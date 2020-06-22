import {resourceStoreReducer} from "./resourceStoreReducer";
import {ResourceStore} from "./ResourceStore";

describe("Resource Store Reducer", () => {
    it("loads remote resource", () => {
        expect(resourceStoreReducer<number, number, number>(
            value => value,
            (clientId, selections, operation) => selections,
            operation => operation,
            (leftOperations, topOperations, tieBreaker) => [leftOperations, topOperations],
            operation => true
        )(ResourceStore.defaultResourceStore(1), {
            type: "load_remote_resource",
            resource: {
                metadata: {type: "RESOURCE", version: 1},
                version: 1,
                cursors: {},
                value: 1
            }
        })).toEqual({
            remoteResource: {
                metadata: {type: "RESOURCE", version: 1},
                version: 1,
                cursors: {},
                value: 1
            },
            unprocessedChangesets: [],
            localResource: {
                metadata: {type: "RESOURCE", version: 1},
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