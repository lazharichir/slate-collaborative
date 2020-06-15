import {Value} from "../value/Value";
import {Selection} from "../value/Selection";

export type RecordId = string;
export type RecordVersion = number;

export type Record = {
    metadata: {
        type: "RECORD";
        version: 1;
    };
    version: RecordVersion;
    value: Value;
    cursors: {[key: string]: Selection};
};

export const Record = {
    DEFAULT: {
        metadata: {type: "RECORD", version: 1},
        version: 0,
        value: Value.DEFAULT,
        cursors: {}
    } as Record
};
