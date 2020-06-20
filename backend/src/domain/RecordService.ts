import RecordRepository from "./RecordRepository";
import ChangesetRepository from "./ChangesetRepository";
import {Changeset} from "common/record/action/Changeset";
import {RecordId} from "common/record/Record";
import changesetTransformer from "common/record/transformer/changesetTransformer";
import {recordReducer} from "common/record/reducer/recordReducer";

export default class RecordService {
    private recordRepository: RecordRepository
    private changesetRepository: ChangesetRepository

    constructor(recordRepository: RecordRepository, changesetRepository: ChangesetRepository) {
        this.recordRepository = recordRepository;
        this.changesetRepository = changesetRepository;
    }

    async applyChangeset(id: RecordId, changeset: Changeset): Promise<Changeset | null> {
        let record = await this.recordRepository.find(id);
        if (record.version + 1 !== changeset.version) {
            for await (const appliedChangeset of this.changesetRepository.findSince(id, changeset.version)) {
                if (appliedChangeset.id === changeset.id) {
                    return null; // already applied
                }

                changeset = changesetTransformer(changeset, appliedChangeset, false);
            }
        }

        record = recordReducer(record, changeset);
        await this.changesetRepository.save(id, changeset);
        await this.recordRepository.save(id, record);

        return changeset
    }
}
