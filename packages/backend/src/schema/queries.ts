import * as graphql from "graphql"
import { ResourceId, ResourceVersion, ResourceRevision } from "@wleroux/resource"
import { DocumentResourceType } from "./types"
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
import ResourceConnectionRepository from "../domain/ResourceConnectionRepository"
import ConnectionService from "../domain/ConnectionService"
import VoidGatewayConnectionService from "../infrastructure/VoidGatewayConnectionService"
import ResourceService from "../domain/ResourceService"
import ResourceConnectionService from "../domain/ResourceConnectionService"
import RequestHandler from "../application/RequestHandler"
import ResourceRepository from "../domain/ResourceRepository"
import {
	resourcesPgRepository,
	resourceConnectionPgRepository,
} from "../database/knex"
import AppplyChangesetRequestHandler from "../application/AppplyChangesetRequestHandler"
import GetDocumentValueRequestHandler from "../application/GetDocumentValueRequestHandler"

let connectionService: ConnectionService<
	SlateValue,
	SlateSelection,
	SlateOperation
> = new VoidGatewayConnectionService<
	SlateValue,
	SlateSelection,
	SlateOperation
>()

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

let getDocumentValueRequestHandler: GetDocumentValueRequestHandler<
	VersionedSlateValue,
	SlateValue,
	VersionedSlateSelection,
	SlateSelection,
	VersionedSlateOperation,
	SlateOperation
> = new GetDocumentValueRequestHandler(
	slateOperationUpcaster,
	resourceService,
	resourceConnectionService
)

export const getDocumentValue: graphql.GraphQLFieldConfig<
	any,
	any,
	{
		document: ResourceId
		version: ResourceVersion
		since?: ResourceRevision | `latest`
	}
> = {
	type: DocumentResourceType,
	args: {
		document: { type: graphql.GraphQLNonNull(graphql.GraphQLString) },
		version: { type: graphql.GraphQLNonNull(graphql.GraphQLString) },
		since: { type: graphql.GraphQLInt }
	},
	resolve: async (_, { document, version, since }) => {

		since = since ? since : `latest`

		console.log(`getDocumentValue`, {
			document,
			version,
			since,
		})

		const respone = await getDocumentValueRequestHandler.handle(document, version, since)

		const validResponse = {
			since: JSON.stringify(respone.since),
			metadata: JSON.stringify(respone.metadata),
			revision: respone.revision,
			value: JSON.stringify(respone.value),
			cursors: JSON.stringify(respone.cursors),
		}

		console.log(`> getDocumentValue.validResponse`, validResponse)

		return validResponse
	},
}

export const Query = new graphql.GraphQLObjectType<any, any, any>({
	name: `Query`,
	fields: {
		getDocumentValue,
	},
})
