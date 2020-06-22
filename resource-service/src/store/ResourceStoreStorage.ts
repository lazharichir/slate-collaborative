import {ResourceId} from "resource";
import {ResourceStore} from "./ResourceStore";

export interface ResourceStoreStorage<V, S, O> {
    find(id: ResourceId): Promise<ResourceStore<V, S, O>>
    save(id: ResourceId, resourceStore: ResourceStore<V, S, O>): Promise<void>
};
