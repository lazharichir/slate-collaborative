// @ts-nocheck
import ResourceConnectionRepository from "../domain/ResourceConnectionRepository";
import {ConnectionId} from "../domain/ConnectionId";
import {ResourceId, ResourceVersion} from "@wleroux/resource";
import Knex from "knex";
import { UniqueIdGenerator } from "../utils/UniqueIdGenerator";

export default class PgResourceConnectionRepository implements ResourceConnectionRepository {

	private readonly knex: Knex;
	private readonly connectionTableName = `connections`

    constructor(knex: Knex) {
		this.knex = knex;
	}

    async addConnection(document: ResourceId, version: ResourceVersion, connectionId: ConnectionId): Promise<void> {
		this.log(`🧳 PgResourceConnectionRepository.addConnection: `, { document, version, connectionId })
		await this.knex(this.connectionTableName).insert({
			id: UniqueIdGenerator.generateUUID(),
			connection: connectionId,
			document,
			version,
			initiated_by: connectionId,
		})
    }

    async findConnectionsByResourceId(document: ResourceId, version: ResourceVersion): Promise<ConnectionId[]> {
		const rows = await this.knex.select().from(this.connectionTableName).where({ document, version })
		this.log(`🧳 PgResourceConnectionRepository.findConnectionsByResourceId: `, { document, version }, rows)
		return rows.map(row => row.connection as ConnectionId)
    }

    async removeConnection(document: ResourceId, version: ResourceVersion, connectionId: ConnectionId): Promise<void> {
		this.log(`🧳 PgResourceConnectionRepository.removeConnection: `, { document, version, connectionId })
		await this.knex(this.connectionTableName).delete().where({ document, version, connection: connectionId })
    }
	
    async findResourceIdsByConnectionId(connectionId: ConnectionId): Promise<{ id: ResourceId, version: ResourceVersion }[]> {
		const rows = await this.knex.select().from(this.connectionTableName).where({ connection: connectionId })
		this.log(`🧳 PgResourceConnectionRepository.findResourceIdsByConnectionId: `, { connectionId }, rows)
		return rows.map(row => {
			return {
				id: row.document as ResourceId,
				version: row.version as ResourceVersion,
			}
		})
	}
	
	private log(...args: any[]) {
		console.log(...args)
	}
}