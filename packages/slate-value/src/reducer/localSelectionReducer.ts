import {SlateSelection} from "../SlateSelection";
import {SlateOperation} from "..";
import {rangeTransformer} from "../transformer/rangeTransformer";

export function localSelectionReducer(state: SlateSelection, action: SlateOperation): SlateSelection {
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
