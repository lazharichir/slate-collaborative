import {Selection} from "../../value/Selection";
import {Changeset} from "../action/Changeset";
import {localSelectionReducer} from "../../value/reducer/localSelectionReducer";
import {remoteSelectionReducer} from "../../value/reducer/remoteSelectionReducer";

export function cursorsReducer(state: {[key: string]: Selection}, action: Changeset): {[key: string]: Selection} {
    let cursors = {...state};
    if (cursors[action.clientId] === undefined) {
        cursors[action.clientId] = null;
    }
    for (let cursor in cursors) {
        if (cursor === action.clientId) {
            cursors[cursor] = action.operations.reduce(localSelectionReducer, cursors[cursor]);
        } else {
            cursors[cursor] = action.operations.reduce(remoteSelectionReducer, cursors[cursor]);
        }
    }
    return cursors;
}