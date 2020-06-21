import {RecordService} from "../domain/RecordService";
import {RecordStore} from "../domain/RecordStore";
import {Subscriber} from "../../../common/Subscriber";
import RecordStoreStorage from "../domain/RecordStoreStorage";
import IndexedDBRecordStoreStorage from "./IndexedDBRecordStoreStorage";
import RecordWebsocket from "./RecordWebsocket";
import {Record, RecordId} from "common/record/Record";
import {Subscription} from "../../../common/Subscription";
import recordStoreReducer from "../reducer/recordStoreReducer";
import {Changeset, ChangesetId} from "common/record/action/Changeset";
import {ClientId} from "common/record/ClientId";
import {changesetOptimizer} from "common/record/optimizer/changesetOptimizer";
import {webSocketUrl} from "../../../config";
import {SlateOperation} from "slate-value";

export default class NetworkAwareRecordService implements RecordService {
    private readonly recordStores: {[key: string]: RecordStore} = {};
    private readonly subscribers: {[key: string]: Subscriber<Record>[]} = {};
    private readonly recordStoreStorage: RecordStoreStorage = new IndexedDBRecordStoreStorage();
    private websocket: RecordWebsocket | null = null;

    constructor() {
        this.recordStores = {};
        if (window.navigator.onLine) {
            this.connect();
        }
        window.addEventListener("online", () => this.connect());
        window.addEventListener("offline", () => this.disconnect());
    }

    async subscribe(id: RecordId, subscriber: Subscriber<Record>): Promise<Subscription> {
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

    async applyOperations(id: RecordId, clientId: ClientId, operations: SlateOperation[]) {
        if (this.recordStores[id] === undefined) {
            this.recordStores[id] = await this.recordStoreStorage.find(id)
        }

        this.recordStores[id] = recordStoreReducer(this.recordStores[id], {type: "apply_local_operations", clientId, operations});

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
        this.websocket.send({type: "subscribe", id: id, since: remoteRecord.version === 0 ? "latest" : remoteRecord.version + 1});
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
            let outstandingOperations = outstandingChangesets.reduce((operations: SlateOperation[], changeset: Changeset): SlateOperation[] => {
                return [...operations, ...changeset.operations];
            }, []);

            let inProgressChangeset: Changeset = changesetOptimizer({
                metadata: {type: "CHANGESET", version: 1},
                id: ChangesetId.generate(),
                clientId: outstandingChangesets[0].clientId,
                version: remoteRecord.version + 1,
                operations: outstandingOperations
            });

            this.recordStores[id] = recordStoreReducer(this.recordStores[id], {type: "send_changeset", inProgressChangeset, outstandingChangesets: []})
            this.websocket.send({type: "apply_changeset", id: id, changeset: inProgressChangeset});
        }
    }

    async applyRedo(id: RecordId, clientId: ClientId): Promise<void> {
        if (this.recordStores[id] === undefined) {
            this.recordStores[id] = await this.recordStoreStorage.find(id)
        }
        this.recordStores[id] = recordStoreReducer(this.recordStores[id], {type: "apply_redo", clientId});

        this.sendOutstandingChangesets(id);

        this.broadcast(id);
        await this.recordStoreStorage.save(id, this.recordStores[id]);
    }

    async applyUndo(id: RecordId, clientId: ClientId): Promise<void> {
        if (this.recordStores[id] === undefined) {
            this.recordStores[id] = await this.recordStoreStorage.find(id)
        }
        this.recordStores[id] = recordStoreReducer(this.recordStores[id], {type: "apply_undo", clientId});
        this.sendOutstandingChangesets(id);

        this.broadcast(id);
        await this.recordStoreStorage.save(id, this.recordStores[id]);
    }

    connect() {
        if (!webSocketUrl) return;
        if (this.websocket) return;

        this.websocket = new RecordWebsocket();
        this.websocket.subscribe((response) => {
            if (response.type === "record_loaded") {
                let {id, record} = response;
                this.recordStores[id] = recordStoreReducer(this.recordStores[id], {type: "load_remote_record", record});
                this.resendInProgressChangeset(id);
                this.sendOutstandingChangesets(id);
                this.broadcast(response.id);
                this.recordStoreStorage.save(id, this.recordStores[id]).then();
            } else if (response.type === "changeset_applied") {
                let {id, changeset} = response;
                this.recordStores[id] = recordStoreReducer(this.recordStores[id], {type: "apply_remote_changeset", changeset});

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
