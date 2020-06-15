import {Subscriber} from "../../../common/Subscriber";
import {Subscription} from "../../../common/Subscription";
import {Record, RecordId} from "common/record/Record";
import {Operation} from "common/value/action/Operation";
import {ClientId} from "common/record/ClientId";

export interface RecordService {
    subscribe(id: RecordId, subscriber: Subscriber<Record>): Promise<Subscription>
    applyOperations(id: RecordId, clientId: ClientId, operations: Operation[]): Promise<void>
    applyUndo(id: RecordId, clientId: ClientId): Promise<void>
    applyRedo(id: RecordId, clientId: ClientId): Promise<void>
}
