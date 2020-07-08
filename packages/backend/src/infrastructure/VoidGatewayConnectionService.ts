import ConnectionService from "../domain/ConnectionService"
import { ConnectionId } from "../domain/ConnectionId"
import { Response } from "../application/Response"
import { SocketStream } from "fastify-websocket"
import { FastifyRequest } from "fastify"
import { pubsub } from "../schema/pubsub"

export default class VoidGatewayConnectionService<V, S, O>
	implements ConnectionService<V, S, O> {
	constructor() {}

	async send(
		connectionId: ConnectionId,
		message: Response<V, S, O>
	): Promise<void> {
		// console.log(
		// 	`VoidGatewayConnectionService.send()`,
		// 	connectionId,
		// 	JSON.stringify(message, null, 2)
		// )
		// if (message.type === `changeset_applied`) {
		// 	const payload = {
		// 		id: message.id,
		// 		document: `dcccccc`,
		// 		version: ` vvvvvv`,
		// 		revision: message.changeset.revision,
		// 		client: message.changeset.client,
		// 		operations: message.changeset.operations,
		// 		metadata: message.changeset.metadata,
		// 	}
		// 	pubsub.publish(`AppliedChangeset`, payload)
		// }
	}

	async broadcastAppliedChangeset(message: Response<V, S, O>): Promise<void> {
		if (message.type === `changeset_applied`) {
			const payload = {
				id: message.changeset.id,
				document: message.changeset.document,
				version: message.changeset.version,
				revision: message.changeset.revision,
				client: message.changeset.client,
				operations: message.changeset.operations,
				metadata: message.changeset.metadata,
			}
			console.log(`> broadcastAppliedChangeset`, payload)
			pubsub.publish(`AppliedChangeset`, payload)
		}
	}

	async close(connectionId: ConnectionId): Promise<void> {
		console.log(`VoidGatewayConnectionService.close()`, connectionId)
	}

	async open(
		connectionId: ConnectionId,
		connection: SocketStream,
		request: FastifyRequest
	): Promise<void> {
		console.log(`VoidGatewayConnectionService.open()`, connectionId)
	}
}
