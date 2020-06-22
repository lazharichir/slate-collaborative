import {Changeset, changesetInverter, changesetsTransformer, ClientId, recordReducer} from "record";
import {RecordStoreAction} from "./RecordStoreAction";
import {randomUUID} from "../util/randomUUID";
import {RecordStore} from "./RecordStore";

function incrementVersion<O>(changeset: Changeset<O>) {
    return ({...changeset, version: changeset.version + 1});
}

export default function recordStoreReducer<V, S, O>(
    valueReducer: (value: V, operation: O) => V,
    selectionsReducer: (clientId: ClientId, selections: {[key: string]: S}, operation: O) => {[key: string]: S},
    operationInverter: (operation: O) => O,
    operationsTransformer: (leftOperations: O[], topOperations: O[], tieBreaker: boolean) => [O[], O[]],
    isMutationOperation: (operation: O) => boolean
): (recordStore: RecordStore<V, S, O>, action: RecordStoreAction<V, S, O>) => RecordStore<V, S, O> {
    const reducer = recordReducer(valueReducer, selectionsReducer);
    const inverter = changesetInverter(operationInverter)
    const transformer = changesetsTransformer(operationsTransformer)
    const isMutation = Changeset.isMutationChangeset(isMutationOperation)

    return (recordStore: RecordStore<V, S, O>, action: RecordStoreAction<V, S, O>): RecordStore<V, S, O> => {
        let {remoteRecord, unprocessedChangesets, localRecord, inProgressChangeset, outstandingChangesets, undoQueue, redoQueue} = recordStore;
        if (action.type === "load_remote_record") {
            remoteRecord = action.record;
            unprocessedChangesets = unprocessedChangesets.filter(unprocessedChangeset => remoteRecord.version >= unprocessedChangeset.version);

            localRecord = remoteRecord;
            inProgressChangeset = null;
            outstandingChangesets = [];
            undoQueue = [];
            redoQueue = [];
        } else if (action.type === "apply_local_operations") {
            let outstandingChangeset: Changeset<O> = {
                metadata: {type: "CHANGESET", version: 1},
                id: randomUUID(),
                clientId: action.clientId,
                version: localRecord.version + 1,
                operations: action.operations
            };

            localRecord = reducer(recordStore.localRecord, outstandingChangeset);
            outstandingChangesets = [...recordStore.outstandingChangesets, outstandingChangeset];

            undoQueue = [inverter(outstandingChangeset), ...undoQueue.map(incrementVersion)].map(incrementVersion);
            if (isMutation(outstandingChangeset)) {
                redoQueue = [];
            } else {
                redoQueue = redoQueue.map(incrementVersion);
            }
        } else if (action.type === "apply_remote_changeset") {
            if (remoteRecord.version < action.changeset.version) {
                if (!unprocessedChangesets.some(unprocessedChangeset => unprocessedChangeset.id === action.changeset.id)) {
                    unprocessedChangesets = [...unprocessedChangesets, action.changeset].sort((a, b) => a.version - b.version);
                    while (unprocessedChangesets.length > 0 && unprocessedChangesets[0].version === remoteRecord.version + 1) {
                        let appliedChangeset = unprocessedChangesets[0];
                        remoteRecord = reducer(remoteRecord, appliedChangeset)
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
                        localRecord = remoteRecord;
                        if (inProgressChangeset !== null) {
                            localRecord = reducer(localRecord, inProgressChangeset);
                        }
                        if (outstandingChangesets.length > 0) {
                            localRecord = outstandingChangesets.reduce(reducer, localRecord);
                        }
                        if (undoQueue.length > 0) {
                            undoQueue.reduce(reducer, localRecord);
                        }
                        if (redoQueue.length > 0) {
                            redoQueue.reduce(reducer, localRecord);
                        }
                    }
                    localRecord = remoteRecord;
                    if (inProgressChangeset !== null) {
                        localRecord = reducer(localRecord, inProgressChangeset);
                    }
                    if (outstandingChangesets.length > 0) {
                        localRecord = outstandingChangesets.reduce(reducer, localRecord);
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

            localRecord = remoteRecord;
            if (inProgressChangeset !== null) {
                localRecord = reducer(localRecord, inProgressChangeset);
            }
            if (outstandingChangesets.length > 0) {
                localRecord = outstandingChangesets.reduce(reducer, localRecord);
            }
        } else if (action.type === "apply_undo") {
            while (undoQueue.length > 0) {
                let undoChangeset = {
                    ...undoQueue[0],
                    id: randomUUID(),
                    clientId: action.clientId,
                    version: localRecord.version + 1
                };

                undoQueue = undoQueue.slice(1);
                redoQueue = [inverter(undoChangeset), ...redoQueue.map(incrementVersion)].map(incrementVersion);
                outstandingChangesets = [...outstandingChangesets, undoChangeset];
                localRecord = reducer(localRecord, undoChangeset)

                // keep undoing until a mutation is detected
                if (isMutation(undoChangeset)) break;
            }
        } else if (action.type === "apply_redo") {
            while (redoQueue.length > 0) {
                let redoChangeset: Changeset<O> = {
                    ...redoQueue[0],
                    id: randomUUID(),
                    clientId: action.clientId,
                    version: localRecord.version + 1
                };

                redoQueue = redoQueue.slice(1);
                undoQueue = [inverter(redoChangeset), ...undoQueue.map(incrementVersion)].map(incrementVersion);
                outstandingChangesets = [...outstandingChangesets, redoChangeset];
                localRecord = reducer(localRecord, redoChangeset);

                // keep redoing until a mutation is detected
                if (isMutation(redoChangeset)) break;
            }
        }

        return ({
            remoteRecord,
            unprocessedChangesets,
            localRecord,
            inProgressChangeset,
            outstandingChangesets,
            undoQueue,
            redoQueue
        });
    };
}
