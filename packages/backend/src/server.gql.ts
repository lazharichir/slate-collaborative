import fastify from "fastify"
import cors from "fastify-cors"
import GQL from "fastify-gql"
import { Schema } from "./schema"
import { pubsub } from "./schema/pubsub"

export const createServer = async (port: number = 5000) => {

	const app = fastify()
	
	app.register(cors, { origin: true })
	
	app.register(GQL, {
		graphiql: true,
		schema: Schema,
		subscription: true,
		resolvers: {
			Subscription: {
				subscribeToDocument: {
					resolve: (x) => {
						const response = {
							id: x.id,
							document: x.document,
							version: x.version,
							revision: x.revision,
							client: x.client,
							operations: JSON.stringify(x.operations),
							metadata: JSON.stringify(x.metadata),
						}

						console.log(`> subscribeToDocument payload...`, response)

						return response
					},
					subscribe: () => pubsub.asyncIterator(`ChangesetApplied`),
				}
			}
		}
	})

	app.listen(port)

	console.log(`Listening on port ${port}!`)

	return app
}