import {Record} from "../Record";
import {Changeset} from "../action/Changeset";
import {valueReducer} from "../../value/reducer/valueReducer";
import {cursorsReducer} from "./cursorsReducer";

export function recordReducer(state: Record, action: Changeset) {
    if (state.version + 1 !== action.version) {
        throw new Error(`Cannot apply operation ${JSON.stringify(action)} on ${JSON.stringify(state)}`);
    }

    return ({
        ...state,
        value: action.operations.reduce(valueReducer, state.value),
        cursors: cursorsReducer(state.cursors, action),
        version: action.version
    });
}