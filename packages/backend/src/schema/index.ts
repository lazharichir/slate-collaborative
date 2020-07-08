import * as graphql from "graphql"
import { Query } from "./queries"
import { Mutation } from "./mutations"
import { Subscription } from "./subscriptions"

export const Schema = new graphql.GraphQLSchema({
	query: Query,
	mutation: Mutation,
	subscription: Subscription,
})