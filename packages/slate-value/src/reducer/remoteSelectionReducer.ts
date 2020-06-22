import {SlateSelection} from "../SlateSelection";
import {SlateOperation} from "..";
import {rangeTransformer} from "../transformer/rangeTransformer";

export function remoteSelectionReducer(state: SlateSelection, action: SlateOperation): SlateSelection {
    if (action.type === "set_selection") return state;
    if (state === null) return state;
    return rangeTransformer(state, action);
}