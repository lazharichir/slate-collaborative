import {Changeset} from "..";

export function changesetInverter<O>(operationInverter: (operation: O) => O): (changeset: Changeset<O>) => Changeset<O> {
    return (changeset) => ({...changeset, operations: changeset.operations.slice().reverse().map(operationInverter)});
};
