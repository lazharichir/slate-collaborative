import {Node} from "./Node";

export type Element = {
    children: Node[];
    [key: string]: unknown;
}
