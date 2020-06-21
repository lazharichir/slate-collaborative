import {Changeset} from "..";
import {slateOperationInverter} from "slate-value";

export function changesetInverter(changeset: Changeset): Changeset {
    return ({
        ...changeset,
        operations: [...changeset.operations].reverse().map(slateOperationInverter)
    });
}
