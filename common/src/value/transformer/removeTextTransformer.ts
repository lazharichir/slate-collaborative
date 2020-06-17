import {Operation, RemoveTextOperation} from "../action/Operation";
import {Path} from "../Path";
import {pathTransform} from "./pathTransformer";

export function removeTextTransformer(operation: RemoveTextOperation, appliedOperation: Operation): RemoveTextOperation[] {
    if (appliedOperation.type === "set_selection" || appliedOperation.type === "set_node") return [operation];

    if (appliedOperation.type === "insert_text") {
        if (!Path.equals(appliedOperation.path, operation.path)) return [operation];
        if (operation.offset + operation.text.length <= appliedOperation.offset) {
            return [operation];
        } else if (operation.offset >= appliedOperation.offset) {
            return [{...operation, offset: operation.offset + appliedOperation.text.length}]
        } else {
            return [{...operation, text: operation.text.substring(0, appliedOperation.offset - operation.offset) + appliedOperation.text + operation.text.substring(appliedOperation.offset - operation.offset) }]
        }
    } else if (appliedOperation.type === "remove_text") {
        if (!Path.equals(appliedOperation.path, operation.path)) return [operation];
        if (appliedOperation.offset + appliedOperation.text.length <= operation.offset) {
            return [{...operation, offset: operation.offset - appliedOperation.text.length}];
        } else if (appliedOperation.offset <= operation.offset && operation.offset <= appliedOperation.offset + appliedOperation.text.length) {
            if (operation.offset + operation.text.length <= appliedOperation.offset + appliedOperation.text.length) {
                return [];
            } else {
                return [{...operation, offset: appliedOperation.offset, text: operation.text.substring(appliedOperation.offset - operation.offset + appliedOperation.text.length)}];
            }
        } else if (appliedOperation.offset > operation.offset) {
            if (appliedOperation.offset > operation.offset + operation.text.length) {
                return [operation];
            } else if (appliedOperation.offset + appliedOperation.text.length < operation.offset + operation.text.length) {
                return [{...operation, text: operation.text.substring(0, appliedOperation.offset - operation.offset) + operation.text.substring(appliedOperation.offset + appliedOperation.text.length - operation.offset)}];
            } else {
                return [{...operation, text: operation.text.substring(0, appliedOperation.offset - operation.offset)}]
            }
        } else {
            return [operation];
        }
    } else if (appliedOperation.type === "split_node") {
        if (Path.equals(appliedOperation.path, operation.path)) {
            if (operation.offset + operation.text.length <= appliedOperation.position) {
                return [operation];
            } else if (operation.offset >= appliedOperation.position) {
                return [{...operation, path: Path.next(operation.path), offset: operation.offset - appliedOperation.position}]
            } else {
                return [
                    {...operation, text: operation.text.substring(0, appliedOperation.position - operation.offset) },
                    {...operation, path: Path.next(operation.path), offset: 0, text: operation.text.substring(appliedOperation.position - operation.offset)}
                ]
            }
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
}