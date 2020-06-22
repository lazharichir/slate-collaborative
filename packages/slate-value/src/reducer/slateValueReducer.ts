import {SlateOperation} from "..";
import {SlateValue} from "../SlateValue";
import {Node} from "../Node";
import {nodeReducer} from "./nodeReducer";

export function slateValueReducer(state: SlateValue, action: SlateOperation): SlateValue {
    if (action.type === "set_selection") return state;

    if (Node.isElement(state)) {
        try {
            return nodeReducer(state, action) as SlateValue;
        } catch (e) {
            throw new Error(`Cannot apply operation ${JSON.stringify(action)} on ${JSON.stringify(state)}.`);
        }
    } else {
        throw new Error(`Cannot apply ${JSON.stringify(action)} on ${JSON.stringify(state)}`);
    }
}
