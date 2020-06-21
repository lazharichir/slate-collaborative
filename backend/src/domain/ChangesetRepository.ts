import {SlateChangeset} from "common";
import {RecordId, RecordVersion} from "record";

export default interface ChangesetRepository {
    findSince(id: RecordId, version: RecordVersion): AsyncIterable<SlateChangeset>
    save(id: RecordId, changeset: SlateChangeset): Promise<void>
}
