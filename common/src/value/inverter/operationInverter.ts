import {Operation} from "../action/Operation";
import {Path} from "../Path";
import {pathTransform} from "../transformer/pathTransformer";

export function operationInverter(operation: Operation): Operation {
    if (operation.type === "insert_text") {
        return ({
            ...operation,
            type: "remove_text",
            path: operation.path,
            offset: operation.offset,
            text: operation.text
        });
    } else if (operation.type === "remove_text") {
        return ({
            ...operation,
            type: "insert_text",
            path: operation.path,
            offset: operation.offset,
            text: operation.text
        });
    } else if (operation.type === "set_selection") {
        return ({
            ...operation,
            type: "set_selection",
            newProperties: operation.properties,
            properties: operation.newProperties
        } as Operation);
    } else if (operation.type === "insert_node") {
        return ({
            ...operation,
            type: "remove_node",
            path: operation.path,
            node: operation.node
        });
    } else if (operation.type === "remove_node") {
        return ({
            ...operation,
            type: "insert_node",
            path: operation.path,
            node: operation.node
        });
    } else if (operation.type === "move_node") {
        if (Path.equals(operation.newPath, operation.path))
            return operation;
        if (Path.isSibling(operation.newPath, operation.path))
            return ({...operation, type: "move_node", path: operation.newPath, newPath: operation.path});
        const inversePath = pathTransform(operation.newPath, operation)!
        const inverseNewPath = pathTransform(operation.path, operation)!
        return ({
            ...operation,
            type: "move_node",
            newPath: inverseNewPath,
            path: inversePath
        });
    } else if (operation.type === "set_node") {
        return ({
            ...operation,
            type: "set_node",
            path: operation.path,
            properties: operation.newProperties,
            newProperties: operation.properties
        });
    } else if (operation.type === "split_node") {
        return ({
            ...operation,
            type: 'merge_node',
            path: Path.next(operation.path),
            target: operation.target,
            position: operation.position,
            properties: operation.properties
        });
    } else if (operation.type === "merge_node") {
        return ({
            ...operation,
            type: 'split_node',
            path: Path.previous(operation.path),
            target: operation.target,
            position: operation.position,
            properties: operation.properties
        });
    }

    throw new Error(`Cannot invert operation ${JSON.stringify(operation)}`);
}