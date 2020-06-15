import {localSelectionReducer} from "./localSelectionReducer";
import {remoteSelectionReducer} from "./remoteSelectionReducer";

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
    })
});
