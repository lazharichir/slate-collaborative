import {VersionedRecord} from "./VersionedRecord";
import {Record} from "../Record";

export function recordUpcaster<VV, V, VS, S>(valueUpcaster: (versionedValue: VV) => V, selectionUpcaster: (versionedSelection: VS) => S): (versionedRecord: VersionedRecord<VV, VS>) => Record<V, S> {
    return (versionedRecord: VersionedRecord<VV, VS>) => {
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
