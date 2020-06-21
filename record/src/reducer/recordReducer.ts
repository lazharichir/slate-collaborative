import {Record} from "../Record";
import {Changeset, ClientId} from "..";

export function recordReducer<V, S, O>(
    valueReducer: (value: V, operation: O) => V,
    cursorsReducer: (clientId: ClientId, cursors: {[key: string]: S}, operation: O) => {[key: string]: S}
): (state: Record<V, S>, action: Changeset<O>) => Record<V, S> {
    return (state: Record<V, S>, changeset: Changeset<O>) => {
        if (state.version + 1 !== changeset.version) {
            throw new Error(`Cannot apply operation ${JSON.stringify(changeset)} on ${JSON.stringify(state)}`);
        }

        return ({
            ...state,
            value: changeset.operations.reduce(valueReducer, state.value),
            cursors: changeset.operations.reduce((state: { [key: string]: S }, operation: O) => cursorsReducer(changeset.clientId, state, operation), state.cursors),
            version: changeset.version
        });
    };
}