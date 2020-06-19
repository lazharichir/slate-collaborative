import {Node} from "../Node";
import {VersionedNode_1, VersionedPath_1, VersionedRange_1} from "./VersionedValue";

export type VersionedInsertNodeOperation_1 = {
    type: 'insert_node',
    path: VersionedPath_1,
    node: Node,
    [key: string]: unknown
};

export type VersionedInsertTextOperation_1 = {
    type: 'insert_text',
    path: VersionedPath_1,
    offset: number,
    text: string,
    [key: string]: unknown
};

export type VersionedMergeNodeOperation_1 = {
    type: 'merge_node',
    path: VersionedPath_1,
    position: number,
    properties: Partial<VersionedNode_1>,
    [key: string]: unknown
};

export type VersionedMoveNodeOperation_1 = {
    type: 'move_node',
    path: VersionedPath_1,
    newPath: VersionedPath_1,
    [key: string]: unknown
};

export type VersionedRemoveNodeOperation_1 = {
    type: 'remove_node',
    path: VersionedPath_1,
    node: VersionedNode_1,
    [key: string]: unknown
};

export type VersionedRemoveTextOperation_1 = {
    type: 'remove_text',
    path: VersionedPath_1,
    offset: number,
    text: string,
    [key: string]: unknown
};

export type VersionedSetNodeOperation_1 = {
    type: 'set_node',
    path: VersionedPath_1,
    properties: Partial<VersionedNode_1>,
    newProperties: Partial<VersionedNode_1>,
    [key: string]: unknown
};

export type VersionedSetSelectionOperation_1 = {
    type: 'set_selection',
    [key: string]: unknown,
    properties: null,
    newProperties: VersionedRange_1
} | {
    type: 'set_selection',
    [key: string]: unknown,
    properties: Partial<VersionedRange_1>,
    newProperties: Partial<VersionedRange_1>
} | {
    type: 'set_selection',
    [key: string]: unknown,
    properties: VersionedRange_1,
    newProperties: null
};

export type VersionedSplitNodeOperation_1 = {
    type: 'split_node',
    path: VersionedPath_1,
    position: number,
    properties: Partial<VersionedNode_1>,
    [key: string]: unknown
};

export type VersionedNodeOperation_1 = VersionedInsertNodeOperation_1 | VersionedMergeNodeOperation_1 | VersionedMoveNodeOperation_1 | VersionedRemoveNodeOperation_1 | VersionedSetNodeOperation_1 | VersionedSplitNodeOperation_1;
export type VersionedSelectionOperation_1 = VersionedSetSelectionOperation_1;
export type VersionedTextOperation_1 = VersionedInsertTextOperation_1 | VersionedRemoveTextOperation_1;

export type VersionedOperation_1 =
    | VersionedNodeOperation_1
    | VersionedSelectionOperation_1
    | VersionedTextOperation_1
    ;

export type VersionedOperation =
    | VersionedOperation_1
    ;
