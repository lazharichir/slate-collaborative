import {ConnectionId} from "../domain/ConnectionId";
import RecordConnectionRepository from "../domain/RecordConnectionRepository";
import ConnectionService from "../domain/ConnectionService";
import RecordRepository from "../domain/RecordRepository";
import RecordService from "../domain/RecordService";
import RecordConnectionService from "../domain/RecordConnectionService";
import {Changeset, changesetUpcaster, Record, VersionedChangeset} from "record";
import {Request} from "./Request";

export default class RequestHandler<VV, V, VS, S, VO, O> {
    private readonly valueUpcaster: (versionedValue: VV) => V;
    private readonly changesetUpcaster: (versionedChangeset: VersionedChangeset<VO>) => Changeset<O>;

    private recordConnectionRepository: RecordConnectionRepository
    private recordRepository: RecordRepository<V, S, O>
    private connectionService: ConnectionService<V, S, O>
    private recordService: RecordService<V, S, O>
    private recordConnectionService: RecordConnectionService<V, S, O>

    constructor(
        valueUpcaster: (versionedValue: VV) => V,
        operationUpcaster: (versionedOperation: VO) => O,
        recordConnectionRepository: RecordConnectionRepository, recordRepository: RecordRepository<V, S, O>, connectionService: ConnectionService<V, S, O>, recordService: RecordService<V, S, O>, recordConnectionService: RecordConnectionService<V, S, O>) {
        this.valueUpcaster = valueUpcaster;
        this.changesetUpcaster = changesetUpcaster(operationUpcaster);
        this.recordConnectionRepository = recordConnectionRepository
        this.recordRepository = recordRepository
        this.connectionService = connectionService
        this.recordService = recordService
        this.recordConnectionService = recordConnectionService
    }

    async handle(connectionId: ConnectionId, request: Request<VV, VO>): Promise<void> {
        if (request.type === "subscribe") {
            await this.recordConnectionRepository.addConnection(request.id, connectionId);
            let since;
            if (request.since === "latest") {
                let record = await this.recordRepository.findRecord(request.id);
                if (record === null) {
                    record = Record.DEFAULT(this.valueUpcaster(request.defaultValue));
                    await this.recordRepository.saveRecord(request.id, record);
                }

                await this.connectionService.send(connectionId, {type: "record_loaded", id: request.id, record});
                since = record.version;
            } else {
                since = request.since;
            }
            let promises = [];
            for await (const changeset of this.recordRepository.findChangesetsSince(request.id, since)) {
                promises.push(this.connectionService.send(connectionId, {type: "changeset_applied", id: request.id, changeset}));
            }
            await Promise.all(promises);
        } else if (request.type === "unsubscribe") {
            await this.recordConnectionRepository.removeConnection(request.id, connectionId);
        } else if (request.type === "apply_changeset") {
            let {id, changeset} = request;
            let appliedChangeset = await this.recordService.applyChangeset(id, this.changesetUpcaster(changeset));
            if (appliedChangeset !== null) {
                await this.connectionService.send(connectionId, {
                    type: "changeset_applied",
                    id, changeset: appliedChangeset
                })
                await this.recordConnectionService.broadcast(id, {type: "changeset_applied", id, changeset: appliedChangeset}, connectionId);
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
