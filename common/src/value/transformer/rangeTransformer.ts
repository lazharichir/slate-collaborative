import {Range} from "../Range";
import {Operation} from "../action/Operation";
import {Path} from "../Path";
import {Point} from "../Point";
import {pointTransformer} from "./pointTransformer";

export function rangeTransformer(range: Range, appliedOperation: Operation): Range {
    if (appliedOperation.type === "insert_text") {
        let {anchor, focus} = range;
        if (Path.equals(anchor.path, appliedOperation.path)) {
            if (anchor.offset > appliedOperation.offset || (anchor.offset === appliedOperation.offset && !Point.isAfter(anchor, focus))) {
                anchor = ({
                    ...anchor,
                    offset: anchor.offset + appliedOperation.text.length
                });
            }
        }
        if (Path.equals(focus.path, appliedOperation.path)) {
            if (focus.offset > appliedOperation.offset || (focus.offset === appliedOperation.offset && !Point.isAfter(focus, anchor))) {
                focus = ({
                    ...focus,
                    offset: focus.offset + appliedOperation.text.length
                });
            }
        }

        if (anchor !== range.anchor || focus !== range.focus) {
            return ({...range, anchor, focus});
        } else {
            return range;
        }
    } else {
        let anchor = pointTransformer(range.anchor, appliedOperation);
        let focus = pointTransformer(range.focus, appliedOperation);
        if (anchor !== range.anchor || focus !== range.focus) {
            return ({...range, anchor, focus});
        } else {
            return range;
        }
    }
}

