import {changesetsTransformer} from "./changesetsTransformer";

describe("Changeset Transformation Square", () => {
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