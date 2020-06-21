import {RecordStore} from "../domain/RecordStore";
import {RecordStoreAction} from "../action/RecordStoreAction";
import {SlateChangeset, slateChangesetInverter, slateChangesetsTransformer, slateRecordReducer} from "common";
import {ChangesetId} from "record/action/Changeset";

function incrementVersion(changeset: SlateChangeset) {
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
        let outstandingChangeset: SlateChangeset = {
            metadata: {type: "CHANGESET", version: 1},
            id: ChangesetId.generate(),
            clientId: action.clientId,
            version: localRecord.version + 1,
            operations: action.operations
        };

        localRecord = slateRecordReducer(recordStore.localRecord, outstandingChangeset);
        outstandingChangesets = [...recordStore.outstandingChangesets, outstandingChangeset];

        undoQueue = [slateChangesetInverter(outstandingChangeset), ...undoQueue.map(incrementVersion)].map(incrementVersion);
        if (SlateChangeset.isMutationSlateChangeset(outstandingChangeset)) {
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
                    remoteRecord = slateRecordReducer(remoteRecord, appliedChangeset)
                    unprocessedChangesets = unprocessedChangesets.slice(1);

                    if (inProgressChangeset !== null) {
                        if (inProgressChangeset.id === appliedChangeset.id) {
                            inProgressChangeset = null;
                        } else {
                            let [right, bottom] = slateChangesetsTransformer([inProgressChangeset], [appliedChangeset], false);
                            inProgressChangeset = right[0];
                            [right, bottom] = slateChangesetsTransformer(outstandingChangesets, bottom, false);
                            outstandingChangesets = right;

                            undoQueue = slateChangesetsTransformer(undoQueue, bottom, false)[0];
                            redoQueue = slateChangesetsTransformer(redoQueue, bottom, false)[0];
                        }
                    } else {
                        let [right, bottom] = slateChangesetsTransformer(outstandingChangesets, [appliedChangeset], false);
                        outstandingChangesets = right;
                        undoQueue = slateChangesetsTransformer(undoQueue, bottom, false)[0];
                        redoQueue = slateChangesetsTransformer(redoQueue, bottom, false)[0];
                    }
                }
                localRecord = remoteRecord;
                if (inProgressChangeset !== null) {
                    localRecord = slateRecordReducer(localRecord, inProgressChangeset);
                }
                if (outstandingChangesets.length > 0) {
                    localRecord = outstandingChangesets.reduce(slateRecordReducer, localRecord);
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
            localRecord = slateRecordReducer(localRecord, inProgressChangeset);
        }
        if (outstandingChangesets.length > 0) {
            localRecord = outstandingChangesets.reduce(slateRecordReducer, localRecord);
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
            redoQueue = [slateChangesetInverter(undoChangeset), ...redoQueue.map(incrementVersion)].map(incrementVersion);
            outstandingChangesets = [...outstandingChangesets, undoChangeset];
            localRecord = slateRecordReducer(localRecord, undoChangeset)

            // keep undoing until a mutation is detected
            if (SlateChangeset.isMutationSlateChangeset(undoChangeset)) break;
        }
    } else if (action.type === "apply_redo") {
        while (redoQueue.length > 0) {
            let redoChangeset: SlateChangeset = {
                ...redoQueue[0],
                id: ChangesetId.generate(),
                clientId: action.clientId,
                version: localRecord.version + 1
            };

            redoQueue = redoQueue.slice(1);
            undoQueue = [slateChangesetInverter(redoChangeset), ...undoQueue.map(incrementVersion)].map(incrementVersion);
            outstandingChangesets = [...outstandingChangesets, redoChangeset];
            localRecord = slateRecordReducer(localRecord, redoChangeset);

            // keep redoing until a mutation is detected
            if (SlateChangeset.isMutationSlateChangeset(redoChangeset)) break;
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