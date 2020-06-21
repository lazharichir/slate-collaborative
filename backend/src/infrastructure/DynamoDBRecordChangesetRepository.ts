import ChangesetRepository from "../domain/ChangesetRepository";
import {DynamoDB} from "aws-sdk";
import {DocumentClient} from "aws-sdk/lib/dynamodb/document_client";
import {RecordId, RecordVersion} from "record";
import {recordChangesetTableName} from "../config";
import {SlateChangeset, slateChangesetUpcaster, VersionedSlateChangeset} from "common";
import QueryInput = DocumentClient.QueryInput;

export default class DynamoDBRecordChangesetRepository implements ChangesetRepository {
    private dynamoDbClient: DynamoDB.DocumentClient = new DynamoDB.DocumentClient();

    async *findSince(id: RecordId, version: RecordVersion): AsyncIterable<SlateChangeset> {
        let queryParams: QueryInput = {
            TableName: recordChangesetTableName,
            ConsistentRead: true,
            KeyConditionExpression: "id = :id AND version >= :version",
            ExpressionAttributeValues: {
                ":id": id,
                ":version": version
            },
            ProjectionExpression: "changeset"
        };

        let lastEvaluatedKey = undefined;
        do {
            let response: DocumentClient.QueryOutput = await this.dynamoDbClient.query({
                ...queryParams,
                ExclusiveStartKey: lastEvaluatedKey
            }).promise();

            if (response.Items) {
                for (const item of response.Items) {
                    yield slateChangesetUpcaster(item["changeset"] as VersionedSlateChangeset);
                }
            }
            lastEvaluatedKey = response.LastEvaluatedKey;
        } while (lastEvaluatedKey);
    }

    save(id: RecordId, changeset: SlateChangeset): Promise<void> {
        return this.dynamoDbClient.put({
            TableName: recordChangesetTableName,
            Item: {
                id: id,
                version: changeset.version,
                changeset
            },
            ConditionExpression: "attribute_not_exists(id) AND attribute_not_exists(version)"
        }).promise().then(() => {});
    }
}