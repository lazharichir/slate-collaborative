import {Operation, SetNodeOperation} from "../action/Operation";
import {pathTransform} from "./pathTransformer";

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
    }

    let newPath = pathTransform(operation.path, appliedOperation);
    if (newPath === null) return [];
    if (operation.path !== newPath) {
        return [{...operation, path: newPath}]
    } else {
        return [operation];
    }
}