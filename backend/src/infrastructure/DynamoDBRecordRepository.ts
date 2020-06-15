import RecordRepository from "../domain/RecordRepository";
import {Record, RecordId} from "common/record/Record";
import {DynamoDB} from "aws-sdk";
import {recordTableName} from "../config";
import {recordUpcaster} from "common/record/upcaster/recordUpcaster";
import {VersionedRecord} from "common/record/upcaster/VersionedRecord";
import {Value} from "common/value/Value";

export default class DynamoDBRecordRepository implements RecordRepository {
    private dynamoDbClient: DynamoDB.DocumentClient = new DynamoDB.DocumentClient();

    find(id: RecordId): Promise<Record> {
        return this.dynamoDbClient.get({
            TableName: recordTableName,
            Key: { id },
            ProjectionExpression: "id,#record",
            ExpressionAttributeNames: {"#record": "record"}
        }).promise().then(response => {
            if (response.Item) {
                return recordUpcaster(response.Item["record"] as VersionedRecord);
            } else {
                return ({
                    metadata: {type: "RECORD", version: 1},
                    version: 0,
                    value: Value.DEFAULT,
                    cursors: {}
                });
            }
        });
    }

    save(id: RecordId, record: Record): Promise<void> {
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