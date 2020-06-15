import {localSelectionReducer} from "./localSelectionReducer";
import {remoteSelectionReducer} from "./remoteSelectionReducer";
import {Path} from "../Path";

describe("Remote Selection Reducer", () => {
    describe("set_selection", () => {
        it("add selection", () => {
            expect(remoteSelectionReducer(null, {
                type: "set_selection",
                properties: null,
                newProperties: {
                    anchor: {path: [0, 0], offset: 1},
                    focus: {path: [0, 0], offset: 1}
                }
            })).toBeNull()
        });
        it("remove selection", () => {
            expect(remoteSelectionReducer({
                anchor: {path: [0, 0], offset: 1},
                focus: {path: [0, 0], offset: 1}
            }, {
                type: "set_selection",
                properties: {
                    anchor: {path: [0, 0], offset: 1},
                    focus: {path: [0, 0], offset: 1}
                },
                newProperties: null
            })).toEqual({
                anchor: {path: [0, 0], offset: 1},
                focus: {path: [0, 0], offset: 1}
            })
        });
        it("move anchor", () => {
            expect(remoteSelectionReducer({
                anchor: {path: [0, 0], offset: 1},
                focus: {path: [0, 0], offset: 1}
            }, {
                type: "set_selection",
                properties: {
                    anchor: {path: [0, 0], offset: 1}
                },
                newProperties: {
                    anchor: {path: [1, 1], offset: 2}
                }
            })).toEqual({
                anchor: {path: [0, 0], offset: 1},
                focus: {path: [0, 0], offset: 1}
            })
        });
        it("move focus", () => {
            expect(remoteSelectionReducer({
                anchor: {path: [0, 0], offset: 1},
                focus: {path: [0, 0], offset: 1}
            }, {
                type: "set_selection",
                properties: {
                    focus: {path: [0, 0], offset: 1}
                },
                newProperties: {
                    focus: {path: [1, 1], offset: 2}
                }
            })).toEqual({
                anchor: {path: [0, 0], offset: 1},
                focus: {path: [0, 0], offset: 1}
            })
        });
        it("move both focus and anchor", () => {
            expect(remoteSelectionReducer({
                anchor: {path: [0, 0], offset: 1},
                focus: {path: [0, 0], offset: 1}
            }, {
                type: "set_selection",
                properties: {
                    anchor: {path: [0, 0], offset: 1},
                    focus: {path: [0, 0], offset: 1}
                },
                newProperties: {
                    anchor: {path: [1, 1], offset: 2},
                    focus: {path: [1, 1], offset: 2}
                }
            })).toEqual({
                anchor: {path: [0, 0], offset: 1},
                focus: {path: [0, 0], offset: 1}
            })
        });
    });
    describe("insert_text", () => {
        let before = 1; let at = 2; let after = 3; let length = 3;
        ([
            ["before-before", [before, before], [before, before]],
            ["before-at", [before, at], [before, at]],
            ["before-after", [before, after], [before, after + length]],
            ["at-at", [at, at], [at + length, at + length]],
            ["at-after", [at, after], [at + length, after + length]],
            ["after-after", [after, after], [after + length, after + length]],
            ["at-before", [at, before], [at, before]],
            ["after-before", [after, before], [after + length, before]],
            ["after-at", [after, at], [after + length, at + length]]
        ] as [string, number[], number[]][]).forEach(([name, offsets, expected]) => {
            it(name, () => {
                expect(remoteSelectionReducer({
                    anchor: {path: [], offset: offsets[0]},
                    focus: {path: [], offset: offsets[1]}
                }, {
                    type: "insert_text", path: [], offset: 2, text: "abc"
                })).toEqual({
                    anchor: {path: [], offset: expected[0]},
                    focus: {path: [], offset: expected[1]}
                })
            })
        });
    });
    describe("remove_text", () => {
        let before = 1; let start = 2; let within = 3; let end = 4; let after = 5; let length = 2;
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
            ["within-end", [within, end], [start, end-length]],
            ["within-after", [within, after], [start, after-length]],
            ["end-end", [end, end], [start, start]],
            ["end-after", [end, after], [start, after-length]],
            ["after-after", [after, after], [after-length, after-length]],
            ["start-before", [start, before], [start, before]],
            ["within-before", [within, before], [start, before]],
            ["end-before", [end, before], [end-length, before]],
            ["after-before", [after, before], [after-length, before]],
            ["within-start", [within, start], [start, start]],
            ["end-start", [end, start], [start, start]],
            ["after-start", [after, start], [after-length, start]],
            ["end-within", [end, within], [start, start]],
            ["after-within", [after, within], [after-length, start]],
            ["after-end", [after, end], [after-length, start]],
        ] as [string, number[], number[]][]).forEach(([name, offsets, expected]) => {
            it(name, () => {
                expect(remoteSelectionReducer({
                    anchor: {path: [], offset: offsets[0]},
                    focus: {path: [], offset: offsets[1]}
                }, {
                    type: "remove_text", path: [], offset: 2, text: "ab"
                })).toEqual({
                    anchor: {path: [], offset: expected[0]},
                    focus: {path: [], offset: expected[1]}
                })
            });
        });
    });
    describe("insert_node", () => {
        ([
            ["parent's previous", [0], [2, 1]],
            ["parent's previous's child", [0, 1], [1, 1]],
            ["parent", [1], [2, 1]],
            ["previous", [1, 0], [1, 2]],
            ["at", [1, 1], [1, 2]],
            ["next", [1, 2], [1, 1]],
            ["parent's next", [2], [1, 1]]
        ] as [string, Path, Path][]).forEach(([name, initial, expected]) => {
            it(name, () => {
                expect(remoteSelectionReducer({
                    anchor: {path: [1, 1], offset: 5},
                    focus: {path: [1, 1], offset: 5}
                }, {
                    type: "insert_node", path: initial, node: {text: "abc"}
                })).toEqual({
                    anchor: {path: expected, offset: 5},
                    focus: {path: expected, offset: 5}
                })
            });
        })
    });
    describe("remove_node", () => {
        let parentPrevious = [0], parent = [1], previous = [1, 0], at = [1, 1], child = [1, 1, 1], next = [1, 2], parentNext = [2];
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
            ["parentNext-parentNext", [parentNext, parentNext], [parentNext, parentNext]]
        ] as [string, [Path, Path], [Path, Path] | null][]).forEach(([name, input, output]) => {
            it(name, () => {
                expect(localSelectionReducer(input !== null ? {anchor: {path: input[0], offset: 5}, focus: {path: input[1], offset: 5}} : null,
                    {type: "remove_node", path: [1, 1], node: {text: "abc"}}
                )).toEqual(output !== null ? {anchor: {path: output[0], offset: 5}, focus: {path: output[1], offset: 5}} : null);
            });
        });
    });
    describe("set_node", () => {
        it("no-op", () => {});
    });
});
