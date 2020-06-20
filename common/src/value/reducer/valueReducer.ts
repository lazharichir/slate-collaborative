import {Operation} from "../action/Operation";
import {Value} from "../Value";
import {Node} from "../Node";
import {nodeReducer} from "./nodeReducer";

export function valueReducer(state: Value, action: Operation): Value {
    if (action.type === "set_selection") return state;

    if (Node.isElement(state)) {
        try {
            return nodeReducer(state, action) as Value;
        } catch (e) {
            throw new Error(`Cannot apply operation ${JSON.stringify(action)} on ${JSON.stringify(state)}.`);
        }
    } else {
        throw new Error(`Cannot apply ${JSON.stringify(action)} on ${JSON.stringify(state)}`);
    }
}
