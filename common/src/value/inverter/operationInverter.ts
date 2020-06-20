import {Operation} from "../action/Operation";
import {Path} from "../Path";
import {pathTransform} from "../transformer/pathTransformer";

export function operationInverter(operation: Operation): Operation {
    switch (operation.type) {
        case "set_selection": return ({
            ...operation,
            type: "set_selection",
            newProperties: operation.properties,
            properties: operation.newProperties
        } as Operation);
        case "insert_text": return ({
            ...operation,
            type: "remove_text",
            path: operation.path,
            offset: operation.offset,
            text: operation.text
        });
        case "remove_text": return ({
            ...operation,
            type: "insert_text",
            path: operation.path,
            offset: operation.offset,
            text: operation.text
        });
        case "insert_node": return ({
            ...operation,
            type: "remove_node",
            path: operation.path,
            node: operation.node
        });
        case "remove_node": return ({
            ...operation,
            type: "insert_node",
            path: operation.path,
            node: operation.node
        });
        case "move_node": {
            if (Path.equals(operation.newPath, operation.path))
                return operation;
            if (Path.isSibling(operation.newPath, operation.path))
                return ({...operation, type: "move_node", path: operation.newPath, newPath: operation.path});
            return ({
                ...operation,
                type: "move_node",
                newPath: pathTransform(Path.next(operation.path), operation)!,
                path: pathTransform(operation.path, operation)!
            });
        }
        case "set_node": return ({
            ...operation,
            type: "set_node",
            path: operation.path,
            properties: operation.newProperties,
            newProperties: operation.properties
        });
        case "split_node": return ({
            ...operation,
            type: 'merge_node',
            path: Path.next(operation.path),
            position: operation.position,
            properties: operation.properties
        });
        case "merge_node": return ({
            ...operation,
            type: 'split_node',
            path: Path.previous(operation.path),
            position: operation.position,
            properties: operation.properties
        });
    }
}