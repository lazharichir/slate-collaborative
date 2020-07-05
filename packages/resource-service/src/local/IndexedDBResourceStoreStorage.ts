import {openResourcesIndexedDB} from "./openResourcesIndexedDB";
import {
    Changeset,
    changesetUpcaster,
    ResourceId,
    ResourceRevision,
    VersionedChangeset,
    VersionedResourceRevision
} from "@wleroux/resource";
import {ResourceStoreStorage} from "../store/ResourceStoreStorage";
import {ResourceStore} from "../store/ResourceStore";

type VersionedIndexedDBResource_1<VV> = {
    metadata: {type: "RESOURCE"; version: 1; };
    revision: VersionedResourceRevision;
    value: VV;
};

type VersionedIndexedDBResource<VV> =
    | VersionedIndexedDBResource_1<VV>
    ;

type VersionedIndexedDBResourceStore_1<VV, VO> = {
    remoteResource: VersionedIndexedDBResource<VV>,
    unprocessedChangesets: VersionedChangeset<VO>[],
    localResource: VersionedIndexedDBResource<VV>,
    inProgressChangeset: null | VersionedChangeset<VO>,
    outstandingChangesets: VersionedChangeset<VO>[],
};

type VersionedIndexedDBResourceStore<VV, VO> =
    | VersionedIndexedDBResourceStore_1<VV, VO>
    ;

type IndexedDBResource<V> = {
    metadata: {type: "RESOURCE"; version: 1; };
    revision: ResourceRevision;
    value: V;
}

type IndexedDBResourceStore<V, O> = {
    remoteResource: IndexedDBResource<V>,
    unprocessedChangesets: Changeset<O>[],
    localResource: IndexedDBResource<V>,
    inProgressChangeset: null | Changeset<O>,
    outstandingChangesets: Changeset<O>[]
}

function indexedDBResourceStoreUpcaster<VV, V, VO, O>(
    valueUpcaster: (versionedValue: VV) => V,
    operationUpcaster: (operation: VO) => O
): (indexedDBResourceStore: VersionedIndexedDBResourceStore<VV, VO>) => IndexedDBResourceStore<V, O> {
    const upcaster = changesetUpcaster(operationUpcaster);

    return (indexedDBResourceStore: VersionedIndexedDBResourceStore<VV, VO>): IndexedDBResourceStore<V, O> => {
        return ({
            ...indexedDBResourceStore,
            remoteResource: {
                ...indexedDBResourceStore.remoteResource,
                value: valueUpcaster(indexedDBResourceStore.remoteResource.value),
            },
            localResource: {
                ...indexedDBResourceStore.localResource,
                value: valueUpcaster(indexedDBResourceStore.localResource.value)
            },
            inProgressChangeset: indexedDBResourceStore.inProgressChangeset === null ? null : upcaster(indexedDBResourceStore.inProgressChangeset),
            outstandingChangesets: indexedDBResourceStore.outstandingChangesets.map(upcaster),
            unprocessedChangesets: indexedDBResourceStore.unprocessedChangesets.map(upcaster)
        });
    }
}

export default class IndexedDBResourceStoreStorage<VV, V, VS, S, VO, O> implements ResourceStoreStorage<V, S, O> {
    private readonly database: Promise<IDBDatabase>;
    private readonly defaultValue: V;
    private readonly indexedDBResourceStoreUpcaster: (versionedIndexedDBResourceStore: VersionedIndexedDBResourceStore<VV, VO>) => IndexedDBResourceStore<V, O>;

    constructor(defaultValue: V, valueUpcaster: (versionedValue: VV) => V, operationUpcaster: (versionedOperation: VO) => O) {
        this.defaultValue = defaultValue;
        this.indexedDBResourceStoreUpcaster = indexedDBResourceStoreUpcaster(
            valueUpcaster,
            operationUpcaster
        )
        this.database = openResourcesIndexedDB();
    }

    async find(id: ResourceId): Promise<ResourceStore<V, S, O>> {
        let db = await this.database;
        let tx = db.transaction("RESOURCE_STORES", "readonly");
        let recordsObjectStore = tx.objectStore("RESOURCE_STORES");

        let result = await new Promise(((resolve, reject) => {
            let request = recordsObjectStore.get(id);
            request.addEventListener("success", () => resolve(request.result));
            request.addEventListener("error", (event) => reject(event));
        })) as (VersionedIndexedDBResourceStore<VV, VO> | undefined);
        if (result) {
            let indexedDBResourceStore = this.indexedDBResourceStoreUpcaster(result);
            return {
                inProgressChangeset: indexedDBResourceStore.inProgressChangeset,
                outstandingChangesets: indexedDBResourceStore.outstandingChangesets,
                unprocessedChangesets: indexedDBResourceStore.unprocessedChangesets,
                localResource: {
                    metadata: {type: "RESOURCE", version: 1},
                    revision: indexedDBResourceStore.localResource.revision,
                    value: indexedDBResourceStore.localResource.value,
                    cursors: {}
                },
                remoteResource: {
                    metadata: {type: "RESOURCE", version: 1},
                    revision: indexedDBResourceStore.remoteResource.revision,
                    value: indexedDBResourceStore.remoteResource.value,
                    cursors: {}
                },
                undoQueue: [],
                redoQueue: []
            };
        } else {
            return ResourceStore.defaultResourceStore(this.defaultValue);
        }
    }

    async save(id: ResourceId, recordStore: ResourceStore<V, S, O>): Promise<void> {
        let db = await this.database;
        let tx = db.transaction("RESOURCE_STORES", "readwrite");
        let recordsObjectStore = tx.objectStore("RESOURCE_STORES");
        return new Promise((resolve, reject) => {
            let request = recordsObjectStore.put({
                inProgressChangeset: recordStore.inProgressChangeset,
                outstandingChangesets: recordStore.outstandingChangesets,
                unprocessedChangesets: recordStore.unprocessedChangesets,
                localResource: {
                    value: recordStore.localResource.value,
                    revision: recordStore.localResource.revision
                },
                remoteResource: {
                    value: recordStore.remoteResource.value,
                    revision: recordStore.remoteResource.revision
                }
            } as IndexedDBResourceStore<V, O>, id);
            request.addEventListener("success", () => resolve());
            request.addEventListener("error", (event) => reject(event));
        });
    }
}