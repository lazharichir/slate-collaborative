import {slateOperationTransformer} from "./slateOperationTransformer";
import {Path} from "../Path";
import {SetSelectionOperation} from "../action/SlateOperation";

describe("Insert Text Transformer", () => {
    describe("set_selection applied", () => {
        it("no-op", () => {
            expect(slateOperationTransformer(
                {type: "insert_text", path: [], offset: 5, text: "abc"},
                {type: "set_selection", properties: {}, newProperties: null} as SetSelectionOperation,
                false
            )).toEqual([
                {type: "insert_text", path: [], offset: 5, text: "abc"}
            ]);
        });
    });
    describe("insert_text applied", () => {
        ([
            ["before", 0, 0],
            ["at", 1, 4],
            ["after", 2, 5]
        ] as [string, number, number][]).forEach(([name, offset, expected]) => {
            it(name, () => {
                expect(slateOperationTransformer(
                    {type: "insert_text", path: [], offset: offset, text: "def"},
                    {type: "insert_text", path: [], offset: 1, text: "abc"},
                    false
                )).toEqual([{
                    type: "insert_text", path: [], offset: expected, text: "def"
                }])
            });
        });
        it("at, tiebreaker", () => {
            expect(slateOperationTransformer(
                {type: "insert_text", path: [], offset: 1, text: "def"},
                {type: "insert_text", path: [], offset: 1, text: "abc"},
                true
            )).toEqual([{
                type: "insert_text", path: [], offset: 1, text: "def"
            }]);
        });
        it("unrelated", () => {
            expect(slateOperationTransformer(
                {type: "insert_text", path: [0], offset: 5, text: "abc"},
                {type: "insert_text", path: [1], offset: 3, text: "def"},
                false
            )).toEqual([
                {type: "insert_text", path: [0], offset: 5, text: "abc"}
            ]);
        });
    });
    describe("remove_text applied", () => {
        const before = 0, start = 1, within = 2, end = 3, after = 4, length = 2;
        ([
            ["before", [before, "a"], [before, "a"]],
            ["start", [start, "a"], [start, "a"]],
            ["within", [within, "a"], null],
            ["end", [end, "a"], [start, "a"]],
            ["after", [after, "a"], [after-length, "a"]]
        ] as [string, [number, string], null | [number, string]][]).forEach(([name, initial, expected]) => {
            it(name, () => {
                let expectation = expect(slateOperationTransformer(
                    {type: "insert_text", path: [], offset: initial[0], text: initial[1]},
                    {type: "remove_text", path: [], offset: start, text: "ab"},
                    false
                ));
                if (expected === null) {
                    expectation.toEqual([]);
                } else {
                    expectation.toEqual([{
                        type: "insert_text", path: [], offset: expected[0], text: expected[1]
                    }]);
                }
            });
        });
        it("unrelated", () => {
            expect(slateOperationTransformer(
                {type: "insert_text", path: [0], offset: 5, text: "abc"},
                {type: "remove_text", path: [1], offset: 3, text: "def"},
                false
            )).toEqual([
                {type: "insert_text", path: [0], offset: 5, text: "abc"}
            ]);
        });
    });
    describe("insert_node applied", () => {
        ([
            ["parent's previous", [0], [0]],
            ["parent's previous's child", [0, 0], [0, 0]],
            ["parent", [1], [1]],
            ["previous", [1, 0], [1, 0]],
            ["at", [1, 1], [1, 2]],
            ["child", [1, 1, 1], [1, 2, 1]],
            ["next", [1, 2], [1, 3]],
            ["parent's next", [2], [2]],
        ] as [string, Path, Path][]).forEach(([name, initial, expected]) => {
            it(name, () => {
                expect(slateOperationTransformer(
                    {type: "insert_text", path: initial, offset: 5, text: "abc"},
                    {type: "insert_node", path: [1, 1], node: {text: ""}},
                    false
                )).toEqual([
                    {type: "insert_text", path: expected, offset: 5, text: "abc"}
                ]);
            });
        });
    });
    describe("remove_node applied", () => {
        let parentPrevious = [0], previous = [1, 0], at = [1, 1], child = [1, 1, 1], next = [1, 2], parentNext = [2];
        ([
            ["parentPrevious", parentPrevious, parentPrevious],
            ["previous", previous, previous],
            ["at", at, null],
            ["child", child, null],
            ["next", next, at],
            ["parentNext", parentNext, parentNext],
        ] as [string, Path, Path][]).forEach(([name, input, output]) => {
            it(name, () => {
                expect(slateOperationTransformer(
                    {type: "insert_text", path: input, offset: 5, text: "abc"},
                    {type: "remove_node", path: [1, 1], node: {text: "abc"}},
                    false
                )).toEqual(
                    output !== null ? [{type: "insert_text", path: output, offset: 5, text: "abc"}] : []
                );
            });
        });
    });
    describe("set_node applied", () => {
        it("no-op", () => {
            expect(slateOperationTransformer(
                {type: "insert_text", path: [], offset: 5, text: "abc"},
                {type: "set_node", path: [], properties: {bold: undefined}, newProperties: {bold: true}},
                false
            )).toEqual([
                {type: "insert_text", path: [], offset: 5, text: "abc"}
            ]);
        });
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
                    {type: "insert_text", path: at, offset: 5, text: "abc"},
                    {type: "move_node", path: path, newPath: newPath},
                    false
                )).toEqual([{
                    type: "insert_text", path: output, offset: 5, text: "abc"
                }]);
            });
        });
    });
    describe("split_node applied", () => {
        ([
            ["beforeNode", [[0], 5], [[0], 5]],
            ["before", [[1], 0], [[1], 0]],
            ["at", [[1], 1], [[1], 1]],
            ["child", [[1, 1], 5], [[2, 0], 5]],
            ["after", [[1], 2], [[2], 1]],
            ["afterNode", [[2], 5], [[3], 5]]
        ] as [string, [Path, number], [Path, number]][]).forEach(([name, [path, offset], [newPath, newOffset]]) => {
            it(name, () => {
                expect(slateOperationTransformer(
                    {type: "insert_text", path, offset, text: "abc"},
                    {type: "split_node", path: [1], position: 1, properties: {}},
                    false
                )).toEqual([
                    {type: "insert_text", path: newPath, offset: newOffset, text: "abc"}
                ]);
            });
        });
    });
    describe("merge_node applied", () => {
        let beforeNode = [[0], 5], before = [[1], 0], after = [[2], 0], afterNode = [[3], 5];
        ([
            ["beforeNode", beforeNode, [[0], 5]],
            ["before", before, [[1], 0]],
            ["after", after, [[1], 4]],
            ["afterAfter", afterNode, [[2], 5]]
        ] as [string, [Path, number], [Path, number]][]).forEach(([name, [path, offset], output]) => {
            it(name, () => {
                expect(slateOperationTransformer(
                    {type: "insert_text", path, offset, text: "abc"},
                    {type: "merge_node", path: [2], position: 4, properties: {}},
                    false
                )).toEqual([
                    {type: "insert_text", path: output[0], offset: output[1], text: "abc"}
                ])
            });
        });
    });
});