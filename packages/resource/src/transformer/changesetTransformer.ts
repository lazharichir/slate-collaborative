import {Changeset} from "..";

export default function changesetTransformer<O>(operationsTransformer: (leftOperations: O[], topOperations: O[], winBreaker: boolean) => [O[], O[]]): (changeset: Changeset<O>, appliedChangeset: Changeset<O>, winBreaker: boolean) => Changeset<O> {
    return (changeset: Changeset<O>, appliedChangeset: Changeset<O>, winBreaker: boolean): Changeset<O> => {
        if (changeset.revision !== appliedChangeset.revision) {
            throw new Error(`Cannot transform changeset ${JSON.stringify(changeset)} using ${JSON.stringify(appliedChangeset)}`)
        }

        return {
            ...changeset,
            operations: operationsTransformer(changeset.operations, appliedChangeset.operations, winBreaker)[0],
            revision: changeset.revision + 1
        };
    }
}