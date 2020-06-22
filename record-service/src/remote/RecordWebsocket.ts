import {Request} from "./Request";
import {Response} from "./Response";
import {Subscription} from "../Subscription";
import {Subscriber} from "../Subscriber";

export default class RecordWebsocket<V, S, O> {

    private websocket: WebSocket;

    constructor(webSocketUrl: string) {
        this.websocket = new WebSocket(webSocketUrl);

        // prevent idle connection timeouts
        setInterval(() => {
            this.send({type: "keep_alive"});
        }, 60000);
    }

    send(request: Request<O>) {
        if (this.websocket.readyState === WebSocket.CONNECTING) {
            let handleOpen = () => {
                this.websocket.send(JSON.stringify(request));
                this.websocket.removeEventListener("open", handleOpen);
            };
            this.websocket.addEventListener("open", handleOpen);
        } else {
            this.websocket.send(JSON.stringify(request));
        }
    }

    close() {
        this.websocket.close();
    }

    subscribe(subscriber: Subscriber<Response<V, S, O>>): Subscription {
        let listener = (event: MessageEvent) => {
            subscriber(JSON.parse(event.data) as Response<V, S, O>);
        };

        this.websocket.addEventListener("message", listener);
        return () => {
            this.websocket.removeEventListener("message", listener);
        };
    }
}
