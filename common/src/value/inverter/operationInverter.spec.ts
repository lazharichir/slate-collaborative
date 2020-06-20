import {operationInverter} from "./operationInverter";

describe("Operation Inverter", () => {
    it("inverts set_selection", () => {
        expect(operationInverter({
            type: "set_selection",
            properties: {anchor: {path: [0], offset: 5}, focus: {path: [0], offset: 5}},
            newProperties: {anchor: {path: [2], offset: 10}, focus: {path: [2], offset: 10}}
        })).toEqual({
            type: "set_selection",
            properties: {anchor: {path: [2], offset: 10}, focus: {path: [2], offset: 10}},
            newProperties: {anchor: {path: [0], offset: 5}, focus: {path: [0], offset: 5}}
        });
    });
    it("inverts insert_text", () => {
        expect(operationInverter({
            type: "insert_text",
            path: [1, 1],
            offset: 5,
            text: "abc"
        })).toEqual({
            type: "remove_text",
            path: [1, 1],
            offset: 5,
            text: "abc"
        });
    });
    it ("inverts remove_text", () => {
        expect(operationInverter({
            type: "remove_text",
            path: [1, 1],
            offset: 5,
            text: "abc"
        })).toEqual({
            type: "insert_text",
            path: [1, 1],
            offset: 5,
            text: "abc"
        });
    });
    it("inverts insert_node", () => {
        expect(operationInverter({
            type: "insert_node",
            path: [1, 1],
            node: {text: "abc"}
        })).toEqual({
            type: "remove_node",
            path: [1, 1],
            node: {text: "abc"}
        });
    });
    it("inverts remove_node", () => {
        expect(operationInverter({
            type: "remove_node",
            path: [1, 1],
            node: {text: "abc"}
        })).toEqual({
            type: "insert_node",
            path: [1, 1],
            node: {text: "abc"}
        });
    });
    it("inverts move_node", () => {
        expect(operationInverter({
            type: "move_node",
            path: [1, 1],
            newPath: [2, 2]
        })).toEqual({
            type: "move_node",
            path: [2, 2],
            newPath: [1, 1]
        });
        expect(operationInverter({
            type: "move_node",
            path: [1, 1],
            newPath: [1, 2]
        })).toEqual({
            type: "move_node",
            path: [1, 2],
            newPath: [1, 1]
        });

        expect(operationInverter({
            type: "move_node",
            path: [1, 1],
            newPath: [1, 1]
        })).toEqual({
            type: "move_node",
            path: [1, 1],
            newPath: [1, 1]
        });
    });
    it("inverts set_node", () => {
        expect(operationInverter({
            type: "set_node",
            path: [1, 2],
            properties: {bold: undefined},
            newProperties: {bold: true}
        })).toEqual({
            type: "set_node",
            path: [1, 2],
            properties: {bold: true},
            newProperties: {bold: undefined}
        });
    });
    it("inverts split_node", () => {
        expect(operationInverter({
            type: "split_node",
            path: [1, 1],
            properties: {},
            position: 5
        })).toEqual({
            type: "merge_node",
            path: [1, 2],
            position: 5,
            properties: {}
        });
    });
    it("inverts merge_node", () => {
        expect(operationInverter({
            type: "merge_node",
            path: [1, 2],
            position: 5,
            properties: {}
        })).toEqual({
            type: "split_node",
            path: [1, 1],
            position: 5,
            properties: {}
        });
    });
});