import {Changeset} from "..";
import changesetTransformer from "./changesetTransformer";

export function changesetsTransformer<O>(operationsTransformer: (leftOperations: O[], topOperations: O[], winBreaker: boolean) => [O[], O[]]) {
    let operationChangesetTransformer = changesetTransformer<O>(operationsTransformer);
    return (leftChangesets: Changeset<O>[], topChangesets: Changeset<O>[], winBreaker: boolean): [Changeset<O>[], Changeset<O>[]] => {
        if (leftChangesets.length === 0 || topChangesets.length === 0) return [leftChangesets, topChangesets];

        let bottomChangesets: Changeset<O>[] = [];
        let rightChangesets: Changeset<O>[] = [];
        for (const leftChangeset of leftChangesets) {
            bottomChangesets = [];
            for (const topChangeset of topChangesets) {
                bottomChangesets = [...bottomChangesets, operationChangesetTransformer(topChangeset, leftChangeset, winBreaker)];
                rightChangesets = [...rightChangesets, operationChangesetTransformer(leftChangeset, topChangeset, !winBreaker)];
            }
            topChangesets = bottomChangesets;
        }

        return [rightChangesets, bottomChangesets];
    };
}
