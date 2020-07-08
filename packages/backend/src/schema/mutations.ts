import * as graphql from "graphql"
import { Changeset, ResourceId, ResourceVersion, ResourceRevision } from "@wleroux/resource"
import { SlateOperation, VersionedSlateOperation, VersionedSlateValue } from "@wleroux/slate-value"
import { pubsub } from "./pubsub"
import { StatelessHandler } from "../handler.pg.stateless"
import { Request } from "../application/Request"

export const unsubscribeFromDocument: graphql.GraphQLFieldConfig<
	any,
	any,
	{ document: string; version: string }
> = {
	type: graphql.GraphQLBoolean,
	args: {
		document: { type: graphql.GraphQLNonNull(graphql.GraphQLString) },
		version: { type: graphql.GraphQLNonNull(graphql.GraphQLString) },
	},
	resolve: (_, { document, version }) => {
		console.log(`unsubscribeFromDocument`, { document, version })
		return true
	},
}

export const appplyChangesetToDocument: graphql.GraphQLFieldConfig<
	any,
	any,
	{ changeset: string }
> = {
	type: graphql.GraphQLBoolean,
	args: {
		changeset: { type: graphql.GraphQLNonNull(graphql.GraphQLString) },
	},
	resolve: async (_, { changeset }) => {
		try {
			
			const parsedChangeset = JSON.parse(changeset) as Changeset<SlateOperation>
			
			const appliedChangeset =  await StatelessHandler(
				parsedChangeset.client,
				{
					type: `apply_changeset`,
					document: parsedChangeset.document,
					version: parsedChangeset.version,
					changeset: parsedChangeset,
				} as Request<VersionedSlateValue, VersionedSlateOperation>
			)
			
			return true

		} catch (error) {
			console.error(`appplyChangesetToDocument.resolve()`, error)
			return false
		}
	},
}

export const Mutation = new graphql.GraphQLObjectType<any, any, any>({
	name: `Mutation`,
	fields: {
		unsubscribeFromDocument,
		appplyChangesetToDocument,
	},
})
