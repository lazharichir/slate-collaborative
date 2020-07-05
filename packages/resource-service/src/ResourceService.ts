import {ClientId, Resource, ResourceId, ResourceVersion} from "@wleroux/resource";
import {Subscriber} from "./Subscriber";
import {Subscription} from "./Subscription";

export interface ResourceService<V, S, O> {
    subscribe(id: ResourceId, version: ResourceVersion, subscriber: Subscriber<Resource<V, S>>): Promise<Subscription>
    applyOperations(id: ResourceId, version: ResourceVersion, client: ClientId, operations: O[]): Promise<void>
    applyUndo(id: ResourceId, version: ResourceVersion, client: ClientId): Promise<void>
    applyRedo(id: ResourceId, version: ResourceVersion, client: ClientId): Promise<void>
}
