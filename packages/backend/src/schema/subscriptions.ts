import * as graphql from "graphql"
import { ChangeSetType } from "./types"
import { ResourceId, ResourceVersion, ResourceRevision } from "@wleroux/resource"
import { pubsub } from "../schema/pubsub"

export const subscribeToDocument: graphql.GraphQLFieldConfig<
	any,
	any,
	any // { document: ResourceId; version: ResourceVersion; revision: ResourceRevision; since?: number }
> = {
	type: ChangeSetType,
	// args: {
	// 	document: { type: graphql.GraphQLNonNull(graphql.GraphQLString) },
	// 	version: { type: graphql.GraphQLNonNull(graphql.GraphQLString) },
	// 	since: { type: graphql.GraphQLInt },
	// },
	// subscribe: (_, { document, version, since }) => {
	// 	console.log(`subscribeToDocument`, { document, version, since })
	// 	return pubsub.asyncIterator(`ChangesetApplied`)
	// },
}

export const Subscription = new graphql.GraphQLObjectType<any, any, any>({
	name: `Subscription`,
	fields: {
		subscribeToDocument,
	},
})



// return {
// 	id: UniqueIdGenerator.generateNanoId(),
// 	document: document,
// 	version: version,
// 	revision: changeset.revision,
// 	client: changeset.client,
// 	operations: changeset.operations,
// 	metadata: changeset.metadata,
// }