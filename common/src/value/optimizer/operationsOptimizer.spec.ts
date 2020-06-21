import {operationsOptimizer} from "./operationsOptimizer";

describe("Operations Optimizer", () => {
    it("collapses two insert_text adjacent to each other", () => {
        expect(operationsOptimizer([
            {type: "insert_text", path: [0], offset: 5, text: "abc"},
            {type: "insert_text", path: [0], offset: 8, text: "def"},
            {type: "insert_text", path: [0], offset: 11, text: "ghi"}
        ])).toEqual([
            {type: "insert_text", path: [0], offset: 5, text: "abcdefghi"},
        ]);
        expect(operationsOptimizer([
            {type: "insert_text", path: [0], offset: 5, text: "abc"},
            {type: "insert_text", path: [0], offset: 5, text: "def"},
            {type: "insert_text", path: [0], offset: 5, text: "ghi"}
        ])).toEqual([
            {type: "insert_text", path: [0], offset: 5, text: "ghidefabc"},
        ]);
    });
    it("collapses two remove_text adjacent to each other", () => {
        expect(operationsOptimizer([
            {type: "remove_text", path: [0], offset: 5, text: "abc"},
            {type: "remove_text", path: [0], offset: 5, text: "def"},
            {type: "remove_text", path: [0], offset: 5, text: "ghi"}
        ])).toEqual([
            {type: "remove_text", path: [0], offset: 5, text: "abcdefghi"},
        ]);
        expect(operationsOptimizer([
            {type: "remove_text", path: [0], offset: 8, text: "abc"},
            {type: "remove_text", path: [0], offset: 5, text: "def"},
            {type: "remove_text", path: [0], offset: 2, text: "ghi"}
        ])).toEqual([
            {type: "remove_text", path: [0], offset: 2, text: "ghidefabc"},
        ]);
    });
});
