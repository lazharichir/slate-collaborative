import {operationTransformer} from "./operationTransformer";
import {SetSelectionOperation} from "../action/Operation";
import {Range} from "../Range";

function selectionProperties(focus: number | null, anchor: number | null): Range | Partial<Range> | null {
    if (anchor === null && focus === null) return null;
    let properties: Partial<Range> = {};
    if (anchor !== null) {
        properties["anchor"] = {path: [], offset: anchor as number};
    }
    if (focus !== null) {
        properties["focus"] = {path: [], offset: focus as number};
    }
    return properties;
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
            ] as [string, (number|null)[], (number|null)[]][]).forEach(([name, offsets, expected]) => {
                it(name, () => {
                    expect(operationTransformer({
                        type: "set_selection",
                        properties: selectionProperties(offsets[0], offsets[1]),
                        newProperties: selectionProperties(offsets[0], offsets[1])
                    } as SetSelectionOperation, {
                        type: "insert_text",
                        path: [],
                        offset: 1,
                        text: "abc"
                    })).toEqual([{
                        type: "set_selection",
                        properties: selectionProperties(expected[0], expected[1]),
                        newProperties: selectionProperties(expected[0], expected[1])
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
            ] as [string, (number|null)[], (number|null)[]][]).forEach(([name, initial, expected]) => {
                it(name, () => {
                    expect(operationTransformer({
                        type: "set_selection",
                        properties: selectionProperties(initial[0], initial[1]),
                        newProperties: selectionProperties(initial[0], initial[1])
                    } as SetSelectionOperation,
                        {type: "remove_text", path: [], offset: start, text: "ab"
                    })).toEqual([{
                        type: "set_selection",
                        properties: selectionProperties(expected[0], expected[1]),
                        newProperties: selectionProperties(expected[0], expected[1])
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
    });
});
