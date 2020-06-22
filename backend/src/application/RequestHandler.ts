import {ConnectionId} from "../domain/ConnectionId";
import ResourceConnectionRepository from "../domain/ResourceConnectionRepository";
import ConnectionService from "../domain/ConnectionService";
import ResourceRepository from "../domain/ResourceRepository";
import ResourceService from "../domain/ResourceService";
import ResourceConnectionService from "../domain/ResourceConnectionService";
import {Changeset, changesetUpcaster, Resource, VersionedChangeset} from "resource";
import {Request} from "./Request";

export default class RequestHandler<VV, V, VS, S, VO, O> {
    private readonly valueUpcaster: (versionedValue: VV) => V;
    private readonly changesetUpcaster: (versionedChangeset: VersionedChangeset<VO>) => Changeset<O>;

    private resourceConnectionRepository: ResourceConnectionRepository
    private resourceRepository: ResourceRepository<V, S, O>
    private connectionService: ConnectionService<V, S, O>
    private resourceService: ResourceService<V, S, O>
    private resourceConnectionService: ResourceConnectionService<V, S, O>

    constructor(
        valueUpcaster: (versionedValue: VV) => V,
        operationUpcaster: (versionedOperation: VO) => O,
        resourceConnectionRepository: ResourceConnectionRepository, resourceRepository: ResourceRepository<V, S, O>, connectionService: ConnectionService<V, S, O>, resourceService: ResourceService<V, S, O>, resourceConnectionService: ResourceConnectionService<V, S, O>) {
        this.valueUpcaster = valueUpcaster;
        this.changesetUpcaster = changesetUpcaster(operationUpcaster);
        this.resourceConnectionRepository = resourceConnectionRepository
        this.resourceRepository = resourceRepository
        this.connectionService = connectionService
        this.resourceService = resourceService
        this.resourceConnectionService = resourceConnectionService
    }

    async handle(connectionId: ConnectionId, request: Request<VV, VO>): Promise<void> {
        if (request.type === "subscribe") {
            await this.resourceConnectionRepository.addConnection(request.id, connectionId);
            let since;
            if (request.since === "latest") {
                let resource = await this.resourceRepository.findResource(request.id);
                if (resource === null) {
                    resource = Resource.DEFAULT(this.valueUpcaster(request.defaultValue));
                    await this.resourceRepository.saveResource(request.id, resource);
                }

                await this.connectionService.send(connectionId, {type: "resource_loaded", id: request.id, resource});
                since = resource.version;
            } else {
                since = request.since;
            }
            let promises = [];
            for await (const changeset of this.resourceRepository.findChangesetsSince(request.id, since)) {
                promises.push(this.connectionService.send(connectionId, {type: "changeset_applied", id: request.id, changeset}));
            }
            await Promise.all(promises);
        } else if (request.type === "unsubscribe") {
            await this.resourceConnectionRepository.removeConnection(request.id, connectionId);
        } else if (request.type === "apply_changeset") {
            let {id, changeset} = request;
            let appliedChangeset = await this.resourceService.applyChangeset(id, this.changesetUpcaster(changeset));
            if (appliedChangeset !== null) {
                await this.connectionService.send(connectionId, {
                    type: "changeset_applied",
                    id, changeset: appliedChangeset
                })
                await this.resourceConnectionService.broadcast(id, {type: "changeset_applied", id, changeset: appliedChangeset}, connectionId);
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
