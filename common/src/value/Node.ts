import {Element} from "./Element";
import {Text} from "./Text";

export type Node = Element | Text;

function isElement(node: Node): node is Element {
    return node.children !== undefined;
}
function isText(node: Node): node is Text {
    return node.text !== undefined;
}

export const Node = {
    isElement,
    isText
}