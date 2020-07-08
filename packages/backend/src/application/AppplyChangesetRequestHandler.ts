import {ConnectionId} from "../domain/ConnectionId";
import ResourceService from "../domain/ResourceService";
import ResourceConnectionService from "../domain/ResourceConnectionService";
import {Changeset, changesetUpcaster, VersionedChangeset} from "@wleroux/resource";
import {Request} from "./Request";

export default class AppplyChangesetRequestHandler<VV, V, VS, S, VO, O> {
    private readonly changesetUpcaster: (versionedChangeset: VersionedChangeset<VO>) => Changeset<O>;
    private resourceService: ResourceService<V, S, O>
    private resourceConnectionService: ResourceConnectionService<V, S, O>

    constructor(
        operationUpcaster: (versionedOperation: VO) => O,
		resourceService: ResourceService<V, S, O>,
		resourceConnectionService: ResourceConnectionService<V, S, O>
	) {
        this.changesetUpcaster = changesetUpcaster(operationUpcaster);
        this.resourceService = resourceService
        this.resourceConnectionService = resourceConnectionService
    }

    async handle(connectionId: ConnectionId, request: Request<VV, VO>): Promise<Changeset<O>> {
		try {
			
			if (request.type !== `apply_changeset`)
				throw new Error(`The request type "${request.type}" is not "apply_changeset".`)

			let {document, version, changeset} = request;

			let appliedChangeset = await this.resourceService.applyChangeset(document, version, this.changesetUpcaster(changeset));
			
			if (appliedChangeset !== null) {

				await this.resourceConnectionService.broadcast(document, version, {type: "changeset_applied", id: document, version, changeset: appliedChangeset}, connectionId);

				return appliedChangeset;
			}

			else {
				throw new Error(`Changeset ${changeset.id} could not be applied for "${document}/${version}"`);
			}

		} catch (error) {
			throw error
		}
    }
}
