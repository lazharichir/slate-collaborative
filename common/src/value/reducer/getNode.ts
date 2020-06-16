import {Node} from "../Node";
import {Path} from "../Path";

export function getNode(node: Node, path: Path): Node {
    for (let i = 0; i < path.length; i ++) {
        if (Node.isElement(node) && 0 <= path[i] && path[i] < node.children.length) {
            node = node.children[path[i]];
        } else throw new Error(`Could not retrieve node at path ${JSON.stringify(path)} on ${JSON.stringify(node)}`)
    }
    return node;
}
