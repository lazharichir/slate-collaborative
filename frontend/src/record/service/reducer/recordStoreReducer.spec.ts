import recordStoreReducer from "./recordStoreReducer";
import {RecordStore} from "../domain/RecordStore";

describe("Record Store Reducer", () => {
    it("loads remote record", () => {
        expect(recordStoreReducer(RecordStore.DEFAULT, {
            type: "load_remote_record",
            record: {
                metadata: {type: "RECORD", version: 1},
                version: 1,
                cursors: {},
                value: {
                    metadata: {type: "SLATE_VALUE", version: 1},
                    children: []
                }
            }
        })).toEqual({
            remoteRecord: {
                metadata: {type: "RECORD", version: 1},
                version: 1,
                cursors: {},
                value: {
                    metadata: {type: "SLATE_VALUE", version: 1},
                    children: []
                }
            },
            unprocessedChangesets: [],
            localRecord: {
                metadata: {type: "RECORD", version: 1},
                version: 1,
                cursors: {},
                value: {
                    metadata: {type: "SLATE_VALUE", version: 1},
                    children: []
                }
            },
            inProgressChangeset: null,
            outstandingChangesets: [],
            undoQueue: [],
            redoQueue: []
        })
    });
});