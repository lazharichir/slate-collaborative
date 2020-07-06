// @ts-nocheck
import ResourceConnectionRepository from "../domain/ResourceConnectionRepository";
import {ConnectionId} from "../domain/ConnectionId";
import {DynamoDB} from "aws-sdk";
import {DocumentClient} from "aws-sdk/lib/dynamodb/document_client";
import {ResourceId} from "@wleroux/resource";
import QueryOutput = DocumentClient.QueryOutput;

export default class DynamoDBResourceConnectionRepository implements ResourceConnectionRepository {
    private readonly dynamoDbClient: DynamoDB.DocumentClient = new DynamoDB.DocumentClient();
    private readonly resourceConnectionTableName: string;

    constructor(resourceConnectionTableName: string) {
        this.resourceConnectionTableName = resourceConnectionTableName;
    }

    addConnection(id: ResourceId, connectionId: ConnectionId): Promise<void> {
        return this.dynamoDbClient.put({
            TableName: this.resourceConnectionTableName,
            Item: { id, connectionId }
        }).promise().then(() => {});
    }

    async findConnectionsByResourceId(id: ResourceId): Promise<ConnectionId[]> {
        let response: DocumentClient.QueryOutput = await this.dynamoDbClient.query({
            TableName: this.resourceConnectionTableName,
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

    removeConnection(id: ResourceId, connectionId: ConnectionId): Promise<void> {
        return this.dynamoDbClient.delete({
            TableName: this.resourceConnectionTableName,
            Key: { id, connectionId }
        }).promise().then(() => {});
    }

    async findResourceIdsByConnectionId(connectionId: ConnectionId): Promise<ResourceId[]> {
        let response: QueryOutput = await this.dynamoDbClient.query({
            TableName: this.resourceConnectionTableName,
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