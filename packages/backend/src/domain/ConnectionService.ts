import {ConnectionId} from "./ConnectionId";
import {Response} from "../application/Response";
import { FastifyRequest } from "fastify";
import { SocketStream } from "fastify-websocket";

export default interface ConnectionService<V, S, O> {
    send(connectionId: ConnectionId, message: Response<V, S, O>): Promise<void>;
	close(connectionId: ConnectionId): Promise<void>
	open(connectionId: ConnectionId, connection: SocketStream, request: FastifyRequest): Promise<void>
	broadcastAppliedChangeset?(respone: Response<V, S, O>): Promise<void>
}
