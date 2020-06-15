import {Record, RecordId} from "common/record/Record";

export default interface RecordRepository {
    find(id: RecordId): Promise<Record>
    save(id: RecordId, record: Record): Promise<void>
    delete(id: RecordId): Promise<void>
}
