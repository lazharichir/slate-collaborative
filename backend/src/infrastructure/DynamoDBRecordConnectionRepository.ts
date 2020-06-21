import RecordConnectionRepository from "../domain/RecordConnectionRepository";
import {ConnectionId} from "../domain/ConnectionId";
import {DynamoDB} from "aws-sdk";
import {DocumentClient} from "aws-sdk/lib/dynamodb/document_client";
import {recordConnectionTableName} from "../config";
import {RecordId} from "record";
import QueryOutput = DocumentClient.QueryOutput;

export default class DynamoDBRecordConnectionRepository implements RecordConnectionRepository {
    private dynamoDbClient: DynamoDB.DocumentClient = new DynamoDB.DocumentClient();

    addConnection(id: RecordId, connectionId: ConnectionId): Promise<void> {
        return this.dynamoDbClient.put({
            TableName: recordConnectionTableName,
            Item: { id, connectionId }
        }).promise().then(() => {});
    }

    async findConnectionsByRecordId(id: RecordId): Promise<ConnectionId[]> {
        let response: DocumentClient.QueryOutput = await this.dynamoDbClient.query({
            TableName: recordConnectionTableName,
            ConsistentRead: true,
            ProjectionExpression: "connectionId",
            KeyConditionExpression: "id = :id",
            ExpressionAttributeValues: {
                ":id": id
            }
        }).promise();

        if (response.Items) {
            return response.Items.map(item => item["connectionId"]);
        } else {
            return [];
        }
    }

    removeConnection(id: RecordId, connectionId: ConnectionId): Promise<void> {
        return this.dynamoDbClient.delete({
            TableName: recordConnectionTableName,
            Key: { id, connectionId }
        }).promise().then(() => {});
    }

    async findRecordIdsByConnectionId(connectionId: ConnectionId): Promise<RecordId[]> {
        let response: QueryOutput = await this.dynamoDbClient.query({
            TableName: recordConnectionTableName,
            IndexName: "connectionId-IDX",
            ProjectionExpression: "id",
            KeyConditionExpression: "connectionId = :connectionId",
            ExpressionAttributeValues: {
                ":connectionId": connectionId
            }
        }).promise();

        if (response.Items) {
            return response.Items.map(item => item["id"]);
        } else {
            return [];
        }
    }
}