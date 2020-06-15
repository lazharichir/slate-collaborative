import {InsertNodeOperation, Operation} from "../action/Operation";
import {pathTransform} from "./pathTransformer";

export function insertNodeTransformer(operation: InsertNodeOperation, appliedOperation: Operation): InsertNodeOperation[] {
    if (appliedOperation.type === "set_selection" || appliedOperation.type === "set_node" || appliedOperation.type === "insert_text" || appliedOperation.type === "remove_text") return [operation];

    if (appliedOperation.type === "insert_node") {
        let newPath = pathTransform(operation.path, appliedOperation)!;
        if (newPath !== operation.path) {
            return [{...operation, path: newPath}];
        } else {
            return [operation]
        }
    }

    return [operation];
}