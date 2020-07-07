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
    VersionedResource,
	ResourceVersion
} from "@wleroux/resource";
import { UniqueIdGenerator } from "../utils/UniqueIdGenerator";

export default class PgResourceRepository<VV, V, VS, S, VO, O> implements ResourceRepository<V, S, O> {
	private readonly knex: Knex;
	private readonly defaultValue: V;
    private readonly resourceUpcaster: (versionedResource: VersionedResource<VV, VS>) => Resource<V, S>;
    private readonly changesetUpcaster: (versionedChangeset: VersionedChangeset<VO>) => Changeset<O>;
	private readonly resourceTableName = `documents`
	private readonly changesetTableName = `changesets`

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
	
	mapRowToObject(row: any): Resource<V, S> {
		return {
			revision: parseInt(String(row.revision)),
			value: row.value as V,
			cursor: row.cursor as { [key: string]: S },
			metadata: row.metadata as {
				type: `RESOURCE`,
				version: `1`,
			},
		} as Resource<V, S>
	}

	mapChangesetRowToObject(row: any): Changeset<O> {
		return {
			id: String(row.id) as ChangesetId,
			revision: parseInt(String(row.revision)) as ResourceRevision,
			client: String(row.inserted_by) as ClientId,
			operations: row.operations as O[],
			metadata: row.metadata as {
				type: `CHANGESET`,
				version: `1`,
			},
		} as Resource<V, S>
	}

    async findResource(document: ResourceId, version: ResourceVersion): Promise<Resource<V, S>> {
		const rows = await this.knex(this.resourceTableName).select().where({ document, version })
		this.log(`🧳 PgResourceRepository.findResource: `, { document, version }, rows)

		if (!rows[0]) {
			console.log(`Resource "${document}/${version}" not found.`)
			return Resource.DEFAULT(this.defaultValue);
		}

		return this.resourceUpcaster((this.mapRowToObject(rows[0]) as unknown) as VersionedResource<VV, VS>);
    }

    async saveResource(document: ResourceId, version: ResourceVersion, resource: Resource<V, S>): Promise<void> {
		this.log(`🧳 PgResourceRepository.saveResource: `, { document, version, resource })
		const txn = await this.knex.transaction();
		try {

			const existing = await txn(this.resourceTableName).select().where({ document, version }).limit(1)

			if (existing[0]) {
				await txn(this.resourceTableName).update({
					id: existing[0].id,
					revision: parseInt(resource.revision),
					value: JSON.stringify(resource.value),
					cursors: JSON.stringify(resource.cursors),
					metadata: JSON.stringify(resource.metadata),
					inserted_by: ``,
				}).where({ document, version })
			}
			
			else {
				await txn(this.resourceTableName).insert({
					id: UniqueIdGenerator.generateUUID(),
					document,
					version,
					revision: parseInt(resource.revision),
					value: JSON.stringify(resource.value),
					cursors: JSON.stringify(resource.cursors),
					metadata: JSON.stringify(resource.metadata),
					inserted_by: ``,
				})
			}

			await txn.commit()
		} catch (error) {
			await txn.rollback(error)
		}
    }

    async deleteResource(document: ResourceId, version: ResourceVersion): Promise<void> {
		this.log(`🧳 PgResourceRepository.deleteResource: `, { document, version })
		const txn = await this.knex.transaction();
		try {
			await txn(this.resourceTableName).delete().where({ document, version })
			await txn(this.changesetTableName).delete().where({ document, version })
			await txn.commit()
		} catch (error) {
			await txn.rollback(error)
		}
    }

    async *findChangesetsSince(document: ResourceId, version: ResourceVersion, revision: ResourceRevision): AsyncIterable<Changeset<O>> {
		
		this.log(`🧳 PgResourceRepository.findChangesetsSince: `, { document, version, revision })

		const changesetsSince = (await this.knex(this.changesetTableName)
			.select()
			.from(this.changesetTableName)
			.where({ document, version })
			.andWhere(`revision`, `>=`, revision)).map(row => this.mapChangesetRowToObject(row))

		for (const item of changesetsSince) {
			yield this.changesetUpcaster(item as unknown as VersionedChangeset<VO>);
		}
    }

    async saveChangeset(document: ResourceId, version: ResourceVersion, changeset: Changeset<O>): Promise<void> {
		this.log(`🧳 PgResourceRepository.saveChangeset: `, { document, version, changeset })
		const txn = await this.knex.transaction();
		try {
			const resources = await txn(this.resourceTableName).select([`id`]).where({ document, version, revision: changeset.revision })
			
			if (!resources[0]) {
	
				await txn(this.changesetTableName).insert({
					id: changeset.id,
					document,
					version,
					revision: changeset.revision,
					inserted_by: changeset.client,
					operations: JSON.stringify(changeset.operations),
					metadata: JSON.stringify(changeset.metadata),
				})
	
			}
	
			await txn.commit()

		} catch (error) {
			await txn.rollback(error)
		}
	}
	
	private log(...args: any[]) {
		console.log(...args)
	}

}