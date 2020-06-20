import {RecordStore} from "../domain/RecordStore";
import {RecordStoreAction} from "../action/RecordStoreAction";
import {Changeset, ChangesetId} from "common/record/action/Changeset";
import {recordReducer} from "common/record/reducer/recordReducer";
import {Operation} from "common/value/action/Operation";
import {changesetInverter} from "common/record/inverter/changesetInverter";
import {changesetsTransformer} from "common/record/transformer/changesetsTransformer";

function incrementVersion(changeset: Changeset) {
    return ({...changeset, version: changeset.version + 1});
}

export default function recordStoreReducer(recordStore: RecordStore, action: RecordStoreAction): RecordStore {
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
        let outstandingChangeset: Changeset = {
            metadata: {type: "CHANGESET", version: 1},
            id: ChangesetId.generate(),
            clientId: action.clientId,
            version: localRecord.version + 1,
            operations: action.operations
        };

        localRecord = recordReducer(recordStore.localRecord, outstandingChangeset);
        outstandingChangesets = [...recordStore.outstandingChangesets, outstandingChangeset];

        undoQueue = [changesetInverter(outstandingChangeset), ...undoQueue.map(incrementVersion)].map(incrementVersion);
        if (action.operations.some(Operation.isMutationOperation)) {
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
                    remoteRecord = recordReducer(remoteRecord, appliedChangeset)
                    unprocessedChangesets = unprocessedChangesets.slice(1);

                    if (inProgressChangeset !== null) {
                        if (inProgressChangeset.id === appliedChangeset.id) {
                            inProgressChangeset = null;
                        } else {
                            let [right, bottom] = changesetsTransformer([inProgressChangeset], [appliedChangeset]);
                            inProgressChangeset = right[0];
                            [right, bottom] = changesetsTransformer(outstandingChangesets, bottom);
                            outstandingChangesets = right;

                            undoQueue = changesetsTransformer(undoQueue, bottom)[0];
                            redoQueue = changesetsTransformer(redoQueue, bottom)[0];
                        }
                    } else {
                        let [right, bottom] = changesetsTransformer(outstandingChangesets, [appliedChangeset]);
                        outstandingChangesets = right;
                        undoQueue = changesetsTransformer(undoQueue, bottom)[0];
                        redoQueue = changesetsTransformer(redoQueue, bottom)[0];
                    }
                }
                localRecord = remoteRecord;
                if (inProgressChangeset !== null) {
                    localRecord = recordReducer(localRecord, inProgressChangeset);
                }
                if (outstandingChangesets.length > 0) {
                    localRecord = outstandingChangesets.reduce(recordReducer, localRecord);
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
            localRecord = recordReducer(localRecord, inProgressChangeset);
        }
        if (outstandingChangesets.length > 0) {
            localRecord = outstandingChangesets.reduce(recordReducer, localRecord);
        }
    } else if (action.type === "apply_undo") {
        while (undoQueue.length > 0) {
            let undoChangeset = {
                ...undoQueue[0],
                id: ChangesetId.generate(),
                clientId: action.clientId,
                version: localRecord.version + 1
            };

            undoQueue = undoQueue.slice(1);
            redoQueue = [changesetInverter(undoChangeset), ...redoQueue.map(incrementVersion)].map(incrementVersion);
            outstandingChangesets = [...outstandingChangesets, undoChangeset];
            localRecord = recordReducer(localRecord, undoChangeset)

            // keep undoing until a mutation is detected
            if (undoChangeset.operations.some(Operation.isMutationOperation)) break;
        }
    } else if (action.type === "apply_redo") {
        while (redoQueue.length > 0) {
            let redoChangeset: Changeset = {
                ...redoQueue[0],
                id: ChangesetId.generate(),
                clientId: action.clientId,
                version: localRecord.version + 1
            };

            redoQueue = redoQueue.slice(1);
            undoQueue = [changesetInverter(redoChangeset), ...undoQueue.map(incrementVersion)].map(incrementVersion);
            outstandingChangesets = [...outstandingChangesets, redoChangeset];
            localRecord = recordReducer(localRecord, redoChangeset);

            // keep redoing until a mutation is detected
            if (redoChangeset.operations.some(Operation.isMutationOperation)) break;
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
}