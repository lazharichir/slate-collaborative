import RecordRepository from "./RecordRepository";
import ChangesetRepository from "./ChangesetRepository";
import {RecordId} from "record";
import {SlateChangeset, slateChangesetsTransformer, slateRecordReducer} from "common";

export default class RecordService {
    private recordRepository: RecordRepository
    private changesetRepository: ChangesetRepository

    constructor(recordRepository: RecordRepository, changesetRepository: ChangesetRepository) {
        this.recordRepository = recordRepository;
        this.changesetRepository = changesetRepository;
    }

    async applyChangeset(id: RecordId, changeset: SlateChangeset): Promise<SlateChangeset | null> {
        let attempt = 0;
        while (true) {
            try {
                let transformedChangeset = changeset;
                let record = await this.recordRepository.find(id);
                if (record.version + 1 !== changeset.version) {
                    for await (const appliedChangeset of this.changesetRepository.findSince(id, transformedChangeset.version)) {
                        if (appliedChangeset.id === transformedChangeset.id) {
                            return null; // already applied
                        }

                        transformedChangeset = slateChangesetsTransformer([transformedChangeset], [appliedChangeset], false)[0][0];
                    }
                }

                record = slateRecordReducer(record, transformedChangeset);
                await this.changesetRepository.save(id, transformedChangeset);
                await this.recordRepository.save(id, record);
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
