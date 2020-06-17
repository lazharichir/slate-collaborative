import {operationTransformer} from "./operationTransformer";
import {SetSelectionOperation} from "../action/Operation";
import {Range} from "../Range";
import {Path} from "../Path";
import {Point} from "../Point";
import {Node} from "../Node";


function properties(anchor: Point | null, focus: Point | null): Range | Partial<Range> | null {
    if (anchor === null && focus === null) return null;
    if (anchor !== null && focus === null) return {anchor};
    if (focus !== null && anchor === null) return {focus};
    return ({anchor, focus} as Range);
}

describe("Operation Transformer", () => {
    describe("set_selection applied", () => {
        describe("set_selection", () => {
            it("no-op", () => {});
        });
        describe("insert_text", () => {
            it("no-op", () => {});
        });
        describe("remove_text", () => {
            it("no-op", () => {});
        });
        describe("insert_node", () => {
            it("no-op", () => {});
        });
        describe("remove_node", () => {
            it("no-op", () => {});
        });
        describe("set_node", () => {
            it("no-op", () => {});
        });
        describe("move_node", () => {
            it("no-op", () => {});
        });
        describe("split_node", () => {
            it("no-op", () => {});
        });
    });
    describe("insert_text applied", () => {
        describe("set_selection", () => {
            let before = 0, at = 1, after = 2, unspecified = null, length = 3;
            ([
                ["before-before", [before, before], [before, before]],
                ["before-at", [before, at], [before, at]],
                ["before-after", [before, after], [before, after + length]],
                ["at-at", [at, at], [at + length, at + length]],
                ["at-after", [at, after], [at + length, after + length]],
                ["after-after", [after, after], [after + length, after + length]],
                ["after-at", [after, at], [after + length, at + length]],
                ["after-before", [after, before], [after + length, before]],
                ["at-before", [at, before], [at, before]],
                ["unspecified-before", [unspecified, before], [unspecified, before]],
                ["unspecified-at", [unspecified, at], [unspecified, at + length]],
                ["unspecified-after", [unspecified, after], [unspecified, after + length]],
                ["before-unspecified", [before, unspecified], [before, unspecified]],
                ["at-unspecified", [at, unspecified], [at + length, unspecified]],
                ["after-unspecified", [after, unspecified], [after + length, unspecified]],
            ] as [string, (number|null)[], (number|null)[]][]).forEach(([name, input, output]) => {
                it(name, () => {
                    expect(operationTransformer({
                        type: "set_selection",
                        properties: properties(input[0] !== null ? {path: [], offset: input[0]} : null, input[1] !== null ? {path: [], offset: input[1]} : null),
                        newProperties: properties(input[0] !== null ? {path: [], offset: input[0]} : null, input[1] !== null ? {path: [], offset: input[1]} : null)
                    } as SetSelectionOperation, {
                        type: "insert_text",
                        path: [],
                        offset: 1,
                        text: "abc"
                    })).toEqual([{
                        type: "set_selection",
                        properties: properties(output[0] !== null ? {path: [], offset: output[0]} : null, output[1] !== null ? {path: [], offset: output[1]} : null),
                        newProperties: properties(output[0] !== null ? {path: [], offset: output[0]} : null, output[1] !== null ? {path: [], offset: output[1]} : null)
                    }]);
                });
            });
        });
        describe("insert_text", () => {
            ([
                ["before", 0, 0],
                ["at", 1, 4],
                ["after", 2, 5]
            ] as [string, number, number][]).forEach(([name, offset, expected]) => {
                it(name, () => {
                    expect(operationTransformer({type: "insert_text", path: [], offset: offset, text: "def"}, {
                        type: "insert_text", path: [], offset: 1, text: "abc"
                    })).toEqual([{
                        type: "insert_text", path: [], offset: expected, text: "def"
                    }])
                });
            });
        });
        describe("remove_text", () => {
            ([
                ["before-before", [0, "a"], [0, "a"]],
                ["before-at", [0, "ab"], [0, "ab"]],
                ["before-after", [0, "abc"], [0, "abdefc"]],
                ["at-after", [2, "c"], [5, "c"]],
                ["after-after", [3, "d"], [6, "d"]]
            ] as [string, [number, string], [number, string]][]).forEach(([name, initial, expected]) => {
                it(name, () => {
                    expect(operationTransformer({
                        type: "remove_text", path: [], offset: initial[0], text: initial[1]
                    }, {
                        type: "insert_text", path: [], offset: 2, text: "def"
                    })).toEqual([{
                        type: "remove_text", path: [], offset: expected[0], text: expected[1]
                    }]);
                })
            });
        });
        describe("insert_node", () => {
            it("no-op", () => {});
        });
        describe("remove_node", () => {
            it("include text in removed node", () => {
                expect(operationTransformer(
                    {type: "remove_node", path: [0], node: {text: "abc"}},
                    {type: "insert_text", path: [0], offset: 2, text: "def"}
                )).toEqual([
                    {type: "remove_node", path: [0], node: {text: "abdefc"}}
                ]);
            });
        });
        describe("set_node", () => {
            it("no-op", () => {});
        });
        describe("move_node", () => {
            it("no-op", () => {});
        });
        describe("split_node", () => {
            let before = 0, at = 1, after = 2, length = 3;
            ([
                ["before", before, at + length],
                ["at", at, at],
                ["after", after, at]
            ] as [string, number, number][]).forEach(([name, offset, output]) => {
                it(name, () => {
                    expect(operationTransformer(
                        {type: "split_node", path: [0], position: at, properties: {}, target: null},
                        {type: "insert_text", path: [0], offset, text: "abc"}
                    )).toEqual([
                        {type: "split_node", path: [0], position: output, properties: {}, target: null}
                    ])
                });
            });
        });
    });
    describe("remove_text applied", () => {
        describe("set_selection", () => {
            let before = 0, start = 1, within = 2, end = 3, after = 4, unspecified = null, length = 2;
            ([
                ["before-before", [before, before], [before, before]],
                ["before-start", [before, start], [before, start]],
                ["before-within", [before, within], [before, start]],
                ["before-end", [before, end], [before, start]],
                ["before-after", [before, after], [before, after-length]],
                ["start-start", [start, start], [start, start]],
                ["start-within", [start, within], [start, start]],
                ["start-end", [start, end], [start, start]],
                ["start-after", [start, after], [start, after-length]],
                ["within-within", [within, within], [start, start]],
                ["within-end", [within, end], [start, start]],
                ["within-after", [within, after], [start, after-length]],
                ["end-end", [end, end], [start, start]],
                ["end-after", [end, after], [start, after-length]],
                ["after-after", [after, after], [after-length, after-length]],
                ["start-before", [start, before], [start, before]],
                ["within-before", [within, before], [start, before]],
                ["end-before", [end, before], [start, before]],
                ["after-before", [after, before], [after-length, before]],
                ["within-start", [within, start], [start, start]],
                ["end-start", [end, start], [start, start]],
                ["after-start", [after, start], [after-length, start]],
                ["end-within", [end, within], [start, start]],
                ["after-within", [after, within], [after-length, start]],
                ["after-end", [after, end], [after-length, start]],
                ["after-after", [after, after], [after-length, after-length]],
                ["unspecified-before", [unspecified, before], [unspecified, before]],
                ["unspecified-start", [unspecified, start], [unspecified, start]],
                ["unspecified-within", [unspecified, within], [unspecified, start]],
                ["unspecified-end", [unspecified, end], [unspecified, start]],
                ["unspecified-after", [unspecified, after], [unspecified, after-length]],
                ["before-unspecified", [before, unspecified], [before, unspecified]],
                ["start-unspecified", [start, unspecified], [start, unspecified]],
                ["within-unspecified", [within, unspecified], [start, unspecified]],
                ["end-unspecified", [end, unspecified], [start, unspecified]],
                ["after-unspecified", [after, unspecified], [after-length, unspecified]]
            ] as [string, (number|null)[], (number|null)[]][]).forEach(([name, input, output]) => {
                it(name, () => {
                    expect(operationTransformer({
                        type: "set_selection",
                        properties: properties(input[0] !== null ? {path: [], offset: input[0]} : null, input[1] !== null ? {path: [], offset: input[1]} : null),
                        newProperties: properties(input[0] !== null ? {path: [], offset: input[0]} : null, input[1] !== null ? {path: [], offset: input[1]} : null)
                    } as SetSelectionOperation,
                        {type: "remove_text", path: [], offset: start, text: "ab"
                    })).toEqual([{
                        type: "set_selection",
                        properties: properties(output[0] !== null ? {path: [], offset: output[0]} : null, output[1] !== null ? {path: [], offset: output[1]} : null),
                        newProperties: properties(output[0] !== null ? {path: [], offset: output[0]} : null, output[1] !== null ? {path: [], offset: output[1]} : null)
                    }]);
                });
            });
        });
        describe("insert_text", () => {
            const before = 0, start = 1, within = 2, end = 3, after = 4, length = 2;
            ([
                ["before", [before, "a"], [before, "a"]],
                ["start", [start, "a"], [start, "a"]],
                ["within", [within, "a"], null],
                ["end", [end, "a"], [start, "a"]],
                ["after", [after, "a"], [after-length, "a"]]
            ] as [string, [number, string], null | [number, string]][]).forEach(([name, initial, expected]) => {
                it(name, () => {
                    let expectation = expect(operationTransformer({
                        type: "insert_text", path: [], offset: initial[0], text: initial[1]
                    }, {
                        type: "remove_text", path: [], offset: start, text: "ab"
                    }))
                    if (expected === null) {
                        expectation.toEqual([]);
                    } else {
                        expectation.toEqual([{
                            type: "insert_text", path: [], offset: expected[0], text: expected[1]
                        }]);
                    }
                });
            });
        });
        describe("remove_text", () => {
            // ab|cde|fg
            const before = 0, start = 2, within = 3, end = 5, after = 6, length = 3;
            ([
                ["before-before", [before, "a"], [before, "a"]],
                ["before-start", [before, "ab"], [before, "ab"]],
                ["before-within", [before, "abc"], [before, "ab"]],
                ["before-end", [before, "abcde"], [before, "ab"]],
                ["before-after", [before, "abcdef"], [before, "abf"]],
                ["start-within", [start, "cd"], null],
                ["start-end", [start, "cde"], null],
                ["start-after", [start, "cdef"], [start, "f"]],
                ["within-within", [within, "d"], null],
                ["within-end", [within, "de"], null],
                ["within-after", [within, "def"], [start, "f"]],
                ["end-after", [end, "f"], [start, "f"]],
                ["after-after", [after, "g"], [after-length, "g"]],
            ] as [string, [number, string], null | [number, string]][]).forEach(([name, initial, expected]) => {
                it(name, () => {
                    let expectation = expect(operationTransformer({
                        type: "remove_text", path: [], offset: initial[0], text: initial[1]
                    }, {
                        type: "remove_text", path: [], offset: start, text: "cde"
                    }));
                    if (expected === null) {
                        expectation.toEqual([]);
                    } else {
                        expectation.toEqual([{
                            type: "remove_text", path: [], offset: expected[0], text: expected[1]
                        }]);
                    }
                });
            });
        });
        describe("insert_node", () => {
            it("no-op", () => {});
        });
        describe("remove_node", () => {
            it("remove text from removed node", () => {
                expect(operationTransformer(
                    {type: "remove_node", path: [0], node: {text: "abc"}},
                    {type: "remove_text", path: [0], offset: 2, text: "c"}
                )).toEqual([
                    {type: "remove_node", path: [0], node: {text: "ab"}}
                ]);
            });
        });
        describe("set_node", () => {
            it("no-op", () => {});
        });
        describe("move_node", () => {
            it("no-op", () => {});
        });

        describe("split_node", () => {
            let before = 0, at = 2, after = 3;
            ([
                ["before-before", [before, "a"], at - 1],
                ["before-at", [before, "ab"], at - 2],
                ["before-after", [before, "abc"], at - 2],
                ["at-after", [at, "c"], at],
                ["after-after", [after, "de"], at]
            ] as [string, [number, string], number][]).forEach(([name, [offset, text], output]) => {
                it(name, () => {
                    expect(operationTransformer(
                        {type: "split_node", path: [0], position: at, properties: {}, target: null},
                        {type: "remove_text", path: [0], offset, text}
                    )).toEqual([
                        {type: "split_node", path: [0], position: output, properties: {}, target: null}
                    ])
                });
            });
        });
    });
    describe("insert_node applied", () => {
        describe("set_selection", () => {
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
                    expect(operationTransformer({
                        type: "set_selection",
                        properties: {anchor: {path: [1, 1], offset: 5}, focus: {path: [1, 1], offset: 5}},
                        newProperties: {anchor: {path: [1, 1], offset: 5}, focus: {path: [1, 1], offset: 5}}
                    }, {
                        type: "insert_node", path: initial, node: {text: ""}
                    })).toEqual([{
                        type: "set_selection",
                        properties: {anchor: {path: expected, offset: 5}, focus: {path: expected, offset: 5}},
                        newProperties: {anchor: {path: expected, offset: 5}, focus: {path: expected, offset: 5}}
                    }]);
                });
            });
        });
        describe("insert_text", () => {
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
                    expect(operationTransformer(
                        {type: "insert_text", path: initial, offset: 5, text: "abc"},
                        {type: "insert_node", path: [1, 1], node: {text: ""}}
                    )).toEqual([
                        {type: "insert_text", path: expected, offset: 5, text: "abc"}
                    ]);
                });
            });
        });
        describe("remove_text", () => {
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
                    expect(operationTransformer(
                        {type: "remove_text", path: [1, 1], offset: 5, text: "abc"},
                        {type: "insert_node", path: initial, node: {text: ""}}
                    )).toEqual([
                        {type: "remove_text", path: expected, offset: 5, text: "abc"}
                    ]);
                });
            });
        });
        describe("insert_node", () => {
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
                    expect(operationTransformer(
                        {type: "insert_node", path: [1, 1], node: {text: "abc"}},
                        {type: "insert_node", path: initial, node: {text: ""}}
                    )).toEqual([
                        {type: "insert_node", path: expected, node: {text: "abc"}}
                    ]);
                });
            });
        });
        describe("remove_node", () => {
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
                    expect(operationTransformer(
                        {type: "remove_node", path: [1, 1], node: {text: "abc"}},
                        {type: "insert_node", path: initial, node: {text: ""}}
                    )).toEqual([
                        {type: "remove_node", path: expected, node: {text: "abc"}}
                    ]);
                });
            });

            it("child", () => {
                expect(operationTransformer(
                    {type: "remove_node", path: [1, 1], node: {children: [{text: "abc"}]}},
                    {type: "insert_node", path: [1, 1, 1], node: {text: "def"}}
                )).toEqual([
                    {type: "remove_node", path: [1, 1], node: {children: [{text: "abc"}, {text: "def"}]}}
                ]);
            })
        })
        describe("set_node", () => {
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
                    expect(operationTransformer(
                        {type: "set_node", path: initial, properties: {}, newProperties: {}},
                        {type: "insert_node", path: [1, 1], node: {text: ""}}
                    )).toEqual([
                        {type: "set_node", path: expected, properties: {}, newProperties: {}}
                    ]);
                });
            });
        });
        describe("move_node", () => {
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
                        {type: "insert_node", path: at, node: {text: "abc"}}
                    )).toEqual([
                        {type: "move_node", path: outputPath, newPath: outputNewPath},
                    ]);
                });
            });
        });
        describe("split_node", () => {
            ([
                ["before", [0], [2]],
                ["at", [1], [2]],
                ["after", [2], [1]]
            ] as [string, Path, Path][]).forEach(([name, input, output]) => {
                it(name, () => {
                    expect(operationTransformer(
                        {type: "split_node", path: [1], position: 5, properties: {}, target: null},
                        {type: "insert_node", path: input, node: {text: "abc"}}
                    )).toEqual([
                        {type: "split_node", path: output, position: 5, properties: {}, target: null}
                    ]);
                });
            });
        });
    });
    describe("remove_node applied", () => {
        describe("set_selection", () => {
            let parentPrevious = [0], parent = [1], previous = [1, 0], at = [1, 1], child = [1, 1, 1], next = [1, 2], parentNext = [2], unspecified = null;
            ([
                ["parentPrevious-parentPrevious", [parentPrevious, parentPrevious], [parentPrevious, parentPrevious]],
                ["parentPrevious-parent", [parentPrevious, parent], [parentPrevious, parent]],
                ["parentPrevious-previous", [parentPrevious, previous], [parentPrevious, previous]],
                ["parentPrevious-at", [parentPrevious, at], null],
                ["parentPrevious-child", [parentPrevious, child], null],
                ["parentPrevious-next", [parentPrevious, next], [parentPrevious, at]],
                ["parentPrevious-parentNext", [parentPrevious, parentNext], [parentPrevious, parentNext]],

                ["parent-parentPrevious", [parent, parentPrevious], [parent, parentPrevious]],
                ["parent-parent", [parent, parent], [parent, parent]],
                ["parent-previous", [parent, previous], [parent, previous]],
                ["parent-at", [parent, at], null],
                ["parent-child", [parent, child], null],
                ["parent-next", [parent, next], [parent, at]],
                ["parent-parentNext", [parent, parentNext], [parent, parentNext]],

                ["previous-parentPrevious", [previous, parentPrevious], [previous, parentPrevious]],
                ["previous-parent", [previous, parent], [previous, parent]],
                ["previous-previous", [previous, previous], [previous, previous]],
                ["previous-at", [previous, at], null],
                ["previous-child", [previous, child], null],
                ["previous-next", [previous, next], [previous, at]],
                ["previous-parentNext", [previous, parentNext], [previous, parentNext]],

                ["at-parentPrevious", [at, parentPrevious], null],
                ["at-parent", [at, parent], null],
                ["at-previous", [at, previous], null],
                ["at-at", [at, at], null],
                ["at-child", [at, child], null],
                ["at-next", [at, next], null],
                ["at-parentNext", [at, parentNext], null],

                ["child-parentPrevious", [child, parentPrevious], null],
                ["child-parent", [child, parent], null],
                ["child-previous", [child, previous], null],
                ["child-at", [child, at], null],
                ["child-child", [child, child], null],
                ["child-next", [child, next], null],
                ["child-parentNext", [child, parentNext], null],

                ["next-parentPrevious", [next, parentPrevious], [at, parentPrevious]],
                ["next-parent", [next, parent], [at, parent]],
                ["next-previous", [next, previous], [at, previous]],
                ["next-at", [next, at], null],
                ["next-child", [next, child], null],
                ["next-next", [next, next], [at, at]],
                ["next-parentNext", [next, parentNext], [at, parentNext]],

                ["parentNext-parentPrevious", [parentNext, parentPrevious], [parentNext, parentPrevious]],
                ["parentNext-parent", [parentNext, parent], [parentNext, parent]],
                ["parentNext-previous", [parentNext, previous], [parentNext, previous]],
                ["parentNext-at", [parentNext, at], null],
                ["parentNext-child", [parentNext, child], null],
                ["parentNext-next", [parentNext, next], [parentNext, at]],
                ["parentNext-parentNext", [parentNext, parentNext], [parentNext, parentNext]],

                ["unspecified-parentPrevious", [unspecified, parentPrevious], [unspecified, parentPrevious]],
                ["unspecified-parent", [unspecified, parent], [unspecified, parent]],
                ["unspecified-previous", [unspecified, previous], [unspecified, previous]],
                ["unspecified-at", [unspecified, at], null],
                ["unspecified-child", [unspecified, child], null],
                ["unspecified-next", [unspecified, next], [unspecified, at]],
                ["unspecified-parentNext", [unspecified, parentNext], [unspecified, parentNext]],

                ["parentPrevious-unspecified", [parentPrevious, unspecified], [parentPrevious, unspecified]],
                ["parent-unspecified", [parent, unspecified], [parent, unspecified]],
                ["previous-unspecified", [previous, unspecified], [previous, unspecified]],
                ["at-unspecified", [at, unspecified], null],
                ["child-unspecified", [child, unspecified], null],
                ["next-unspecified", [next, unspecified], [at, unspecified]],
                ["parentNext-unspecified", [parentNext, unspecified], [parentNext, unspecified]],
            ] as [string, [Path | null, Path | null], [Path | null, Path | null] | null][]).forEach(([name, input, output]) => {
                it(name, () => {
                    expect(operationTransformer(
                        {
                            type: "set_selection",
                            properties: properties(input[0] !== null ? {path: input[0], offset: 5} : null, input[1] !== null ? {path: input[1], offset: 5} : null),
                            newProperties: properties(input[0] !== null ? {path: input[0], offset: 5} : null, input[1] !== null ? {path: input[1], offset: 5} : null)
                        } as SetSelectionOperation,
                        {type: "remove_node", path: [1, 1], node: {text: "abc"}}
                    )).toEqual(output !== null ? [{
                        type: "set_selection",
                        properties: properties(output[0] !== null ? {path: output[0], offset: 5} : null, output[1] !== null ? {path: output[1], offset: 5} : null) ,
                        newProperties: properties(output[0] !== null ? {path: output[0], offset: 5} : null, output[1] !== null ? {path: output[1], offset: 5} : null)
                    }] : []);
                });
            })
        });
        describe("insert_text", () => {
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
                    expect(operationTransformer({
                        type: "insert_text", path: input, offset: 5, text: "abc"
                    }, {
                        type: "remove_node", path: [1, 1], node: {text: "abc"}
                    })).toEqual(
                        output !== null ? [{type: "insert_text", path: output, offset: 5, text: "abc"}] : []
                    )
                })
            })
        })
        describe("remove_text", () => {
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
                    expect(operationTransformer({
                        type: "remove_text", path: input, offset: 0, text: "abc"
                    }, {
                        type: "remove_node", path: [1, 1], node: {text: "abc"}
                    })).toEqual(
                        output !== null ? [{type: "remove_text", path: output, offset: 0, text: "abc"}] : []
                    )
                })
            })
        })
        describe("insert_node", () => {
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
                    expect(operationTransformer({
                        type: "insert_node", path: input, node: {text: ""}
                    }, {
                        type: "remove_node", path: [1, 1], node: {text: "abc"}
                    })).toEqual(
                        output !== null ? [{type: "insert_node", path: output, node: {text: ""}}] : []
                    )
                })
            })
        })
        describe("remove_node", () => {
            let parentPrevious = [0], previous = [1, 0], parent = [1], at = [1, 1], child = [1, 1, 1], next = [1, 2], parentNext = [2];
            ([
                ["parentPrevious", parentPrevious, parentPrevious],
                ["previous", previous, previous],
                ["at", at, null],
                ["child", child, null],
                ["next", next, at],
                ["parentNext", parentNext, parentNext],
            ] as [string, Path, Path][]).forEach(([name, input, output]) => {
                it(name, () => {
                    expect(operationTransformer({
                        type: "remove_node", path: input, node: {text: "abc"}
                    }, {
                        type: "remove_node", path: [1, 1], node: {text: "abc"}
                    })).toEqual(
                        output !== null ? [{type: "remove_node", path: output, node: {text: "abc"}}] : []
                    )
                })
            })

            it("parent", () => {
                expect(operationTransformer({
                    type: "remove_node", path: [1], node: {children: [{text: "def"}, {text: "abc"}]}
                }, {
                    type: "remove_node", path: [1, 1], node: {text: "abc"}
                })).toEqual([{type: "remove_node", path: [1], node: {children: [{text: "def"}]}}])
            });
        });
        describe("set_node", () => {
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
                    expect(operationTransformer({
                        type: "set_node", path: input, properties: {}, newProperties: {}
                    }, {
                        type: "remove_node", path: [1, 1], node: {text: "abc"}
                    })).toEqual(
                        output !== null ? [{type: "set_node", path: output, properties: {}, newProperties: {}}] : []
                    )
                })
            })
        });
        describe("move_node", () => {
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
                        {type: "remove_node", path: [1, 1], node: {text: "abc"}}
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
                        {type: "remove_node", path: [1, 1], node: {text: "abc"}}
                    )).toEqual([]);
                });
            });
        });

        describe("split_node", () => {
            ([
                ["before", [0], [0]],
                ["at", [1], null],
                ["after", [2], [1]]
            ] as [string, Path, Path | null][]).forEach(([name, input, output]) => {
                it(name, () => {
                    expect(operationTransformer(
                        {type: "split_node", path: [1], position: 5, properties: {}, target: null},
                        {type: "remove_node", path: input, node: {text: "abc"}}
                    )).toEqual(output === null ? [] : [
                        {type: "split_node", path: output, position: 5, properties: {}, target: null}
                    ]);
                });
            });
        });
    });
    describe("applied set_node", () => {
        describe("set_selection", () => {
            it("no-op", () => {});
        })
        describe("insert_text", () => {
            it("no-op", () => {});
        })
        describe("remove_text", () => {
            it("no-op", () => {});
        });
        describe("insert_node", () => {
            it("no-op", () => {});
        });
        describe("remove_node", () => {
            it("parent", () => {
                expect(operationTransformer({
                    type: "remove_node", path: [1], node: {children: [{text: "def"}, {text: "abc"}]}
                }, {
                    type: "set_node", path: [1, 1], properties: {bold: undefined}, newProperties: {bold: true}
                })).toEqual([{type: "remove_node", path: [1], node: {children: [{text: "def"}, {text: "abc", bold: true}]}}])
            });
        })
        describe("set_node", () => {
            it("reconciles", () => {
                expect(operationTransformer({
                    type: "set_node", path: [1, 1], properties: {bold: undefined}, newProperties: {bold: false}
                }, {
                    type: "set_node", path: [1, 1], properties: {bold: undefined}, newProperties: {bold: true}
                })).toEqual([{
                    type: "set_node", path: [1, 1], properties: {bold: true}, newProperties: {bold: false}
                }])
            });
        });
        describe("move_node", () => {
            it("no-op", () => {});
        });
        describe("split_node", () => {
            it("no-op", () => {});
        });
    });
    describe("move_node applied", () => {
        describe("set_selection", () => {
            let parentPreviousChild = [0, 1], parentPrevious = [0], parent = [2], previous = [2, 1], start = [2, 2], within = [2, 4], withinChild = [2, 3, 2], end = [2, 5], next = [2, 6], parentNext = [4], unspecified = null;
            ([
                ["parentPreviousChild-parentPrevious", [parentPreviousChild, parentPrevious], [[3, 2], [3, 5]]],
                ["parentPreviousChild-parent", [parentPreviousChild, parent], [[3, 2], [3, 5]]],
                ["parentPreviousChild-previous", [parentPreviousChild, previous], [[2, 3], [2, 6]]],
                ["parentPreviousChild-start", [parentPreviousChild, start], [[2, 3], [2, 6]]],
                ["parentPreviousChild-within", [parentPreviousChild, within], [[2, 2], [2, 6]]],
                ["parentPreviousChild-withinChild", [parentPreviousChild, withinChild], [start, end]],
                ["parentPreviousChild-end", [parentPreviousChild, end], [[2, 2], [2, 6]]],
                ["parentPreviousChild-next", [parentPreviousChild, next], [start, end]],
                ["parentPreviousChild-parentNext", [parentPreviousChild, parentNext], [start, end]],

                ["parentPrevious-previous", [parentPrevious, previous], [[1, 3], [1, 6]]],
                ["parentPrevious-start", [parentPrevious, start], [[1, 3], [1, 6]]],
                ["parentPrevious-within", [parentPrevious, within], [[1, 2], [1, 6]]],
                ["parentPrevious-withinChild", [parentPrevious, withinChild], [[1, 2], [1, 5]]],
                ["parentPrevious-end", [parentPrevious, end], [[1, 2], [1, 6]]],
                ["parentPrevious-next", [parentPrevious, next], [[1, 2], [1, 5]]],
                ["parentPrevious-parentNext", [parentPrevious, parentNext], [[1, 2], [1, 5]]],

                ["parent-parentPreviousChild", [parent, parentPreviousChild], [[0, 1, 2], [0, 1, 5]]],

                ["previous-parentPreviousChild", [previous, parentPreviousChild], [[2, 1], [2, 4]]],
                ["previous-parentPrevious", [previous, parentPrevious], [[3, 1], [3, 4]]],
                ["previous-parent", [previous, parent], [[3, 1], [3, 4]]],
                ["previous-within", [previous, within], [[2, 1], [2, 5]]],
                ["previous-withinChild", [previous, withinChild], [[2, 1], [2, 4]]],
                ["previous-end", [previous, end], [[2, 1], [2, 4]]],
                ["previous-next", [previous, next], [[2, 1], [2, 4]]],
                ["previous-parentNext", [previous, parentNext], [[2, 1], [2, 4]]],

                ["start-parentPreviousChild", [start, parentPreviousChild], [[0, 1], [2, 4]]],
                ["start-parentPrevious", [start, parentPrevious], [[0], [3, 4]]],
                ["start-parent", [start, parent], [[2], [3, 4]]],
                ["start-withinChild", [start, withinChild], [[2, 2, 2], [2, 4]]],
                ["start-end", [start, end], [[2, 5], [2, 4]]],
                ["start-next", [start, next], [[2, 6], [2, 4]]],
                ["start-parentNext", [start, parentNext], [[4], [2, 4]]],

                ["within-parentPreviousChild", [within, parentPreviousChild], [[2, 2], [2, 4]]],
                ["within-parentPrevious", [within, parentPrevious], [[3, 2], [3, 4]]],
                ["within-parent", [within, parent], [[3, 2], [3, 4]]],
                ["within-previous", [within, previous], [[2, 3], [2, 5]]],
                ["within-start", [within, start], [[2, 3], [2, 5]]],
                ["within-next", [within, next], [[2, 2], [2, 4]]],
                ["within-parentNext", [within, parentNext], [[2, 2], [2, 4]]],

                ["withinChild-parentPreviousChild", [withinChild, parentPreviousChild], [[2, 2], [2, 5]]],
                ["withinChild-parentPrevious", [withinChild, parentPrevious], [[3, 2], [3, 5]]],
                ["withinChild-parent", [withinChild, parent], [[3, 2], [3, 5]]],
                ["withinChild-previous", [withinChild, previous], [[2, 3], [2, 6]]],
                ["withinChild-start", [withinChild, start], [[2, 3], [2, 6]]],
                ["withinChild-within", [withinChild, within], [[2, 2], [2, 6]]],
                ["withinChild-end", [withinChild, end], [[2, 2], [2, 6]]],
                ["withinChild-next", [withinChild, next], [[2, 2], [2, 5]]],
                ["withinChild-parentNext", [withinChild, parentNext], [[2, 2], [2, 5]]],

                ["end-parentPreviousChild", [end, parentPreviousChild], [[2, 2], [0, 1]]],
                ["end-parentPrevious", [end, parentPrevious], [[3, 2], [0]]],
                ["end-parent", [end, parent], [[3, 2], [2]]],
                ["end-previous", [end, previous], [[2, 3], [2, 1]]],
                ["end-start", [end, start], [[2, 3], [2, 2]]],
                ["end-withinChild", [end, withinChild], [[2, 2], [2, 3, 2]]],
                ["end-parentNext", [end, parentNext], [[2, 2], [4]]],

                ["next-parentPreviousChild", [next, parentPreviousChild], [[2, 2], [2, 5]]],
                ["next-parentPrevious", [next, parentPrevious], [[3, 2], [3, 5]]],
                ["next-parent", [next, parent], [[3, 2], [3, 5]]],
                ["next-previous", [next, previous], [[2, 3], [2, 6]]],
                ["next-start", [next, start], [[2, 3], [2, 6]]],
                ["next-within", [next, within], [[2, 2], [2, 6]]],
                ["next-withinChild", [next, withinChild], [[2, 2], [2, 5]]],
                ["next-parentNext", [next, parentNext], [[2, 2], [2, 5]]],

                ["parentNext-parentPreviousChild", [parentNext, parentPreviousChild], [[2, 2], [2, 5]]],
                ["parentNext-parentPrevious", [parentNext, parentPrevious], [[3, 2], [3, 5]]],
                ["parentNext-parent", [parentNext, parent], [[3, 2], [3, 5]]],
                ["parentNext-previous", [parentNext, previous], [[2, 3], [2, 6]]],
                ["parentNext-start", [parentNext, start], [[2, 3], [2, 6]]],
                ["parentNext-within", [parentNext, within], [[2, 2], [2, 6]]],
                ["parentNext-withinChild", [parentNext, withinChild], [[2, 2], [2, 5]]],
                ["parentNext-end", [parentNext, end], [[2, 2], [2, 6]]],
                ["parentNext-next", [parentNext, next], [[2, 2], [2, 5]]],
            ] as [string, [Path, Path], [Path, Path]][]).forEach(([name, [path, newPath], [newStart, newEnd]]) => {
                it(name, () => {
                    expect(operationTransformer({
                            type: "set_selection",
                            properties: properties({path: start, offset: 5}, {path: end, offset: 5}),
                            newProperties: properties({path: start, offset: 5}, {path: end, offset: 5}),
                        } as SetSelectionOperation,
                        {type: "move_node", path, newPath}
                    )).toEqual([{
                        type: "set_selection",
                        properties: properties({path: newStart, offset: 5}, {path: newEnd, offset: 5}),
                        newProperties: properties({path: newStart, offset: 5}, {path: newEnd, offset: 5})
                    }]);
                });
                it(`${name}, unspecified anchor`, () => {
                    expect(operationTransformer({
                            type: "set_selection",
                            properties: properties(null, {path: end, offset: 5}),
                            newProperties: properties(null, {path: end, offset: 5})
                        } as SetSelectionOperation,
                        {type: "move_node", path, newPath}
                    )).toEqual([{
                        type: "set_selection",
                        properties: properties(null, {path: newEnd, offset: 5}),
                        newProperties: properties(null, {path: newEnd, offset: 5})
                    }]);
                });

                it(`${name}, unspecified focus`, () => {
                    expect(operationTransformer({
                            type: "set_selection",
                            properties: properties({path: start, offset: 5}, null),
                            newProperties: properties({path: start, offset: 5}, null)
                        } as SetSelectionOperation,
                        {type: "move_node", path, newPath}
                    )).toEqual([{
                        type: "set_selection",
                        properties: properties({path: newStart, offset: 5}, null),
                        newProperties: properties({path: newStart, offset: 5}, null)
                    }]);
                });
            });

            describe("split_node", () => {
                ([
                    ["before", [0], [0]],
                    ["at", [1], null],
                    ["after", [2], [1]]
                ] as [string, Path, Path | null][]).forEach(([name, input, output]) => {
                    it(name, () => {
                        expect(operationTransformer(
                            {type: "split_node", path: [1], position: 5, properties: {}, target: null},
                            {type: "remove_node", path: input, node: {text: "abc"}}
                        )).toEqual(output === null ? [] : [
                            {type: "split_node", path: output, position: 5, properties: {}, target: null}
                        ]);
                    });
                });
            });
        });
        describe("insert_text", () => {
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
                        {type: "insert_text", path: at, offset: 5, text: "abc"},
                        {type: "move_node", path: path, newPath: newPath}
                    )).toEqual([{
                        type: "insert_text", path: output, offset: 5, text: "abc"
                    }]);
                });
            });
        });
        describe("remove_text", () => {
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
                        {type: "remove_text", path: at, offset: 5, text: "abc"},
                        {type: "move_node", path: path, newPath: newPath}
                    )).toEqual([{
                        type: "remove_text", path: output, offset: 5, text: "abc"
                    }]);
                });
            });
        });
        describe("insert_node", () => {
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
                        {type: "insert_node", path: at, node: {text: "abc"}},
                        {type: "move_node", path: path, newPath: newPath}
                    )).toEqual([{
                        type: "insert_node", path: output, node: {text: "abc"}
                    }]);
                });
            });
        });
        describe("remove_node", () => {
            let parentPreviousChild = [0, 1], parentPrevious = [0], parent = [2], previous = [2, 1], at = [2, 2], child1 = [2, 2, 0], child2 = [2, 2, 1], next = [2, 6], parentNext = [4];
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
                        {type: "remove_node", path: at, node: {text: "abc"}},
                        {type: "move_node", path: path, newPath: newPath}
                    )).toEqual([{
                        type: "remove_node", path: output, node: {text: "abc"}
                    }]);
                });
            });
            it("parentPrevious-child1", () => {
                expect(operationTransformer(
                    {type: "remove_node", path: [1, 1], node: {children: [{text: "abc"}, {text: "def"}]}},
                    {type: "move_node", path: [0], newPath: [1, 1, 0], node: {text: "ghi"}}
                )).toEqual([
                    {type: "remove_node", path: [0, 1], node: {children: [{text: "ghi"}, {text: "abc"}, {text: "def"}]}}
                ]);
            })
            it("child1-parentNext", () => {
                expect(operationTransformer(
                    {type: "remove_node", path: [1, 1], node: {children: [{text: "abc"}, {text: "def"}]}},
                    {type: "move_node", path: [1, 1, 0], newPath: [2]}
                )).toEqual([
                    {type: "remove_node", path: [1, 1], node: {children: [{text: "def"}]}}
                ]);
            })
            it("child2-child1", () => {
                expect(operationTransformer(
                    {type: "remove_node", path: [1, 1], node: {children: [{text: "abc"}, {text: "def"}]}},
                    {type: "move_node", path: [1, 1, 1], newPath: [1, 1, 0]}
                )).toEqual([
                    {type: "remove_node", path: [1, 1], node: {children: [{text: "def"}, {text: "abc"}]}}
                ]);
            })
        });
        describe("set_node", () => {
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
                        {type: "set_node", path: at, properties: {bold: undefined}, newProperties: {bold: true}},
                        {type: "move_node", path: path, newPath: newPath}
                    )).toEqual([{
                        type: "set_node", path: output, properties: {bold: undefined}, newProperties: {bold: true}
                    }]);
                });
            });
        });
        describe("move_node", () => {
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
                        {type: "move_node", path: path, newPath: newPath}
                    )).toEqual([
                        {type: "move_node", path: output, newPath: output}
                    ]);
                });
            });
        });
        describe("split_node", () => {
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
                        {type: "split_node", path: at, position: 5, properties: {}, target: null},
                        {type: "move_node", path: path, newPath: newPath}
                    )).toEqual([
                        {type: "split_node", path: output, position: 5, properties: {}, target: null}
                    ]);
                });
            });
        });
    });
    describe("split_node applied", () => {
        describe("set_selection", () => {
            let before: Point = {path: [0], offset: 0}, at: Point = {path: [0], offset: 1}, after: Point = {path: [0], offset: 2};

            let postBefore: Point = {path: [0], offset: 0}, postEnd: Point = {path: [0], offset: 1},  postStart: Point = {path: [1], offset: 0}, postAfter: Point = {path: [1], offset: 1};

            let unspecified: Point | null = null;
            ([
                ["before-before", [before, before], [postBefore, postBefore]],
                ["before-at", [before, at], [postBefore, postEnd]],
                ["before-after", [before, after], [postBefore, postAfter]],
                ["at-after", [at, after], [postStart, postAfter]],
                ["after-after", [after, after], [postAfter, postAfter]],
                ["at-before", [at, before], [postEnd, postBefore]],
                ["after-before", [after, before], [postAfter, postBefore]],
                ["after-at", [after, at], [postAfter, postStart]],
                ["unspecified-before", [before, unspecified], [postBefore, unspecified]],
                ["unspecified-at", [at, unspecified], [postStart, unspecified]],
                ["unspecified-after", [after, unspecified], [postAfter, unspecified]],
                ["before-unspecified", [unspecified, before], [unspecified, postBefore]],
                ["at-unspecified", [unspecified, at], [unspecified, postStart]],
                ["after-unspecified", [unspecified, after], [unspecified, postAfter]]
            ] as [string, [Point | null, Point | null], [Point | null, Point | null]][]).forEach(([name, input, output]) => {
                it(name, () => {
                    expect(operationTransformer(
                        {type: "set_selection", properties: properties(input[0], input[1]), newProperties: properties(input[0], input[1])} as SetSelectionOperation,
                        {type: "split_node", path: [0], position: 1, properties: {}, target: null}
                    )).toEqual([
                        {type: "set_selection", properties: properties(output[0], output[1]), newProperties: properties(output[0], output[1])}
                    ])
                });
            })
        });
        describe("insert_text", () => {
            ([
                ["before", [[0], 0], [[0], 0]],
                ["at", [[0], 1], [[1], 0]],
                ["after", [[0], 2], [[1], 1]]
            ] as [string, [Path, number], [Path, number]][]).forEach(([name, [path, offset], [newPath, newOffset]]) => {
                it(name, () => {
                    expect(operationTransformer(
                        {type: "insert_text", path, offset, text: "abc"},
                        {type: "split_node", path: [0], position: 1, properties: {}, target: null}
                    )).toEqual([
                        {type: "insert_text", path: newPath, offset: newOffset, text: "abc"}
                    ]);
                });
            });
        });
        describe("remove_text", () => {
            ([
                ["before-before", [[0], 0, "a"], [[[0], 0, "a"]]],
                ["before-at", [[0], 0, "ab"], [[[0], 0, "ab"]]],
                ["before-after", [[0], 0, "abc"], [[[0], 0, "ab"], [[1], 0, "c"]]],
                ["at-after", [[0], 2, "c"], [[[1], 0, "c"]]],
                ["after-after", [[0], 3, "d"], [[[1], 1, "d"]]]
            ] as [string, [Path, number, string], [Path, number, string][]][]).forEach(([name, [path, offset, text], outputs]) => {
                it(name, () => {
                    expect(operationTransformer(
                        {type: "remove_text", path, offset, text},
                        {type: "split_node", path: [0], position: 2, properties: {}, target: null}
                    )).toEqual(outputs.map(([outputPath, outputOffset, outputText]) =>
                        ({type: "remove_text", path: outputPath, offset: outputOffset, text: outputText})
                    ))
                });
            })
        });
        describe("insert_node", () => {
            ([
                ["before", [0], [0]],
                ["at", [1], [1]],
                ["after", [2], [3]]
            ] as [string, Path, Path][]).forEach(([name, path, newPath]) => {
                it(name, () => {
                    expect(operationTransformer(
                        {type: "insert_node", path, node: {text: "abc"}},
                        {type: "split_node", path: [1], position: 5, properties: {}, target: null}
                    )).toEqual([
                        {type: "insert_node", path: newPath, node: {text: "abc"}},
                    ])
                });
            });
        });
        describe("remove_node", () => {
            ([
                ["before", [0], [[[0], {text: "abc"}]] ],
                ["at", [1], [[[1], {text: "ab"}], [[2], {text: "c"}]]],
                ["after", [2], [[[3], {text: "abc"}]]]
            ] as [string, Path, [Path, Node][]][]).forEach(([name, path, outputs]) => {
                it(name, () => {
                    expect(operationTransformer(
                        {type: "remove_node", path, node: {text: "abc"}},
                        {type: "split_node", path: [1], position: 2, properties: {}, target: null}
                    )).toEqual(outputs.map(([newPath, newNode]) =>
                        ({type: "remove_node", path: newPath, node: newNode})
                    ));
                });
            });
        });
        describe("move_node", () => {
            let parentPreviousChild = [0, 1], parentPrevious = [0], parent = [1], previous = [1, 0], at = [1, 1], next = [1, 2], parentNext = [2];
            ([
                ["parentPreviousChild-parentPrevious", [parentPreviousChild, parentPrevious], [[0, 1], [0]]],
                ["parentPreviousChild-parent", [parentPreviousChild, parent], [[0, 1], [1]]],
                ["parentPreviousChild-previous", [parentPreviousChild, previous], [[0, 1], [1, 0]]],
                ["parentPreviousChild-at", [parentPreviousChild, at], [[0, 1], [1, 1]]],
                ["parentPreviousChild-next", [parentPreviousChild, next], [[0, 1], [1, 3]]],
                ["parentPreviousChild-parentNext", [parentPreviousChild, parentNext], [[0, 1], [2]]],

                ["parentPrevious-previous", [parentPrevious, previous], [[0], [1, 0]]],
                ["parentPrevious-at", [parentPrevious, at], [[0], [1, 1]]],
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
                ["next-at", [next, at], [[1, 3], [1, 1]]],
                ["next-parentNext", [next, parentNext], [[1, 3], [2]]],

                ["parentNext-parentPreviousChild", [parentNext, parentPreviousChild], [[2], [0, 1]]],
                ["parentNext-parentPrevious", [parentNext, parentPrevious], [[2], [0]]],
                ["parentNext-parent", [parentNext, parent], [[2], [1]]],
                ["parentNext-previous", [parentNext, previous], [[2], [1, 0]]],
                ["parentNext-at", [parentNext, at], [[2], [1, 1]]],
                ["parentNext-next", [parentNext, next], [[2], [1, 3]]],
            ] as [string, [Path, Path], [Path, Path]][]).forEach(([name, [inputPath, inputNewPath], [outputPath, outputNewPath]]) => {
                it(name, () => {
                    expect(operationTransformer(
                        {type: "move_node", path: inputPath, newPath: inputNewPath},
                        {type: "split_node", path: [1, 1], position: 1, properties: {}, target: null}
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
                        {type: "split_node", path: [1, 1], position: 1, properties: {}, target: null}
                    )).toEqual([
                        {type: "merge_node", path: [1, 2], position: 1, properties: {}, target: null},
                        {type: "move_node", path: [1, 1], newPath: inputNewPath},
                        {type: "split_node", path: outputNewPath, position: 1, properties: {}, target: null}
                    ]);
                });
            });
        })
        describe("set_node", () => {
            ([
                ["before", [0], [[0]]],
                ["at", [1], [[1], [2]]],
                ["after", [2], [[3]]]
            ] as [string, Path, Path[]][]).forEach(([name, path, outputs]) => {
                it(name, () => {
                    expect(operationTransformer(
                        {type: "set_node", path, properties: {bold: undefined}, newProperties: {bold: true}},
                        {type: "split_node", path: [1], position: 2, properties: {}, target: null}
                    )).toEqual(outputs.map((newPath) =>
                        ({type: "set_node", path: newPath, properties: {bold: undefined}, newProperties: {bold: true}})
                    ));
                });
            });

        })
        describe("split_node", () => {
            ([
                ["beforeNode", [[0], 5], [[0], 5]],
                ["afterNode", [[2], 5], [[3], 5]],
                ["before", [[1], 0], [[1], 0]],
                ["at", [[1], 1], [[2], 0]],
                ["after", [[1], 2], [[2], 1]]
            ] as [string, [Path, number], Path[]][]).forEach(([name, [path, position], [outputPath, outputPosition]]) => {
                it(name, () => {
                    expect(operationTransformer(
                        {type: "split_node", path, position, properties: {}, target: null},
                        {type: "split_node", path: [1], position: 1, properties: {}, target: null}
                    )).toEqual([
                        {type: "split_node", path: outputPath, position: outputPosition, properties: {}, target: null}
                    ]);
                });
            });
        });
    });
});
