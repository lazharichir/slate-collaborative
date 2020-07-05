import ResourceConnectionRepository from "../domain/ResourceConnectionRepository";
import {ConnectionId} from "../domain/ConnectionId";
import {ResourceId, ResourceVersion} from "@wleroux/resource";

export default class InMemoryResourceConnectionRepository implements ResourceConnectionRepository {

	private rows: { id: ResourceId, version: ResourceVersion, connectionId: ConnectionId }[] = []

    constructor() {

		console.log(`🆕🆕🆕 InMemoryResourceConnectionRepository 🆕🆕🆕`)

		setInterval(() => {
			console.log(`\n\nInMemory Resource Connection – STATE\n`, this.rows)
		}, 3000)

	}

    async addConnection(id: ResourceId, version: ResourceVersion, connectionId: ConnectionId): Promise<void> {
		this.log(`🧳 InMemoryResourceConnectionRepository.addConnection: `, { id, version, connectionId })
		this.rows = this.rows.concat({ id, version, connectionId })
    }

    async findConnectionsByResourceId(id: ResourceId, version: ResourceVersion): Promise<ConnectionId[]> {
		const rows = this.rows.filter((row) => row.id === id && row.version === version).map((row) => row.connectionId)
		this.log(`🧳 InMemoryResourceConnectionRepository.findConnectionsByResourceId: `, { id, version }, rows, this.rows)
		return rows
    }

    async removeConnection(id: ResourceId, version: ResourceVersion, connectionId: ConnectionId): Promise<void> {
		this.log(`🧳 InMemoryResourceConnectionRepository.removeConnection: `, { id, version, connectionId }, { before: this.rows.length })
		this.rows = this.rows.filter((row) => {
			const isItTheConnection = row.id === id && row.version === version && row.connectionId === connectionId
			return !isItTheConnection
		})
		this.log({ after: this.rows.length })
    }
	
    async findResourceIdsByConnectionId(connectionId: ConnectionId): Promise<{ id: ResourceId, version: ResourceVersion }[]> {
		const rows = this.rows.filter((row) => row.connectionId === connectionId).map(({ id, version }) => {
			return { id, version }
		})
		this.log(`🧳 InMemoryResourceConnectionRepository.findResourceIdsByConnectionId: `, { connectionId }, rows, this.rows)
		return rows
	}
	
	private log(...args: any[]) {
		console.log(...args)
	}
}