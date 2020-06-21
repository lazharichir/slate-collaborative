import {Node} from "../Node";
import {VersionedNode, VersionedPath, VersionedRange} from "./VersionedSlateValue";

type VersionedInsertNodeOperation_1 = {
    type: 'insert_node',
    path: VersionedPath,
    node: Node,
    [key: string]: unknown
};

type VersionedInsertTextOperation_1 = {
    type: 'insert_text',
    path: VersionedPath,
    offset: number,
    text: string,
    [key: string]: unknown
};

type VersionedMergeNodeOperation_1 = {
    type: 'merge_node',
    path: VersionedPath,
    position: number,
    properties: Partial<VersionedNode>,
    [key: string]: unknown
};

type VersionedMoveNodeOperation_1 = {
    type: 'move_node',
    path: VersionedPath,
    newPath: VersionedPath,
    [key: string]: unknown
};

type VersionedRemoveNodeOperation_1 = {
    type: 'remove_node',
    path: VersionedPath,
    node: VersionedNode,
    [key: string]: unknown
};

type VersionedRemoveTextOperation_1 = {
    type: 'remove_text',
    path: VersionedPath,
    offset: number,
    text: string,
    [key: string]: unknown
};

type VersionedSetNodeOperation_1 = {
    type: 'set_node',
    path: VersionedPath,
    properties: Partial<VersionedNode>,
    newProperties: Partial<VersionedNode>,
    [key: string]: unknown
};

type VersionedSetSelectionOperation_1 = {
    type: 'set_selection',
    [key: string]: unknown,
    properties: null,
    newProperties: VersionedRange
} | {
    type: 'set_selection',
    [key: string]: unknown,
    properties: Partial<VersionedRange>,
    newProperties: Partial<VersionedRange>
} | {
    type: 'set_selection',
    [key: string]: unknown,
    properties: VersionedRange,
    newProperties: null
};

type VersionedSplitNodeOperation_1 = {
    type: 'split_node',
    path: VersionedPath,
    position: number,
    properties: Partial<VersionedNode>,
    [key: string]: unknown
};

type VersionedNodeOperation_1 = VersionedInsertNodeOperation_1 | VersionedMergeNodeOperation_1 | VersionedMoveNodeOperation_1 | VersionedRemoveNodeOperation_1 | VersionedSetNodeOperation_1 | VersionedSplitNodeOperation_1;
type VersionedSelectionOperation_1 = VersionedSetSelectionOperation_1;
type VersionedTextOperation_1 = VersionedInsertTextOperation_1 | VersionedRemoveTextOperation_1;

type VersionedOperation_1 =
    | VersionedNodeOperation_1
    | VersionedSelectionOperation_1
    | VersionedTextOperation_1
    ;

export type VersionedSlateOperation =
    | VersionedOperation_1
    ;
