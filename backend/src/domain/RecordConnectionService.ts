import ConnectionService from "./ConnectionService";
import RecordConnectionRepository from "./RecordConnectionRepository";
import {ConnectionId} from "./ConnectionId";
import {RecordId} from "record";
import {Response} from "../application/Response";

export default class RecordConnectionService<V, S, O> {
    private editorConnectionRepository: RecordConnectionRepository;
    private connectionService: ConnectionService<V, S, O>;

    constructor(editorConnectionRepository: RecordConnectionRepository, connectionService: ConnectionService<V, S, O>) {
        this.editorConnectionRepository = editorConnectionRepository;
        this.connectionService = connectionService;
    }

    async broadcast(id: RecordId, response: Response<V, S, O>, excludeConnectionId?: ConnectionId): Promise<void> {
        let connections = (await this.editorConnectionRepository.findConnectionsByRecordId(id))
            .filter(connectionId => connectionId !== excludeConnectionId);
        await Promise.all(connections.map(recordConnectionId =>
            this.connectionService.send(recordConnectionId, response).catch(e => {
                if (e.statusCode === 410) {
                    return this.editorConnectionRepository.removeConnection(id, recordConnectionId)
                } else {
                    throw e;
                }
            })
        ));
    }
}