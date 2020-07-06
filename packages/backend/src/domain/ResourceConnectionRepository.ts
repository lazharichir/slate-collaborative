import {ConnectionId} from "./ConnectionId";
import {ResourceId, ResourceVersion, Resource} from "@wleroux/resource";

export default interface ResourceConnectionRepository {
    findConnectionsByResourceId(resourceId: ResourceId, resourceVersion: ResourceVersion): Promise<ConnectionId[]>
    findResourceIdsByConnectionId(connectionId: ConnectionId): Promise<{
		id: ResourceId
		version: ResourceVersion
	}[]>

    addConnection(resourceId: ResourceId, resourceVersion: ResourceVersion, connectionId: ConnectionId): Promise<void>
    removeConnection(resourceId: ResourceId, resourceVersion: ResourceVersion, connectionId: ConnectionId): Promise<void>
}
