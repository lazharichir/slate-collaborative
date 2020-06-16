import {nodeReducer} from "./nodeReducer";

describe("Node Reducer", () => {
    describe("set_selection", () => {
        it("does not affect nodes", () => {
            // test included for suite completion
        });
    });
    describe("insert_text", () => {
        ([
            ["before", 0, "123ab"],
            ["middle", 1, "a123b"],
            ["end", 2, "ab123"]
        ] as [string, number, string][]).forEach(([name, offset, expected]) => {
            it(name, () => {
                expect(nodeReducer({text: "ab"}, {type: "insert_text", path: [], offset: offset, text: "123"}))
                    .toEqual({text: expected});
            })
        });
        it("inserts at subnodes", () => {
            expect(nodeReducer({children: [{text: "abc"}, {text: "def"}]}, {type: "insert_text", path: [1], offset: 0, text: "123"}))
                .toEqual({children: [{text: "abc"}, {text: "123def"}]});
        });
    });
    describe("remove_text", () => {
        ([
            ["before", 0, "bc"],
            ["middle", 1, "ac"],
            ["end", 2, "ab"]
        ] as [string, number, string][]).forEach(([name, offset, expected]) => {
            it(name, () => {
                expect(nodeReducer({text: "abc"}, {type: "remove_text", path: [], offset: offset, text: "abc".substring(offset, offset + 1)}))
                    .toEqual({text: expected});
            })
        });
        it("removes at sub-node", () => {
            expect(nodeReducer({children: [{text: "abc"}, {text: "def"}]}, {type: "remove_text", path: [1], offset: 0, text:"de"}))
                .toEqual({children: [{text: "abc"}, {text: "f"}]});
        });
    })
    describe("insert_node", () => {
        it("beginning", () => {
            expect(nodeReducer({
                    children: [{text: "abc"}, {text: "def"}]
                }, {type: "insert_node", path: [0], node: {text: "ghi"}}
            )).toEqual({
                children: [{text: "ghi"}, {text: "abc"}, {text: "def"}]
            });
        });
        it("in-between", () => {
            expect(nodeReducer({
                    children: [{text: "abc"}, {text: "def"}]
                }, {type: "insert_node", path: [1], node: {text: "ghi"}}
            )).toEqual({
                children: [{text: "abc"}, {text: "ghi"}, {text: "def"}]
            });
        });
        it("at the end", () => {
            expect(nodeReducer({
                    children: [{text: "abc"}, {text: "def"}]
                }, {type: "insert_node", path: [2], node: {text: "ghi"}}
            )).toEqual({
                children: [{text: "abc"}, {text: "def"}, {text: "ghi"}]
            });
        });
    });
    describe("remove_node", () => {
        it("removes node at beginning", () => {
            expect(nodeReducer({
                    children: [{text: "abc"}, {text: "def"}, {text: "ghi"}]
                }, {type: "remove_node", path: [0], node: {text: "abc"}}
            )).toEqual({
                children: [{text: "def"}, {text: "ghi"}]
            });
        })
        it("removes node in middle", () => {
            expect(nodeReducer({
                    children: [{text: "abc"}, {text: "def"}, {text: "ghi"}]
                }, {type: "remove_node", path: [1], node: {text: "def"}}
            )).toEqual({
                children: [{text: "abc"}, {text: "ghi"}]
            });
        })
        it("removes node at end", () => {
            expect(nodeReducer({
                    children: [{text: "abc"}, {text: "def"}, {text: "ghi"}]
                }, {type: "remove_node", path: [2], node: {text: "ghi"}}
            )).toEqual({
                children: [{text: "abc"}, {text: "def"}]
            });
        })
    });
    describe("move_node", () => {
        it("first to second", () => {
            expect(nodeReducer({
                children: [{text: "abc"}, {text: "def"}, {text: "ghi"}]
            }, {
                type: "move_node", path: [0], newPath: [2]
            })).toEqual({
                children: [{text: "def"}, {text: "abc"}, {text: "ghi"}]
            });
        });
        it("second to first", () => {
            expect(nodeReducer({
                children: [{text: "abc"}, {text: "def"}, {text: "ghi"}]
            }, {
                type: "move_node", path: [1], newPath: [0]
            })).toEqual({
                children: [{text: "def"}, {text: "abc"}, {text: "ghi"}]
            });
        });
    });
});
