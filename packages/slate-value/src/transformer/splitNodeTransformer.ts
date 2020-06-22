import {SlateOperation, SplitNodeOperation} from "../SlateOperation";
import {Path} from "../Path";
import {pathTransform} from "./pathTransformer";

export function splitNodeTransformer(operation: SplitNodeOperation, appliedOperation: SlateOperation, tieBreaker: boolean): SplitNodeOperation[] {
    if (appliedOperation.type === "insert_text") {
        if (!Path.equals(operation.path, appliedOperation.path)) return [operation];
        if (appliedOperation.offset <= operation.position) {
            return [{...operation, position: operation.position + appliedOperation.text.length}];
        } else {
            return [operation];
        }
    } else if (appliedOperation.type === "remove_text") {
        if (!Path.equals(operation.path, appliedOperation.path)) return [operation];
        if (appliedOperation.offset < operation.position) {
            if (appliedOperation.offset + appliedOperation.text.length < operation.position) {
                return [{...operation, position: operation.position - appliedOperation.text.length}]
            } else {
                return [{...operation, position: appliedOperation.offset}];
            }
        }
    } else if (appliedOperation.type === "split_node") {
        if (Path.equals(appliedOperation.path, operation.path)) {
            if (appliedOperation.position > operation.position || (tieBreaker && appliedOperation.position === operation.position)) {
                return [operation];
            } else {
                return [{
                    ...operation,
                    path: Path.next(operation.path),
                    position: operation.position - appliedOperation.position
                }]
            }
        } else if (Path.isParent(operation.path, appliedOperation.path)) {
            if (appliedOperation.path[appliedOperation.path.length - 1] < operation.position) {
                return [{...operation, position: operation.position + 1}]
            } else {
                return [operation];
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