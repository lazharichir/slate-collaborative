import { FastifyRequest } from "fastify"
import { SocketStream } from "fastify-websocket"
import ConnectionService from "../domain/ConnectionService"
import { ConnectionId } from "../domain/ConnectionId"
import { Response } from "../application/Response"

export interface WSConnection {
	connectionId: ConnectionId
	connection: SocketStream
	request: FastifyRequest
}

export default class WSConnectionService<V, S, O>
	implements ConnectionService<V, S, O> {
	constructor(
		private readonly connections = new Map<ConnectionId, WSConnection>()
	) {}

	async open(connectionId: ConnectionId, connection: SocketStream, request: FastifyRequest): Promise<void> {
		console.log(`⬆️ Opening ${connectionId}`)
		this.connections.set(connectionId, { connectionId, connection, request })
	}

	async send(
		connectionId: ConnectionId,
		message: Response<V, S, O>
	): Promise<void> {

		const client = this.connections.get(connectionId)
		
		if (message.type !== `keep_alive`)
			console.log(`⬆️ Sending to ${connectionId}: `, JSON.stringify(message), { client: client?.connectionId })
		
		if (!client) {
			console.log(`⬆️ Connection not found: ${connectionId}. `, JSON.stringify(this.connections.keys(), null, 2))
			await this.close(connectionId)
			return
		}

		client.connection.socket.send(JSON.stringify(message))
	}

	async close(connectionId: ConnectionId): Promise<void> {
		console.log(`⬆️ Closing ${connectionId}`)
		this.connections.delete(connectionId)
	}
}
