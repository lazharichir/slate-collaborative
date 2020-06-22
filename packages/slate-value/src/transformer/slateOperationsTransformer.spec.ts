import {slateOperationsTransformer} from "./slateOperationsTransformer";

describe("Operations Transformer", () => {
    it("returns quickly when only one side has operations", () => {
        expect(slateOperationsTransformer(
            [{type: "insert_text", path: [0], offset: 5, text: "abc"}],
            [],
            false
        )).toEqual([
            [{type: "insert_text", path: [0], offset: 5, text: "abc"}],
            []
        ]);
        expect(slateOperationsTransformer(
            [],
            [{type: "insert_text", path: [0], offset: 5, text: "abc"}],
            false
        )).toEqual([
            [],
            [{type: "insert_text", path: [0], offset: 5, text: "abc"}]
        ]);
    });
    it("resolves similar operations", () => {
        expect(slateOperationsTransformer(
            [{type: "remove_text", path: [0], offset: 5, text: "abc"}],
            [{type: "remove_text", path: [0], offset: 5, text: "abc"}],
            false
        )).toEqual([
            [],
            []
        ])
    });
    it("resolves multiple operations", () => {
        expect(slateOperationsTransformer(
            [
                {type: "insert_text", path: [0, 0], offset: 5, text: "a"},
                {type: "insert_text", path: [0, 0], offset: 12, text: "bc"}
            ],
            [
                {type: "split_node", path: [0, 0], position: 10, properties: {}},
                {type: "split_node", path: [0], position: 1, properties: {}}
            ],
            false
        )).toEqual([
            [
                {type: "insert_text", path: [0, 0], offset: 5, text: "a"},
                {type: "insert_text", path: [1, 0], offset: 1, text: "bc"}
            ],
            [
                {type: "split_node", path: [0, 0], position: 11, properties: {}},
                {type: "split_node", path: [0], position: 1, properties: {}}
            ]
        ])
    });
});