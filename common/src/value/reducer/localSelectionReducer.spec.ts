import {localSelectionReducer} from "./localSelectionReducer";
import {remoteSelectionReducer} from "./remoteSelectionReducer";
import {Path} from "../Path";

describe("Local Selection Reducer", () => {
    describe("set_selection", () => {
        it("select", () => {
            expect(localSelectionReducer(null, {
                type: "set_selection",
                properties: null,
                newProperties: {
                    anchor: {path: [0, 0], offset: 1},
                    focus: {path: [0, 0], offset: 1}
                }
            })).toEqual({
                anchor: {path: [0, 0], offset: 1},
                focus: {path: [0, 0], offset: 1}
            })
        });
        it("deselect", () => {
            expect(localSelectionReducer({
                anchor: {path: [0, 0], offset: 1},
                focus: {path: [0, 0], offset: 1}
            }, {
                type: "set_selection",
                properties: {
                    anchor: {path: [0, 0], offset: 1},
                    focus: {path: [0, 0], offset: 1}
                },
                newProperties: null
            })).toBeNull()
        });
        it("move anchor", () => {
            expect(localSelectionReducer({
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
                anchor: {path: [1, 1], offset: 2},
                focus: {path: [0, 0], offset: 1}
            })
        });
        it("move focus", () => {
            expect(localSelectionReducer({
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
                focus: {path: [1, 1], offset: 2}
            })
        });
        it("move both focus and anchor", () => {
            expect(localSelectionReducer({
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
                anchor: {path: [1, 1], offset: 2},
                focus: {path: [1, 1], offset: 2}
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
                expect(localSelectionReducer({
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
                expect(localSelectionReducer({
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

    describe("move_node", () => {
        let parentPreviousChild = [0, 1], parentPrevious = [0], parent = [2], previous = [2, 1], start = [2, 2], within = [2, 4], withinChild = [2, 3, 2], end = [2, 5], next = [2, 6], parentNext = [4];

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
            ["parentNext-next", [parentNext, next], [[2, 2], [2, 5]]]
        ] as [string, [Path, Path], [Path, Path]][]).forEach(([name, [path, newPath], [newStart, newEnd]]) => {
            it(name, () => {
                expect(localSelectionReducer({anchor: {path: start, offset: 5}, focus: {path: end, offset: 5}},
                    {type: "move_node", path, newPath}
                )).toEqual({anchor: {path: newStart, offset: 5}, focus: {path: newEnd, offset: 5}});
            })
        });
    });
});
