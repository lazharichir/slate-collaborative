import ResourceRepository from "./ResourceRepository";
import {Changeset, changesetsTransformer, Resource, ResourceId, resourceReducer, ResourceVersion} from "resource";

export default class ResourceService<V, S, O> {
    private readonly resourceRepository: ResourceRepository<V, S, O>
    private readonly resourceReducer: (resource: Resource<V, S>, changeset: Changeset<O>) => Resource<V, S>;
    private readonly changesetsTransformer: (leftChangesets: Changeset<O>[], topChangesets: Changeset<O>[], winBreaker: boolean) => [Changeset<O>[], Changeset<O>[]];

    constructor(
        valueReducer: (value: V, operation: O) => V,
        selectionsReducer: (clientId: string, selections: {[key: string]: S}, operation: O) => {[key: string]: S},
        operationsTransformer: (leftOperations: O[], topOperations: O[], winBreaker: boolean) => [O[], O[]],
        resourceRepository: ResourceRepository<V, S, O>) {
        this.resourceReducer = resourceReducer(valueReducer, selectionsReducer);
        this.changesetsTransformer = changesetsTransformer(operationsTransformer);
        this.resourceRepository = resourceRepository;
    }

    findResource(id: ResourceId): Promise<Resource<V, S>> {
        return this.resourceRepository.findResource(id);
    }

    findChangesetsSince(id: ResourceId, version: ResourceVersion): AsyncIterable<Changeset<O>> {
        return this.resourceRepository.findChangesetsSince(id, version);
    }

    async applyChangeset(id: ResourceId, changeset: Changeset<O>): Promise<Changeset<O> | null> {
        let attempt = 0;
        while (true) {
            try {
                let transformedChangeset = changeset;
                let resource = await this.resourceRepository.findResource(id);
                if (resource.version + 1 !== changeset.version) {
                    for await (const appliedChangeset of this.resourceRepository.findChangesetsSince(id, transformedChangeset.version)) {
                        if (appliedChangeset.id === transformedChangeset.id) {
                            return null; // already applied
                        }

                        transformedChangeset = this.changesetsTransformer([transformedChangeset], [appliedChangeset], false)[0][0];
                    }
                }

                resource = this.resourceReducer(resource, transformedChangeset);
                await this.resourceRepository.saveChangeset(id, transformedChangeset);
                await this.resourceRepository.saveResource(id, resource);
                return transformedChangeset;
            } catch (e) {
                if (attempt < 5 && e.code === "ConditionalCheckFailedException") {
                    attempt ++;
                } else {
                    throw e;
                }
            }
        }
    }
}
