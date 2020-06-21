import {ConnectionId} from "../domain/ConnectionId";
import {Request} from "common";
import RecordConnectionRepository from "../domain/RecordConnectionRepository";
import RecordRepository from "../domain/RecordRepository";
import ConnectionService from "../domain/ConnectionService";
import ChangesetRepository from "../domain/ChangesetRepository";
import RecordService from "../domain/RecordService";
import RecordConnectionService from "../domain/RecordConnectionService";
import {slateChangesetUpcaster} from "common";

export default class RequestHandler {

    private recordConnectionRepository: RecordConnectionRepository
    private recordRepository: RecordRepository
    private connectionService: ConnectionService
    private recordChangesetRepository: ChangesetRepository
    private recordService: RecordService
    private recordConnectionService: RecordConnectionService

    constructor(recordConnectionRepository: RecordConnectionRepository, recordRepository: RecordRepository, connectionService: ConnectionService, recordChangesetRepository: ChangesetRepository, recordService: RecordService, recordConnectionService: RecordConnectionService) {
        this.recordConnectionRepository = recordConnectionRepository
        this.recordRepository = recordRepository
        this.connectionService = connectionService
        this.recordChangesetRepository = recordChangesetRepository
        this.recordService = recordService
        this.recordConnectionService = recordConnectionService
    }

    async handle(connectionId: ConnectionId, request: Request): Promise<void> {
        if (request.type === "subscribe") {
            let {id, since} = request;
            await this.recordConnectionRepository.addConnection(id, connectionId);
            if (since === "latest") {
                let record = await this.recordRepository.find(id);
                await this.connectionService.send(connectionId, {type: "record_loaded", id, record});
                since = record.version;
            }
            let promises = [];
            for await (const changeset of this.recordChangesetRepository.findSince(id, since)) {
                promises.push(this.connectionService.send(connectionId, {type: "changeset_applied", id, changeset}));
            }
            await Promise.all(promises);
        } else if (request.type === "unsubscribe") {
            await this.recordConnectionRepository.removeConnection(request.id, connectionId);
        } else if (request.type === "apply_changeset") {
            let {id, changeset} = request;
            let appliedChangeset = await this.recordService.applyChangeset(id, slateChangesetUpcaster(changeset));
            if (appliedChangeset !== null) {
                changeset = appliedChangeset;
                await this.connectionService.send(connectionId, {
                    type: "changeset_applied",
                    id, changeset
                })
                await this.recordConnectionService.broadcast(id, {type: "changeset_applied", id, changeset}, connectionId);
            }
        } else if (request.type === "keep_alive") {
            // do nothing!
            await this.connectionService.send(connectionId, {type: "keep_alive"});
        } else {
            throw Error(`Unrecognized request: ${JSON.stringify(request)}`)
            // Ignore
        }
    }
}
