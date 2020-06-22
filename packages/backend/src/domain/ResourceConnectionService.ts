import ConnectionService from "./ConnectionService";
import ResourceConnectionRepository from "./ResourceConnectionRepository";
import {ConnectionId} from "./ConnectionId";
import {ResourceId} from "@wleroux/resource";
import {Response} from "../application/Response";

export default class ResourceConnectionService<V, S, O> {
    private resourceConnectionRepository: ResourceConnectionRepository;
    private connectionService: ConnectionService<V, S, O>;

    constructor(resourceConnectionRepository: ResourceConnectionRepository, connectionService: ConnectionService<V, S, O>) {
        this.resourceConnectionRepository = resourceConnectionRepository;
        this.connectionService = connectionService;
    }

    addConnection(resourceId: ResourceId, connectionId: ConnectionId): Promise<void> {
        return this.resourceConnectionRepository.addConnection(resourceId, connectionId);
    }

    removeConnection(resourceId: ResourceId, connectionId: ConnectionId): Promise<void> {
        return this.resourceConnectionRepository.removeConnection(resourceId, connectionId);
    }

    async broadcast(id: ResourceId, response: Response<V, S, O>, excludeConnectionId?: ConnectionId): Promise<void> {
        let connections = (await this.resourceConnectionRepository.findConnectionsByResourceId(id))
            .filter(connectionId => connectionId !== excludeConnectionId);
        await Promise.all(connections.map(resourceConnectionId =>
            this.connectionService.send(resourceConnectionId, response).catch(e => {
                if (e.statusCode === 410) {
                    return this.resourceConnectionRepository.removeConnection(id, resourceConnectionId)
                } else {
                    throw e;
                }
            })
        ));
    }
}