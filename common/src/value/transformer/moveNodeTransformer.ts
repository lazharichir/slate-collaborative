import {MoveNodeOperation, Operation} from "../action/Operation";
import {pathTransform} from "./pathTransformer";
import {Path} from "../Path";

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