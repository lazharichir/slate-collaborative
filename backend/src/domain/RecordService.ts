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
        let record = await this.recordRepository.find(id);
        if (record.version + 1 !== changeset.version) {
            for await (const appliedChangeset of this.changesetRepository.findSince(id, changeset.version)) {
                if (appliedChangeset.id === changeset.id) {
                    return null; // already applied
                }

                changeset = slateChangesetsTransformer([changeset], [appliedChangeset], false)[0][0];
            }
        }

        record = slateRecordReducer(record, changeset);
        await this.changesetRepository.save(id, changeset);
        await this.recordRepository.save(id, record);

        return changeset
    }
}
