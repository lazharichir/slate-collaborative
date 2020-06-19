import {InsertTextOperation, Operation} from "../action/Operation";
import {Path} from "../Path";
import {pathTransform} from "./pathTransformer";

export function insertTextTransformer(operation: InsertTextOperation, appliedOperation: Operation): InsertTextOperation[] {
    if (appliedOperation.type === "set_selection" || appliedOperation.type === "set_node") return [operation];

    if (appliedOperation.type === "insert_text") {
        if (!Path.equals(appliedOperation.path, operation.path)) return [operation];
        if (appliedOperation.offset <= operation.offset) {
            return ([{...operation, offset: operation.offset + appliedOperation.text.length}])
        } else {
            return [operation];
        }
    } else if (appliedOperation.type === "remove_text") {
        if (!Path.equals(appliedOperation.path, operation.path)) return [operation];
        if (operation.offset >= appliedOperation.offset + appliedOperation.text.length) {
            return [{...operation, offset: operation.offset - appliedOperation.text.length}]
        } else if (appliedOperation.offset < operation.offset && operation.offset < appliedOperation.offset + appliedOperation.text.length) {
            return [];
        } else {
            return [operation];
        }
    } else if (appliedOperation.type === "split_node") {
        if (Path.equals(appliedOperation.path, operation.path)) {
            if (appliedOperation.position <= operation.offset) {
                return [{
                    ...operation, path: Path.next(operation.path), offset: operation.offset - appliedOperation.position
                }];
            } else {
                return [operation];
            }
        } else {
            let newPath = pathTransform(operation.path, appliedOperation);
            if (newPath === null) return [];
            if (newPath !== operation.path) {
                return [{...operation, path: newPath}];
            } else {
                return [operation];
            }
        }
    } else if (appliedOperation.type === "merge_node") {
        if (Path.equals(appliedOperation.path, operation.path)) {
            return [{...operation, path: Path.previous(operation.path), offset: operation.offset + appliedOperation.position}];
        } else {
            let newPath = pathTransform(operation.path, appliedOperation)!;
            if (newPath !== operation.path) {
                return [{...operation, path: newPath}];
            } else {
                return [operation];
            }
        }
    } else {
        let newPath = pathTransform(operation.path, appliedOperation);
        if (newPath === null) return [];
        if (newPath !== operation.path) {
            return [{...operation, path: newPath}];
        } else {
            return [operation];
        }
    }
}