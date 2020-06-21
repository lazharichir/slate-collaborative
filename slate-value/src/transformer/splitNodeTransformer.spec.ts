import {slateOperationTransformer} from "./slateOperationTransformer";
import {Path} from "../Path";
import {Point} from "../Point";

describe("Split Node Transformer", () => {
    describe("set_selection applied", () => {
        it("no-op", () => {});
    });
    describe("insert_text applied", () => {
        let before = 0, at = 1, after = 2, length = 3;
        ([
            ["before", before, at + length],
            ["at", at, at + length],
            ["after", after, at]
        ] as [string, number, number][]).forEach(([name, offset, output]) => {
            it(name, () => {
                expect(slateOperationTransformer(
                    {type: "split_node", path: [0], position: at, properties: {}},
                    {type: "insert_text", path: [0], offset, text: "abc"},
                    false
                )).toEqual([
                    {type: "split_node", path: [0], position: output, properties: {}}
                ])
            });
        });
        it("unrelated", () => {
            expect(slateOperationTransformer(
                {type: "split_node", path: [1], position: 5, properties: {}},
                {type: "insert_text", path: [0], offset: 5, text: "abc"},
                false
            )).toEqual([
                {type: "split_node", path: [1], position: 5, properties: {}},
            ]);
        });
    });
    describe("remove_text applied", () => {
        let before = 0, at = 2, after = 3;
        ([
            ["before-before", [before, "a"], at - 1],
            ["before-at", [before, "ab"], at - 2],
            ["before-after", [before, "abc"], at - 2],
            ["at-after", [at, "c"], at],
            ["after-after", [after, "de"], at]
        ] as [string, [number, string], number][]).forEach(([name, [offset, text], output]) => {
            it(name, () => {
                expect(slateOperationTransformer(
                    {type: "split_node", path: [0], position: at, properties: {}},
                    {type: "remove_text", path: [0], offset, text},
                    false
                )).toEqual([
                    {type: "split_node", path: [0], position: output, properties: {}}
                ])
            });
        });
        it("unrelated", () => {
            expect(slateOperationTransformer(
                {type: "split_node", path: [1], position: 5, properties: {}},
                {type: "remove_text", path: [0], offset: 5, text: "abc"},
                false
            )).toEqual([
                {type: "split_node", path: [1], position: 5, properties: {}},
            ]);
        });
    });
    describe("insert_node applied", () => {
        ([
            ["before", [0], [2]],
            ["at", [1], [2]],
            ["after", [2], [1]]
        ] as [string, Path, Path][]).forEach(([name, input, output]) => {
            it(name, () => {
                expect(slateOperationTransformer(
                    {type: "split_node", path: [1], position: 5, properties: {}},
                    {type: "insert_node", path: input, node: {text: "abc"}},
                    false
                )).toEqual([
                    {type: "split_node", path: output, position: 5, properties: {}}
                ]);
            });
        });
    });
    describe("remove_node applied", () => {
        ([
            ["before", [0], [0]],
            ["at", [1], null],
            ["after", [2], [1]]
        ] as [string, Path, Path | null][]).forEach(([name, input, output]) => {
            it(name, () => {
                expect(slateOperationTransformer(
                    {type: "split_node", path: [1], position: 5, properties: {}},
                    {type: "remove_node", path: input, node: {text: "abc"}},
                    false
                )).toEqual(output === null ? [] : [
                    {type: "split_node", path: output, position: 5, properties: {}}
                ]);
            });
        });
    });
    describe("applied set_node", () => {
        it("no-op", () => {});
    });
    describe("move_node applied", () => {
        let parentPreviousChild = [0, 1], parentPrevious = [0], parent = [2], previous = [2, 1], at = [2, 2], next = [2, 6], parentNext = [4];
        ([
            ["parentPreviousChild-parentPrevious", [parentPreviousChild, parentPrevious], [3, 2]],
            ["parentPreviousChild-parent", [parentPreviousChild, parent], [3, 2]],
            ["parentPreviousChild-previous", [parentPreviousChild, previous], [2, 3]],
            ["parentPreviousChild-at", [parentPreviousChild, at], [2, 3]],

            ["parentPrevious-previous", [parentPrevious, previous], [1, 3]],
            ["parentPrevious-at", [parentPrevious, at], [1, 3]],
            ["parentPrevious-next", [parentPrevious, next], [1, 2]],
            ["parentPrevious-parentNext", [parentPrevious, parentNext], [1, 2]],

            ["parent-parentPreviousChild", [parent, parentPreviousChild], [0, 1, 2]],

            ["previous-parentPreviousChild", [previous, parentPreviousChild], [2, 1]],
            ["previous-parentPrevious", [previous, parentPrevious], [3, 1]],
            ["previous-parent", [previous, parent], [3, 1]],
            ["previous-next", [previous, next], [2, 1]],
            ["previous-parentNext", [previous, parentNext], [2, 1]],

            ["at-parentPreviousChild", [at, parentPreviousChild], [0, 1]],
            ["at-parentPrevious", [at, parentPrevious], [0]],
            ["at-parent", [at, parent], [2]],
            ["at-next", [at, next], [2, 6]],
            ["at-parentNext", [at, parentNext], [4]],

            ["next-parentPreviousChild", [next, parentPreviousChild], [2, 2]],
            ["next-parentPrevious", [next, parentPrevious], [3, 2]],
            ["next-parent", [next, parent], [3, 2]],
            ["next-previous", [next, previous], [2, 3]],
            ["next-at", [next, at], [2, 3]],
            ["next-parentNext", [next, parentNext], [2, 2]],

            ["parentNext-parentPreviousChild", [parentNext, parentPreviousChild], [2, 2]],
            ["parentNext-parentPrevious", [parentNext, parentPrevious], [3, 2]],
            ["parentNext-parent", [parentNext, parent], [3, 2]],
            ["parentNext-previous", [parentNext, previous], [2, 3]],
            ["parentNext-at", [parentNext, at], [2, 3]],
            ["parentNext-next", [parentNext, next], [2, 2]],
        ] as [string, [Path, Path], Path][]).forEach(([name, [path, newPath], output]) => {
            it(name, () => {
                expect(slateOperationTransformer(
                    {type: "split_node", path: at, position: 5, properties: {}},
                    {type: "move_node", path: path, newPath: newPath},
                    false
                )).toEqual([
                    {type: "split_node", path: output, position: 5, properties: {}}
                ]);
            });
        });
    });
    describe("split_node applied", () => {
        ([
            ["beforeNode", [[0], 5], [[0], 5]],
            ["afterNode", [[2], 5], [[3], 5]],
            ["before", [[1], 0], [[1], 0]],
            ["at", [[1], 1], [[2], 0]],
            ["after", [[1], 2], [[2], 1]]
        ] as [string, [Path, number], Path[]][]).forEach(([name, [path, position], [outputPath, outputPosition]]) => {
            it(name, () => {
                expect(slateOperationTransformer(
                    {type: "split_node", path, position, properties: {}},
                    {type: "split_node", path: [1], position: 1, properties: {}},
                    false
                )).toEqual([
                    {type: "split_node", path: outputPath, position: outputPosition, properties: {}}
                ]);
            });
        });
    });
    describe("merge_node applied", () => {
        ([
            ["before", {path: [0], offset: 0}, {path: [0], offset: 0}],
            ["target", {path: [1], offset: 3}, {path: [1], offset: 3}],
            ["current:0", {path: [2], offset: 0}, {path: [1], offset: 5}],
            ["current:5", {path: [2], offset: 3}, {path: [1], offset: 8}],
            ["after", {path: [3], offset: 5}, {path: [2], offset: 5}]
        ] as [string, Point, Point][]).forEach(([name, input, output]) => {
            it(name, () => {
                expect(slateOperationTransformer(
                    {type: "split_node", path: input.path, position: input.offset, properties: {}},
                    {type: "merge_node", path: [2], position: 5, properties: {}},
                    false
                )).toEqual([
                    {type: "split_node", path: output.path, position: output.offset, properties: {}}
                ]);
            });
        });
    });
});
