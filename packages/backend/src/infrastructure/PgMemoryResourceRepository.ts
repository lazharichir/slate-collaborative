// @ts-nocheck
import ResourceRepository from "../domain/ResourceRepository";
import Knex from "knex";
import {
    Changeset,
    changesetUpcaster,
    Resource,
    ResourceId,
    resourceUpcaster,
    ResourceRevision,
    VersionedChangeset,
    VersionedResource
} from "@wleroux/resource";

export default class PgResourceRepository<VV, V, VS, S, VO, O> implements ResourceRepository<V, S, O> {
	private readonly knex: Knex;
	private readonly defaultValue: V;
    private readonly resourceUpcaster: (versionedResource: VersionedResource<VV, VS>) => Resource<V, S>;
    private readonly changesetUpcaster: (versionedChangeset: VersionedChangeset<VO>) => Changeset<O>;
	private resourceRows: { id: ResourceId, resource: Resource<V, S> }[] = []
	private resourceChangesetRows: { id: ResourceId, revision: ResourceRevision, changeset: Changeset<O> }[] = []

    constructor(
		knex: Knex,
        valueUpcaster: (versionedValue: VV) => V,
        selectionUpcaster: (versionedSelection: VS) => S,
        operationUpcaster: (versionedOperation: VO) => O,
        defaultValue: V
    ) {
        this.resourceUpcaster = resourceUpcaster(valueUpcaster, selectionUpcaster);
        this.changesetUpcaster = changesetUpcaster(operationUpcaster);
        this.defaultValue = defaultValue;
        this.knex = knex;
    }

    async findResource(id: ResourceId): Promise<Resource<V, S>> {
		const row = this.resourceRows.find(row => row.id === id)
		this.log(`🧳 PgResourceRepository.findResource: `, { id }, row, this.resourceRows)
		if (row) {
			return this.resourceUpcaster((row.resource as unknown) as VersionedResource<VV, VS>);
		} else {
			return Resource.DEFAULT(this.defaultValue);
		}
    }

    async saveResource(id: ResourceId, resource: Resource<V, S>): Promise<void> {
		this.resourceRows = this.resourceRows.filter(row => row.id !== id).concat({ id, resource })
		this.log(`🧳 PgResourceRepository.saveResource: `, { id, resource }, this.resourceRows)
    }

    async deleteResource(id: ResourceId): Promise<void> {
		this.log(`🧳 PgResourceRepository.deleteResource: `, { id }, this.resourceRows)
		this.resourceRows = this.resourceRows.filter(row => row.id !== id)
		this.resourceChangesetRows = this.resourceChangesetRows.filter(row => row.id !== id)
    }

    async *findChangesetsSince(id: ResourceId, revision: ResourceRevision): AsyncIterable<Changeset<O>> {
		this.log(`🧳 PgResourceRepository.findChangesetsSince: `, { id, revision }, this.resourceChangesetRows)
		const changesetsSince = this.resourceChangesetRows.filter((row) => row.id === id && row.revision >= revision)
		for (const item of changesetsSince) {
			yield this.changesetUpcaster(item.changeset as unknown as VersionedChangeset<VO>);
		}
    }

    async saveChangeset(id: ResourceId, changeset: Changeset<O>): Promise<void> {
		this.log(`🧳 PgResourceRepository.saveChangeset: `, { id, changeset }, this.resourceChangesetRows)
		const resourceChangeset = this.resourceChangesetRows.find(row => row.id === id && row.revision === changeset.revision)
		if (resourceChangeset)
			return
		this.resourceChangesetRows = this.resourceChangesetRows.concat({ id, revision: changeset.revision, changeset })
	}
	
	private log(...args: any[]) {
		console.log(...args)
	}

}