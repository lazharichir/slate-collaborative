import {VersionedSlateOperation} from "./VersionedSlateOperation";
import {SlateOperation} from "..";

export function slateOperationUpcaster(operation: VersionedSlateOperation): SlateOperation {
    return operation;
}
