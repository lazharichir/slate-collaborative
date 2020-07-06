import {ResourceId, ResourceVersion} from "@wleroux/resource";
import {ResourceStore} from "./ResourceStore";

export interface ResourceStoreStorage<V, S, O> {
    find(id: ResourceId, version: ResourceVersion): Promise<ResourceStore<V, S, O>>
    save(id: ResourceId, version: ResourceVersion, resourceStore: ResourceStore<V, S, O>): Promise<void>
};
