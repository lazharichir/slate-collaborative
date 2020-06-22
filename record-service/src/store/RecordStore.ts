import {Record} from "record";
import {Changeset} from "record";

export type RecordStore<V, S, O> = {
    remoteRecord: Record<V, S>,
    unprocessedChangesets: Changeset<O>[],
    localRecord: Record<V, S>,
    inProgressChangeset: null | Changeset<O>,
    outstandingChangesets: Changeset<O>[],
    undoQueue: Changeset<O>[],
    redoQueue: Changeset<O>[]
};

function defaultRecordStore<V, S, O>(defaultValue: V): RecordStore<V, S, O> {
    return ({
        remoteRecord: {
            metadata: {type: "RECORD", version: 1},
            version: 0,
            value: defaultValue,
            cursors: {}
        },
        unprocessedChangesets: [],
            localRecord: {
            metadata: {type: "RECORD", version: 1},
            version: 0,
            value: defaultValue,
            cursors: {}
        },
        inProgressChangeset: null,
        outstandingChangesets: [],
        undoQueue: [],
        redoQueue: []
    } as RecordStore<V, S, O>)
}

export const RecordStore = {
    defaultRecordStore
};
