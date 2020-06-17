import {MoveNodeOperation, Operation} from "../action/Operation";
import {pathTransform} from "./pathTransformer";
import {Path} from "../Path";
import {operationInverter} from "../inverter/operationInverter";

export function moveNodeTransformer(operation: MoveNodeOperation, appliedOperation: Operation): Operation[] {
    if (appliedOperation.type === "remove_node") {
        let path = pathTransform(operation.path, appliedOperation);
        let newPath: Path | null
        if (Path.equals(appliedOperation.path, operation.newPath)) {
            newPath = operation.newPath;
        } else {
            newPath = pathTransform(operation.newPath, appliedOperation);
        }

        if (path === null || newPath === null) return [];
        if (operation.path !== path || operation.newPath !== newPath) {
            return [{...operation, path, newPath}];
        } else {
            return [operation];
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
            return [
                {...operation, path: path, newPath: newPath}
            ];
            // the node we're targeting got split!
        } else {
            let path = pathTransform(operation.path, appliedOperation)!;
            let newPath = pathTransform(operation.newPath, appliedOperation)!;
            if (operation.path !== path || operation.newPath !== newPath) {
                return [{...operation, path, newPath}];
            } else {
                return [operation];
            }
        }
    } else {
        let path = pathTransform(operation.path, appliedOperation);
        let newPath = pathTransform(operation.newPath, appliedOperation);
        if (path === null || newPath === null) return [];

        if (operation.path !== path || operation.newPath !== newPath) {
            return [{...operation, path, newPath}];
        } else {
            return [operation];
        }
    }
}