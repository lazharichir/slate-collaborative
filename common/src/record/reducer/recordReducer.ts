import {Record} from "../Record";
import {Changeset} from "..";
import {slateCursorsReducer, SlateOperation, SlateSelection, SlateValue, slateValueReducer} from "slate-value";

export function recordReducer(state: Record, action: Changeset) {
    if (state.version + 1 !== action.version) {
        throw new Error(`Cannot apply operation ${JSON.stringify(action)} on ${JSON.stringify(state)}`);
    }

    return ({
        ...state,
        value: action.operations.reduce(slateValueReducer, state.value),
        cursors: action.operations.reduce((state: {[key: string]: SlateSelection}, operation: SlateOperation) => slateCursorsReducer(action.clientId, state, operation), state.cursors),
        version: action.version
    });
}