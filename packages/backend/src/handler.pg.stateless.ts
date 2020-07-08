import ResourceConnectionRepository from "./domain/ResourceConnectionRepository"
import ConnectionService from "./domain/ConnectionService"
import VoidGatewayConnectionService from "./infrastructure/VoidGatewayConnectionService"
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
import AppplyChangesetRequestHandler from "./application/AppplyChangesetRequestHandler"
import { Changeset } from "@wleroux/resource"

let connectionService: ConnectionService<
	SlateValue,
	SlateSelection,
	SlateOperation
> = new VoidGatewayConnectionService<SlateValue, SlateSelection, SlateOperation>()

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

let appplyChangesetRequestHandler: AppplyChangesetRequestHandler<VersionedSlateValue,
	SlateValue,
	VersionedSlateSelection,
	SlateSelection,
	VersionedSlateOperation,
	SlateOperation
> = new AppplyChangesetRequestHandler(slateOperationUpcaster, resourceService, resourceConnectionService)

export async function StatelessHandler(
	connectionId: ConnectionId,
	request: Request<VersionedSlateValue, VersionedSlateOperation>
): Promise<Changeset<SlateOperation>> {
	if (request.type !== `keep_alive`)
		console.log(`⬇️ StatelessHandler [${connectionId}] says `, JSON.stringify(request, null, 2))

	switch (request.type) {
		case `apply_changeset`:
			return appplyChangesetRequestHandler.handle(connectionId, request)
		default:
			throw new Error(`Unknown request type: ${request.type}.`)
	}

}
