import {ConnectionId} from "../domain/ConnectionId";
import ResourceService from "../domain/ResourceService";
import ResourceConnectionService from "../domain/ResourceConnectionService";
import {Changeset, changesetUpcaster, VersionedChangeset, ResourceId, ResourceVersion, ResourceRevision, Resource} from "@wleroux/resource";
import {Request} from "./Request";
import { SlateValue, SlateSelection, SlateOperation } from "@wleroux/slate-value";

export type Output<V, S, O> = Resource<V, S> & {
	since: Changeset<O>[]
}

export default class GetDocumentValueRequestHandler<VV, V, VS, S, VO, O> {
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

    async handle(document: ResourceId, version: ResourceVersion, since: ResourceRevision|`latest`): Promise<Output<V, S, O>> {
		try {

			let resource: Resource<V, S> = await this.resourceService.findResource(document, version);
			
			if (since === `latest`)
                since = resource.revision;

			if (!resource)
				throw new Error(`Resource not found: ${document}/${version}.`)
			
			let changesets: Changeset<O>[] = [];
			
			for await (const changeset of this.resourceService.findChangesetsSince(document, version, since)) {
                changesets.push(changeset)
			}
			
			return {
				...resource,
				since: changesets,
			}

		} catch (error) {
			throw error
		}
    }
}
