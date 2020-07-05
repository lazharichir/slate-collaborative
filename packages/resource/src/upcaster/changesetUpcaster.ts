import {Changeset, VersionedChangeset} from "..";

export function changesetUpcaster<VO, O>(operationUpcaster: (versionedOperation: VO) => O): (versionedChangeset: VersionedChangeset<VO>) => Changeset<O> {
    return (changeset: VersionedChangeset<VO>): Changeset<O> => {
        return ({
            ...changeset,
            operations: changeset.operations.map(operationUpcaster)
        });
    };
}