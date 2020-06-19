import {Operation, SplitNodeOperation} from "../action/Operation";
import {Path} from "../Path";
import {pathTransform} from "./pathTransformer";

export function splitNodeTransformer(operation: SplitNodeOperation, appliedOperation: Operation): SplitNodeOperation[] {
    if (appliedOperation.type === "insert_text") {
        if (Path.equals(operation.path, appliedOperation.path)) {
            if (appliedOperation.offset < operation.position) {
                return [{...operation, position: operation.position + appliedOperation.text.length}];
            } else {
                return [operation];
            }
        } else return [operation];
    } else if (appliedOperation.type === "remove_text") {
        if (Path.equals(operation.path, appliedOperation.path)) {
            if (appliedOperation.offset < operation.position) {
                if (appliedOperation.offset + appliedOperation.text.length < operation.position) {
                    return [{...operation, position: operation.position - appliedOperation.text.length}]
                } else {
                    return [{...operation, position: appliedOperation.offset}];
                }
            }
        } else {
            return [operation];
        }
    } else if (appliedOperation.type === "split_node") {
        if (Path.equals(appliedOperation.path, operation.path)) {
            if (appliedOperation.position > operation.position) {
                return [operation];
            } else {
                return [{
                    ...operation,
                    path: Path.next(operation.path),
                    position: operation.position - appliedOperation.position
                }]
            }
        } else {
            let newPath = pathTransform(operation.path, appliedOperation)!;
            if (operation.path !== newPath) {
                return [{...operation, path: newPath}];
            } else {
                return [operation];
            }
        }
    } else if (appliedOperation.type === "merge_node") {
        if (Path.equals(appliedOperation.path, operation.path)) {
            return [{...operation, path: Path.previous(operation.path), position: operation.position + appliedOperation.position}];
        } else {
            let newPath = pathTransform(operation.path, appliedOperation)!;
            if (operation.path !== newPath) {
                return [{...operation, path: newPath}];
            } else {
                return [operation];
            }
        }
    } else {
        let newPath = pathTransform(operation.path, appliedOperation);
        if (newPath === null) return [];
        if (operation.path !== newPath) {
            return [{...operation, path: newPath}];
        } else {
            return [operation];
        }
    }
    return [operation];
}