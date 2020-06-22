import {Resource} from "../Resource";
import {Changeset, ClientId} from "..";

export function resourceReducer<V, S, O>(
    valueReducer: (value: V, operation: O) => V,
    selectionReducer: (clientId: ClientId, selections: {[key: string]: S}, operation: O) => {[key: string]: S}
): (state: Resource<V, S>, action: Changeset<O>) => Resource<V, S> {
    return (resource: Resource<V, S>, changeset: Changeset<O>) => {
        if (resource.version + 1 !== changeset.version) {
            throw new Error(`Cannot apply operation ${JSON.stringify(changeset)} on ${JSON.stringify(resource)}`);
        }

        return ({
            ...resource,
            value: changeset.operations.reduce(valueReducer, resource.value),
            cursors: changeset.operations.reduce((state: { [key: string]: S }, operation: O) => selectionReducer(changeset.clientId, state, operation), resource.cursors),
            version: changeset.version
        });
    };
}