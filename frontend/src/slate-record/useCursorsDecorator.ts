import {useCallback} from "react";
import {Path, Point, Range, Text} from "slate";
import {ClientId} from "record";
import {SlateSelection} from "slate-value";

export function useCursorsDecorator(cursors: {[key: string]: SlateSelection}) {
    return useCallback(([node, path]): Range[] => {
        if (!Text.isText(node)) return [];
        return Object.keys(cursors).flatMap((clientId: ClientId): Range[] => {
            const selection = cursors[clientId];
            if (selection === null) return [];
            if (!Range.includes(selection, path)) return [];
            const { focus, anchor } = selection
            const isFocusNode = Path.equals(focus.path, path)
            const isAnchorNode = Path.equals(anchor.path, path)
            const isForward = Point.isBefore(anchor, focus)

            return [{
                ...selection,
                cursor: clientId,
                isForwardCaret: isFocusNode && isForward,
                isBackwardCaret: isFocusNode && !isForward,
                anchor: { path, offset: isAnchorNode ? anchor.offset : isForward ? 0 : node.text.length },
                focus: { path, offset: isFocusNode ? focus.offset : isForward ? node.text.length : 0 }
            }];
        })
    }, [cursors]);
}
