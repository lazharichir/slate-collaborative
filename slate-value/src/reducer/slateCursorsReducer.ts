import {SlateSelection} from "../SlateSelection";
import {localSelectionReducer} from "./localSelectionReducer";
import {remoteSelectionReducer} from "./remoteSelectionReducer";
import {SlateOperation} from "..";

export function slateCursorsReducer(clientId: string, state: {[key: string]: SlateSelection}, operation: SlateOperation): {[key: string]: SlateSelection} {
    let cursors = {...state};
    if (cursors[clientId] === undefined) {
        cursors[clientId] = null;
    }
    for (let cursor in cursors) {
        if (cursor === clientId) {
            cursors[cursor] = localSelectionReducer(cursors[cursor], operation);
        } else {
            cursors[cursor] = remoteSelectionReducer(cursors[cursor], operation);
        }
    }
    return cursors;
}