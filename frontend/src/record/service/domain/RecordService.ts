import {Subscriber} from "../../../common/Subscriber";
import {Subscription} from "../../../common/Subscription";
import {SlateOperation} from "slate-value";
import {ClientId, RecordId} from "record";
import {SlateRecord} from "common";

export interface RecordService {
    subscribe(id: RecordId, subscriber: Subscriber<SlateRecord>): Promise<Subscription>
    applyOperations(id: RecordId, clientId: ClientId, operations: SlateOperation[]): Promise<void>
    applyUndo(id: RecordId, clientId: ClientId): Promise<void>
    applyRedo(id: RecordId, clientId: ClientId): Promise<void>
}
