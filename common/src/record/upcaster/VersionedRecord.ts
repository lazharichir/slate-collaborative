import {VersionedSelection_1, VersionedValue_1} from "../../value/upcaster/VersionedValue";

export type VersionedClientId_1 = string;

export type VersionedCursor_1 = {
    clientId: VersionedClientId_1,
    selection: VersionedSelection_1
};

export type VersionedRecordVersion_1 = number;

export type VersionedRecordVersion =
    | VersionedRecordVersion_1
    ;

export type VersionedRecord_1 = {
    metadata: {
        type: "RECORD";
        version: 1;
    };
    version: VersionedRecordVersion_1;
    value: VersionedValue_1;
    cursors: {[key: string]: VersionedSelection_1};
};

export type VersionedRecord =
    | VersionedRecord_1
    ;
