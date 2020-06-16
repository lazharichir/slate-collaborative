import {InsertNodeOperation, Operation, RemoveNodeOperation, SetSelectionOperation} from "../action/Operation";
import {Node} from "../Node";
import {Path} from "../Path";
import {pathTransform} from "../transformer/pathTransformer";
import {getNode} from "./getNode";

export function nodeReducer(node: Node, action: Operation): Node {
    if (action.type === "set_selection") {
        return node;
    }

    if (action.type === "insert_text") {
        if (action.path.length > 0) {
            return applyNodeReducerToChildElement(node, action);
        } else if (Node.isText(node) && 0 <= action.offset && action.offset <= node.text.length) {
            return ({
                ...node,
                text: node.text.substring(0, action.offset) + action.text + node.text.substring(action.offset)
            });
        }
    } else if (action.type === "remove_text") {
        if (action.path.length > 0) {
            return applyNodeReducerToChildElement(node, action);
        } else {
            if (Node.isText(node) && 0 <= action.offset && action.offset + action.text.length <= node.text.length && node.text.substring(action.offset, action.offset + action.text.length) === action.text) {
                return ({
                    ...node,
                    text: node.text.substring(0, action.offset) + node.text.substring(action.offset + action.text.length)
                });
            }
        }
    } else if (action.type === "insert_node") {
        if (action.path.length > 1) {
            return applyNodeReducerToChildElement(node, action);
        } else if (action.path.length === 1) {
            if (Node.isElement(node) && 0 <= action.path[0] && action.path[0] <= node.children.length) {
                return ({
                    ...node,
                    children: [
                        ...node.children.slice(0, action.path[0]),
                        action.node,
                        ...node.children.slice(action.path[0])
                    ]
                });
            }
        }
    } else if (action.type === "remove_node") {
        if (action.path.length > 1) {
            return applyNodeReducerToChildElement(node, action);
        } else {
            if (Node.isElement(node) && 0 <= action.path[0] && action.path[0] < node.children.length && JSON.stringify(node.children[action.path[0]]) === JSON.stringify(action.node)) {
                return ({
                    ...node,
                    children: [
                        ...node.children.slice(0, action.path[0]),
                        ...node.children.slice(action.path[0] + 1)
                    ]
                });
            }
        }
    } else if (action.type === "set_node") {
        if (action.path.length > 0) {
            return applyNodeReducerToChildElement(node, action);
        } else {
            return ({...node, ...action.newProperties});
        }
    } else if (action.type === "split_node") {
        if (action.path.length > 1) {
            return applyNodeReducerToChildElement(node, action);
        } else if (action.path.length === 1) {
            if (Node.isElement(node) && 0 <= action.path[0] && action.path[0] < node.children.length) {
                let targetNode = node.children[action.path[0]];
                if (Node.isText(targetNode) && 0 <= action.position && action.position <= targetNode.text.length) {
                    return ({
                        ...node,
                        children: [
                            ...node.children.slice(0, action.path[0]),
                            ({
                                ...targetNode,
                                text: targetNode.text.substring(0, action.position)
                            }),
                            ({
                                ...targetNode,
                                ...action.properties,
                                text: targetNode.text.substring(action.position)
                            }),
                            ...node.children.slice(action.path[0] + 1)
                        ]
                    });
                } else if (Node.isElement(targetNode) && 0 <= action.position && action.position <= targetNode.children.length) {
                    return ({
                        ...node,
                        children: [
                            ...node.children.slice(0, action.path[0]),
                            ({
                                ...targetNode,
                                children: targetNode.children.slice(0, action.position)
                            }),
                            ({
                                ...targetNode,
                                children: targetNode.children.slice(action.position)
                            }),
                            ...node.children.slice(action.path[0] + 1)
                        ]
                    });
                }
            }
        }
    } else if (action.type === "merge_node") {
        debugger;
        if (action.path.length > 1) {
            return applyNodeReducerToChildElement(node, action);
        } else if (action.path.length === 1) {
            if (Node.isElement(node) && 0 < action.path[0] && action.path[0] < node.children.length) {
                let prevNode = node.children[action.path[0] - 1];
                let targetNode = node.children[action.path[0]];
                if (Node.isText(targetNode) && Node.isText(prevNode)) {
                    return ({
                        ...node,
                        children: [
                            ...node.children.slice(0, action.path[0] - 1),
                            ({
                                ...prevNode,
                                text: prevNode.text + targetNode.text
                            }),
                            ...node.children.slice(action.path[0] + 1)
                        ]
                    });
                } else if (Node.isElement(targetNode) && Node.isElement(prevNode)) {
                    return ({
                        ...node,
                        children: [
                            ...node.children.slice(0, action.path[0] - 1),
                            ({
                                ...prevNode,
                                children: [...prevNode.children, ...targetNode.children]
                            }),
                            ...node.children.slice(action.path[0] + 1)
                        ]
                    });
                }
            }
        }
    } else if (action.type === "move_node") {
        let targetNode = getNode(node, action.path);
        let removeNodeOperation: RemoveNodeOperation = {...action, type: "remove_node", path: action.path, node: targetNode};
        let insertNodeOperation: InsertNodeOperation = {...action, type: "insert_node", path: pathTransform(action.newPath, removeNodeOperation)!, node: targetNode};
        return nodeReducer(nodeReducer(node, removeNodeOperation), insertNodeOperation);
    }

    throw new Error(`Cannot apply operation ${JSON.stringify(action)} on ${node}`);
}

function applyNodeReducerToChildElement<T extends Node>(node: T, action: Exclude<Operation, SetSelectionOperation>): T {
    if (Node.isElement(node) && 0 <= action.path[0] && action.path[0] < node.children.length) {
        return ({
            ...node,
            children: [
                ...node.children.slice(0, action.path[0]),
                nodeReducer(node.children[action.path[0]], {...action, path: action.path.slice(1)}),
                ...node.children.slice(action.path[0] + 1)
            ]
        });
    } else throw new Error(`Cannot apply operation ${JSON.stringify(action)} on ${node}`);
}
