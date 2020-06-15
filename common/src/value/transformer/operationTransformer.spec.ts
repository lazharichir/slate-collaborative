import {operationTransformer} from "./operationTransformer";
import {SetSelectionOperation} from "../action/Operation";
import {Range} from "../Range";
import {Path} from "../Path";
import {Point} from "../Point";


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
    })
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
        })
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
        })
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
                        {type: "insert_text", path: [1, 1], offset: 5, text: "abc"},
                        {type: "insert_node", path: initial, node: {text: ""}}
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
        })

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
    });
});
