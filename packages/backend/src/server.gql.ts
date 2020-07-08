import fastify from "fastify"
import cors from "fastify-cors"
import GQL from "fastify-gql"
import { Schema } from "./schema"
import { pubsub } from "./schema/pubsub"
import { withFilter } from 'graphql-subscriptions';

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

					subscribe: withFilter(() => pubsub.asyncIterator(`ChangesetApplied`), (payload, variables) => {
						console.log(`payload`, payload)
						console.log(`variables`, variables)
						return String(payload.document) === String(variables.document) && String(payload.version) === String(variables.version);
					}),

					// subscribe: (_, __, subscriptionContext, ctx) => {
					// 	console.log(`subscriptionContext => `, subscriptionContext)
					// 	console.log(`ctx => `, ctx)
					// 	return pubsub.asyncIterator(`ChangesetApplied`)
					// },
				}
			}
		}
	})

	app.listen(port)

	console.log(`Listening on port ${port}!`)

	return app
}