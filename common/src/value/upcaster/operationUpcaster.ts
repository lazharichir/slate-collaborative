import {VersionedOperation} from "./VersionedOperation";
import {Operation} from "../action/Operation";

export function operationUpcaster(operation: VersionedOperation): Operation {
    return operation;
}
