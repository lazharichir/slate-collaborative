import {InsertNodeOperation, Operation} from "../action/Operation";
import {pathTransform} from "./pathTransformer";
import {Path} from "../Path";

export function insertNodeTransformer(operation: InsertNodeOperation, appliedOperation: Operation): InsertNodeOperation[] {
    if (appliedOperation.type === "set_selection" || appliedOperation.type === "set_node" || appliedOperation.type === "insert_text" || appliedOperation.type === "remove_text") return [operation];

    if ((appliedOperation.type === "remove_node" || appliedOperation.type === "split_node" || appliedOperation.type === "merge_node") && Path.equals(appliedOperation.path, operation.path)) {
        return [operation];
    }

    let newPath = pathTransform(operation.path, appliedOperation)!;
    if (newPath === null) return [];
    if (newPath !== operation.path) {
        return [{...operation, path: newPath}];
    } else {
        return [operation]
    }
}