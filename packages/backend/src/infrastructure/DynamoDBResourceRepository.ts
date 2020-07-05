import ResourceRepository from "../domain/ResourceRepository";
import {DynamoDB} from "aws-sdk";
import {DocumentClient} from "aws-sdk/lib/dynamodb/document_client";
import {
    Changeset,
    changesetUpcaster,
    Resource,
    ResourceId,
    resourceUpcaster,
    ResourceRevision,
    VersionedChangeset,
    VersionedResource
} from "@wleroux/resource";
import QueryInput = DocumentClient.QueryInput;

export default class DynamoDBResourceRepository<VV, V, VS, S, VO, O> implements ResourceRepository<V, S, O> {
    private readonly dynamoDbClient: DynamoDB.DocumentClient = new DynamoDB.DocumentClient();
    private readonly resourceTableName: string;
    private readonly resourceChangesetTableName: string;
    private readonly resourceUpcaster: (versionedResource: VersionedResource<VV, VS>) => Resource<V, S>;
    private readonly changesetUpcaster: (versionedChangeset: VersionedChangeset<VO>) => Changeset<O>;
    private readonly defaultValue: V;

    constructor(
        resourceTableName: string,
        resourceChangesetTableName: string,
        valueUpcaster: (versionedValue: VV) => V,
        selectionUpcaster: (versionedSelection: VS) => S,
        operationUpcaster: (versionedOperation: VO) => O,
        defaultValue: V
    ) {
        this.resourceTableName = resourceTableName;
        this.resourceChangesetTableName = resourceChangesetTableName;
        this.resourceUpcaster = resourceUpcaster(valueUpcaster, selectionUpcaster);
        this.changesetUpcaster = changesetUpcaster(operationUpcaster);
        this.defaultValue = defaultValue;
    }

    findResource(id: ResourceId): Promise<Resource<V, S>> {
        return this.dynamoDbClient.get({
            TableName: this.resourceTableName,
            Key: { id },
            ProjectionExpression: "id,#resource",
            ExpressionAttributeNames: {"#resource": "resource"}
        }).promise().then(response => {
            if (response.Item) {
                return this.resourceUpcaster(response.Item["resource"] as VersionedResource<VV, VS>);
            } else {
                return Resource.DEFAULT(this.defaultValue);
            }
        });
    }

    saveResource(id: ResourceId, resource: Resource<V, S>): Promise<void> {
        return this.dynamoDbClient.put({
            TableName: this.resourceTableName,
            Item: {id, resource}
        }).promise().then(() => {});
    }

    deleteResource(id: ResourceId): Promise<void> {
        return this.dynamoDbClient.delete({
            TableName: this.resourceTableName,
            Key: { id }
        }).promise().then(() => {});
    }

    async *findChangesetsSince(id: ResourceId, revision: ResourceRevision): AsyncIterable<Changeset<O>> {
        let queryParams: QueryInput = {
            TableName: this.resourceChangesetTableName,
            ConsistentRead: true,
            KeyConditionExpression: "id = :id AND revision >= :revision",
            ExpressionAttributeValues: {
                ":id": id,
                ":revision": revision
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

    saveChangeset(id: ResourceId, changeset: Changeset<O>): Promise<void> {
        return this.dynamoDbClient.put({
            TableName: this.resourceChangesetTableName,
            Item: {
                id: id,
                revision: changeset.revision,
                changeset
            },
            ConditionExpression: "attribute_not_exists(id) AND attribute_not_exists(revision)"
        }).promise().then(() => {});
    }
}