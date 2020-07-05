import {Changeset, RevisionedChangeset} from "..";

export function changesetUpcaster<VO, O>(operationUpcaster: (revisionedOperation: VO) => O): (revisionedChangeset: RevisionedChangeset<VO>) => Changeset<O> {
    return (changeset: RevisionedChangeset<VO>): Changeset<O> => {
        return ({
            ...changeset,
            operations: changeset.operations.map(operationUpcaster)
        });
    };
}