import {Subscriber} from "../../../common/Subscriber";
import {Subscription} from "../../../common/Subscription";
import {Record, RecordId} from "common/record/Record";
import {ClientId} from "common/record/ClientId";
import {SlateOperation} from "slate-value";

export interface RecordService {
    subscribe(id: RecordId, subscriber: Subscriber<Record>): Promise<Subscription>
    applyOperations(id: RecordId, clientId: ClientId, operations: SlateOperation[]): Promise<void>
    applyUndo(id: RecordId, clientId: ClientId): Promise<void>
    applyRedo(id: RecordId, clientId: ClientId): Promise<void>
}
