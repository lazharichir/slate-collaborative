import {Changeset, Record, RecordId, RecordVersion} from "record";

export default interface RecordRepository<V, S, O> {
    findRecord(id: RecordId): Promise<Record<V, S> | null>
    saveRecord(id: RecordId, record: Record<V, S>): Promise<void>
    deleteRecord(id: RecordId): Promise<void>
    findChangesetsSince(id: RecordId, version: RecordVersion): AsyncIterable<Changeset<O>>
    saveChangeset(id: RecordId, changeset: Changeset<O>): Promise<void>
}
