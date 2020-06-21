import {RecordId} from "record";
import {SlateRecord} from "common";

export default interface RecordRepository {
    find(id: RecordId): Promise<SlateRecord>
    save(id: RecordId, record: SlateRecord): Promise<void>
    delete(id: RecordId): Promise<void>
}
