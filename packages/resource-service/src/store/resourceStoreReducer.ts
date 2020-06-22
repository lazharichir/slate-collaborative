import {Changeset, changesetInverter, changesetsTransformer, ClientId, resourceReducer} from "@wleroux/resource";
import {ResourceStoreAction} from "./ResourceStoreAction";
import {randomUUID} from "../util/randomUUID";
import {ResourceStore} from "./ResourceStore";

function incrementVersion<O>(changeset: Changeset<O>) {
    return ({...changeset, version: changeset.version + 1});
}

export function resourceStoreReducer<V, S, O>(
    valueReducer: (value: V, operation: O) => V,
    selectionsReducer: (clientId: ClientId, selections: {[key: string]: S}, operation: O) => {[key: string]: S},
    operationInverter: (operation: O) => O,
    operationsTransformer: (leftOperations: O[], topOperations: O[], tieBreaker: boolean) => [O[], O[]],
    isMutationOperation: (operation: O) => boolean
): (resourceStore: ResourceStore<V, S, O>, action: ResourceStoreAction<V, S, O>) => ResourceStore<V, S, O> {
    const reducer = resourceReducer(valueReducer, selectionsReducer);
    const inverter = changesetInverter(operationInverter)
    const transformer = changesetsTransformer(operationsTransformer)
    const isMutation = Changeset.isMutationChangeset(isMutationOperation)

    return (resourceStore: ResourceStore<V, S, O>, action: ResourceStoreAction<V, S, O>): ResourceStore<V, S, O> => {
        let {remoteResource, unprocessedChangesets, localResource, inProgressChangeset, outstandingChangesets, undoQueue, redoQueue} = resourceStore;
        if (action.type === "load_remote_resource") {
            remoteResource = action.resource;
            unprocessedChangesets = unprocessedChangesets.filter(unprocessedChangeset => remoteResource.version >= unprocessedChangeset.version);

            localResource = remoteResource;
            inProgressChangeset = null;
            outstandingChangesets = [];
            undoQueue = [];
            redoQueue = [];
        } else if (action.type === "apply_local_operations") {
            let outstandingChangeset: Changeset<O> = {
                metadata: {type: "CHANGESET", version: 1},
                id: randomUUID(),
                clientId: action.clientId,
                version: localResource.version + 1,
                operations: action.operations
            };

            localResource = reducer(resourceStore.localResource, outstandingChangeset);
            outstandingChangesets = [...resourceStore.outstandingChangesets, outstandingChangeset];

            undoQueue = [inverter(outstandingChangeset), ...undoQueue.map(incrementVersion)].map(incrementVersion);
            if (isMutation(outstandingChangeset)) {
                redoQueue = [];
            } else {
                redoQueue = redoQueue.map(incrementVersion);
            }
        } else if (action.type === "apply_remote_changeset") {
            if (remoteResource.version < action.changeset.version) {
                if (!unprocessedChangesets.some(unprocessedChangeset => unprocessedChangeset.id === action.changeset.id)) {
                    unprocessedChangesets = [...unprocessedChangesets, action.changeset].sort((a, b) => a.version - b.version);
                    while (unprocessedChangesets.length > 0 && unprocessedChangesets[0].version === remoteResource.version + 1) {
                        let appliedChangeset = unprocessedChangesets[0];
                        remoteResource = reducer(remoteResource, appliedChangeset)
                        unprocessedChangesets = unprocessedChangesets.slice(1);

                        if (inProgressChangeset !== null) {
                            if (inProgressChangeset.id === appliedChangeset.id) {
                                inProgressChangeset = null;
                            } else {
                                let [right, bottom] = transformer([inProgressChangeset], [appliedChangeset], false);
                                inProgressChangeset = right[0];
                                [right, bottom] = transformer(outstandingChangesets, bottom, false);
                                outstandingChangesets = right;

                                undoQueue = transformer(undoQueue, bottom, false)[0];
                                redoQueue = transformer(redoQueue, bottom, false)[0];
                            }
                        } else {
                            let [right, bottom] = transformer(outstandingChangesets, [appliedChangeset], false);
                            outstandingChangesets = right;
                            undoQueue = transformer(undoQueue, bottom, false)[0];
                            redoQueue = transformer(redoQueue, bottom, false)[0];
                        }

                        // Ensure that the changesets can still be applied
                        localResource = remoteResource;
                        if (inProgressChangeset !== null) {
                            localResource = reducer(localResource, inProgressChangeset);
                        }
                        if (outstandingChangesets.length > 0) {
                            localResource = outstandingChangesets.reduce(reducer, localResource);
                        }
                        if (undoQueue.length > 0) {
                            undoQueue.reduce(reducer, localResource);
                        }
                        if (redoQueue.length > 0) {
                            redoQueue.reduce(reducer, localResource);
                        }
                    }
                    localResource = remoteResource;
                    if (inProgressChangeset !== null) {
                        localResource = reducer(localResource, inProgressChangeset);
                    }
                    if (outstandingChangesets.length > 0) {
                        localResource = outstandingChangesets.reduce(reducer, localResource);
                    }
                }
            }
        } else if (action.type === "send_changeset") {
            undoQueue = undoQueue.map(changeset => ({
                ...changeset,
                version: changeset.version + action.outstandingChangesets.length - outstandingChangesets.length + 1
            }));
            redoQueue = redoQueue.map(changeset => ({
                ...changeset,
                version: changeset.version + action.outstandingChangesets.length - outstandingChangesets.length + 1
            }));

            inProgressChangeset = action.inProgressChangeset;
            outstandingChangesets = action.outstandingChangesets;

            localResource = remoteResource;
            if (inProgressChangeset !== null) {
                localResource = reducer(localResource, inProgressChangeset);
            }
            if (outstandingChangesets.length > 0) {
                localResource = outstandingChangesets.reduce(reducer, localResource);
            }
        } else if (action.type === "apply_undo") {
            while (undoQueue.length > 0) {
                let undoChangeset = {
                    ...undoQueue[0],
                    id: randomUUID(),
                    clientId: action.clientId,
                    version: localResource.version + 1
                };

                undoQueue = undoQueue.slice(1);
                redoQueue = [inverter(undoChangeset), ...redoQueue.map(incrementVersion)].map(incrementVersion);
                outstandingChangesets = [...outstandingChangesets, undoChangeset];
                localResource = reducer(localResource, undoChangeset)

                // keep undoing until a mutation is detected
                if (isMutation(undoChangeset)) break;
            }
        } else if (action.type === "apply_redo") {
            while (redoQueue.length > 0) {
                let redoChangeset: Changeset<O> = {
                    ...redoQueue[0],
                    id: randomUUID(),
                    clientId: action.clientId,
                    version: localResource.version + 1
                };

                redoQueue = redoQueue.slice(1);
                undoQueue = [inverter(redoChangeset), ...undoQueue.map(incrementVersion)].map(incrementVersion);
                outstandingChangesets = [...outstandingChangesets, redoChangeset];
                localResource = reducer(localResource, redoChangeset);

                // keep redoing until a mutation is detected
                if (isMutation(redoChangeset)) break;
            }
        }

        return ({
            remoteResource,
            unprocessedChangesets,
            localResource,
            inProgressChangeset,
            outstandingChangesets,
            undoQueue,
            redoQueue
        });
    };
}
