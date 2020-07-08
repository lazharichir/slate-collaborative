import { ApolloClient, HttpLink, InMemoryCache, split } from "@apollo/client"
import { getMainDefinition } from "@apollo/client/utilities"
import { WebSocketLink } from "@apollo/link-ws"

const wsLink = new WebSocketLink({
	uri: `ws://localhost:5000/graphql`,
	options: {
		reconnect: true,
	},
})

const httpLink = new HttpLink({
	uri: "http://localhost:5000/graphql",
})

// The split function takes three parameters:
//
// * A function that's called for each operation to execute
// * The Link to use for an operation if the function returns a "truthy" value
// * The Link to use for an operation if the function returns a "falsy" value

const splitLink = split(
	(op: any) => {
		const { query, operationName } = op
		const definition = getMainDefinition(query)
		return (
			(
				typeof operationName === `string` && operationName.endsWith(`OverWS`)
			) 
				||
			(
				definition.kind === "OperationDefinition" &&
				definition.operation === "subscription"
			)
		)
	},
	wsLink,
	httpLink
)

export const client = new ApolloClient({
	cache: new InMemoryCache(),
	link: splitLink,
})