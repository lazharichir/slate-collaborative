import {Operation} from "../action/Operation";
import {Value} from "../Value";
import {Node} from "../Node";
import {nodeReducer} from "./nodeReducer";

export function valueReducer(state: Value, action: Operation): Value {
    try {
        if (Node.isElement(state)) {
            return nodeReducer(state, action) as Value;
        } else {
            return state;
        }
    } catch (e) {
        throw new Error(`Cannot apply operation ${JSON.stringify(action)} on ${JSON.stringify(state)}.`);
    }
}
