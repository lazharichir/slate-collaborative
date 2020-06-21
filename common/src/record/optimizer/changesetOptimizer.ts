import {Changeset} from "..";
import {slateOperationsOptimizer} from "slate-value";

export function changesetOptimizer(changeset: Changeset): Changeset {
    return ({
        ...changeset,
        operations: slateOperationsOptimizer(changeset.operations)
    });
}