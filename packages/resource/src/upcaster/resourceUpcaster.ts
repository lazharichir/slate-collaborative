import {RevisionedResource} from "./RevisionedResource";
import {Resource} from "../Resource";

export function resourceUpcaster<VV, V, VS, S>(valueUpcaster: (revisionedValue: VV) => V, selectionUpcaster: (revisionedSelection: VS) => S): (revisionedRecord: RevisionedResource<VV, VS>) => Resource<V, S> {
    return (revisionedRecord: RevisionedResource<VV, VS>) => {
        let cursors: {[key: string]: S} = {};
        for (let cursor in revisionedRecord.cursors) {
            cursors[cursor] = selectionUpcaster(revisionedRecord.cursors[cursor])
        }
        return ({
            ...revisionedRecord,
            value: valueUpcaster(revisionedRecord.value),
            cursors: cursors
        });
    };
}
