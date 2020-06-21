import {APIGatewayProxyEvent, APIGatewayProxyResult} from "aws-lambda/trigger/api-gateway-proxy";
import {Context} from "aws-lambda/handler";
import DynamoDBRecordConnectionRepository from "./infrastructure/DynamoDBRecordConnectionRepository";
import RecordConnectionRepository from "./domain/RecordConnectionRepository";
import {Request} from "common";
import ConnectionService from "./domain/ConnectionService";
import ApiGatewayConnectionService from "./infrastructure/ApiGatewayConnectionService";
import RecordRepository from "./domain/RecordRepository";
import DynamoDBRecordRepository from "./infrastructure/DynamoDBRecordRepository";
import ChangesetRepository from "./domain/ChangesetRepository";
import DynamoDBRecordChangesetRepository from "./infrastructure/DynamoDBRecordChangesetRepository";
import RecordService from "./domain/RecordService";
import RecordConnectionService from "./domain/RecordConnectionService";
import RequestHandler from "./application/RequestHandler";
import {ConnectionId} from "./domain/ConnectionId";

// noinspection JSUnusedGlobalSymbols
export async function handler(event: APIGatewayProxyEvent, _context: Context): Promise<APIGatewayProxyResult> {
  let webSocketEndpoint = event.requestContext.domainName + "/" + event.requestContext.stage;
  let connectionService: ConnectionService = new ApiGatewayConnectionService(webSocketEndpoint);
  let recordConnectionRepository: RecordConnectionRepository = new DynamoDBRecordConnectionRepository();
  let recordRepository: RecordRepository = new DynamoDBRecordRepository();
  let recordChangesetRepository: ChangesetRepository = new DynamoDBRecordChangesetRepository();
  let recordService: RecordService = new RecordService(recordRepository, recordChangesetRepository);
  let recordConnectionService: RecordConnectionService = new RecordConnectionService(recordConnectionRepository, connectionService);
  let requestHandler: RequestHandler = new RequestHandler(recordConnectionRepository, recordRepository, connectionService, recordChangesetRepository, recordService, recordConnectionService);

  const connectionId = event.requestContext.connectionId as null | ConnectionId;
  try {
    if (connectionId !== null) {
      if (event.requestContext.routeKey === "$default") {
        if (event.body !== null) {
          const request = JSON.parse(event.body) as Request;
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
