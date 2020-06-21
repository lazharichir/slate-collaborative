import {Changeset} from "..";

export function changesetsOptimizer<O>(operationsOptimizer: (operation: O[]) => O[]): (changesets: Changeset<O>[]) => Changeset<O>[] {
    return (changesets: Changeset<O>[]) => changesets.map(changeset => ({...changeset, operations: operationsOptimizer(changeset.operations)}));
}