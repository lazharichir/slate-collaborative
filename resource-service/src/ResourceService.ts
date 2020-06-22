import {ClientId, Resource, ResourceId} from "resource";
import {Subscriber} from "./Subscriber";
import {Subscription} from "./Subscription";

export interface ResourceService<V, S, O> {
    subscribe(id: ResourceId, subscriber: Subscriber<Resource<V, S>>): Promise<Subscription>
    applyOperations(id: ResourceId, clientId: ClientId, operations: O[]): Promise<void>
    applyUndo(id: ResourceId, clientId: ClientId): Promise<void>
    applyRedo(id: ResourceId, clientId: ClientId): Promise<void>
}
