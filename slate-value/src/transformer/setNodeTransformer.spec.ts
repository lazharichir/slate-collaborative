import {slateOperationTransformer} from "./slateOperationTransformer";
import {Path} from "../Path";
import {SetSelectionOperation} from "../SlateOperation";

describe("Set Node Transformer", () => {
    describe("set_selection applied", () => {
        it("no-op", () => {
            expect(slateOperationTransformer(
                {type: "set_node", path: [0], properties: {bold: undefined}, newProperties: {bold: true}},
                {type: "set_selection", properties: {}, newProperties: {}} as SetSelectionOperation,
                false
            )).toEqual([
                {type: "set_node", path: [0], properties: {bold: undefined}, newProperties: {bold: true}},
            ]);
        });
    });
    describe("insert_text applied", () => {
        it("no-op", () => {
            expect(slateOperationTransformer(
                {type: "set_node", path: [0], properties: {bold: undefined}, newProperties: {bold: true}},
                {type: "insert_text", path: [0], offset: 5, text: "abc"},
                false
            )).toEqual([
                {type: "set_node", path: [0], properties: {bold: undefined}, newProperties: {bold: true}},
            ]);
        });
    });
    describe("remove_text applied", () => {
        it("no-op", () => {
            expect(slateOperationTransformer(
                {type: "set_node", path: [0], properties: {bold: undefined}, newProperties: {bold: true}},
                {type: "remove_text", path: [0], offset: 5, text: "abc"},
                false
            )).toEqual([
                {type: "set_node", path: [0], properties: {bold: undefined}, newProperties: {bold: true}},
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
                        {type: "set_node", path: initial, properties: {}, newProperties: {}},
                        {type: "insert_node", path: [1, 1], node: {text: ""}},
                        false
                    )).toEqual([
                        {type: "set_node", path: expected, properties: {}, newProperties: {}}
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
                    {type: "set_node", path: input, properties: {}, newProperties: {}},
                    {type: "remove_node", path: [1, 1], node: {text: "abc"}},
                    false
                )).toEqual(
                    output !== null ? [{type: "set_node", path: output, properties: {}, newProperties: {}}] : []
                )
            })
        })
    });
    describe("applied set_node", () => {
        it("reconciles", () => {
                expect(slateOperationTransformer(
                    {type: "set_node", path: [1, 1], properties: {bold: undefined}, newProperties: {bold: false}},
                    {type: "set_node", path: [1, 1], properties: {bold: undefined}, newProperties: {bold: true}},
                    false
                )).toEqual([{
                    type: "set_node", path: [1, 1], properties: {bold: true}, newProperties: {bold: false}
                }])
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
                    {type: "set_node", path: at, properties: {bold: undefined}, newProperties: {bold: true}},
                    {type: "move_node", path: path, newPath: newPath},
                    false
                )).toEqual([{
                    type: "set_node", path: output, properties: {bold: undefined}, newProperties: {bold: true}
                }]);
            });
        });
    });
    describe("split_node applied", () => {
        ([
                ["before", [0], [[0]]],
                ["at", [1], [[1], [2]]],
                ["after", [2], [[3]]]
            ] as [string, Path, Path[]][]).forEach(([name, path, outputs]) => {
                it(name, () => {
                    expect(slateOperationTransformer(
                        {type: "set_node", path, properties: {bold: undefined}, newProperties: {bold: true}},
                        {type: "split_node", path: [1], position: 2, properties: {bold: true}},
                        false
                    )).toEqual(outputs.map((newPath, index) =>
                        ({type: "set_node", path: newPath, properties: {bold: index === 1 ? true : undefined}, newProperties: {bold: true}})
                    ));
                });
            });
    });
    describe("merge_node applied", () => {
        let before = [0], target = [1], current = [2], after = [3];
        ([
                ["before", before, [0]],
                ["target", target, [1]],
                ["current", current, null],
                ["after", after, [2]],
            ] as [string, Path, Path | null][]).forEach(([name, input, output]) => {
                it(name, () => {
                    expect(slateOperationTransformer(
                        {type: "set_node", path: input, properties: {}, newProperties: {}},
                        {type: "merge_node", path: [2], position: 0, properties: {}},
                        false
                    )).toEqual(output === null ? [] : [
                        {type: "set_node", path: output, properties: {}, newProperties: {}}
                    ]);
                });
            });
    });
});
