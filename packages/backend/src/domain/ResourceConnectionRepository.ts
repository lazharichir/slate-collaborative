import {ConnectionId} from "./ConnectionId";
import {ResourceId} from "@wleroux/resource";

export default interface ResourceConnectionRepository {
    findConnectionsByResourceId(resourceId: ResourceId): Promise<ConnectionId[]>
    findResourceIdsByConnectionId(connectionId: ConnectionId): Promise<ResourceId[]>

    addConnection(resourceId: ResourceId, connectionId: ConnectionId): Promise<void>
    removeConnection(resourceId: ResourceId, connectionId: ConnectionId): Promise<void>
}
