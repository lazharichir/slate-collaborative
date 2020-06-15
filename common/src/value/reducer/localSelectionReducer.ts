import {Selection} from "../Selection";
import {Operation} from "../action/Operation";
import {Path} from "../Path";
import {Point} from "../Point";
import {rangeTransformer} from "../transformer/rangeTransformer";

export function localSelectionReducer(state: Selection, action: Operation): Selection {
    if (action.type === "set_selection") {
        if (action.newProperties === null) {
            return null;
        } else if (action.properties === null) {
            return action.newProperties;
        } else if (state !== null) {
            return ({
                ...state,
                ...action.newProperties
            });
        } else return state;
    }

    if (state === null) {
        return null;
    }

    if (action.type === "insert_text") {
        let {anchor, focus} = state;
        if (Path.equals(action.path, anchor.path)) {
            if (action.offset < anchor.offset || (action.offset == anchor.offset && !Point.isAfter(anchor, focus))) {
                anchor = {...anchor, offset: anchor.offset + action.text.length};
            }
        }
        if (Path.equals(action.path, focus.path)) {
            if (action.offset < focus.offset || (action.offset == focus.offset && !Point.isAfter(focus, anchor))) {
                focus = {...focus, offset: focus.offset + action.text.length};
            }
        }
        if (anchor !== state.anchor || focus !== state.focus) {
            return ({anchor, focus});
        } else {
            return state;
        }
    } else if (action.type === "remove_text") {
        let {anchor, focus} = state;
        if (Path.equals(action.path, anchor.path)) {
            if (action.offset + action.text.length <= anchor.offset) {
                anchor = {...anchor, offset: anchor.offset - action.text.length};
            } else if (action.offset <= anchor.offset) {
                anchor = {...anchor, offset: action.offset};
            }
        }
        if (Path.equals(action.path, focus.path)) {
            if (action.offset + action.text.length <= focus.offset) {
                focus = {...focus, offset: focus.offset - action.text.length};
            } else if (action.offset <= focus.offset) {
                focus = {...focus, offset: action.offset};
            }
        }
        if (anchor !== state.anchor || focus !== state.focus) {
            return ({anchor, focus});
        } else {
            return state;
        }
    } else if (action.type === "insert_node") {
        return rangeTransformer(state, action);
    } else if (action.type === "remove_node") {
        return rangeTransformer(state, action);
    } else if (action.type === "merge_node") {
        return rangeTransformer(state, action);
    } else if (action.type === "split_node") {
        return rangeTransformer(state, action);
    } else if (action.type === "set_node") {
        return rangeTransformer(state, action);
    } else if (action.type === "move_node") {
        return rangeTransformer(state, action);
    }

    return state;
}
