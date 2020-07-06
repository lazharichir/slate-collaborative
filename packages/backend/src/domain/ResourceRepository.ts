import {Changeset, Resource, ResourceId, ResourceRevision, ResourceVersion} from "@wleroux/resource";

export default interface ResourceRepository<V, S, O> {
    findResource(id: ResourceId, version: ResourceVersion): Promise<Resource<V, S>>
    saveResource(id: ResourceId, version: ResourceVersion, resource: Resource<V, S>): Promise<void>
    deleteResource(id: ResourceId, version: ResourceVersion): Promise<void>
    findChangesetsSince(id: ResourceId, version: ResourceVersion, revision: ResourceRevision): AsyncIterable<Changeset<O>>
    saveChangeset(id: ResourceId, version: ResourceVersion, changeset: Changeset<O>): Promise<void>
}
