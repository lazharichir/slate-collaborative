import {slateOperationTransformer} from "./slateOperationTransformer";
import {Path} from "../Path";
import {SetSelectionOperation} from "../SlateOperation";

describe("Insert Node Transformer", () => {
    describe("set_selection applied", () => {
        it("no-op", () => {
            expect(slateOperationTransformer(
                {type: "insert_node", path: [0], node: {text: "abc"}},
                {type: "set_selection", properties: {}, newProperties: null} as SetSelectionOperation,
                false
            )).toEqual([
                {type: "insert_node", path: [0], node: {text: "abc"}},
            ]);
        });
    });
    describe("insert_text applied", () => {
        it("no-op", () => {
            expect(slateOperationTransformer(
                {type: "insert_node", path: [0], node: {text: "abc"}},
                {type: "insert_text", path: [0], offset: 5, text: "def"},
                false
            )).toEqual([
                {type: "insert_node", path: [0], node: {text: "abc"}},
            ]);
        });
    });
    describe("remove_text applied", () => {
        it("no-op", () => {
            expect(slateOperationTransformer(
                {type: "insert_node", path: [0], node: {text: "abc"}},
                {type: "remove_text", path: [0], offset: 5, text: "def"},
                false
            )).toEqual([
                {type: "insert_node", path: [0], node: {text: "abc"}},
            ]);
        });
    });
    describe("insert_node applied", () => {
        ([
            ["parent's previous", [0], [2, 1]],
            ["parent's previous's child", [0, 0], [1, 1]],
            ["parent", [1], [2, 1]],
            ["previous", [1, 0], [1, 2]],
            ["at", [1, 1], [1, 2]],
            ["next", [1, 2], [1, 1]],
            ["parent's next", [2], [1, 1]],
        ] as [string, Path, Path][]).forEach(([name, initial, expected]) => {
            it(name, () => {
                expect(slateOperationTransformer(
                    {type: "insert_node", path: [1, 1], node: {text: "abc"}},
                    {type: "insert_node", path: initial, node: {text: "def"}},
                    false
                )).toEqual([
                    {type: "insert_node", path: expected, node: {text: "abc"}}
                ]);
            });
        });
        it("at, tiebreaker", () => {
            expect(slateOperationTransformer(
                {type: "insert_node", path: [1, 1], node: {text: "abc"}},
                {type: "insert_node", path: [1, 1], node: {text: "def"}},
                true
            )).toEqual([
                {type: "insert_node", path: [1, 1], node: {text: "abc"}}
            ]);
        });
    });
    describe("remove_node applied", () => {
        let parentPrevious = [0], previous = [1, 0], parent = [1], at = [1, 1], child = [1, 1, 1], next = [1, 2], parentNext = [2];
        ([
            ["parentPrevious", parentPrevious, parentPrevious],
            ["previous", previous, previous],
            ["parent", parent, parent],
            ["at", at, at],
            ["child", child, null],
            ["next", next, at],
            ["parentNext", parentNext, parentNext],
        ] as [string, Path, Path][]).forEach(([name, input, output]) => {
            it(name, () => {
                expect(slateOperationTransformer(
                    {type: "insert_node", path: input, node: {text: ""}},
                    {type: "remove_node", path: [1, 1], node: {text: "abc"}},
                    false
                )).toEqual(
                    output !== null ? [{type: "insert_node", path: output, node: {text: ""}}] : []
                );
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
                    {type: "insert_node", path: at, node: {text: "abc"}},
                    {type: "move_node", path: path, newPath: newPath},
                    false
                )).toEqual([{
                    type: "insert_node", path: output, node: {text: "abc"}
                }]);
            });
        });
    });
    describe("split_node applied", () => {
        ([
            ["before", [0], [0]],
            ["at", [1], [1]],
            ["after", [2], [3]]
        ] as [string, Path, Path][]).forEach(([name, path, newPath]) => {
            it(name, () => {
                expect(slateOperationTransformer(
                    {type: "insert_node", path, node: {text: "abc"}},
                    {type: "split_node", path: [1], position: 5, properties: {}},
                    false
                )).toEqual([
                    {type: "insert_node", path: newPath, node: {text: "abc"}},
                ])
            });
        });
    });
    describe("merge_node applied", () => {
        it("before", () => {
            expect(slateOperationTransformer(
                {type: "merge_node", path: [2], position: 5, properties: {}},
                {type: "insert_node", path: [1], node: {text: "abc"}},
                false
            )).toEqual([
                {type: "merge_node", path: [3], position: 5, properties: {}},
            ]);
        });
        it("inbetween", () => {
            expect(slateOperationTransformer(
                {type: "merge_node", path: [2], position: 5, properties: {}},
                {type: "insert_node", path: [2], node: {text: "abc"}},
                false
            )).toEqual([
                {type: "move_node", path: [3], newPath: [2]},
                {type: "merge_node", path: [2], position: 5, properties: {}}
            ]);
        });
        it("after", () => {
            expect(slateOperationTransformer(
                {type: "merge_node", path: [2], position: 5, properties: {}},
                {type: "insert_node", path: [3], node: {text: "abc"}},
                false
            )).toEqual([
                {type: "merge_node", path: [2], position: 5, properties: {}}
            ]);
        });
    });
});
