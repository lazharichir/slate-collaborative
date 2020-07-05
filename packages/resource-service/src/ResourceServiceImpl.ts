import {resourceStoreReducer} from "./store/resourceStoreReducer";
import {Changeset, changesetsOptimizer, ClientId, Resource, ResourceId} from "@wleroux/resource";
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

    async subscribe(id: ResourceId, subscriber: Subscriber<Resource<V, S>>): Promise<Subscription> {
        if (this.resourceStores[id] === undefined) {
            this.resourceStores[id] = await this.resourceStoreStorage.find(id)
        }

        subscriber(this.resourceStores[id].localResource);
        if (this.subscribers[id] === undefined) {
            this.subscribers[id] = [];
        }

        if (this.subscribers[id].length === 0) {
            await this.requestSubscriptionToResource(id);
        }

        this.subscribers[id] = [...this.subscribers[id], subscriber];
        return () => {
            this.subscribers[id] = this.subscribers[id].filter(s => s !== subscriber);
            if (this.subscribers[id].length === 0) {
                this.requestUnsubscribeFromResource(id);
            }
        };
    }

    async applyOperations(id: ResourceId, client: ClientId, operations: O[]) {
        if (this.resourceStores[id] === undefined) {
            this.resourceStores[id] = await this.resourceStoreStorage.find(id)
        }

        this.resourceStores[id] = this.reducer(this.resourceStores[id], {
            type: "apply_local_operations",
            client,
            operations
        });

        this.sendOutstandingChangesets(id);

        this.broadcast(id);
        await this.resourceStoreStorage.save(id, this.resourceStores[id]);
    }

    private broadcast(id: ResourceId) {
        if (this.subscribers[id] === null) return;
        this.subscribers[id].forEach(subscriber => subscriber(this.resourceStores[id].localResource));
    }

    private async requestSubscriptionToResource(id: ResourceId) {
        if (!this.websocket) return;
        if (this.resourceStores[id] === undefined) {
            this.resourceStores[id] = await this.resourceStoreStorage.find(id);
        }

        let {remoteResource} = this.resourceStores[id];
        this.websocket.send({
            type: "subscribe",
            id: id,
            since: remoteResource.revision === 0 ? "latest" : remoteResource.revision + 1
        });
        this.resendInProgressChangeset(id);
        this.sendOutstandingChangesets(id);

        await this.resourceStoreStorage.save(id, this.resourceStores[id]);
    }

    private requestUnsubscribeFromResource(id: ResourceId) {
        if (!this.websocket) return;
        this.websocket.send({type: "unsubscribe", id});
    }

    private resendInProgressChangeset(id: ResourceId) {
        if (!this.websocket) return;
        if (this.resourceStores[id] === null) return;

        let {inProgressChangeset} = this.resourceStores[id];
        if (inProgressChangeset !== null) {
            this.websocket.send({type: "apply_changeset", id, changeset: inProgressChangeset});
        }
    }

    private sendOutstandingChangesets(id: ResourceId) {
        if (!this.websocket) return;
        if (this.resourceStores[id] === null) return;
        let {remoteResource, inProgressChangeset, outstandingChangesets} = this.resourceStores[id];

        if (inProgressChangeset === null && outstandingChangesets.length > 0) {
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

            this.resourceStores[id] = this.reducer(this.resourceStores[id], {
                type: "send_changeset",
                inProgressChangeset,
                outstandingChangesets: []
            })
            this.websocket.send({type: "apply_changeset", id: id, changeset: inProgressChangeset});
        }
    }

    async applyRedo(id: ResourceId, client: ClientId): Promise<void> {
        if (this.resourceStores[id] === undefined) {
            this.resourceStores[id] = await this.resourceStoreStorage.find(id)
        }
        this.resourceStores[id] = this.reducer(this.resourceStores[id], {type: "apply_redo", client});

        this.sendOutstandingChangesets(id);

        this.broadcast(id);
        await this.resourceStoreStorage.save(id, this.resourceStores[id]);
    }

    async applyUndo(id: ResourceId, client: ClientId): Promise<void> {
        if (this.resourceStores[id] === undefined) {
            this.resourceStores[id] = await this.resourceStoreStorage.find(id)
        }
        this.resourceStores[id] = this.reducer(this.resourceStores[id], {type: "apply_undo", client});
        this.sendOutstandingChangesets(id);

        this.broadcast(id);
        await this.resourceStoreStorage.save(id, this.resourceStores[id]);
    }

    connect() {
        if (!this.websocketUrl) return;
        if (this.websocket) return;

		this.websocket = new ResourceWebsocket<V, S, O>(this.websocketUrl);
		
        this.websocket.subscribe(response => {
            if (response.type === "resource_loaded") {
                let {id, resource} = response;
                this.resourceStores[id] = this.reducer(this.resourceStores[id], {type: "load_remote_resource", resource});
                this.resendInProgressChangeset(id);
                this.sendOutstandingChangesets(id);
                this.broadcast(response.id);
                this.resourceStoreStorage.save(id, this.resourceStores[id]).then();
            } else if (response.type === "changeset_applied") {
                let {id, changeset} = response;
                this.resourceStores[id] = this.reducer(this.resourceStores[id], {
                    type: "apply_remote_changeset",
                    changeset
                });

                if (this.resourceStores[id].inProgressChangeset === null) {
                    this.sendOutstandingChangesets(id);
                }

                this.broadcast(id);
                this.resourceStoreStorage.save(id, this.resourceStores[id]).then();
            }
        });

        Object.keys(this.subscribers).forEach(id => {
            this.requestSubscriptionToResource(id).then();
        });
    }

    disconnect() {
        if (!this.websocket) return;
        Object.keys(this.subscribers).forEach(id => {
            this.requestUnsubscribeFromResource(id);
        });

        this.websocket.close();
        this.websocket = null;
    }
}
