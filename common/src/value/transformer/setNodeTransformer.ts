import {Operation, SetNodeOperation} from "../action/Operation";
import {pathTransform} from "./pathTransformer";
import {Path} from "../Path";

export function setNodeTransformer(operation: SetNodeOperation, appliedOperation: Operation): SetNodeOperation[] {
    if (appliedOperation.type === "set_node") {
        let properties = operation.properties;
        for (let key in properties) {
            if (appliedOperation.newProperties[key]) {
                properties = {...properties, [key]: appliedOperation.newProperties[key]};
            }
        }
        if (properties !== operation.properties) {
            return [{...operation, properties}];
        } else {return [operation]}
    } else if (appliedOperation.type === "split_node") {
        if (Path.equals(appliedOperation.path, operation.path)) {
            let properties = operation.properties;
            for (let key in properties) {
                if (appliedOperation.properties[key]) {
                    properties = {...properties, [key]: appliedOperation.properties[key]};
                }
            }
            return [
                {...operation},
                {...operation, path: Path.next(operation.path), properties}
            ];
        } else {
            let newPath = pathTransform(operation.path, appliedOperation)!;
            if (operation.path !== newPath) {
                return [{...operation, path: newPath}]
            } else {
                return [operation];
            }
        }
    } else if (appliedOperation.type === "merge_node") {
        if (Path.equals(appliedOperation.path, operation.path)) {
            return [];
        } else {
            let newPath = pathTransform(operation.path, appliedOperation)!;
            if (operation.path !== newPath) {
                return [{...operation, path: newPath}]
            } else {
                return [operation];
            }
        }
    }

    let newPath = pathTransform(operation.path, appliedOperation);
    if (newPath === null) return [];
    if (operation.path !== newPath) {
        return [{...operation, path: newPath}]
    } else {
        return [operation];
    }
}