import {Changeset} from "../action/Changeset";
import {operationTransformer} from "../../value/transformer/operationTransformer";

export default function changesetTransformer(changeset: Changeset, appliedChangeset: Changeset): Changeset {
    return ({
        ...changeset,
        operations: appliedChangeset.operations.reduce(
            (operations, appliedOperation) =>
                operations.flatMap(operation => operationTransformer(operation, appliedOperation)),
            changeset.operations
        ),
        version: changeset.version + 1
    })
}