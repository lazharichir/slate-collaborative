import {VersionedResource} from "./RevisionedResource";
import {Resource} from "../Resource";

export function resourceUpcaster<VV, V, VS, S>(valueUpcaster: (versionedValue: VV) => V, selectionUpcaster: (versionedSelection: VS) => S): (versionedRecord: VersionedResource<VV, VS>) => Resource<V, S> {
    return (versionedRecord: VersionedResource<VV, VS>) => {
        let cursors: {[key: string]: S} = {};
        for (let cursor in versionedRecord.cursors) {
            cursors[cursor] = selectionUpcaster(versionedRecord.cursors[cursor])
        }
        return ({
            ...versionedRecord,
            value: valueUpcaster(versionedRecord.value),
            cursors: cursors
        });
    };
}
