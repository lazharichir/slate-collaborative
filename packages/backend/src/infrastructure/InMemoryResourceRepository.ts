import ResourceRepository from "../domain/ResourceRepository";
import {
    Changeset,
    changesetUpcaster,
    Resource,
    ResourceId,
    ResourceVersion,
    resourceUpcaster,
    ResourceRevision,
    VersionedChangeset,
    VersionedResource
} from "@wleroux/resource";

export default class InMemoryResourceRepository<VV, V, VS, S, VO, O> implements ResourceRepository<V, S, O> {
	private readonly defaultValue: V;
    private readonly resourceUpcaster: (versionedResource: VersionedResource<VV, VS>) => Resource<V, S>;
    private readonly changesetUpcaster: (versionedChangeset: VersionedChangeset<VO>) => Changeset<O>;
	private resourceRows: { id: ResourceId, version: ResourceVersion, resource: Resource<V, S> }[] = []
	private resourceChangesetRows: { id: ResourceId, version: ResourceVersion, revision: ResourceRevision, changeset: Changeset<O> }[] = []

    constructor(
        valueUpcaster: (versionedValue: VV) => V,
        selectionUpcaster: (versionedSelection: VS) => S,
        operationUpcaster: (versionedOperation: VO) => O,
        defaultValue: V
    ) {
        this.resourceUpcaster = resourceUpcaster(valueUpcaster, selectionUpcaster);
        this.changesetUpcaster = changesetUpcaster(operationUpcaster);
        this.defaultValue = defaultValue;
    }

    async findResource(id: ResourceId, version: ResourceVersion): Promise<Resource<V, S>> {
		const row = this.resourceRows.find(row => row.id === id && row.version === version)
		this.log(`🧳 InMemoryResourceRepository.findResource: `, { id, version }, row, this.resourceRows)
		if (row) {
			return this.resourceUpcaster((row.resource as unknown) as VersionedResource<VV, VS>);
		} else {
			return Resource.DEFAULT(this.defaultValue);
		}
    }

    async saveResource(id: ResourceId, version: ResourceVersion, resource: Resource<V, S>): Promise<void> {
		this.resourceRows = this.resourceRows.filter(row => {
			const isTheOne = row.id === id && row.version === version
			return !isTheOne
		}).concat({ id, version, resource })
		this.log(`🧳 InMemoryResourceRepository.saveResource: `, { id, version, resource }, this.resourceRows)
    }

    async deleteResource(id: ResourceId, version: ResourceVersion): Promise<void> {
		this.log(`🧳 InMemoryResourceRepository.deleteResource: `, { id, version }, this.resourceRows)
		this.resourceRows = this.resourceRows.filter(row => {
			const isTheOne = row.id === id && row.version === version
			return !isTheOne
		})
		this.resourceChangesetRows = this.resourceChangesetRows.filter(row => {
			const isTheOne = row.id === id && row.version === version
			return !isTheOne
		})
    }

    async *findChangesetsSince(id: ResourceId, version: ResourceVersion, revision: ResourceRevision): AsyncIterable<Changeset<O>> {
		this.log(`🧳 InMemoryResourceRepository.findChangesetsSince: `, { id, version, revision }, this.resourceChangesetRows)
		const changesetsSince = this.resourceChangesetRows.filter((row) => row.id === id && row.version === version && row.revision >= revision)
		for (const item of changesetsSince) {
			yield this.changesetUpcaster(item.changeset as unknown as VersionedChangeset<VO>);
		}
    }

    async saveChangeset(id: ResourceId, version: ResourceVersion, changeset: Changeset<O>): Promise<void> {
		this.log(`🧳 InMemoryResourceRepository.saveChangeset: `, { id, changeset }, this.resourceChangesetRows)
		const resourceChangeset = this.resourceChangesetRows.find(row => row.id === id && row.version === version && row.revision === changeset.revision)
		if (resourceChangeset)
			return
		this.resourceChangesetRows = this.resourceChangesetRows.concat({ id, version, revision: changeset.revision, changeset })
	}
	
	private log(...args: any[]) {
		console.log(...args)
	}

}