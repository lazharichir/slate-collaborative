import {Operation} from "../action/Operation";
import {setSelectionTransformer} from "./setSelectionTransformer";
import {insertTextTransformer} from "./insertTextTransformer";
import {removeTextTransformer} from "./removeTextTransformer";
import {insertNodeTransformer} from "./insertNodeTransformer";

export function operationTransformer(operation: Operation, appliedOperation: Operation): Operation[] {
    switch (operation.type) {
        case "set_selection": return setSelectionTransformer(operation, appliedOperation);
        case "insert_text": return insertTextTransformer(operation, appliedOperation);
        case "remove_text": return removeTextTransformer(operation, appliedOperation);
        case "insert_node": return insertNodeTransformer(operation, appliedOperation);
        default: return [operation];
    }
}
