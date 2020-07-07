import ResourceConnectionRepository from "./domain/ResourceConnectionRepository"
import ConnectionService from "./domain/ConnectionService"
import WSConnectionService from "./infrastructure/WSConnectionService"
import ResourceService from "./domain/ResourceService"
import ResourceConnectionService from "./domain/ResourceConnectionService"
import RequestHandler from "./application/RequestHandler"
import { ConnectionId } from "./domain/ConnectionId"
import ResourceRepository from "./domain/ResourceRepository"
import {
	SlateOperation,
	slateOperationsTransformer,
	slateOperationUpcaster,
	SlateSelection,
	slateSelectionsReducer,
	SlateValue,
	slateValueReducer,
	VersionedSlateOperation,
	VersionedSlateSelection,
	VersionedSlateValue,
} from "@wleroux/slate-value"
import { Request } from "./application/Request"
import {
	resourcesPgRepository,
	resourceConnectionPgRepository,
} from "./database/knex"
import { SocketStream } from "fastify-websocket"
import { FastifyRequest, FastifyInstance } from "fastify"

const connections = new Map<ConnectionId, WSConnection>()

let connectionService: ConnectionService<
	SlateValue,
	SlateSelection,
	SlateOperation
> = new WSConnectionService<SlateValue, SlateSelection, SlateOperation>(
	connections
)

let resourceConnectionRepository: ResourceConnectionRepository = resourceConnectionPgRepository

let resourceRepository: ResourceRepository<
	SlateValue,
	SlateSelection,
	SlateOperation
> = resourcesPgRepository

let resourceService: ResourceService<
	SlateValue,
	SlateSelection,
	SlateOperation
> = new ResourceService<SlateValue, SlateSelection, SlateOperation>(
	slateValueReducer,
	slateSelectionsReducer,
	slateOperationsTransformer,
	resourceRepository
)

let resourceConnectionService: ResourceConnectionService<
	SlateValue,
	SlateSelection,
	SlateOperation
> = new ResourceConnectionService<SlateValue, SlateSelection, SlateOperation>(
	resourceConnectionRepository,
	connectionService
)

let requestHandler: RequestHandler<
	VersionedSlateValue,
	SlateValue,
	VersionedSlateSelection,
	SlateSelection,
	VersionedSlateOperation,
	SlateOperation
> = new RequestHandler<
	VersionedSlateValue,
	SlateValue,
	VersionedSlateSelection,
	SlateSelection,
	VersionedSlateOperation,
	SlateOperation
>(
	slateOperationUpcaster,
	connectionService,
	resourceService,
	resourceConnectionService
)

export interface WSConnection {
	connectionId: ConnectionId
	connection: SocketStream
	request: FastifyRequest
}

export async function websocketHandler(
	_server: FastifyInstance,
	connection: SocketStream,
	request: FastifyRequest,
	params = {}
): Promise<void> {
	try {
		const connectionId = String(
			request.headers[`sec-websocket-key`] || new Date().toISOString()
		)

		console.log(
			`websocket.handler[cId: ${connectionId}]: `,
			JSON.stringify(request.headers, null, 2)
		)

		await connectionService.open(connectionId, connection, request)

		connection.setEncoding(`utf8`)

		connection.socket.on(`message`, async (rawMessage) => {
			const request = JSON.parse(String(rawMessage)) as Request<
				VersionedSlateValue,
				VersionedSlateOperation
			>

			if (request.type !== `keep_alive`)
				console.log(`⬇️ [${connectionId}] says `, request)

			await requestHandler.handle(connectionId, request)
		})

		connection.socket.on(`close`, async (code: number, reason: string) => {
			const resourceIds = await resourceConnectionRepository.findResourceIdsByConnectionId(
				connectionId
			)

			await Promise.all(
				resourceIds.map((resourceId) =>
					resourceConnectionRepository.removeConnection(
						resourceId.id,
						resourceId.version,
						connectionId
					)
				)
			)
		})
	} catch (error) {
		console.error(error)
	} finally {
		return
	}
}
