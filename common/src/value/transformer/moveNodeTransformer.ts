import {MoveNodeOperation, Operation} from "../action/Operation";
import {pathTransform} from "./pathTransformer";
import {Path} from "../Path";
import {operationInverter} from "../inverter/operationInverter";

function defaultMergeNodeTransformer(operation: MoveNodeOperation, appliedOperation: Operation): Operation[] {
    let path = pathTransform(operation.path, appliedOperation);
    let newPath = pathTransform(operation.newPath, appliedOperation);
    if (path === null || newPath === null) return [];
    if (operation.path !== path || operation.newPath !== newPath) {
        return [{...operation, path, newPath}];
    } else {
        return [operation];
    }
}

export function moveNodeTransformer(operation: MoveNodeOperation, appliedOperation: Operation): Operation[] {
    if (appliedOperation.type === "remove_node") {
        if (Path.equals(appliedOperation.path, operation.path)) return [];
        if (Path.equals(appliedOperation.path, operation.newPath)) {
            let path = pathTransform(operation.path, appliedOperation);
            if (path === null) return [];
            let newPath = operation.newPath;
            if (operation.path !== path || operation.newPath !== newPath) {
                return [{...operation, path, newPath}];
            } else {
                return [operation];
            }
        }
    } else if (appliedOperation.type === "split_node") {
        if (Path.equals(appliedOperation.path, operation.path)) {
            return [
                operationInverter(appliedOperation),
                operation,
                {...appliedOperation, path: pathTransform(operation.path, operation)!}
            ];
        } else if (Path.equals(appliedOperation.path, operation.newPath)) {
            let path = pathTransform(operation.path, appliedOperation)!;
            let newPath: Path
            if (Path.equals(appliedOperation.path, operation.newPath)) {
                newPath = operation.newPath;
            } else {
                newPath = pathTransform(operation.newPath, appliedOperation)!;
            }
            return [{...operation, path: path, newPath: newPath}];
        }
    } else if (appliedOperation.type === "merge_node") {
        if (
            (Path.equals(appliedOperation.path, operation.path) && Path.equals(Path.previous(appliedOperation.path), operation.newPath)) ||
            (Path.equals(appliedOperation.path, operation.newPath) && Path.equals(Path.previous(appliedOperation.path), operation.path))
        ) return [];

        if (Path.equals(appliedOperation.path, operation.path)) return [];
        let path = pathTransform(operation.path, appliedOperation)!;
        if (Path.equals(appliedOperation.path, operation.newPath)) {
            return [{...operation, path}];
        }
        let newPath = pathTransform(operation.newPath, appliedOperation)!;
        if (Path.equals(path, newPath)) return [];
    }
    return defaultMergeNodeTransformer(operation, appliedOperation);
}