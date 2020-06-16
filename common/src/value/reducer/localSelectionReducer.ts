import {Selection} from "../Selection";
import {Operation} from "../action/Operation";
import {Path} from "../Path";
import {Point} from "../Point";
import {rangeTransformer} from "../transformer/rangeTransformer";

export function localSelectionReducer(state: Selection, action: Operation): Selection {
    if (action.type === "set_selection") {
        if (action.newProperties === null) {
            return null;
        } else if (action.properties === null) {
            return action.newProperties;
        } else if (state !== null) {
            return ({
                ...state,
                ...action.newProperties
            });
        } else return state;
    }

    if (state === null) return state;
    return rangeTransformer(state, action);
}
