import {Changeset} from "../action/Changeset";
import {operationsOptimizer} from "../../value/optimizer/operationsOptimizer";

export function changesetOptimizer(changeset: Changeset): Changeset {
    return ({
        ...changeset,
        operations: operationsOptimizer(changeset.operations)
    });
}