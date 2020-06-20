import {changesetsTransformer} from "./changesetsTransformer";

describe("Changeset Transformation Square", () => {
    it("throws an exception if the two changesets are not at the same version", () => {
        expect(() => changesetsTransformer(
            [{
                metadata: {type: "CHANGESET", version: 1},
                id: "123", version: 1, clientId: "abc",
                operations: [{type: "insert_text", path: [0], offset: 5, text: "abc"}]
            }],
            [{
                metadata: {type: "CHANGESET", version: 1},
                id: "456", version: 2, clientId: "def",
                operations: [{type: "insert_text", path: [0], offset: 5, text: "abc"}]
            }]
        )).toThrowError();
    });
    it("simply returns when only one side has changesets", () => {
        expect(changesetsTransformer(
            [{
                metadata: {type: "CHANGESET", version: 1},
                id: "123", version: 1, clientId: "abc",
                operations: [{type: "insert_text", path: [0], offset: 5, text: "abc"}]
            }],
            []
        )).toEqual([
            [{
                metadata: {type: "CHANGESET", version: 1},
                id: "123", version: 1, clientId: "abc",
                operations: [{type: "insert_text", path: [0], offset: 5, text: "abc"}]
            }],
            []
        ]);
    });

    it("transforms changesets", () => {
        expect(changesetsTransformer([{
            metadata: {type: "CHANGESET", version: 1},
            id: "123",
            version: 1,
            clientId: "abc",
            operations: [{type: "remove_text", path: [0], offset: 5, text: "abc"}]
        }], [{
            metadata: {type: "CHANGESET", version: 1},
            id: "321", version: 1, clientId: "def",
            operations: [{type: "remove_text", path: [0], offset: 4, text: "tabc"}]
        }])).toEqual([[{
            metadata: {type: "CHANGESET", version: 1},
            id: "123", version: 2, clientId: "abc",
            operations: []
        }], [{
            metadata: {type: "CHANGESET", version: 1}, id: "321", version: 2, clientId: "def",
            operations: [{
                type: "remove_text",
                path: [0],
                offset: 4,
                text: "t"
            }]
        }]]);
    });
});