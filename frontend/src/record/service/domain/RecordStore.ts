import {SlateChangeset, SlateRecord} from "common";

export type RecordStore = {
    remoteRecord: SlateRecord,
    unprocessedChangesets: SlateChangeset[],
    localRecord: SlateRecord,
    inProgressChangeset: null | SlateChangeset,
    outstandingChangesets: SlateChangeset[],
    undoQueue: SlateChangeset[],
    redoQueue: SlateChangeset[]
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
