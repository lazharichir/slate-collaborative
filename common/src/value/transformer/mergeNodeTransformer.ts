import {MergeNodeOperation, Operation} from "../action/Operation";
import {Path} from "../Path";
import {pathTransform} from "./pathTransformer";

export function mergeNodeTransformer(operation: MergeNodeOperation, appliedOperation: Operation): Operation[] {
    if (appliedOperation.type === "insert_text") {
        if (Path.equals(Path.next(appliedOperation.path), operation.path)) {
            return [{...operation, position: operation.position + appliedOperation.text.length}];
        }
    } else if (appliedOperation.type === "remove_text") {
        if (Path.equals(Path.next(appliedOperation.path), operation.path)) {
            return [{...operation, position: operation.position - appliedOperation.text.length}];
        }
    } else if (appliedOperation.type === "insert_node") {
        if (Path.equals(appliedOperation.path, operation.path)) {
            return [{type: "move_node", path: Path.next(operation.path), newPath: operation.path}, operation]
        }
    } else if (appliedOperation.type === "remove_node") {
        if (Path.equals(Path.next(appliedOperation.path), operation.path) || Path.equals(appliedOperation.path, operation.path)) {
            return [];
        }
    } else if (appliedOperation.type === "split_node") {
        if (Path.equals(appliedOperation.path, operation.path)) {
            return [operation];
        }
    } else if (appliedOperation.type === "merge_node") {
        if (Path.equals(appliedOperation.path, operation.path)) {
            return [];
        } else if (Path.equals(appliedOperation.path, Path.previous(operation.path))) {
            return [{...operation, path: Path.previous(operation.path), position: appliedOperation.position + operation.position}]
        }
    } else if (appliedOperation.type === "move_node") {
        let path = pathTransform(operation.path, appliedOperation)!;
        let pathPrev = pathTransform(Path.previous(operation.path), appliedOperation)!;
        if (Path.equals(path, Path.next(pathPrev))) {
            return (path === operation.path) ? [operation] : [{...operation, path}];
        } else {
            if (Path.endsBefore(path, pathPrev)) {
                return [
                    {type: "move_node", path, newPath: pathPrev},
                    {...operation, path: pathPrev}
                ];
            } else {
                return [
                    {type: "move_node", path, newPath: Path.next(pathPrev)},
                    {...operation, path: Path.next(pathPrev)}
                ];
            }
        }
    }

    let newPath = pathTransform(operation.path, appliedOperation);
    if (newPath === null) return [];
    if (operation.path !== newPath) {
        return [{...operation, path: newPath}];
    } else {
        return [operation];
    }
}