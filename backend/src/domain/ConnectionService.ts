import {ConnectionId} from "./ConnectionId";
import {Response} from "common/api/Response";

export default interface ConnectionService {
    send(connectionId: ConnectionId, message: Response): Promise<void>;
    close(connectionId: ConnectionId): Promise<void>
}
