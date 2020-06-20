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

describe("Set Selection Transformer", () => {
    describe("set_selection applied", () => {
        it("no-op", () => {
            expect(operationTransformer(
                {type: "set_selection", properties: {}, newProperties: {}} as SetSelectionOperation,
                {type: "set_selection", properties: {}, newProperties: {}} as SetSelectionOperation,
                false
            )).toEqual([
                {type: "set_selection", properties: {}, newProperties: {}}
            ]);
        });
    });
    describe("insert_text applied", () => {
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
                }, false)).toEqual([{
                    type: "set_selection",
                    properties: properties(output[0] !== null ? {path: [], offset: output[0]} : null, output[1] !== null ? {path: [], offset: output[1]} : null),
                    newProperties: properties(output[0] !== null ? {path: [], offset: output[0]} : null, output[1] !== null ? {path: [], offset: output[1]} : null)
                }]);
            });
        });
    });
    describe("remove_text applied", () => {
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
                    },
                    false
                )).toEqual([{
                    type: "set_selection",
                    properties: properties(output[0] !== null ? {path: [], offset: output[0]} : null, output[1] !== null ? {path: [], offset: output[1]} : null),
                    newProperties: properties(output[0] !== null ? {path: [], offset: output[0]} : null, output[1] !== null ? {path: [], offset: output[1]} : null)
                }]);
            });
        });
    });
    describe("insert_node applied", () => {
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
                        {
                            type: "set_selection",
                            properties: {anchor: {path: [1, 1], offset: 5}, focus: {path: [1, 1], offset: 5}},
                            newProperties: {anchor: {path: [1, 1], offset: 5}, focus: {path: [1, 1], offset: 5}}
                        },
                        {type: "insert_node", path: initial, node: {text: ""}},
                        false
                    )).toEqual([{
                        type: "set_selection",
                        properties: {anchor: {path: expected, offset: 5}, focus: {path: expected, offset: 5}},
                        newProperties: {anchor: {path: expected, offset: 5}, focus: {path: expected, offset: 5}}
                    }]);
                });
            });
    });
    describe("remove_node applied", () => {
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
                    {type: "remove_node", path: [1, 1], node: {text: "abc"}},
                    false
                )).toEqual(output !== null ? [{
                    type: "set_selection",
                    properties: properties(output[0] !== null ? {path: output[0], offset: 5} : null, output[1] !== null ? {path: output[1], offset: 5} : null) ,
                    newProperties: properties(output[0] !== null ? {path: output[0], offset: 5} : null, output[1] !== null ? {path: output[1], offset: 5} : null)
                }] : []);
            });
        });
        it("null-null", () => {
            expect(operationTransformer(
                {type: "set_selection", properties: {
                        anchor: {path: [0], offset: 0}
                    }, newProperties: null} as SetSelectionOperation,
                {type: "remove_node", path: [0], node: {text: ""}},
                false
            )).toEqual([]);
        });
    });
    describe("set_node applied", () => {
        it("no-op", () => {
            expect(operationTransformer(
                {type: "set_selection", properties: {}, newProperties: {}},
                {type: "set_node", path: [0], properties: {}, newProperties: {}},
                false
            )).toEqual([
                {type: "set_selection", properties: {}, newProperties: {}},
            ]);
        });
    });
    describe("move_node applied", () => {
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
            ["parentNext-next", [parentNext, next], [[2, 2], [2, 5]]],
        ] as [string, [Path, Path], [Path, Path]][]).forEach(([name, [path, newPath], [newStart, newEnd]]) => {
            it(name, () => {
                expect(operationTransformer(
                    {
                        type: "set_selection",
                        properties: properties({path: start, offset: 5}, {path: end, offset: 5}),
                        newProperties: properties({path: start, offset: 5}, {path: end, offset: 5}),
                    } as SetSelectionOperation,
                    {type: "move_node", path, newPath},
                    false
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
                    {type: "move_node", path, newPath},
                    false
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
                    {type: "move_node", path, newPath},
                    false
                )).toEqual([{
                    type: "set_selection",
                    properties: properties({path: newStart, offset: 5}, null),
                    newProperties: properties({path: newStart, offset: 5}, null)
                }]);
            });
        });
    });
    describe("split_node applied", () => {
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
                    {type: "split_node", path: [0], position: 1, properties: {}},
                    false
                )).toEqual([
                    {type: "set_selection", properties: properties(output[0], output[1]), newProperties: properties(output[0], output[1])}
                ]);
            });
        });
    });
    describe("merge_node applied", () => {
        let before = {path: [0], offset: 1}, target = {path: [1], offset: 2}, current = {path: [2], offset: 3}, after = {path: [3], offset: 4}, unspecified = null;
        ([
            ["before-before", [before, before], [{path: [0], offset: 1}, {path: [0], offset: 1}]],
            ["before-target", [before, target], [{path: [0], offset: 1}, {path: [1], offset: 2}]],
            ["before-current", [before, current], [{path: [0], offset: 1}, {path: [1], offset: 8}]],
            ["before-after", [before, after], [{path: [0], offset: 1}, {path: [2], offset: 4}]],
            ["before-unspecified", [before, unspecified], [{path: [0], offset: 1}, null]],

            ["target-target", [target, target], [{path: [1], offset: 2}, {path: [1], offset: 2}]],
            ["target-current", [target, current], [{path: [1], offset: 2}, {path: [1], offset: 8}]],
            ["target-after", [target, after], [{path: [1], offset: 2}, {path: [2], offset: 4}]],
            ["target-unspecified", [target, unspecified], [{path: [1], offset: 2}, null]],

            ["current-current", [current, current], [{path: [1], offset: 8}, {path: [1], offset: 8}]],
            ["current-after", [current, after], [{path: [1], offset: 8}, {path: [2], offset: 4}]],
            ["current-unspecified", [current, unspecified], [{path: [1], offset: 8}, null]],

            ["after-after", [after, after], [{path: [2], offset: 4}, {path: [2], offset: 4}]],
            ["after-unspecified", [after, unspecified], [{path: [2], offset: 4}, null]],

            ["target-before", [target, before], [{path: [1], offset: 2}, {path: [0], offset: 1}]],
            ["current-before", [current, before], [{path: [1], offset: 8}, {path: [0], offset: 1}]],
            ["after-before", [after, before], [{path: [2], offset: 4}, {path: [0], offset: 1}]],
            ["unspecified-before", [unspecified, before], [null, {path: [0], offset: 1}]],

            ["current-target", [current, target], [{path: [1], offset: 8}, {path: [1], offset: 2}]],
            ["after-target", [after, target], [{path: [2], offset: 4}, {path: [1], offset: 2}]],
            ["unspecified-target", [unspecified, target], [null, {path: [1], offset: 2}]],

            ["after-current", [after, current], [{path: [2], offset: 4}, {path: [1], offset: 8}]],
            ["unspecified-current", [unspecified, current], [null, {path: [1], offset: 8}]],
            ["unspecified-after", [unspecified, after], [null, {path: [2], offset: 4}]]
        ] as [string, [Point | null, Point | null], [Point | null, Point | null]][]).forEach(([name, input, output]) => {
            it(name, () => {
                expect(operationTransformer(
                    {type: "set_selection", properties: properties(input[0], input[1]), newProperties: properties(input[0], input[1])} as SetSelectionOperation,
                    {type: "merge_node", path: [2], position: 5, properties: {}},
                    false
                )).toEqual([
                    {type: "set_selection", properties: properties(output[0], output[1]), newProperties: properties(output[0], output[1])}
                ]);
            });
        });
    });
});
