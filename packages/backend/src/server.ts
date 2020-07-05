import fastify from "fastify"
import FastifyWebsocket from "fastify-websocket"
import { websocketHandler } from "./handler"

export const server = fastify({
	logger: true,
	ignoreTrailingSlash: true,
})

server.register(FastifyWebsocket, {
	options: {
		clientTracking: true
	}
})

server.get<{ Params: { document: string; version: string } }>(
	`/ws`,
	{ websocket: true },
	async (connection, _request, params = {}) => {
		return websocketHandler(server, connection, _request, params)
	}
)

const start = async () => {
	try {
		await server.listen(3000)
		console.log(`🚀 Fastify server running on port 3000`)
		console.log(`➡️ /ws`)
	} catch (err) {
		server.log.error(err)
		console.error(err)
		process.exit(1)
	}
}

start()
