import {RemoveNodeOperation, SlateOperation} from "../action/SlateOperation";
import {Path} from "../Path";
import {nodeReducer} from "../reducer/nodeReducer";
import {pathTransform} from "./pathTransformer";
import {getNode} from "../reducer/getNode";
import {Node} from "../Node";
import {slateOperationInverter} from "..";

export function removeNodeTransformer(operation: RemoveNodeOperation, appliedOperation: SlateOperation, _: boolean): SlateOperation[] {
    if (appliedOperation.type === "set_selection") {
        return [operation];
    } else if (appliedOperation.type === "insert_text" || appliedOperation.type === "remove_text") {
        if (Path.isAncestor(operation.path, appliedOperation.path) || Path.equals(appliedOperation.path, operation.path)) {
            let newNode = nodeReducer(operation.node, {...appliedOperation, path: appliedOperation.path.slice(operation.path.length)});
            return [{...operation, node: newNode}];
        }
    } else if (appliedOperation.type === "move_node") {
        if (Path.isAncestor(operation.path, appliedOperation.path) && Path.isAncestor(operation.path, appliedOperation.newPath)) {
            let newNode = nodeReducer(operation.node, {...appliedOperation, path: appliedOperation.path.slice(operation.path.length), newPath: appliedOperation.newPath.slice(operation.path.length)});
            return [{...operation, node: newNode}];
        } else if (Path.isAncestor(operation.path, appliedOperation.path)) {
            let newPath = pathTransform(operation.path, appliedOperation)!;
            let newNode = nodeReducer(operation.node, {...appliedOperation, type: "remove_node", path: appliedOperation.path.slice(operation.path.length), node: getNode(
                    operation.node,
                    appliedOperation.path.slice(operation.path.length)
                )});
            return [{...operation, path: newPath, node: newNode}];
        } else if (Path.isAncestor(operation.path, appliedOperation.newPath)) {
            let newPath = pathTransform(operation.path, appliedOperation)!;
            return [{...operation, path: newPath}];
        }
    } else if (appliedOperation.type === "split_node") {
        if (Path.equals(appliedOperation.path, operation.path)) {
            if (Node.isText(operation.node)) {
                return ([
                    {...operation, node: {...operation.node, text: operation.node.text.substring(0, appliedOperation.position)}},
                    {...operation, path: Path.next(operation.path), node: {...operation.node, ...appliedOperation.properties, text: operation.node.text.substring(appliedOperation.position)}}
                ]);
            } else if (Node.isElement(operation.node)) {
                return ([
                    {...operation, node: {...operation.node, children: operation.node.children.slice(0, appliedOperation.position)}},
                    {...operation, path: Path.next(operation.path), node: {...operation.node, ...appliedOperation.properties, children: operation.node.children.slice(appliedOperation.position)}}
                ])
            }
        } else if (Path.isAncestor(operation.path, appliedOperation.path)) {
            let newNode = nodeReducer(operation.node, {...appliedOperation, path: appliedOperation.path.slice(operation.path.length)});
            return [{...operation, node: newNode}];
        } else {
            let newPath = pathTransform(operation.path, appliedOperation)!
            if (newPath !== operation.path) {
                return [{...operation, path: newPath}];
            } else {
                return [operation];
            }
        }
    } else if (appliedOperation.type === "merge_node") {
        if (Path.equals(appliedOperation.path, operation.path) || Path.equals(Path.previous(appliedOperation.path), operation.path)) {
            return [slateOperationInverter(appliedOperation), operation];
        }
    }

    if (Path.isAncestor(operation.path, appliedOperation.path)) {
        let newNode = nodeReducer(operation.node, {...appliedOperation, path: appliedOperation.path.slice(operation.path.length)});
        return [{...operation, node: newNode}];
    } else {
        let newPath = pathTransform(operation.path, appliedOperation)
        if (newPath === null) return [];
        if (newPath !== operation.path) {
            return [{...operation, path: newPath}];
        } else {
            return [operation];
        }
    }
}