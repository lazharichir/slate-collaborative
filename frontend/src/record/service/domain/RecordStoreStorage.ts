import {RecordId} from "common/record/Record";
import {RecordStore} from "./RecordStore";

export default interface RecordStoreStorage {
    find(id: RecordId): Promise<RecordStore>
    save(id: RecordId, recordStore: RecordStore): Promise<void>
};
