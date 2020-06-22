import {slateSelectionsReducer} from "./slateSelectionsReducer";

describe("Slate Cursors Reducer", () => {
    it("Updates Only Local Selection", () => {
        expect(slateSelectionsReducer(
            "abc",
            {"def": {anchor: {path: [1], offset: 8}, focus: {path: [1], offset: 8}}},
            {type: "set_selection", properties: null, newProperties: {anchor: {path: [0], offset: 5}, focus: {path: [0], offset: 5}}}
        )).toEqual({
            "abc": {anchor: {path: [0], offset: 5}, focus: {path: [0], offset: 5}},
            "def": {anchor: {path: [1], offset: 8}, focus: {path: [1], offset: 8}}
        });
    });
});
