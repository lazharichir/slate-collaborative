import {SlateSelection, SlateValue} from "slate-value";

export type RecordId = string;
export type RecordVersion = number;

export type Record = {
    metadata: {
        type: "RECORD";
        version: 1;
    };
    version: RecordVersion;
    value: SlateValue;
    cursors: {[key: string]: SlateSelection};
};

export const Record = {
    DEFAULT: {
        metadata: {type: "RECORD", version: 1},
        version: 0,
        value: SlateValue.DEFAULT,
        cursors: {}
    } as Record
};
