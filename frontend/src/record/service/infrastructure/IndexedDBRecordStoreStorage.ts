import openRecordsIndexedDB from "./openRecordsIndexedDB";
import RecordStoreStorage from "../domain/RecordStoreStorage";
import {RecordStore} from "../domain/RecordStore";
import {SlateValue, slateValueUpcaster, VersionedSlateValue} from "slate-value";
import {RecordId, RecordVersion, VersionedRecordVersion} from "record";
import {SlateChangeset, VersionedSlateChangeset} from "common";

type VersionedIndexedDBRecord_1 = {
    metadata: {type: "RECORD"; version: 1; };
    version: VersionedRecordVersion;
    value: VersionedSlateValue;
};

type VersionedIndexedDBRecord =
    | VersionedIndexedDBRecord_1
    ;

type VersionedIndexedDBRecordStore_1 = {
    remoteRecord: VersionedIndexedDBRecord_1,
    unprocessedChangesets: VersionedSlateChangeset[],
    localRecord: VersionedIndexedDBRecord_1,
    inProgressChangeset: null | VersionedSlateChangeset,
    outstandingChangesets: VersionedSlateChangeset[],
};

type VersionedIndexedDBRecordStore =
    | VersionedIndexedDBRecordStore_1
    ;

type IndexedDBRecord = {
    metadata: {type: "RECORD"; version: 1; };
    version: RecordVersion;
    value: SlateValue;
}

type IndexedDBRecordStore = {
    remoteRecord: IndexedDBRecord,
    unprocessedChangesets: SlateChangeset[],
    localRecord: IndexedDBRecord,
    inProgressChangeset: null | SlateChangeset,
    outstandingChangesets: SlateChangeset[]
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
                    value: slateValueUpcaster(indexedDBRecordStore.localRecord.value),
                    version: indexedDBRecordStore.localRecord.version,
                    cursors: {}
                },
                remoteRecord: {
                    metadata: {type: "RECORD", version: 1},
                    version: indexedDBRecordStore.remoteRecord.version,
                    value: slateValueUpcaster(indexedDBRecordStore.remoteRecord.value),
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