import recordStoreReducer from "./recordStoreReducer";
import {RecordStore} from "../domain/RecordStore";

describe("Record Store Reducer", () => {
    it("loads remote record", () => {
        expect(recordStoreReducer<number, number, number>(
            value => value,
            (clientId, selections, operation) => selections,
            operation => operation,
            (leftOperations, topOperations, tieBreaker) => [leftOperations, topOperations],
            operation => true
        )(RecordStore.defaultRecordStore(1), {
            type: "load_remote_record",
            record: {
                metadata: {type: "RECORD", version: 1},
                version: 1,
                cursors: {},
                value: 1
            }
        })).toEqual({
            remoteRecord: {
                metadata: {type: "RECORD", version: 1},
                version: 1,
                cursors: {},
                value: 1
            },
            unprocessedChangesets: [],
            localRecord: {
                metadata: {type: "RECORD", version: 1},
                version: 1,
                cursors: {},
                value: 1
            },
            inProgressChangeset: null,
            outstandingChangesets: [],
            undoQueue: [],
            redoQueue: []
        })
    });
});