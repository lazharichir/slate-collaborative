import {RecordStore} from "../domain/RecordStore";
import {RecordStoreAction} from "../action/RecordStoreAction";
import {Changeset, ChangesetId} from "common/record/action/Changeset";
import {recordReducer} from "common/record/reducer/recordReducer";
import {Operation} from "common/value/action/Operation";
import changesetTransformer from "common/record/transformer/changesetTransformer";
import {changesetInverter} from "common/record/inverter/changesetInverter";

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

        undoQueue = [...recordStore.undoQueue.map(undoChangeset => changesetTransformer(undoChangeset, outstandingChangeset)), changesetInverter(outstandingChangeset)];
        redoQueue = [...recordStore.redoQueue.map(redoChangeset => changesetTransformer(redoChangeset, outstandingChangeset))];
        if (action.operations.some(Operation.isMutationOperation)) {
            redoQueue = [];
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
                            inProgressChangeset = changesetTransformer(inProgressChangeset, appliedChangeset)
                            outstandingChangesets = outstandingChangesets.map(outstandingChangeset => changesetTransformer(outstandingChangeset, appliedChangeset))
                            undoQueue = undoQueue.map(undoChangeset => changesetTransformer(undoChangeset, appliedChangeset))
                            redoQueue = redoQueue.map(redoChangeset => changesetTransformer(redoChangeset, appliedChangeset))
                        }
                    } else {
                        outstandingChangesets = outstandingChangesets.map(outstandingChangeset => changesetTransformer(outstandingChangeset, appliedChangeset))
                        undoQueue = undoQueue.map(undoChangeset => changesetTransformer(undoChangeset, appliedChangeset))
                        redoQueue = redoQueue.map(redoChangeset => changesetTransformer(redoChangeset, appliedChangeset))
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
                ...undoQueue[undoQueue.length - 1],
                id: ChangesetId.generate(),
                clientId: action.clientId,
                version: localRecord.version + 1
            };
            undoQueue = undoQueue.slice(0, -1);
            redoQueue = [...redoQueue, changesetInverter(undoChangeset)];

            outstandingChangesets = [...outstandingChangesets, undoChangeset];
            localRecord = recordReducer(localRecord, undoChangeset)

            // keep undoing until a mutation is detected
            if (undoChangeset.operations.some(Operation.isMutationOperation)) break;
        }
    } else if (action.type === "apply_redo") {
        while (redoQueue.length > 0) {
            let redoChangeset: Changeset = {
                ...redoQueue[redoQueue.length - 1],
                id: ChangesetId.generate(),
                clientId: action.clientId,
                version: localRecord.version + 1
            };
            redoQueue = redoQueue.slice(0, -1);

            undoQueue = [...undoQueue, changesetInverter(redoChangeset)];
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