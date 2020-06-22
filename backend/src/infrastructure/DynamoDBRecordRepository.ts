import RecordRepository from "../domain/RecordRepository";
import {DynamoDB} from "aws-sdk";
import {DocumentClient} from "aws-sdk/lib/dynamodb/document_client";
import {
    Changeset,
    changesetUpcaster,
    Record,
    RecordId,
    recordUpcaster,
    RecordVersion,
    VersionedChangeset,
    VersionedRecord
} from "record";
import QueryInput = DocumentClient.QueryInput;

export default class DynamoDBRecordRepository<VV, V, VS, S, VO, O> implements RecordRepository<V, S, O> {
    private readonly dynamoDbClient: DynamoDB.DocumentClient = new DynamoDB.DocumentClient();
    private recordTableName: string;
    private recordChangesetTableName: string;
    private readonly recordUpcaster: (versionedRecord: VersionedRecord<VV, VS>) => Record<V, S>;
    private readonly changesetUpcaster: (versionedChangeset: VersionedChangeset<VO>) => Changeset<O>;

    constructor(
        recordTableName: string,
        recordChangesetTableName: string,
        valueUpcaster: (versionedValue: VV) => V,
        selectionUpcaster: (versionedSelection: VS) => S,
        operationUpcaster: (versionedOperation: VO) => O
    ) {
        this.recordTableName = recordTableName;
        this.recordChangesetTableName = recordChangesetTableName;
        this.recordUpcaster = recordUpcaster(valueUpcaster, selectionUpcaster);
        this.changesetUpcaster = changesetUpcaster(operationUpcaster);
    }

    findRecord(id: RecordId): Promise<Record<V, S> | null> {
        return this.dynamoDbClient.get({
            TableName: this.recordTableName,
            Key: { id },
            ProjectionExpression: "id,#record",
            ExpressionAttributeNames: {"#record": "record"}
        }).promise().then(response => {
            if (response.Item) {
                return this.recordUpcaster(response.Item["record"] as VersionedRecord<VV, VS>);
            } else {
                return null;
            }
        });
    }

    saveRecord(id: RecordId, record: Record<V, S>): Promise<void> {
        return this.dynamoDbClient.put({
            TableName: this.recordTableName,
            Item: {id, record}
        }).promise().then(() => {});
    }

    deleteRecord(id: RecordId): Promise<void> {
        return this.dynamoDbClient.delete({
            TableName: this.recordTableName,
            Key: { id }
        }).promise().then(() => {});
    }

    async *findChangesetsSince(id: RecordId, version: RecordVersion): AsyncIterable<Changeset<O>> {
        let queryParams: QueryInput = {
            TableName: this.recordChangesetTableName,
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
                    yield this.changesetUpcaster(item["changeset"] as VersionedChangeset<VO>);
                }
            }
            lastEvaluatedKey = response.LastEvaluatedKey;
        } while (lastEvaluatedKey);
    }

    saveChangeset(id: RecordId, changeset: Changeset<O>): Promise<void> {
        return this.dynamoDbClient.put({
            TableName: this.recordChangesetTableName,
            Item: {
                id: id,
                version: changeset.version,
                changeset
            },
            ConditionExpression: "attribute_not_exists(id) AND attribute_not_exists(version)"
        }).promise().then(() => {});
    }
}