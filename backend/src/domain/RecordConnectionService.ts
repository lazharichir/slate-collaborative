import ConnectionService from "./ConnectionService";
import RecordConnectionRepository from "./RecordConnectionRepository";
import {ConnectionId} from "./ConnectionId";
import {Response} from "common/api/Response";
import {RecordId} from "common/record/Record";

export default class RecordConnectionService {
    private editorConnectionRepository: RecordConnectionRepository;
    private connectionService: ConnectionService;

    constructor(editorConnectionRepository: RecordConnectionRepository, connectionService: ConnectionService) {
        this.editorConnectionRepository = editorConnectionRepository;
        this.connectionService = connectionService;
    }

    async broadcast(id: RecordId, response: Response, excludeConnectionId?: ConnectionId): Promise<void> {
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