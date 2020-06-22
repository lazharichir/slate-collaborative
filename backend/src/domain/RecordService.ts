import RecordRepository from "./RecordRepository";
import {Changeset, changesetsTransformer, Record, RecordId, recordReducer} from "record";

export default class RecordService<V, S, O> {
    private readonly recordRepository: RecordRepository<V, S, O>
    private readonly recordReducer: (record: Record<V, S>, changeset: Changeset<O>) => Record<V, S>;
    private readonly changesetsTransformer: (leftChangesets: Changeset<O>[], topChangesets: Changeset<O>[], winBreaker: boolean) => [Changeset<O>[], Changeset<O>[]];

    constructor(
        valueReducer: (value: V, operation: O) => V,
        selectionsReducer: (clientId: string, selections: {[key: string]: S}, operation: O) => {[key: string]: S},
        operationsTransformer: (leftOperations: O[], topOperations: O[], winBreaker: boolean) => [O[], O[]],
        recordRepository: RecordRepository<V, S, O>) {
        this.recordReducer = recordReducer(valueReducer, selectionsReducer);
        this.changesetsTransformer = changesetsTransformer(operationsTransformer);
        this.recordRepository = recordRepository;
    }

    async applyChangeset(id: RecordId, changeset: Changeset<O>): Promise<Changeset<O> | null> {
        let attempt = 0;
        while (true) {
            try {
                let transformedChangeset = changeset;
                let record = await this.recordRepository.findRecord(id);
                if (record === null) throw new Error(`Cannot apply changeset on non-existant record.`);
                if (record.version + 1 !== changeset.version) {
                    for await (const appliedChangeset of this.recordRepository.findChangesetsSince(id, transformedChangeset.version)) {
                        if (appliedChangeset.id === transformedChangeset.id) {
                            return null; // already applied
                        }

                        transformedChangeset = this.changesetsTransformer([transformedChangeset], [appliedChangeset], false)[0][0];
                    }
                }

                record = this.recordReducer(record, transformedChangeset);
                await this.recordRepository.saveChangeset(id, transformedChangeset);
                await this.recordRepository.saveRecord(id, record);
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
