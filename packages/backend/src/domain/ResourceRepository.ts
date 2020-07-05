import {Changeset, Resource, ResourceId, ResourceRevision} from "@wleroux/resource";

export default interface ResourceRepository<V, S, O> {
    findResource(id: ResourceId): Promise<Resource<V, S>>
    saveResource(id: ResourceId, resource: Resource<V, S>): Promise<void>
    deleteResource(id: ResourceId): Promise<void>
    findChangesetsSince(id: ResourceId, revision: ResourceRevision): AsyncIterable<Changeset<O>>
    saveChangeset(id: ResourceId, changeset: Changeset<O>): Promise<void>
}
