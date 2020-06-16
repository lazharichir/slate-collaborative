import {Selection} from "../Selection";
import {Operation} from "../action/Operation";
import {rangeTransformer} from "../transformer/rangeTransformer";

export function remoteSelectionReducer(state: Selection, action: Operation): Selection {
    if (action.type === "set_selection") return state;
    if (state === null) return state;
    return rangeTransformer(state, action);
}