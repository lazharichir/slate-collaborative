import {Record} from "common/record/Record";
import {Changeset} from "common/record/action/Changeset";

export type RecordStore = {
    remoteRecord: Record,
    unprocessedChangesets: Changeset[],
    localRecord: Record,
    inProgressChangeset: null | Changeset,
    outstandingChangesets: Changeset[],
    undoQueue: Changeset[],
    redoQueue: Changeset[]
};

export const RecordStore = {
    DEFAULT: {
        remoteRecord: {
            metadata: {type: "RECORD", version: 1},
            version: 0,
            value: {
                metadata: {type: "SLATE_VALUE", version: 1},
                children: []
            },
            cursors: {}
        },
        unprocessedChangesets: [],
        localRecord: {
            metadata: {type: "RECORD", version: 1},
            version: 0,
            value: {
                metadata: {type: "SLATE_VALUE", version: 1},
                children: []
            },
            cursors: {}
        },
        inProgressChangeset: null,
        outstandingChangesets: [],
        undoQueue: [],
        redoQueue: []
    } as RecordStore
};
