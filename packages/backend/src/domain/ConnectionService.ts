import {ConnectionId} from "./ConnectionId";
import {Response} from "../application/Response";

export default interface ConnectionService<V, S, O> {
    send(connectionId: ConnectionId, message: Response<V, S, O>): Promise<void>;
    close(connectionId: ConnectionId): Promise<void>
}
