import ConnectionService from "./ConnectionService";
import ResourceConnectionRepository from "./ResourceConnectionRepository";
import {ConnectionId} from "./ConnectionId";
import {ResourceId} from "resource";
import {Response} from "../application/Response";

export default class ResourceConnectionService<V, S, O> {
    private editorConnectionRepository: ResourceConnectionRepository;
    private connectionService: ConnectionService<V, S, O>;

    constructor(editorConnectionRepository: ResourceConnectionRepository, connectionService: ConnectionService<V, S, O>) {
        this.editorConnectionRepository = editorConnectionRepository;
        this.connectionService = connectionService;
    }

    async broadcast(id: ResourceId, response: Response<V, S, O>, excludeConnectionId?: ConnectionId): Promise<void> {
        let connections = (await this.editorConnectionRepository.findConnectionsByResourceId(id))
            .filter(connectionId => connectionId !== excludeConnectionId);
        await Promise.all(connections.map(resourceConnectionId =>
            this.connectionService.send(resourceConnectionId, response).catch(e => {
                if (e.statusCode === 410) {
                    return this.editorConnectionRepository.removeConnection(id, resourceConnectionId)
                } else {
                    throw e;
                }
            })
        ));
    }
}