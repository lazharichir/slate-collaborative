import {Operation} from "../action/Operation";
import {setSelectionTransformer} from "./setSelectionTransformer";
import {insertTextTransformer} from "./insertTextTransformer";
import {removeTextTransformer} from "./removeTextTransformer";
import {insertNodeTransformer} from "./insertNodeTransformer";
import {removeNodeTransformer} from "./removeNodeTransformer";
import {setNodeTransformer} from "./setNodeTransformer";
import {moveNodeTransformer} from "./moveNodeTransformer";
import {splitNodeTransformer} from "./splitNodeTransformer";
import {mergeNodeTransformer} from "./mergeNodeTransformer";

export function operationTransformer(operation: Operation, appliedOperation: Operation, tieBreaker: boolean): Operation[] {
    switch (operation.type) {
        case "set_selection": return setSelectionTransformer(operation, appliedOperation, tieBreaker);
        case "insert_text": return insertTextTransformer(operation, appliedOperation, tieBreaker);
        case "remove_text": return removeTextTransformer(operation, appliedOperation, tieBreaker);
        case "insert_node": return insertNodeTransformer(operation, appliedOperation, tieBreaker);
        case "remove_node": return removeNodeTransformer(operation, appliedOperation, tieBreaker);
        case "set_node": return setNodeTransformer(operation, appliedOperation, tieBreaker);
        case "move_node": return moveNodeTransformer(operation, appliedOperation, tieBreaker);
        case "split_node": return splitNodeTransformer(operation, appliedOperation, tieBreaker);
        case "merge_node": return mergeNodeTransformer(operation, appliedOperation, tieBreaker);
    }
}
