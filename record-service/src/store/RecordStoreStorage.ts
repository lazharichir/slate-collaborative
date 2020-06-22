import {RecordId} from "record";
import {RecordStore} from "./RecordStore";

export interface RecordStoreStorage<V, S, O> {
    find(id: RecordId): Promise<RecordStore<V, S, O>>
    save(id: RecordId, recordStore: RecordStore<V, S, O>): Promise<void>
};
