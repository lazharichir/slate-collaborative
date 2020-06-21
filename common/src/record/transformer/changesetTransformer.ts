import {Changeset} from "..";
import {slateOperationsTransformer} from "slate-value";

export default function changesetTransformer(changeset: Changeset, appliedChangeset: Changeset, winBreaker: boolean): Changeset {
    if (changeset.version !== appliedChangeset.version) {
        throw new Error(`Cannot transform changeset ${JSON.stringify(changeset)} using ${JSON.stringify(appliedChangeset)}`)
    }

    return {
        ...changeset,
        operations: slateOperationsTransformer(changeset.operations, appliedChangeset.operations, winBreaker)[0],
        version: changeset.version + 1
    };
}