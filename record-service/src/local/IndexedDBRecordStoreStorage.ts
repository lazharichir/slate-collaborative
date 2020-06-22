import {openRecordsIndexedDB} from "./openRecordsIndexedDB";
import {
    Changeset,
    changesetUpcaster,
    RecordId,
    RecordVersion,
    VersionedChangeset,
    VersionedRecordVersion
} from "record";
import {RecordStoreStorage} from "../store/RecordStoreStorage";
import {RecordStore} from "../store/RecordStore";

type VersionedIndexedDBRecord_1<VV> = {
    metadata: {type: "RECORD"; version: 1; };
    version: VersionedRecordVersion;
    value: VV;
};

type VersionedIndexedDBRecord<VV> =
    | VersionedIndexedDBRecord_1<VV>
    ;

type VersionedIndexedDBRecordStore_1<VV, VO> = {
    remoteRecord: VersionedIndexedDBRecord<VV>,
    unprocessedChangesets: VersionedChangeset<VO>[],
    localRecord: VersionedIndexedDBRecord<VV>,
    inProgressChangeset: null | VersionedChangeset<VO>,
    outstandingChangesets: VersionedChangeset<VO>[],
};

type VersionedIndexedDBRecordStore<VV, VO> =
    | VersionedIndexedDBRecordStore_1<VV, VO>
    ;

type IndexedDBRecord<V> = {
    metadata: {type: "RECORD"; version: 1; };
    version: RecordVersion;
    value: V;
}

type IndexedDBRecordStore<V, O> = {
    remoteRecord: IndexedDBRecord<V>,
    unprocessedChangesets: Changeset<O>[],
    localRecord: IndexedDBRecord<V>,
    inProgressChangeset: null | Changeset<O>,
    outstandingChangesets: Changeset<O>[]
}

function indexedDBRecordStoreUpcaster<VV, V, VO, O>(
    valueUpcaster: (versionedValue: VV) => V,
    operationUpcaster: (operation: VO) => O
): (indexedDBRecordStore: VersionedIndexedDBRecordStore<VV, VO>) => IndexedDBRecordStore<V, O> {
    const upcaster = changesetUpcaster(operationUpcaster);

    return (indexedDBRecordStore: VersionedIndexedDBRecordStore<VV, VO>): IndexedDBRecordStore<V, O> => {
        return ({
            ...indexedDBRecordStore,
            remoteRecord: {
                ...indexedDBRecordStore.remoteRecord,
                value: valueUpcaster(indexedDBRecordStore.remoteRecord.value),
            },
            localRecord: {
                ...indexedDBRecordStore.localRecord,
                value: valueUpcaster(indexedDBRecordStore.localRecord.value)
            },
            inProgressChangeset: indexedDBRecordStore.inProgressChangeset === null ? null : upcaster(indexedDBRecordStore.inProgressChangeset),
            outstandingChangesets: indexedDBRecordStore.outstandingChangesets.map(upcaster),
            unprocessedChangesets: indexedDBRecordStore.unprocessedChangesets.map(upcaster)
        });
    }
}

export default class IndexedDBRecordStoreStorage<VV, V, VS, S, VO, O> implements RecordStoreStorage<V, S, O> {
    private readonly database: Promise<IDBDatabase>;
    private readonly defaultValue: V;
    private readonly indexedDBRecordStoreUpcaster: (versionedIndexedDBRecordStore: VersionedIndexedDBRecordStore<VV, VO>) => IndexedDBRecordStore<V, O>;

    constructor(defaultValue: V, valueUpcaster: (versionedValue: VV) => V, operationUpcaster: (versionedOperation: VO) => O) {
        this.defaultValue = defaultValue;
        this.indexedDBRecordStoreUpcaster = indexedDBRecordStoreUpcaster(
            valueUpcaster,
            operationUpcaster
        )
        this.database = openRecordsIndexedDB();
    }

    async find(id: RecordId): Promise<RecordStore<V, S, O>> {
        let db = await this.database;
        let tx = db.transaction("RECORD_STORES", "readonly");
        let recordsObjectStore = tx.objectStore("RECORD_STORES");

        let result = await new Promise(((resolve, reject) => {
            let request = recordsObjectStore.get(id);
            request.addEventListener("success", () => resolve(request.result));
            request.addEventListener("error", (event) => reject(event));
        })) as (VersionedIndexedDBRecordStore<VV, VO> | undefined);
        if (result) {
            let indexedDBRecordStore = this.indexedDBRecordStoreUpcaster(result);
            return {
                inProgressChangeset: indexedDBRecordStore.inProgressChangeset,
                outstandingChangesets: indexedDBRecordStore.outstandingChangesets,
                unprocessedChangesets: indexedDBRecordStore.unprocessedChangesets,
                localRecord: {
                    metadata: {type: "RECORD", version: 1},
                    value: indexedDBRecordStore.localRecord.value,
                    version: indexedDBRecordStore.localRecord.version,
                    cursors: {}
                },
                remoteRecord: {
                    metadata: {type: "RECORD", version: 1},
                    version: indexedDBRecordStore.remoteRecord.version,
                    value: indexedDBRecordStore.remoteRecord.value,
                    cursors: {}
                },
                undoQueue: [],
                redoQueue: []
            };
        } else {
            return RecordStore.defaultRecordStore(this.defaultValue);
        }
    }

    async save(id: RecordId, recordStore: RecordStore<V, S, O>): Promise<void> {
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
            } as IndexedDBRecordStore<V, O>, id);
            request.addEventListener("success", () => resolve());
            request.addEventListener("error", (event) => reject(event));
        });
    }
}