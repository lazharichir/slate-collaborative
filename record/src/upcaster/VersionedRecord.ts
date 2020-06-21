type VersionedRecordId_1 = string;

export type VersionedRecordId =
    | VersionedRecordId_1
    ;

type VersionedClientId_1 = string;

export type VersionedClientId =
    | VersionedClientId_1
    ;

type VersionedRecordVersion_1 = number;

export type VersionedRecordVersion =
    | VersionedRecordVersion_1
    ;

type VersionedRecord_1<VV, VS> = {
    metadata: {
        type: "RECORD";
        version: 1;
    };
    version: VersionedRecordVersion;
    value: VV;
    cursors: {[key: string]: VS};
};

export type VersionedRecord<VV, VS> =
    | VersionedRecord_1<VV, VS>
    ;
