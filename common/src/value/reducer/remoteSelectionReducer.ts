import {Selection} from "../Selection";
import {Operation} from "../action/Operation";
import {Path} from "../Path";
import {Point} from "../Point";

export function remoteSelectionReducer(state: Selection, action: Operation): Selection {
    if (action.type === "set_selection") return state;
    if (state === null) return state;
    if (action.type === "insert_text") {
        let {anchor, focus} = state;
        if (Path.equals(anchor.path, action.path)) {
            if (anchor.offset > action.offset || (anchor.offset == action.offset && !Point.isAfter(anchor, focus))) {
                anchor = ({
                    ...anchor,
                    offset: anchor.offset + action.text.length
                });
            }
        }
        if (Path.equals(focus.path, action.path)) {
            if (focus.offset > action.offset || (focus.offset == action.offset && !Point.isAfter(focus, anchor))) {
                focus = ({
                    ...focus,
                    offset: focus.offset + action.text.length
                });
            }
        }

        return (anchor !== state.anchor || focus !== state.focus) ? ({anchor, focus}) : state;
    } else if (action.type === "remove_text") {
        let {anchor, focus} = state;
        if (Path.equals(anchor.path, action.path)) {
            if (anchor.offset >= action.offset + action.text.length) {
                anchor = ({...anchor,offset: anchor.offset - action.text.length});
            } else if (anchor.offset >= action.offset) {
                anchor = ({...anchor, offset: action.offset})
            }
        }

        if (Path.equals(focus.path, action.path)) {
            if (focus.offset >= action.offset + action.text.length) {
                focus = ({...focus,offset: focus.offset - action.text.length});
            } else if (focus.offset >= action.offset) {
                focus = ({...focus, offset: action.offset})
            }
        }

        return (anchor !== state.anchor || focus !== state.focus) ? ({anchor, focus}) : state;
    }

    return state;
}