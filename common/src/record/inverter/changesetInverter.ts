import {Changeset} from "../action/Changeset";
import {operationInverter} from "../../value/inverter/operationInverter";

export function changesetInverter(changeset: Changeset): Changeset {
    return ({
        ...changeset,
        operations: [...changeset.operations].reverse().map(operationInverter)
    });
}
