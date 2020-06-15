import {Operation, RemoveNodeOperation} from "../action/Operation";
import {Path} from "../Path";
import {nodeReducer} from "../reducer/nodeReducer";
import {pathTransform} from "./pathTransformer";

export function removeNodeTransformer(operation: RemoveNodeOperation, appliedOperation: Operation): RemoveNodeOperation[] {
    if (appliedOperation.type === "set_selection") return [operation];

    if (appliedOperation.type === "insert_text" || appliedOperation.type === "remove_text") {
        if (Path.isAncestor(operation.path, appliedOperation.path) || Path.equals(appliedOperation.path, operation.path)) {
            let newNode = nodeReducer(operation.node, {...appliedOperation, path: appliedOperation.path.slice(operation.path.length)});
            if (newNode !== operation.node) {
                return [{...operation, node: newNode}];
            } else {
                return [operation];
            }
        }
    }

    if (Path.isAncestor(operation.path, appliedOperation.path)) {
        let newNode = nodeReducer(operation.node, {...appliedOperation, path: appliedOperation.path.slice(operation.path.length)});
        if (newNode !== operation.node) {
            return [{...operation, node: newNode}];
        } else {
            return [operation];
        }
    } else {
        let newPath = pathTransform(operation.path, appliedOperation)
        if (newPath === null) return [];
        if (newPath !== operation.path) {
            return [{...operation, path: newPath}];
        } else {
            return [operation];
        }
    }

    return [operation];
}