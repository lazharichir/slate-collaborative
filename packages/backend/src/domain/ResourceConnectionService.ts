import ConnectionService from "./ConnectionService";
import ResourceConnectionRepository from "./ResourceConnectionRepository";
import {ConnectionId} from "./ConnectionId";
import {ResourceId, ResourceVersion} from "@wleroux/resource";
import {Response} from "../application/Response";

export default class ResourceConnectionService<V, S, O> {
    private resourceConnectionRepository: ResourceConnectionRepository;
    private connectionService: ConnectionService<V, S, O>;

    constructor(resourceConnectionRepository: ResourceConnectionRepository, connectionService: ConnectionService<V, S, O>) {
        this.resourceConnectionRepository = resourceConnectionRepository;
        this.connectionService = connectionService;
    }

    addConnection(resourceId: ResourceId, resourceVersion: ResourceVersion, connectionId: ConnectionId): Promise<void> {
        return this.resourceConnectionRepository.addConnection(resourceId, resourceVersion, connectionId);
    }

    removeConnection(resourceId: ResourceId, resourceVersion: ResourceVersion, connectionId: ConnectionId): Promise<void> {
        return this.resourceConnectionRepository.removeConnection(resourceId, resourceVersion, connectionId);
    }

    async broadcast(id: ResourceId, resourceVersion: ResourceVersion, response: Response<V, S, O>, excludeConnectionId?: ConnectionId): Promise<void> {
		let connections = (await this.resourceConnectionRepository.findConnectionsByResourceId(id, resourceVersion))
			.filter(connectionId => connectionId !== excludeConnectionId);
		console.log(`📡 Broadcasting`, { id, resourceVersion, excludeConnectionId }, connections)
		await Promise.all(connections.map(resourceConnectionId => {
			try {
				return this.connectionService.send(resourceConnectionId, response)
			} catch (e) {
				console.error(`broadcast error: `, e)
				return this.resourceConnectionRepository.removeConnection(id, resourceVersion, resourceConnectionId)
				// throw e;
			}
		}));
    }
}