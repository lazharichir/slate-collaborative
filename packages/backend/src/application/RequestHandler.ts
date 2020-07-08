import {ConnectionId} from "../domain/ConnectionId";
import ConnectionService from "../domain/ConnectionService";
import ResourceService from "../domain/ResourceService";
import ResourceConnectionService from "../domain/ResourceConnectionService";
import {Changeset, changesetUpcaster, VersionedChangeset} from "@wleroux/resource";
import {Request} from "./Request";

export default class RequestHandler<VV, V, VS, S, VO, O> {
    private readonly changesetUpcaster: (versionedChangeset: VersionedChangeset<VO>) => Changeset<O>;
    private connectionService: ConnectionService<V, S, O>
    private resourceService: ResourceService<V, S, O>
    private resourceConnectionService: ResourceConnectionService<V, S, O>

    constructor(
        operationUpcaster: (versionedOperation: VO) => O,
        connectionService: ConnectionService<V, S, O>, resourceService: ResourceService<V, S, O>, resourceConnectionService: ResourceConnectionService<V, S, O>) {
        this.changesetUpcaster = changesetUpcaster(operationUpcaster);
        this.connectionService = connectionService
        this.resourceService = resourceService
        this.resourceConnectionService = resourceConnectionService
    }

    async handle(connectionId: ConnectionId, request: Request<VV, VO>): Promise<void> {
        if (request.type === "subscribe") {
            await this.resourceConnectionService.addConnection(request.document, request.version, connectionId);
            let since;
            if (request.since === "latest") {
                let resource = await this.resourceService.findResource(request.document, request.version);
                await this.connectionService.send(connectionId, {type: "resource_loaded", id: request.document, version: request.version, resource});
                since = resource.revision;
            } else {
                since = request.since;
            }
            let promises = [];
            for await (const changeset of this.resourceService.findChangesetsSince(request.document, request.version, since)) {
                promises.push(this.connectionService.send(connectionId, {type: "changeset_applied", id: request.document, version: request.version, changeset}));
            }
            await Promise.all(promises);
        } else if (request.type === "unsubscribe") {
            await this.resourceConnectionService.removeConnection(request.document, request.version, connectionId);
        } else if (request.type === "apply_changeset") {
            let {document, version, changeset} = request;
            let appliedChangeset = await this.resourceService.applyChangeset(document, version, this.changesetUpcaster(changeset));
            if (appliedChangeset !== null) {
                await this.connectionService.send(connectionId, {
                    type: "changeset_applied",
					id: document, version,
					changeset: appliedChangeset
                })
                await this.resourceConnectionService.broadcast(document, version, {type: "changeset_applied", id: document, version, changeset: appliedChangeset}, connectionId);
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
