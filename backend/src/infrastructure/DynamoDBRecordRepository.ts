import RecordRepository from "../domain/RecordRepository";
import {RecordId} from "record";
import {DynamoDB} from "aws-sdk";
import {recordTableName} from "../config";
import {SlateRecord, slateRecordUpcaster, VersionedSlateRecord} from "common";

export default class DynamoDBRecordRepository implements RecordRepository {
    private dynamoDbClient: DynamoDB.DocumentClient = new DynamoDB.DocumentClient();

    find(id: RecordId): Promise<SlateRecord> {
        return this.dynamoDbClient.get({
            TableName: recordTableName,
            Key: { id },
            ProjectionExpression: "id,#record",
            ExpressionAttributeNames: {"#record": "record"}
        }).promise().then(response => {
            if (response.Item) {
                return slateRecordUpcaster(response.Item["record"] as VersionedSlateRecord);
            } else {
                return (SlateRecord.DEFAULT);
            }
        });
    }

    save(id: RecordId, record: SlateRecord): Promise<void> {
        return this.dynamoDbClient.put({
            TableName: recordTableName,
            Item: {id, record}
        }).promise().then(() => {});
    }

    delete(id: RecordId): Promise<void> {
        return this.dynamoDbClient.delete({
            TableName: recordTableName,
            Key: { id }
        }).promise().then(() => {});
    }
}