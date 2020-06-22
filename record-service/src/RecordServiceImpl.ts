import recordStoreReducer from "./store/recordStoreReducer";
import {Changeset, changesetsOptimizer, ClientId, Record, RecordId} from "record";
import {randomUUID} from "./util/randomUUID";
import {RecordStoreAction} from "./store/RecordStoreAction";
import {RecordService} from "./RecordService";
import {RecordStoreStorage} from "./store/RecordStoreStorage";
import {RecordStore} from "./store/RecordStore";
import RecordWebsocket from "./remote/RecordWebsocket";
import IndexedDBRecordStoreStorage from "./local/IndexedDBRecordStoreStorage";
import {Subscriber} from "./Subscriber";
import {Subscription} from "./Subscription";

export class RecordServiceImpl<VV, V, VS, S, VO, O> implements RecordService<V, S, O> {
    private readonly recordStoreStorage: RecordStoreStorage<V, S, O>;
    private readonly reducer: (recordStore: RecordStore<V, S, O>, action: RecordStoreAction<V, S, O>) => RecordStore<V, S, O>;
    private readonly optimizer: (changesets: Changeset<O>[]) => Changeset<O>[];
    private readonly websocketUrl: string;

    private readonly recordStores: { [key: string]: RecordStore<V, S, O> } = {};
    private readonly subscribers: { [key: string]: Subscriber<Record<V, S>>[] } = {};
    private websocket: RecordWebsocket<V, S, O> | null = null;

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
        this.recordStoreStorage = new IndexedDBRecordStoreStorage<VV, V, VS, S, VO, O>(defaultValue, valueUpcaster, operationUpcaster);
        this.optimizer = changesetsOptimizer(operationsOptimizer)
        this.reducer = recordStoreReducer(valueReducer, selectionsReducer, operationInverter, operationsTransformer, isMutationOperation);

        this.recordStores = {};
        if (window.navigator.onLine) {
            this.connect();
        }
        window.addEventListener("online", () => this.connect());
        window.addEventListener("offline", () => this.disconnect());
    }

    async subscribe(id: RecordId, subscriber: Subscriber<Record<V, S>>): Promise<Subscription> {
        if (this.recordStores[id] === undefined) {
            this.recordStores[id] = await this.recordStoreStorage.find(id)
        }

        subscriber(this.recordStores[id].localRecord);
        if (this.subscribers[id] === undefined) {
            this.subscribers[id] = [];
        }

        if (this.subscribers[id].length === 0) {
            await this.requestSubscriptionToRecord(id);
        }

        this.subscribers[id] = [...this.subscribers[id], subscriber];
        return () => {
            this.subscribers[id] = this.subscribers[id].filter(s => s !== subscriber);
            if (this.subscribers[id].length === 0) {
                this.requestUnsubscribeFromRecord(id);
            }
        };
    }

    async applyOperations(id: RecordId, clientId: ClientId, operations: O[]) {
        if (this.recordStores[id] === undefined) {
            this.recordStores[id] = await this.recordStoreStorage.find(id)
        }

        this.recordStores[id] = this.reducer(this.recordStores[id], {
            type: "apply_local_operations",
            clientId,
            operations
        });

        this.sendOutstandingChangesets(id);

        this.broadcast(id);
        await this.recordStoreStorage.save(id, this.recordStores[id]);
    }

    private broadcast(id: RecordId) {
        if (this.subscribers[id] === null) return;

        this.subscribers[id].forEach(subscriber => subscriber(this.recordStores[id].localRecord));
    }

    private async requestSubscriptionToRecord(id: RecordId) {
        if (!this.websocket) return;
        if (this.recordStores[id] === undefined) {
            this.recordStores[id] = await this.recordStoreStorage.find(id);
        }

        let {remoteRecord} = this.recordStores[id];
        this.websocket.send({
            type: "subscribe",
            id: id,
            since: remoteRecord.version === 0 ? "latest" : remoteRecord.version + 1
        });
        this.resendInProgressChangeset(id);
        this.sendOutstandingChangesets(id);

        await this.recordStoreStorage.save(id, this.recordStores[id]);
    }

    private requestUnsubscribeFromRecord(id: RecordId) {
        if (!this.websocket) return;
        this.websocket.send({type: "unsubscribe", id});
    }

    private resendInProgressChangeset(id: RecordId) {
        if (!this.websocket) return;
        if (this.recordStores[id] === null) return;

        let {inProgressChangeset} = this.recordStores[id];
        if (inProgressChangeset !== null) {
            this.websocket.send({type: "apply_changeset", id, changeset: inProgressChangeset});
        }
    }

    private sendOutstandingChangesets(id: RecordId) {
        if (!this.websocket) return;
        if (this.recordStores[id] === null) return;
        let {remoteRecord, inProgressChangeset, outstandingChangesets} = this.recordStores[id];

        if (inProgressChangeset === null && outstandingChangesets.length > 0) {
            let outstandingOperations = outstandingChangesets.reduce((operations: O[], changeset: Changeset<O>): O[] => {
                return [...operations, ...changeset.operations];
            }, []);

            let inProgressChangeset: Changeset<O> = this.optimizer([{
                metadata: {type: "CHANGESET", version: 1},
                id: randomUUID(),
                clientId: outstandingChangesets[0].clientId,
                version: remoteRecord.version + 1,
                operations: outstandingOperations
            }])[0];

            this.recordStores[id] = this.reducer(this.recordStores[id], {
                type: "send_changeset",
                inProgressChangeset,
                outstandingChangesets: []
            })
            this.websocket.send({type: "apply_changeset", id: id, changeset: inProgressChangeset});
        }
    }

    async applyRedo(id: RecordId, clientId: ClientId): Promise<void> {
        if (this.recordStores[id] === undefined) {
            this.recordStores[id] = await this.recordStoreStorage.find(id)
        }
        this.recordStores[id] = this.reducer(this.recordStores[id], {type: "apply_redo", clientId});

        this.sendOutstandingChangesets(id);

        this.broadcast(id);
        await this.recordStoreStorage.save(id, this.recordStores[id]);
    }

    async applyUndo(id: RecordId, clientId: ClientId): Promise<void> {
        if (this.recordStores[id] === undefined) {
            this.recordStores[id] = await this.recordStoreStorage.find(id)
        }
        this.recordStores[id] = this.reducer(this.recordStores[id], {type: "apply_undo", clientId});
        this.sendOutstandingChangesets(id);

        this.broadcast(id);
        await this.recordStoreStorage.save(id, this.recordStores[id]);
    }

    connect() {
        if (!this.websocketUrl) return;
        if (this.websocket) return;

        this.websocket = new RecordWebsocket<V, S, O>(this.websocketUrl);
        this.websocket.subscribe(response => {
            if (response.type === "record_loaded") {
                let {id, record} = response;
                this.recordStores[id] = this.reducer(this.recordStores[id], {type: "load_remote_record", record});
                this.resendInProgressChangeset(id);
                this.sendOutstandingChangesets(id);
                this.broadcast(response.id);
                this.recordStoreStorage.save(id, this.recordStores[id]).then();
            } else if (response.type === "changeset_applied") {
                let {id, changeset} = response;
                this.recordStores[id] = this.reducer(this.recordStores[id], {
                    type: "apply_remote_changeset",
                    changeset
                });

                if (this.recordStores[id].inProgressChangeset === null) {
                    this.sendOutstandingChangesets(id);
                }

                this.broadcast(id);
                this.recordStoreStorage.save(id, this.recordStores[id]).then();
            }
        });

        Object.keys(this.subscribers).forEach(id => {
            this.requestSubscriptionToRecord(id).then();
        });
    }

    disconnect() {
        if (!this.websocket) return;
        Object.keys(this.subscribers).forEach(id => {
            this.requestUnsubscribeFromRecord(id);
        });

        this.websocket.close();
        this.websocket = null;
    }
}
