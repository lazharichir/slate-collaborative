import {Changeset} from "..";
import changesetTransformer from "./changesetTransformer";

export function changesetsTransformer(leftChangesets: Changeset[], topChangesets: Changeset[]): [Changeset[], Changeset[]] {
    if (leftChangesets.length === 0 || topChangesets.length === 0) return [leftChangesets, topChangesets];

    let bottomChangesets: Changeset[] = [];
    let rightChangesets: Changeset[] = [];
    for (const leftChangeset of leftChangesets) {
        bottomChangesets = [];
        for (const topChangeset of topChangesets) {
            bottomChangesets = [...bottomChangesets, changesetTransformer(topChangeset, leftChangeset, true)];
            rightChangesets = [...rightChangesets, changesetTransformer(leftChangeset, topChangeset, false)];
        }
        topChangesets = bottomChangesets;
    }

    return [rightChangesets, bottomChangesets];
}
