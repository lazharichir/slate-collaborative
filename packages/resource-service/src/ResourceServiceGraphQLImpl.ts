import { resourceStoreReducer } from "./store/resourceStoreReducer"
import {
	Changeset,
	changesetsOptimizer,
	ClientId,
	Resource,
	ResourceId,
	ResourceVersion,
} from "@wleroux/resource"
import { randomUUID } from "./util/randomUUID"
import { ResourceStoreAction } from "./store/ResourceStoreAction"
import { ResourceService } from "./ResourceService"
import { ResourceStoreStorage } from "./store/ResourceStoreStorage"
import { ResourceStore } from "./store/ResourceStore"
import IndexedDBResourceStoreStorage from "./local/IndexedDBResourceStoreStorage"
import { Subscriber } from "./Subscriber"
import { Subscription } from "./Subscription"
import { RESOURCE_LOADED, CHANGESET_APPLIED } from "./remote/Response"
import { ApolloClient } from "@apollo/client"
import {
	SubscribeToDocumentMutationArgs,
	SubscribeToDocumentMutation,
	UnsubscribeFromDocumentMutationArgs,
	UnsubscribeFromDocumentMutation,
	AppplyChangesetToDocumentMutationArgs,
	AppplyChangesetToDocumentMutation,
	GetDocumentValueArgs,
	GetDocumentValueQuery,
} from "./remote/Mutations"

export class ResourceServiceGraphQLImpl<VV, V, VS, S, VO, O, TCacheShape>
	implements ResourceService<V, S, O> {
	private readonly resourceStoreStorage: ResourceStoreStorage<V, S, O>
	private readonly reducer: (
		resourceStore: ResourceStore<V, S, O>,
		action: ResourceStoreAction<V, S, O>
	) => ResourceStore<V, S, O>
	private readonly optimizer: (changesets: Changeset<O>[]) => Changeset<O>[]

	private readonly resourceStores: {
		[key: string]: ResourceStore<V, S, O>
	} = {}
	private readonly subscribers: {
		[key: string]: Subscriber<Resource<V, S>>[]
	} = {}

	private apolloClient: ApolloClient<TCacheShape> | null = null
	// private graphqlSubscription: ApolloClient<TCacheShape> | null = null;

	private delay: number = 0
	private lastSent: Date | null = null
	private interval: ReturnType<typeof setInterval> | null = null

	constructor(
		apolloClient: ApolloClient<TCacheShape>,
		delay: number = 0,
		defaultValue: V,
		valueReducer: (value: V, operation: O) => V,
		valueUpcaster: (versionedValue: VV) => V,
		selectionsReducer: (
			clientId: ClientId,
			selections: { [key: string]: S },
			operation: O
		) => { [key: string]: S },
		operationsTransformer: (
			leftOperations: O[],
			topOperations: O[],
			tieBreaker: boolean
		) => [O[], O[]],
		operationUpcaster: (versionedOperation: VO) => O,
		operationInverter: (operation: O) => O,
		operationsOptimizer: (operations: O[]) => O[],
		isMutationOperation: (operation: O) => boolean
	) {
		this.apolloClient = apolloClient
		this.delay = delay
		this.resourceStoreStorage = new IndexedDBResourceStoreStorage<
			VV,
			V,
			VS,
			S,
			VO,
			O
		>(defaultValue, valueUpcaster, operationUpcaster)
		this.optimizer = changesetsOptimizer(operationsOptimizer)
		this.reducer = resourceStoreReducer(
			valueReducer,
			selectionsReducer,
			operationInverter,
			operationsTransformer,
			isMutationOperation
		)

		this.resourceStores = {}
		if (window.navigator.onLine) {
			this.connect()
		}

		window.addEventListener("online", () => this.connect())
		window.addEventListener("offline", () => this.disconnect())
	}

	private setSendOutstandingChangesetsInterval(
		id: ResourceId,
		version: ResourceVersion,
		intervalMs?: number
	): void {
		const intervalInMs = intervalMs || this.delay
		if (!intervalInMs) return

		this.interval = setInterval(() => {
			this.sendOutstandingChangesets(id, version)
		}, intervalInMs)
	}

	private clearSendOutstandingChangesetssInterval(): void {
		if (this.interval) clearInterval(this.interval)
	}

	private hasEnoughTimeElapsed(): boolean {
		if (!this.delay) return true
		if (!this.lastSent) return true
		const last = this.lastSent.getTime()
		const now = new Date().getTime()
		return now - last >= this.delay
	}

	async subscribe(
		id: ResourceId,
		version: ResourceVersion,
		subscriber: Subscriber<Resource<V, S>>
	): Promise<Subscription> {
		const identifier = `${id}/${version}`

		if (this.resourceStores[identifier] === undefined) {
			this.resourceStores[identifier] = await this.resourceStoreStorage.find(
				id,
				version
			)
		}

		subscriber(this.resourceStores[identifier].localResource)
		if (this.subscribers[identifier] === undefined) {
			this.subscribers[identifier] = []
		}

		if (this.subscribers[identifier].length === 0) {
			await this.requestSubscriptionToResource(id, version)
		}

		this.subscribers[identifier] = [...this.subscribers[identifier], subscriber]

		return () => {
			this.subscribers[identifier] = this.subscribers[identifier].filter(
				(s) => s !== subscriber
			)
			if (this.subscribers[identifier].length === 0) {
				this.requestUnsubscribeFromResource(id, version)
			}
		}
	}

	async applyOperations(
		document: ResourceId,
		version: ResourceVersion,
		client: ClientId,
		operations: O[]
	) {
		const identifier = `${document}/${version}`
		if (!this.resourceStores[identifier]) {
			this.resourceStores[identifier] = await this.resourceStoreStorage.find(
				document,
				version
			)
		}

		this.resourceStores[identifier] = this.reducer(
			this.resourceStores[identifier],
			{
				type: "apply_local_operations",
				client,
				operations,
				document,
				version,
			}
		)

		this.sendOutstandingChangesets(document, version)

		this.broadcast(document, version)

		console.log(`applyOperations`, this.resourceStores[identifier])

		await this.resourceStoreStorage.save(
			document,
			version,
			this.resourceStores[identifier]
		)
	}

	private broadcast(document: ResourceId, version: ResourceVersion) {
		const identifier = `${document}/${version}`
		if (!this.subscribers[identifier]) return
		this.subscribers[identifier].forEach((subscriber) =>
			subscriber(this.resourceStores[identifier].localResource)
		)
	}

	private async requestSubscriptionToResource(
		document: ResourceId,
		version: ResourceVersion
	) {
		console.log(` `)
		console.log(` `)
		console.log(`requestSubscriptionToResource`, document, version)
		if (!this.apolloClient) return
		const identifier = `${document}/${version}`
		if (!this.resourceStores[identifier]) {
			this.resourceStores[identifier] = await this.resourceStoreStorage.find(
				document,
				version
			)
		}

		let { remoteResource } = this.resourceStores[identifier]
		console.log(`remoteResource`, remoteResource)

		const since = remoteResource.revision === 0
			? `latest`
			: remoteResource.revision + 1

		this.apolloClient
			.subscribe<RESOURCE_LOADED<V, S>, SubscribeToDocumentMutationArgs>({
				query: SubscribeToDocumentMutation,
				variables: {
					document,
					version,
					since,
				},
			})
			.subscribe(
				(x: any, y: any) => {
					console.log(x, y)
				},
				(err: Error) => console.log(`Finished with error:`, err),
				() => console.log("Finished")
			)

		await this.loadResource(document, version, since)
		this.resendInProgressChangeset(document, version)
		this.sendOutstandingChangesets(document, version)

		await this.resourceStoreStorage.save(
			document,
			version,
			this.resourceStores[identifier]
		)
	}

	private async loadResource(document: ResourceId, version: ResourceVersion, since: number|`latest`) {
		console.log(`loadResource`, document, version)
		if (!this.apolloClient) return

		const { data, errors } = await this.apolloClient.query<
			any,
			GetDocumentValueArgs
		>({
			query: GetDocumentValueQuery,
			variables: { document, version, since: typeof since === `number` ? since : undefined },
		})

		console.log(`loadResource.data`, data, errors)

		if (data) {
			this.handleResourceLoadedResponse({
				document,
				version,
				resource: {
					revision: data.getDocumentValue.revision,
					cursors: JSON.parse(data.getDocumentValue.cursors),
					metadata: JSON.parse(data.getDocumentValue.metadata),
					value: JSON.parse(data.getDocumentValue.value),
				},
			} as RESOURCE_LOADED<V, S>)
		}

		if (errors) {
			console.error(errors)
		}
	}

	private async requestUnsubscribeFromResource(
		document: ResourceId,
		version: ResourceVersion
	) {
		if (!this.apolloClient) return
		await this.apolloClient.mutate<any, UnsubscribeFromDocumentMutationArgs>({
			mutation: UnsubscribeFromDocumentMutation,
			variables: {
				document,
				version,
			},
		})
	}

	private async resendInProgressChangeset(
		document: ResourceId,
		version: ResourceVersion
	) {
		console.log(`resendInProgressChangeset`, document, version)

		const identifier = `${document}/${version}`
		if (!this.apolloClient) return
		if (!this.resourceStores[identifier]) return

		let { inProgressChangeset } = this.resourceStores[identifier]
		if (inProgressChangeset !== null) {
			try {
				const response = await this.apolloClient.mutate<
					any,
					AppplyChangesetToDocumentMutationArgs
				>({
					mutation: AppplyChangesetToDocumentMutation,
					variables: {
						changeset: JSON.stringify(inProgressChangeset),
					},
				})

				console.log(`resendInProgressChangeset.response`, response)

				if (response.data?.appplyChangesetToDocument) {
					this.handleChangesetAppliedResponse({
						type: `changeset_applied`,
						changeset: inProgressChangeset,
						document,
						version,
					})
				} else {
					console.log(
						`AppplyChangesetToDocumentMutation seems to have returned FALSE`
					)
				}
			} catch (error) {
				console.error(error)
			}
		}
	}

	private async sendOutstandingChangesets(
		document: ResourceId,
		version: ResourceVersion
	) {
		const identifier = `${document}/${version}`
		if (!this.apolloClient) return
		if (!this.resourceStores[identifier]) return
		let resource = this.resourceStores[identifier]
		let {
			remoteResource,
			inProgressChangeset,
			outstandingChangesets,
		} = resource

		if (
			inProgressChangeset === null &&
			outstandingChangesets.length > 0 &&
			this.hasEnoughTimeElapsed()
		) {
			console.log(`sendOutstandingChangesets`, document, version)
			console.log(`sendOutstandingChangesets.resource`, resource)

			this.lastSent = new Date()

			let outstandingOperations = outstandingChangesets.reduce(
				(operations: O[], changeset: Changeset<O>): O[] => {
					return [...operations, ...changeset.operations]
				},
				[]
			)

			let inProgressChangeset: Changeset<O> = this.optimizer([
				{
					metadata: { type: "CHANGESET", version: 1 },
					id: randomUUID(),
					document: document,
					version: version,
					client: outstandingChangesets[0].client,
					revision: remoteResource.revision + 1,
					operations: outstandingOperations,
				},
			])[0]

			console.log(
				`sendOutstandingChangesets.inProgressChangeset`,
				inProgressChangeset
			)

			this.resourceStores[identifier] = this.reducer(
				this.resourceStores[identifier],
				{
					type: "send_changeset",
					inProgressChangeset,
					outstandingChangesets: [],
					document,
					version,
				}
			)

			console.log(
				`sendOutstandingChangesets this.resourceStores[identifier]`,
				this.resourceStores[identifier]
			)

			try {
				const response = await this.apolloClient.mutate<
					any,
					AppplyChangesetToDocumentMutationArgs
				>({
					mutation: AppplyChangesetToDocumentMutation,
					variables: {
						changeset: JSON.stringify(inProgressChangeset),
					},
				})

				console.log(`sendOutstandingChangesets.response`, response)

				if (!response.data) throw new Error(`No response data.`)

				if (response.data.appplyChangesetToDocument) {
					this.handleChangesetAppliedResponse({
						type: `changeset_applied`,
						changeset: inProgressChangeset,
						document,
						version,
					})
				} else {
					console.log(
						`AppplyChangesetToDocumentMutation seems to have returned FALSE`
					)
				}
			} catch (error) {
				console.error(`sendOutstandingChangesets.error`, error)
			}
		}
	}

	async applyRedo(
		document: ResourceId,
		version: ResourceVersion,
		client: ClientId
	): Promise<void> {
		const identifier = `${document}/${version}`
		if (this.resourceStores[identifier] === undefined) {
			this.resourceStores[identifier] = await this.resourceStoreStorage.find(
				document,
				version
			)
		}
		this.resourceStores[identifier] = this.reducer(
			this.resourceStores[identifier],
			{ type: "apply_redo", client, document, version }
		)

		this.sendOutstandingChangesets(document, version)

		this.broadcast(document, version)
		await this.resourceStoreStorage.save(
			document,
			version,
			this.resourceStores[identifier]
		)
	}

	async applyUndo(
		document: ResourceId,
		version: ResourceVersion,
		client: ClientId
	): Promise<void> {
		const identifier = `${document}/${version}`
		if (this.resourceStores[identifier] === undefined) {
			this.resourceStores[identifier] = await this.resourceStoreStorage.find(
				document,
				version
			)
		}
		this.resourceStores[identifier] = this.reducer(
			this.resourceStores[identifier],
			{ type: "apply_undo", client, document, version }
		)
		this.sendOutstandingChangesets(document, version)

		this.broadcast(document, version)
		await this.resourceStoreStorage.save(
			document,
			version,
			this.resourceStores[identifier]
		)
	}

	private async handleResourceLoadedResponse(
		response: RESOURCE_LOADED<V, S>
	): Promise<void> {
		console.log(`handleResourceLoadedResponse`, response)
		let { document, resource, version } = response
		const identifier = `${document}/${version}`
		console.log(`before:`, this.resourceStores[identifier])
		this.resourceStores[identifier] = this.reducer(
			this.resourceStores[identifier],
			{ type: "load_remote_resource", resource, document, version }
		)
		console.log(`after:`, this.resourceStores[identifier])
		this.resendInProgressChangeset(document, version)
		this.sendOutstandingChangesets(document, version)
		this.broadcast(document, version)
		this.resourceStoreStorage
			.save(document, version, this.resourceStores[identifier])
			.then()
		this.setSendOutstandingChangesetsInterval(document, version)
	}

	private async handleChangesetAppliedResponse(
		response: CHANGESET_APPLIED<O>
	): Promise<void> {
		let { document, changeset, version } = response
		const identifier = `${document}/${version}`
		this.resourceStores[identifier] = this.reducer(
			this.resourceStores[identifier],
			{
				type: "apply_remote_changeset",
				changeset,
				document,
				version,
			}
		)

		if (this.resourceStores[identifier].inProgressChangeset === null) {
			this.sendOutstandingChangesets(document, version)
		}

		this.broadcast(document, version)

		console.log(`handleChangesetAppliedResponse`, this.resourceStores[identifier])

		await this.resourceStoreStorage.save(
			document,
			version,
			this.resourceStores[identifier]
		)

		this.setSendOutstandingChangesetsInterval(document, version)
	}

	connect() {
		console.log(`connect`)
		if (!this.apolloClient) return
		Object.keys(this.subscribers).forEach((res) => {
			console.log(`connect().res`, res)
			const [rDocument, rVersion] = res.split(`/`)
			this.requestSubscriptionToResource(rDocument, rVersion).then()
		})
	}

	disconnect() {
		console.log(`disconnect`)
		if (!this.apolloClient) return
		Object.keys(this.subscribers).forEach((identifier) => {
			console.log(`disconnect().identifier`, identifier)
			const [document, version] = identifier.split(`/`)
			this.requestUnsubscribeFromResource(document, version)
		})
		this.clearSendOutstandingChangesetssInterval()
	}
}
