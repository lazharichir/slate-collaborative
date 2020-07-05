import ResourceConnectionRepository from "../domain/ResourceConnectionRepository";
import {ConnectionId} from "../domain/ConnectionId";
import {ResourceId} from "@wleroux/resource";

export default class InMemoryResourceConnectionRepository implements ResourceConnectionRepository {

	private rows: { id: ResourceId, connectionId: ConnectionId }[] = []

    constructor() {

		console.log(`🆕🆕🆕 InMemoryResourceConnectionRepository 🆕🆕🆕`)

		setInterval(() => {
			console.log(`\n\nInMemory Resource Connection – STATE\n`, this.rows)
		}, 3000)

	}

    async addConnection(id: ResourceId, connectionId: ConnectionId): Promise<void> {
		this.log(`🧳 InMemoryResourceConnectionRepository.addConnection: `, { id, connectionId })
		this.rows = this.rows.concat({ id, connectionId })

		//.filter((row) => row.id !== id && row.connectionId !== connectionId)
    }

    async findConnectionsByResourceId(id: ResourceId): Promise<ConnectionId[]> {
		const rows = this.rows.filter((row) => row.id === id).map((row) => row.connectionId)
		this.log(`🧳 InMemoryResourceConnectionRepository.findConnectionsByResourceId: `, { id }, rows, this.rows)
		return rows
    }

    async removeConnection(id: ResourceId, connectionId: ConnectionId): Promise<void> {
		this.log(`🧳 InMemoryResourceConnectionRepository.removeConnection: `, { id, connectionId }, { before: this.rows.length })
		this.rows = this.rows.filter((row) => {
			const isItTheConnection = row.id === id && row.connectionId === connectionId
			return !isItTheConnection
		})
		this.log({ after: this.rows.length })
    }
	
    async findResourceIdsByConnectionId(connectionId: ConnectionId): Promise<ResourceId[]> {
		const rows = this.rows.filter((row) => row.connectionId === connectionId).map((row) => row.id)
		this.log(`🧳 InMemoryResourceConnectionRepository.findResourceIdsByConnectionId: `, { connectionId }, rows, this.rows)
		return rows
	}
	
	private log(...args: any[]) {
		console.log(...args)
	}
}