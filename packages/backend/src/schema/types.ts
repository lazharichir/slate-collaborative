import * as graphql from "graphql"

export const ChangeSetType = new graphql.GraphQLObjectType({
	name: `ChangeSet`,
	fields: {
		id: { type: graphql.GraphQLID },
		document: { type: graphql.GraphQLString },
		version: { type: graphql.GraphQLString },
		revision: { type: graphql.GraphQLInt },
		client: { type: graphql.GraphQLString },
		operations: { type: graphql.GraphQLString },
		metadata: { type: graphql.GraphQLString },
	},
})


export const DocumentResourceType = new graphql.GraphQLObjectType({
	name: `DocumentResource`,
	fields: {
		metadata: { type: graphql.GraphQLString },
		revision: { type: graphql.GraphQLInt },
		value:{ type: graphql.GraphQLString },
		cursors: { type: graphql.GraphQLString },
		since: { type: graphql.GraphQLString },
	},
})
