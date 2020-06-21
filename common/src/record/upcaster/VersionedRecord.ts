import {VersionedSlateSelection, VersionedSlateValue} from "slate-value";

type VersionedClientId_1 = string;

export type VersionedClientId =
    | VersionedClientId_1
    ;

type VersionedRecordVersion_1 = number;

export type VersionedRecordVersion =
    | VersionedRecordVersion_1
    ;

type VersionedRecord_1 = {
    metadata: {
        type: "RECORD";
        version: 1;
    };
    version: VersionedRecordVersion;
    value: VersionedSlateValue;
    cursors: {[key: string]: VersionedSlateSelection};
};

export type VersionedRecord =
    | VersionedRecord_1
    ;
