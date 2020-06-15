import openRecordsIndexedDB from "./openRecordsIndexedDB";
import RecordStoreStorage from "../domain/RecordStoreStorage";
import {VersionedRecordVersion_1} from "common/record/upcaster/VersionedRecord";
import {VersionedValue_1} from "common/value/upcaster/VersionedValue";
import {VersionedChangeset_1} from "common/record/upcaster/VersionedChangeset";
import {Changeset} from "common/record/action/Changeset";
import {RecordStore} from "../domain/RecordStore";
import {valueUpcaster} from "common/value/upcaster/valueUpcaster";
import {RecordId, RecordVersion} from "common/record/Record";
import {Value} from "common/value/Value";

type VersionedIndexedDBRecord_1 = {
    metadata: {type: "RECORD"; version: 1; };
    version: VersionedRecordVersion_1;
    value: VersionedValue_1;
};

type VersionedIndexedDBRecord =
    | VersionedIndexedDBRecord_1
    ;

type VersionedIndexedDBRecordStore_1 = {
    remoteRecord: VersionedIndexedDBRecord_1,
    unprocessedChangesets: VersionedChangeset_1[],
    localRecord: VersionedIndexedDBRecord_1,
    inProgressChangeset: null | VersionedChangeset_1,
    outstandingChangesets: VersionedChangeset_1[],
};

type VersionedIndexedDBRecordStore =
    | VersionedIndexedDBRecordStore_1
    ;

type IndexedDBRecord = {
    metadata: {type: "RECORD"; version: 1; };
    version: RecordVersion;
    value: Value;
}

type IndexedDBRecordStore = {
    remoteRecord: IndexedDBRecord,
    unprocessedChangesets: Changeset[],
    localRecord: IndexedDBRecord,
    inProgressChangeset: null | Changeset,
    outstandingChangesets: Changeset[]
}

function indexedDBRecordStoreUpcaster(indexedDBRecordStore: VersionedIndexedDBRecordStore): IndexedDBRecordStore {
    return indexedDBRecordStore;
}

export default class IndexedDBRecordStoreStorage implements RecordStoreStorage {
    private readonly database: Promise<IDBDatabase>;

    constructor() {
        this.database = openRecordsIndexedDB();
    }

    async find(id: RecordId): Promise<RecordStore> {
        let db = await this.database;
        let tx = db.transaction("RECORD_STORES", "readonly");
        let recordsObjectStore = tx.objectStore("RECORD_STORES");

        let result = await new Promise(((resolve, reject) => {
            let request = recordsObjectStore.get(id);
            request.addEventListener("success", () => resolve(request.result));
            request.addEventListener("error", (event) => reject(event));
        })) as (VersionedIndexedDBRecordStore | undefined);
        if (result) {
            let indexedDBRecordStore = indexedDBRecordStoreUpcaster(result);
            return {
                inProgressChangeset: indexedDBRecordStore.inProgressChangeset,
                outstandingChangesets: indexedDBRecordStore.outstandingChangesets,
                unprocessedChangesets: indexedDBRecordStore.unprocessedChangesets,
                localRecord: {
                    metadata: {type: "RECORD", version: 1},
                    value: valueUpcaster(indexedDBRecordStore.localRecord.value),
                    version: indexedDBRecordStore.localRecord.version,
                    cursors: {}
                },
                remoteRecord: {
                    metadata: {type: "RECORD", version: 1},
                    version: indexedDBRecordStore.remoteRecord.version,
                    value: valueUpcaster(indexedDBRecordStore.remoteRecord.value),
                    cursors: {}
                },
                undoQueue: [],
                redoQueue: []
            };
        } else {
            return RecordStore.DEFAULT;
        }
    }

    async save(id: RecordId, recordStore: RecordStore): Promise<void> {
        let db = await this.database;
        let tx = db.transaction("RECORD_STORES", "readwrite");
        let recordsObjectStore = tx.objectStore("RECORD_STORES");
        return new Promise((resolve, reject) => {
            let request = recordsObjectStore.put({
                inProgressChangeset: recordStore.inProgressChangeset,
                outstandingChangesets: recordStore.outstandingChangesets,
                unprocessedChangesets: recordStore.unprocessedChangesets,
                localRecord: {
                    value: recordStore.localRecord.value,
                    version: recordStore.localRecord.version
                },
                remoteRecord: {
                    value: recordStore.remoteRecord.value,
                    version: recordStore.remoteRecord.version
                }
            } as IndexedDBRecordStore, id);
            request.addEventListener("success", () => resolve());
            request.addEventListener("error", (event) => reject(event));
        });
    }
}