import {operationTransformer} from "./operationTransformer";
import {Path} from "../Path";

describe("Move Node Transformer", () => {
    describe("set_selection applied", () => {
        it("no-op", () => {});
    });
    describe("insert_text applied", () => {
        it("no-op", () => {});
    });
    describe("remove_text applied", () => {
        it("no-op", () => {});
    });
    describe("insert_node applied", () => {
        let parentPreviousChild = [0, 1], parentPrevious = [0], parent = [1], previous = [1, 0], at = [1, 1], next = [1, 2], parentNext = [2];
        ([
            ["parentPreviousChild-parentPrevious", [parentPreviousChild, parentPrevious], [[0, 1], [0]]],
            ["parentPreviousChild-parent", [parentPreviousChild, parent], [[0, 1], [1]]],
            ["parentPreviousChild-previous", [parentPreviousChild, previous], [[0, 1], [1, 0]]],
            ["parentPreviousChild-at", [parentPreviousChild, at], [[0, 1], [1, 2]]],
            ["parentPreviousChild-next", [parentPreviousChild, next], [[0, 1], [1, 3]]],
            ["parentPreviousChild-parentNext", [parentPreviousChild, parentNext], [[0, 1], [2]]],

            ["parentPrevious-previous", [parentPrevious, previous], [[0], [1, 0]]],
            ["parentPrevious-at", [parentPrevious, at], [[0], [1, 2]]],
            ["parentPrevious-next", [parentPrevious, next], [[0], [1, 3]]],
            ["parentPrevious-parentNext", [parentPrevious, parentNext], [[0], [2]]],

            ["parent-parentPreviousChild", [parent, parentPreviousChild], [[1], [0, 1]]],

            ["previous-parentPreviousChild", [previous, parentPreviousChild], [[1, 0], [0, 1]]],
            ["previous-parentPrevious", [previous, parentPrevious], [[1, 0], [0]]],
            ["previous-parent", [previous, parent], [[1, 0], [1]]],
            ["previous-next", [previous, next], [[1, 0], [1, 3]]],
            ["previous-parentNext", [previous, parentNext], [[1, 0], [2]]],

            ["at-parentPreviousChild", [at, parentPreviousChild], [[1, 2], [0, 1]]],
            ["at-parentPrevious", [at, parentPrevious], [[1, 2], [0]]],
            ["at-parent", [at, parent], [[1, 2], [1]]],
            ["at-next", [at, next], [[1, 2], [1, 3]]],
            ["at-parentNext", [at, parentNext], [[1, 2], [2]]],

            ["next-parentPreviousChild", [next, parentPreviousChild], [[1, 3], [0, 1]]],
            ["next-parentPrevious", [next, parentPrevious], [[1, 3], [0]]],
            ["next-parent", [next, parent], [[1, 3], [1]]],
            ["next-previous", [next, previous], [[1, 3], [1, 0]]],
            ["next-at", [next, at], [[1, 3], [1, 2]]],
            ["next-parentNext", [next, parentNext], [[1, 3], [2]]],

            ["parentNext-parentPreviousChild", [parentNext, parentPreviousChild], [[2], [0, 1]]],
            ["parentNext-parentPrevious", [parentNext, parentPrevious], [[2], [0]]],
            ["parentNext-parent", [parentNext, parent], [[2], [1]]],
            ["parentNext-previous", [parentNext, previous], [[2], [1, 0]]],
            ["parentNext-at", [parentNext, at], [[2], [1, 2]]],
            ["parentNext-next", [parentNext, next], [[2], [1, 3]]],
        ] as [string, [Path, Path], [Path, Path]][]).forEach(([name, [inputPath, inputNewPath], [outputPath, outputNewPath]]) => {
            it(name, () => {
                expect(operationTransformer(
                    {type: "move_node", path: inputPath, newPath: inputNewPath},
                    {type: "insert_node", path: at, node: {text: "abc"}},
                    false
                )).toEqual([
                    {type: "move_node", path: outputPath, newPath: outputNewPath},
                ]);
            });
        });
    });
    describe("remove_node applied", () => {
        let parentPreviousChild = [0, 1], parentPrevious = [0], parent = [1], previous = [1, 0], at = [1, 1], next = [1, 2], parentNext = [2];
        ([
            ["parentPreviousChild-parentPrevious", [parentPreviousChild, parentPrevious], [[0, 1], [0]]],
            ["parentPreviousChild-parent", [parentPreviousChild, parent], [[0, 1], [1]]],
            ["parentPreviousChild-previous", [parentPreviousChild, previous], [[0, 1], [1, 0]]],
            ["parentPreviousChild-at", [parentPreviousChild, at], [[0, 1], [1, 1]]],
            ["parentPreviousChild-next", [parentPreviousChild, next], [[0, 1], [1, 1]]],
            ["parentPreviousChild-parentNext", [parentPreviousChild, parentNext], [[0, 1], [2]]],

            ["parentPrevious-previous", [parentPrevious, previous], [[0], [1, 0]]],
            ["parentPrevious-at", [parentPrevious, at], [[0], [1, 1]]],
            ["parentPrevious-next", [parentPrevious, next], [[0], [1, 1]]],
            ["parentPrevious-parentNext", [parentPrevious, parentNext], [[0], [2]]],

            ["parent-parentPreviousChild", [parent, parentPreviousChild], [[1], [0, 1]]],

            ["previous-parentPreviousChild", [previous, parentPreviousChild], [[1, 0], [0, 1]]],
            ["previous-parentPrevious", [previous, parentPrevious], [[1, 0], [0]]],
            ["previous-parent", [previous, parent], [[1, 0], [1]]],
            ["previous-next", [previous, next], [[1, 0], [1, 1]]],
            ["previous-parentNext", [previous, parentNext], [[1, 0], [2]]],

            ["next-parentPreviousChild", [next, parentPreviousChild], [[1, 1], [0, 1]]],
            ["next-parentPrevious", [next, parentPrevious], [[1, 1], [0]]],
            ["next-parent", [next, parent], [[1, 1], [1]]],
            ["next-previous", [next, previous], [[1, 1], [1, 0]]],
            ["next-at", [next, at], [[1, 1], [1, 1]]],
            ["next-parentNext", [next, parentNext], [[1, 1], [2]]],

            ["parentNext-parentPreviousChild", [parentNext, parentPreviousChild], [[2], [0, 1]]],
            ["parentNext-parentPrevious", [parentNext, parentPrevious], [[2], [0]]],
            ["parentNext-parent", [parentNext, parent], [[2], [1]]],
            ["parentNext-previous", [parentNext, previous], [[2], [1, 0]]],
            ["parentNext-at", [parentNext, at], [[2], [1, 1]]],
            ["parentNext-next", [parentNext, next], [[2], [1, 1]]],
        ] as [string, [Path, Path], [Path, Path]][]).forEach(([name, [inputPath, inputNewPath], [outputPath, outputNewPath]]) => {
            it(name, () => {
                expect(operationTransformer(
                    {type: "move_node", path: inputPath, newPath: inputNewPath},
                    {type: "remove_node", path: [1, 1], node: {text: "abc"}},
                    false
                )).toEqual([
                    {type: "move_node", path: outputPath, newPath: outputNewPath},
                ]);
            });
        });
        ([
            ["at-parentPreviousChild", [at, parentPreviousChild]],
            ["at-parentPrevious", [at, parentPrevious]],
            ["at-parent", [at, parent]],
            ["at-next", [at, next]],
            ["at-parentNext", [at, parentNext]],
        ] as [string, [Path, Path]][]).forEach(([name, [inputPath, inputNewPath]]) => {
            it(name, () => {
                expect(operationTransformer(
                    {type: "move_node", path: inputPath, newPath: inputNewPath},
                    {type: "remove_node", path: [1, 1], node: {text: "abc"}},
                    false
                )).toEqual([]);
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
                expect(operationTransformer(
                    {type: "move_node", path: at, newPath: at},
                    {type: "move_node", path: path, newPath: newPath},
                    false
                )).toEqual([
                    {type: "move_node", path: output, newPath: output}
                ]);
            });
        });
    });
    describe("split_node applied", () => {
        let parentPreviousChild = [0, 1], parentPrevious = [0], parent = [1], previous = [1, 0], at = [1, 1], next = [1, 2], parentNext = [2];
        ([
            ["parentPreviousChild-parentPrevious", [parentPreviousChild, parentPrevious], [[0, 1], [0]]],
            ["parentPreviousChild-parent", [parentPreviousChild, parent], [[0, 1], [1]]],
            ["parentPreviousChild-previous", [parentPreviousChild, previous], [[0, 1], [1, 0]]],
            ["parentPreviousChild-at", [parentPreviousChild, at], [[0, 1], [1, 2]]],
            ["parentPreviousChild-next", [parentPreviousChild, next], [[0, 1], [1, 3]]],
            ["parentPreviousChild-parentNext", [parentPreviousChild, parentNext], [[0, 1], [2]]],

            ["parentPrevious-previous", [parentPrevious, previous], [[0], [1, 0]]],
            ["parentPrevious-at", [parentPrevious, at], [[0], [1, 2]]],
            ["parentPrevious-next", [parentPrevious, next], [[0], [1, 3]]],
            ["parentPrevious-parentNext", [parentPrevious, parentNext], [[0], [2]]],

            ["parent-parentPreviousChild", [parent, parentPreviousChild], [[1], [0, 1]]],

            ["previous-parentPreviousChild", [previous, parentPreviousChild], [[1, 0], [0, 1]]],
            ["previous-parentPrevious", [previous, parentPrevious], [[1, 0], [0]]],
            ["previous-parent", [previous, parent], [[1, 0], [1]]],
            ["previous-next", [previous, next], [[1, 0], [1, 3]]],
            ["previous-parentNext", [previous, parentNext], [[1, 0], [2]]],

            ["next-parentPreviousChild", [next, parentPreviousChild], [[1, 3], [0, 1]]],
            ["next-parentPrevious", [next, parentPrevious], [[1, 3], [0]]],
            ["next-parent", [next, parent], [[1, 3], [1]]],
            ["next-previous", [next, previous], [[1, 3], [1, 0]]],
            ["next-at", [next, at], [[1, 3], [1, 2]]],
            ["next-parentNext", [next, parentNext], [[1, 3], [2]]],

            ["parentNext-parentPreviousChild", [parentNext, parentPreviousChild], [[2], [0, 1]]],
            ["parentNext-parentPrevious", [parentNext, parentPrevious], [[2], [0]]],
            ["parentNext-parent", [parentNext, parent], [[2], [1]]],
            ["parentNext-previous", [parentNext, previous], [[2], [1, 0]]],
            ["parentNext-at", [parentNext, at], [[2], [1, 2]]],
            ["parentNext-next", [parentNext, next], [[2], [1, 3]]],
        ] as [string, [Path, Path], [Path, Path]][]).forEach(([name, [inputPath, inputNewPath], [outputPath, outputNewPath]]) => {
            it(name, () => {
                expect(operationTransformer(
                    {type: "move_node", path: inputPath, newPath: inputNewPath},
                    {type: "split_node", path: [1, 1], position: 1, properties: {}},
                    false
                )).toEqual([
                    {type: "move_node", path: outputPath, newPath: outputNewPath},
                ]);
            });
        });
        ([
            ["at-parentPreviousChild", [at, parentPreviousChild], [0, 1]],
            ["at-parentPrevious", [at, parentPrevious], [0]],
            ["at-parent", [at, parent], [1]],
            ["at-next", [at, next], [1, 2]],
            ["at-parentNext", [at, parentNext], [2]],
        ] as [string, [Path, Path], Path][]).forEach(([name, [inputPath, inputNewPath], outputNewPath]) => {
            it(name, () => {
                expect(operationTransformer(
                    {type: "move_node", path: inputPath, newPath: inputNewPath},
                    {type: "split_node", path: [1, 1], position: 1, properties: {}},
                    false
                )).toEqual([
                    {type: "merge_node", path: [1, 2], position: 1, properties: {}},
                    {type: "move_node", path: [1, 1], newPath: inputNewPath},
                    {type: "split_node", path: outputNewPath, position: 1, properties: {}}
                ]);
            });
        });
    });
    describe("merge_node applied", () => {
        ([
            ["before-before", [[0], [1]], [[0], [1]]],
            ["before-target", [[0], [2]], [[0], [2]]],
            ["before-current", [[0], [3]], [[0], [3]]],
            ["before-after", [[0], [4]], [[0], [3]]],
            ["target-before", [[2], [0]], [[2], [0]]],
            ["target-after", [[2], [4]], [[2], [3]]],
            ["after-before", [[4], [0]], [[3], [0]]],
            ["after-target", [[4], [2]], [[3], [2]]],
            ["after-current", [[5], [3]], [[4], [3]]]
        ] as [string, [Path, Path], [Path, Path]][]).forEach(([name, input, output]) => {
            it(name, () => {
                expect(operationTransformer(
                    {type: "move_node", path: input[0], newPath: input[1]},
                    {type: "merge_node", path: [3], position: 5, properties: {}},
                    false
                )).toEqual([
                    {type: "move_node", path: output[0], newPath: output[1]}
                ]);
            });
        });
        it("target-current", () => {
            expect(operationTransformer(
                {type: "move_node", path: [2], newPath: [3]},
                {type: "merge_node", path: [3], position: 5, properties: {}},
                false
            )).toEqual([]);
        });
        it("current-before", () => {
            expect(operationTransformer(
                {type: "move_node", path: [3], newPath: [0]},
                {type: "merge_node", path: [3], position: 5, properties: {}},
                false
            )).toEqual([]);
        });
        it("current-target", () => {
            expect(operationTransformer(
                {type: "move_node", path: [3], newPath: [2]},
                {type: "merge_node", path: [3], position: 5, properties: {}},
                false
            )).toEqual([]);
        });
    });
});
