import {slateOperationTransformer} from "./slateOperationTransformer";
import {Path} from "../Path";
import {Point} from "../Point";
import openRecordsIndexedDB from "../../../frontend/src/record/service/infrastructure/openRecordsIndexedDB";

describe("Merge Node Transformer", () => {
    describe("set_selection applied", () => {
        it("no-op", () => {});
    });
    describe("insert_text applied", () => {
        let before = [[0], 0], atPre = [[0], 1], atPost = [[1], 0], after = [[1], 0], length = 3;
        ([
            ["before", before, 1+length],
            ["atPre", atPre, 1+length],
            ["atPost", atPost, 1],
            ["after", after, 1]
        ] as [string, [Path, number], number][]).forEach(([name, [path, offset], output]) => {
            it(name, () => {
                expect(slateOperationTransformer(
                    {type: "merge_node", path: [1], position: 1, properties: {}},
                    {type: "insert_text", path, offset, text: "abc"},
                    false
                )).toEqual([
                    {type: "merge_node", path: [1], position: output, properties: {}}
                ])
            });
        });
    });
    describe("remove_text applied", () => {
        let before = [[0], 0], at = [[1], 0], after = [[1], 0], length = 2;
        ([
            ["before", before, 4-length],
            ["at", at, 4],
            ["after", after, 4]
        ] as [string, [Path, number], number][]).forEach(([name, [path, offset], output]) => {
            it(name, () => {
                expect(slateOperationTransformer(
                    {type: "merge_node", path: [1], position: 4, properties: {}},
                    {type: "remove_text", path, offset, text: "ab"},
                    false
                )).toEqual([
                    {type: "merge_node", path: [1], position: output, properties: {}}
                ])
            });
        });
    });
    describe("insert_node applied", () => {
        it("before", () => {
            expect(slateOperationTransformer(
                {type: "insert_node", path: [0], node: {text: "abc"}},
                {type: "merge_node", path: [1], position: 5, properties: {}},
                false
            )).toEqual([
                {type: "insert_node", path: [0], node: {text: "abc"}}
            ]);
        });
        it("inbetween", () => {
            expect(slateOperationTransformer(
                {type: "insert_node", path: [1], node: {text: "abc"}},
                {type: "merge_node", path: [1], position: 5, properties: {}},
                false
            )).toEqual([
                {type: "insert_node", path: [1], node: {text: "abc"}}
            ]);
        });
        it("after", () => {
            expect(slateOperationTransformer(
                {type: "insert_node", path: [2], node: {text: "abc"}},
                {type: "merge_node", path: [1], position: 5, properties: {}},
                false
            )).toEqual([
                {type: "insert_node", path: [1], node: {text: "abc"}}
            ]);
        });
    });
    describe("remove_node applied", () => {
        it("before", () => {
            expect(slateOperationTransformer(
                {type: "merge_node", path: [2], position: 5, properties: {}},
                {type: "remove_node", path: [0], node: {text: "abc"}},
                false
            )).toEqual([
                {type: "merge_node", path: [1], position: 5, properties: {}},
            ]);
        });
        it("current", () => {
            expect(slateOperationTransformer(
                {type: "merge_node", path: [2], position: 5, properties: {}},
                {type: "remove_node", path: [1], node: {text: "abc"}},
                false
            )).toEqual([]);
        });
        it("target", () => {
            expect(slateOperationTransformer(
                {type: "merge_node", path: [2], position: 5, properties: {}},
                {type: "remove_node", path: [2], node: {text: "abc"}},
                false
            )).toEqual([]);
        });
        it("after", () => {
            expect(slateOperationTransformer(
                {type: "merge_node", path: [3], position: 5, properties: {}},
                {type: "remove_node", path: [1], node: {text: "abc"}},
                false
            )).toEqual([
                {type: "merge_node", path: [2], position: 5, properties: {}},
            ]);
        });
        it("ancestor", () => {
            expect(slateOperationTransformer(
                {type: "merge_node", path: [1, 1], position: 5, properties: {}},
                {type: "remove_node", path: [1], node: {children: [{text: "abc"}, {text: "def"}]}},
                false
            )).toEqual([]);
        });
    });
    describe("applied set_node", () => {
        it("no-op", () => {});
    });
    describe("move_node applied", () => {
        it("before-before", () => {
            expect(slateOperationTransformer(
                {type: "merge_node", path: [3], position: 5, properties: {}},
                {type: "move_node", path: [0], newPath: [1]},
                false
            )).toEqual([
                {type: "merge_node", path: [3], position: 5, properties: {}}
            ]);
        });
        it("before-target", () => {
            expect(slateOperationTransformer(
                {type: "merge_node", path: [3], position: 5, properties: {}},
                {type: "move_node", path: [0], newPath: [2]},
                false
            )).toEqual([
                {type: "move_node", path: [3], newPath: [2]},
                {type: "merge_node", path: [2], position: 5, properties: {}}
            ]);
        });
        it("before-current", () => {
            expect(slateOperationTransformer(
                {type: "merge_node", path: [3], position: 5, properties: {}},
                {type: "move_node", path: [0], newPath: [3]},
                false
            )).toEqual([
                {type: "merge_node", path: [2], position: 5, properties: {}}
            ]);
        });
        it("before-after", () => {
            expect(slateOperationTransformer(
                {type: "merge_node", path: [3], position: 5, properties: {}},
                {type: "move_node", path: [0], newPath: [4]},
                false
            )).toEqual([
                {type: "merge_node", path: [2], position: 5, properties: {}}
            ]);
        });
        it("target-before", () => {
            expect(slateOperationTransformer(
                {type: "merge_node", path: [3], position: 5, properties: {}},
                {type: "move_node", path: [2], newPath: [0]},
                false
            )).toEqual([
                {type: "move_node", path: [3], newPath: [1]},
                {type: "merge_node", path: [1], position: 5, properties: {}}
            ]);
        });
        it("target-after", () => {
            expect(slateOperationTransformer(
                {type: "merge_node", path: [3], position: 5, properties: {}},
                {type: "move_node", path: [2], newPath: [4]},
                false
            )).toEqual([
                {type: "move_node", path: [2], newPath: [4]},
                {type: "merge_node", path: [4], position: 5, properties: {}}
            ]);
        });
        it("after-before", () => {
            expect(slateOperationTransformer(
                {type: "merge_node", path: [3], position: 5, properties: {}},
                {type: "move_node", path: [4], newPath: [0]},
                false
            )).toEqual([
                {type: "merge_node", path: [4], position: 5, properties: {}}
            ]);
        });
        it("after-target", () => {
            expect(slateOperationTransformer(
                {type: "merge_node", path: [3], position: 5, properties: {}},
                {type: "move_node", path: [4], newPath: [2]},
                false
            )).toEqual([
                {type: "merge_node", path: [4], position: 5, properties: {}}
            ]);
        });
        it("after-current", () => {
            expect(slateOperationTransformer(
                {type: "merge_node", path: [3], position: 5, properties: {}},
                {type: "move_node", path: [4], newPath: [3]},
                false
            )).toEqual([
                {type: "move_node", path: [4], newPath: [3]},
                {type: "merge_node", path: [3], position: 5, properties: {}}
            ]);
        });
        it("after-target", () => {
            expect(slateOperationTransformer(
                {type: "merge_node", path: [3], position: 5, properties: {}},
                {type: "move_node", path: [4], newPath: [2]},
                false
            )).toEqual([
                {type: "merge_node", path: [4], position: 5, properties: {}}
            ]);
        });
        it("after-current", () => {
            expect(slateOperationTransformer(
                {type: "merge_node", path: [3], position: 5, properties: {}},
                {type: "move_node", path: [4], newPath: [3]},
                false
            )).toEqual([
                {type: "move_node", path: [4], newPath: [3]},
                {type: "merge_node", path: [3], position: 5, properties: {}}
            ]);
        });
        it("target-current", () => {
            expect(slateOperationTransformer(
                {type: "merge_node", path: [3], position: 5, properties: {}},
                {type: "move_node", path: [2], newPath: [3]},
                false
            )).toEqual([
                {type: "move_node", path: [2], newPath: [3]},
                {type: "merge_node", path: [3], position: 5, properties: {}}
            ]);
        });
        it("current-before", () => {
            expect(slateOperationTransformer(
                {type: "merge_node", path: [3], position: 5, properties: {}},
                {type: "move_node", path: [3], newPath: [0]},
                false
            )).toEqual([
                {type: "move_node", path: [0], newPath: [3]},
                {type: "merge_node", path: [3], position: 5, properties: {}}
            ]);
        });
        it("current-target", () => {
            expect(slateOperationTransformer(
                {type: "merge_node", path: [3], position: 5, properties: {}},
                {type: "move_node", path: [3], newPath: [2]},
                false
            )).toEqual([
                {type: "move_node", path: [2], newPath: [3]},
                {type: "merge_node", path: [3], position: 5, properties: {}}
            ]);
        });
        it("afterNode-afterNode", () => {
            expect(slateOperationTransformer(
                {type: "merge_node", path: [3], position: 5, properties: {}},
                {type: "move_node", path: [4], newPath: [5]},
                false
            )).toEqual([
                {type: "merge_node", path: [3], position: 5, properties: {}},
            ]);
        });
    });
    describe("split_node applied", () => {
        ([
            ["before", {path: [0], offset: 5}, {path: [0], offset: 5}],
            ["current", {path: [1], offset: 5}, {path: [1], offset: 5}],
            ["after", {path: [2], offset: 5}, {path: [3], offset: 5}]
        ] as [string, Point, Point][]).forEach(([name, input, output]) => {
            it(name, () => {
                expect(slateOperationTransformer(
                    {type: "merge_node", path: input.path, position: input.offset, properties: {}},
                    {type: "split_node", path: [1], position: 3, properties: {}},
                    false
                )).toEqual([
                    {type: "merge_node", path: output.path, position: output.offset, properties: {}}
                ]);
            });
        });

        it("at", () => {
            expect(slateOperationTransformer(
                {type: "merge_node", path: [0, 1], position: 5, properties: {}},
                {type: "split_node", path: [0], position: 1, properties: {}},
                false
            )).toEqual([]);
        });
    });
    describe("merge_node applied", () => {
        ([
            ["before", {path: [1], offset: 5}, {path: [1], offset: 5}],
            ["target", {path: [2], offset: 5}, {path: [2], offset: 5}],
            ["current", {path: [3], offset: 5}, null],
            ["next", {path: [4], offset: 5}, {path: [3], offset: 13}],
            ["after", {path: [5], offset: 5}, {path: [4], offset: 5}]
        ] as [string, Point, Point | null][]).forEach(([name, input, output]) => {
            it(name, () => {
                expect(slateOperationTransformer(
                    {type: "merge_node", path: input.path, position: input.offset, properties: {}},
                    {type: "merge_node", path: [3], position: 8, properties: {}},
                    false
                )).toEqual(output === null ? [] : [
                    {type: "merge_node", path: output.path, position: output.offset, properties: {}}
                ]);
            });
        });
    });
});
