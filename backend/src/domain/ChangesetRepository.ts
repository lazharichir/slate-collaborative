import {RecordId, RecordVersion} from "common/record/Record";
import {Changeset} from "common/record/action/Changeset";

export default interface ChangesetRepository {
    findSince(id: RecordId, version: RecordVersion): AsyncIterable<Changeset>
    save(id: RecordId, changeset: Changeset): Promise<void>
}
