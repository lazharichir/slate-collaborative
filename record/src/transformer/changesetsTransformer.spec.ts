import {changesetsTransformer} from "./changesetsTransformer";

function operationsTransformer(leftOperations: number[], topOperations: number[]): [number[], number[]] {
    if (leftOperations[0] === topOperations[0]) {
        return [[], []];
    } else {
        return [leftOperations, topOperations];
    }
}

describe("Changeset Transformation Square", () => {
    it("throws an exception if the two changesets are not at the same version", () => {
        expect(() => changesetsTransformer(operationsTransformer)(
            [{
                metadata: {type: "CHANGESET", version: 1},
                id: "123", version: 1, clientId: "abc",
                operations: [1]
            }],
            [{
                metadata: {type: "CHANGESET", version: 1},
                id: "456", version: 2, clientId: "def",
                operations: [2]
            }]
        )).toThrowError();
    });
    it("simply returns when only one side has changesets", () => {
        expect(changesetsTransformer(operationsTransformer)(
            [{
                metadata: {type: "CHANGESET", version: 1},
                id: "123", version: 1, clientId: "abc",
                operations: [1]
            }],
            []
        )).toEqual([
            [{
                metadata: {type: "CHANGESET", version: 1},
                id: "123", version: 1, clientId: "abc",
                operations: [1]
            }],
            []
        ]);
    });

    it("transforms changesets", () => {
        expect(changesetsTransformer(operationsTransformer)([{
            metadata: {type: "CHANGESET", version: 1},
            id: "123",
            version: 1,
            clientId: "abc",
            operations: [1]
        }], [{
            metadata: {type: "CHANGESET", version: 1},
            id: "321", version: 1, clientId: "def",
            operations: [1]
        }])).toEqual([[{
            metadata: {type: "CHANGESET", version: 1},
            id: "123", version: 2, clientId: "abc",
            operations: []
        }], [{
            metadata: {type: "CHANGESET", version: 1}, id: "321", version: 2, clientId: "def",
            operations: []
        }]]);
    });
});