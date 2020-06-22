import {APIGatewayProxyEvent, APIGatewayProxyResult} from "aws-lambda/trigger/api-gateway-proxy";
import {Context} from "aws-lambda/handler";
import DynamoDBRecordConnectionRepository from "./infrastructure/DynamoDBRecordConnectionRepository";
import RecordConnectionRepository from "./domain/RecordConnectionRepository";
import ConnectionService from "./domain/ConnectionService";
import ApiGatewayConnectionService from "./infrastructure/ApiGatewayConnectionService";
import DynamoDBRecordRepository from "./infrastructure/DynamoDBRecordRepository";
import RecordService from "./domain/RecordService";
import RecordConnectionService from "./domain/RecordConnectionService";
import RequestHandler from "./application/RequestHandler";
import {ConnectionId} from "./domain/ConnectionId";
import RecordRepository from "./domain/RecordRepository";
import {
  SlateOperation, slateOperationsTransformer,
  slateOperationUpcaster,
  SlateSelection, slateSelectionsReducer,
  slateSelectionUpcaster,
  SlateValue, slateValueReducer,
  slateValueUpcaster, VersionedSlateOperation, VersionedSlateSelection, VersionedSlateValue
} from "slate-value";
import {recordChangesetTableName, recordConnectionTableName, recordTableName} from "./config";
import {Request} from "./application/Request";

// noinspection JSUnusedGlobalSymbols
export async function handler(event: APIGatewayProxyEvent, _context: Context): Promise<APIGatewayProxyResult> {
  let webSocketEndpoint = event.requestContext.domainName + "/" + event.requestContext.stage;
  let connectionService: ConnectionService<SlateValue, SlateSelection, SlateOperation> = new ApiGatewayConnectionService<SlateValue, SlateSelection, SlateOperation>(webSocketEndpoint);
  let recordConnectionRepository: RecordConnectionRepository = new DynamoDBRecordConnectionRepository(recordConnectionTableName);
  let recordRepository: RecordRepository<SlateValue, SlateSelection, SlateOperation> = new DynamoDBRecordRepository<VersionedSlateValue, SlateValue, VersionedSlateSelection, SlateSelection, VersionedSlateOperation, SlateOperation>(recordTableName, recordChangesetTableName, slateValueUpcaster, slateSelectionUpcaster, slateOperationUpcaster);
  let recordService: RecordService<SlateValue, SlateSelection, SlateOperation> = new RecordService<SlateValue, SlateSelection, SlateOperation>(slateValueReducer, slateSelectionsReducer, slateOperationsTransformer, recordRepository);
  let recordConnectionService: RecordConnectionService<SlateValue, SlateSelection, SlateOperation> = new RecordConnectionService<SlateValue, SlateSelection, SlateOperation>(recordConnectionRepository, connectionService);
  let requestHandler: RequestHandler<VersionedSlateValue, SlateValue, VersionedSlateSelection, SlateSelection, VersionedSlateOperation, SlateOperation> = new RequestHandler<VersionedSlateValue, SlateValue, VersionedSlateSelection, SlateSelection, VersionedSlateOperation, SlateOperation>(slateValueUpcaster, slateOperationUpcaster, recordConnectionRepository, recordRepository, connectionService, recordService, recordConnectionService);

  const connectionId = event.requestContext.connectionId as null | ConnectionId;
  try {
    if (connectionId !== null) {
      if (event.requestContext.routeKey === "$default") {
        if (event.body !== null) {
          const request = JSON.parse(event.body) as Request<VersionedSlateValue, VersionedSlateOperation>;
          await requestHandler.handle(connectionId, request);
        }
      } else if (event.requestContext.routeKey === "$disconnect") {
        const recordIds = await recordConnectionRepository.findRecordIdsByConnectionId(connectionId);
        await Promise.all(recordIds.map(recordId =>
            recordConnectionRepository.removeConnection(recordId, connectionId)
        ));
      }
    }
  } catch (e) {
    console.error(e);
    throw e;
  }

  return {statusCode: 200, body: ""};
}
