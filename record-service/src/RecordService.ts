import {ClientId, Record, RecordId} from "record";
import {Subscriber} from "./Subscriber";
import {Subscription} from "./Subscription";

export interface RecordService<V, S, O> {
    subscribe(id: RecordId, subscriber: Subscriber<Record<V, S>>): Promise<Subscription>
    applyOperations(id: RecordId, clientId: ClientId, operations: O[]): Promise<void>
    applyUndo(id: RecordId, clientId: ClientId): Promise<void>
    applyRedo(id: RecordId, clientId: ClientId): Promise<void>
}
