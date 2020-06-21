import {MoveNodeOperation, SlateOperation} from "../action/SlateOperation";
import {pathTransform} from "./pathTransformer";
import {Path} from "../Path";
import {slateOperationInverter} from "..";

export function moveNodeTransformer(operation: MoveNodeOperation, appliedOperation: SlateOperation, _: boolean): SlateOperation[] {
    if (appliedOperation.type === "remove_node") {
        if (Path.equals(appliedOperation.path, operation.path)) return [];
        if (Path.equals(appliedOperation.path, operation.newPath)) {
            let path = pathTransform(operation.path, appliedOperation)!;
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
                slateOperationInverter(appliedOperation),
                operation,
                {...appliedOperation, path: pathTransform(operation.path, operation)!}
            ];
        }
    } else if (appliedOperation.type === "merge_node") {
        if (
            (Path.equals(appliedOperation.path, operation.path) && Path.equals(Path.previous(appliedOperation.path), operation.newPath)) ||
            (Path.equals(appliedOperation.path, operation.newPath) && Path.equals(Path.previous(appliedOperation.path), operation.path))
        ) return [];
        if (Path.equals(appliedOperation.path, operation.path)) return [];
        if (Path.equals(appliedOperation.path, operation.newPath)) {
            let path = pathTransform(operation.path, appliedOperation)!;
            return [{...operation, path}];
        }
    }

    let path = pathTransform(operation.path, appliedOperation)!;
    let newPath = pathTransform(operation.newPath, appliedOperation)!;
    if (operation.path !== path || operation.newPath !== newPath) {
        return [{...operation, path, newPath}];
    } else {
        return [operation];
    }
}