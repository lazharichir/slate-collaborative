import {resourceStoreReducer} from "./store/resourceStoreReducer";
import {Changeset, changesetsOptimizer, ClientId, Resource, ResourceId, ResourceVersion} from "@wleroux/resource";
import {randomUUID} from "./util/randomUUID";
import {ResourceStoreAction} from "./store/ResourceStoreAction";
import {ResourceService} from "./ResourceService";
import {ResourceStoreStorage} from "./store/ResourceStoreStorage";
import {ResourceStore} from "./store/ResourceStore";
import ResourceWebsocket from "./remote/ResourceWebsocket";
import IndexedDBResourceStoreStorage from "./local/IndexedDBResourceStoreStorage";
import {Subscriber} from "./Subscriber";
import {Subscription} from "./Subscription";

export class ResourceServiceImpl<VV, V, VS, S, VO, O> implements ResourceService<V, S, O> {
    private readonly resourceStoreStorage: ResourceStoreStorage<V, S, O>;
    private readonly reducer: (resourceStore: ResourceStore<V, S, O>, action: ResourceStoreAction<V, S, O>) => ResourceStore<V, S, O>;
    private readonly optimizer: (changesets: Changeset<O>[]) => Changeset<O>[];
    private readonly websocketUrl: string;

    private readonly resourceStores: { [key: string]: ResourceStore<V, S, O> } = {};
    private readonly subscribers: { [key: string]: Subscriber<Resource<V, S>>[] } = {};
	private websocket: ResourceWebsocket<V, S, O> | null = null;
	
	private readonly delay: number|null = 2000
	private lastSent: Date|null = null
	private interval: ReturnType<typeof setInterval>|null = null

    constructor(
        websocketUrl: string,
        defaultValue: V,
        valueReducer: (value: V, operation: O) => V,
        valueUpcaster: (versionedValue: VV) => V,
        selectionsReducer: (clientId: ClientId, selections: {[key: string]: S}, operation: O) => {[key: string]: S},
        operationsTransformer: (leftOperations: O[], topOperations: O[], tieBreaker: boolean) => [O[], O[]],
        operationUpcaster: (versionedOperation: VO) => O,
        operationInverter: (operation: O) => O,
        operationsOptimizer: (operations: O[]) => O[],
        isMutationOperation: (operation: O) => boolean
    ) {
        this.websocketUrl = websocketUrl;
        this.resourceStoreStorage = new IndexedDBResourceStoreStorage<VV, V, VS, S, VO, O>(defaultValue, valueUpcaster, operationUpcaster);
        this.optimizer = changesetsOptimizer(operationsOptimizer)
        this.reducer = resourceStoreReducer(valueReducer, selectionsReducer, operationInverter, operationsTransformer, isMutationOperation);

        this.resourceStores = {};
        if (window.navigator.onLine) {
            this.connect();
        }
        window.addEventListener("online", () => this.connect());
        window.addEventListener("offline", () => this.disconnect());
    }

    async subscribe(id: ResourceId, version: ResourceVersion, subscriber: Subscriber<Resource<V, S>>): Promise<Subscription> {

		const identifier = `${id}/${version}`

        if (this.resourceStores[identifier] === undefined) {
            this.resourceStores[identifier] = await this.resourceStoreStorage.find(id, version)
        }

        subscriber(this.resourceStores[identifier].localResource);
        if (this.subscribers[identifier] === undefined) {
            this.subscribers[identifier] = [];
        }

        if (this.subscribers[identifier].length === 0) {
            await this.requestSubscriptionToResource(id, version);
        }

		this.subscribers[identifier] = [...this.subscribers[identifier], subscriber];
		
        return () => {
            this.subscribers[identifier] = this.subscribers[identifier].filter(s => s !== subscriber);
            if (this.subscribers[identifier].length === 0) {
                this.requestUnsubscribeFromResource(id, version);
            }
        };
    }

    async applyOperations(id: ResourceId, version: ResourceVersion, client: ClientId, operations: O[]) {

		const identifier = `${id}/${version}`
        if (!this.resourceStores[identifier]) {
            this.resourceStores[identifier] = await this.resourceStoreStorage.find(id, version)
        }

        this.resourceStores[identifier] = this.reducer(this.resourceStores[identifier], {
            type: "apply_local_operations",
            client,
            operations
        });

        this.sendOutstandingChangesets(id, version);

        this.broadcast(id, version);
        await this.resourceStoreStorage.save(id, version, this.resourceStores[identifier]);
    }

    private broadcast(id: ResourceId, version: ResourceVersion) {
		const identifier = `${id}/${version}`
        if (!this.subscribers[identifier]) return;
        this.subscribers[identifier].forEach(subscriber => subscriber(this.resourceStores[identifier].localResource));
    }

    private async requestSubscriptionToResource(id: ResourceId, version: ResourceVersion) {
		if (!this.websocket) return;
		const identifier = `${id}/${version}`
        if (!this.resourceStores[identifier]) {
            this.resourceStores[identifier] = await this.resourceStoreStorage.find(id, version);
        }

        let {remoteResource} = this.resourceStores[identifier];
        this.websocket.send({
            type: "subscribe",
			id: id,
			version: version,
            since: remoteResource.revision === 0 ? "latest" : remoteResource.revision + 1
        });
        this.resendInProgressChangeset(id, version);
        this.sendOutstandingChangesets(id, version);

        await this.resourceStoreStorage.save(id, version, this.resourceStores[identifier]);
    }

    private requestUnsubscribeFromResource(id: ResourceId, version: ResourceVersion) {
        if (!this.websocket) return;
        this.websocket.send({type: "unsubscribe", id, version});
    }

    private resendInProgressChangeset(id: ResourceId, version: ResourceVersion) {
		const identifier = `${id}/${version}`
		if (!this.websocket) return;
        if (!this.resourceStores[identifier]) return;

        let {inProgressChangeset} = this.resourceStores[identifier];
        if (inProgressChangeset !== null) {
            this.websocket.send({type: "apply_changeset", id, version, changeset: inProgressChangeset});
        }
	}
	
	private setSendOutstandingChangesetssInterval(id: ResourceId, version: ResourceVersion, intervalMs: number = 1000): void {
		this.interval = setInterval(() => {
			this.sendOutstandingChangesets(id, version)
		}, intervalMs)
	}

	private clearSendOutstandingChangesetssInterval(): void {
		if (this.interval)
			clearInterval(this.interval)
	}
	
	private hasEnoughTimeElapsed(): boolean {
		if (!this.delay) return true;
		if (!this.lastSent) return true;
		const last = this.lastSent.getTime()
		const now = new Date().getTime()
		return (now - last) >= this.delay
	}

    private sendOutstandingChangesets(id: ResourceId, version: ResourceVersion) {
		const identifier = `${id}/${version}`
        if (!this.websocket) return;
        if (!this.resourceStores[identifier]) return;
        let {remoteResource, inProgressChangeset, outstandingChangesets} = this.resourceStores[identifier];

        if (inProgressChangeset === null && outstandingChangesets.length > 0 && this.hasEnoughTimeElapsed()) {
            let outstandingOperations = outstandingChangesets.reduce((operations: O[], changeset: Changeset<O>): O[] => {
                return [...operations, ...changeset.operations];
            }, []);

            let inProgressChangeset: Changeset<O> = this.optimizer([{
                metadata: {type: "CHANGESET", version: 1},
                id: randomUUID(),
                client: outstandingChangesets[0].client,
                revision: remoteResource.revision + 1,
                operations: outstandingOperations
            }])[0];

            this.resourceStores[identifier] = this.reducer(this.resourceStores[identifier], {
                type: "send_changeset",
                inProgressChangeset,
                outstandingChangesets: []
			})
			
			this.websocket.send({type: "apply_changeset", id, version, changeset: inProgressChangeset});
			this.lastSent = new Date();
        }
    }

    async applyRedo(id: ResourceId, version: ResourceVersion, client: ClientId): Promise<void> {
		const identifier = `${id}/${version}`
        if (this.resourceStores[identifier] === undefined) {
            this.resourceStores[identifier] = await this.resourceStoreStorage.find(id, version)
        }
        this.resourceStores[identifier] = this.reducer(this.resourceStores[identifier], {type: "apply_redo", client});

        this.sendOutstandingChangesets(id, version);

        this.broadcast(id, version);
        await this.resourceStoreStorage.save(id, version, this.resourceStores[identifier]);
    }

    async applyUndo(id: ResourceId, version: ResourceVersion, client: ClientId): Promise<void> {
		const identifier = `${id}/${version}`
        if (this.resourceStores[identifier] === undefined) {
            this.resourceStores[identifier] = await this.resourceStoreStorage.find(id, version)
        }
        this.resourceStores[identifier] = this.reducer(this.resourceStores[identifier], {type: "apply_undo", client});
        this.sendOutstandingChangesets(id, version);

        this.broadcast(id, version);
        await this.resourceStoreStorage.save(id, version, this.resourceStores[identifier]);
	}

    connect() {
        if (!this.websocketUrl) return;
        if (this.websocket) return;

		this.websocket = new ResourceWebsocket<V, S, O>(this.websocketUrl);
		
        this.websocket.subscribe(response => {
            if (response.type === "resource_loaded") {
				let {id, resource, version} = response;
				const identifier = `${id}/${version}`
                this.resourceStores[identifier] = this.reducer(this.resourceStores[identifier], {type: "load_remote_resource", resource});
                this.resendInProgressChangeset(id, version);
                this.sendOutstandingChangesets(id, version);
                this.broadcast(id, version);
				this.resourceStoreStorage.save(id, version, this.resourceStores[identifier]).then();
				this.setSendOutstandingChangesetssInterval(id, version)
            } else if (response.type === "changeset_applied") {
				let {id, changeset, version} = response;
				const identifier = `${id}/${version}`
                this.resourceStores[identifier] = this.reducer(this.resourceStores[identifier], {
                    type: "apply_remote_changeset",
                    changeset
                });

                if (this.resourceStores[identifier].inProgressChangeset === null) {
                    this.sendOutstandingChangesets(id, version);
                }

                this.broadcast(id, version);
				this.resourceStoreStorage.save(id, version, this.resourceStores[identifier]).then();
				this.setSendOutstandingChangesetssInterval(id, version)
			}			
        });

        Object.keys(this.subscribers).forEach(res => {
			const [rId, rVer] = res.split(`/`)
			this.requestSubscriptionToResource(rId, rVer).then();
        });
    }

    disconnect() {
        if (!this.websocket) return;
        Object.keys(this.subscribers).forEach(identifier => {
			const [id, version] = identifier.split(`/`)
            this.requestUnsubscribeFromResource(id, version);
        });

        this.websocket.close();
		this.websocket = null;
		this.clearSendOutstandingChangesetssInterval()
    }
}