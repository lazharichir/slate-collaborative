import {webSocketUrl} from "../../../config";
import {Subscriber} from "../../../common/Subscriber";
import {Subscription} from "../../../common/Subscription";
import {Request, Response} from "common";

export default class RecordWebsocket {

    private websocket: WebSocket;

    constructor() {
        this.websocket = new WebSocket(webSocketUrl);

        // prevent idle connection timeouts
        setInterval(() => {
            this.send({type: "keep_alive"});
        }, 60000);
    }

    send(request: Request) {
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

    subscribe(subscriber: Subscriber<Response>): Subscription {
        let listener = (event: MessageEvent) => {
            subscriber(JSON.parse(event.data) as Response);
        };

        this.websocket.addEventListener("message", listener);
        return () => {
            this.websocket.removeEventListener("message", listener);
        };
    }
}
