import {APIGatewayProxyEvent, APIGatewayProxyResult} from "aws-lambda/trigger/api-gateway-proxy";
import {Context} from "aws-lambda/handler";
import DynamoDBResourceConnectionRepository from "./infrastructure/DynamoDBResourceConnectionRepository";
import ResourceConnectionRepository from "./domain/ResourceConnectionRepository";
import ConnectionService from "./domain/ConnectionService";
import ApiGatewayConnectionService from "./infrastructure/ApiGatewayConnectionService";
import DynamoDBResourceRepository from "./infrastructure/DynamoDBResourceRepository";
import ResourceService from "./domain/ResourceService";
import ResourceConnectionService from "./domain/ResourceConnectionService";
import RequestHandler from "./application/RequestHandler";
import {ConnectionId} from "./domain/ConnectionId";
import ResourceRepository from "./domain/ResourceRepository";
import {
  SlateOperation, slateOperationsTransformer,
  slateOperationUpcaster,
  SlateSelection, slateSelectionsReducer,
  slateSelectionUpcaster,
  SlateValue, slateValueReducer,
  slateValueUpcaster, VersionedSlateOperation, VersionedSlateSelection, VersionedSlateValue
} from "slate-value";
import {resourceChangesetTableName, resourceConnectionTableName, resourceTableName} from "./config";
import {Request} from "./application/Request";

// noinspection JSUnusedGlobalSymbols
export async function handler(event: APIGatewayProxyEvent, _context: Context): Promise<APIGatewayProxyResult> {
  let webSocketEndpoint = event.requestContext.domainName + "/" + event.requestContext.stage;
  let connectionService: ConnectionService<SlateValue, SlateSelection, SlateOperation> = new ApiGatewayConnectionService<SlateValue, SlateSelection, SlateOperation>(webSocketEndpoint);
  let resourceConnectionRepository: ResourceConnectionRepository = new DynamoDBResourceConnectionRepository(resourceConnectionTableName);
  let resourceRepository: ResourceRepository<SlateValue, SlateSelection, SlateOperation> = new DynamoDBResourceRepository<VersionedSlateValue, SlateValue, VersionedSlateSelection, SlateSelection, VersionedSlateOperation, SlateOperation>(resourceTableName, resourceChangesetTableName, slateValueUpcaster, slateSelectionUpcaster, slateOperationUpcaster, SlateValue.DEFAULT);
  let resourceService: ResourceService<SlateValue, SlateSelection, SlateOperation> = new ResourceService<SlateValue, SlateSelection, SlateOperation>(slateValueReducer, slateSelectionsReducer, slateOperationsTransformer, resourceRepository);
  let resourceConnectionService: ResourceConnectionService<SlateValue, SlateSelection, SlateOperation> = new ResourceConnectionService<SlateValue, SlateSelection, SlateOperation>(resourceConnectionRepository, connectionService);
  let requestHandler: RequestHandler<VersionedSlateValue, SlateValue, VersionedSlateSelection, SlateSelection, VersionedSlateOperation, SlateOperation> = new RequestHandler<VersionedSlateValue, SlateValue, VersionedSlateSelection, SlateSelection, VersionedSlateOperation, SlateOperation>(slateValueUpcaster, slateOperationUpcaster, resourceConnectionRepository, resourceRepository, connectionService, resourceService, resourceConnectionService);

  const connectionId = event.requestContext.connectionId as null | ConnectionId;
  try {
    if (connectionId !== null) {
      if (event.requestContext.routeKey === "$default") {
        if (event.body !== null) {
          const request = JSON.parse(event.body) as Request<VersionedSlateValue, VersionedSlateOperation>;
          await requestHandler.handle(connectionId, request);
        }
      } else if (event.requestContext.routeKey === "$disconnect") {
        const resourceIds = await resourceConnectionRepository.findResourceIdsByConnectionId(connectionId);
        await Promise.all(resourceIds.map(resourceId =>
            resourceConnectionRepository.removeConnection(resourceId, connectionId)
        ));
      }
    }
  } catch (e) {
    console.error(e);
    throw e;
  }

  return {statusCode: 200, body: ""};
}
