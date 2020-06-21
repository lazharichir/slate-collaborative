import {VersionedSlateOperation} from "slate-value";
import {VersionedClientId, VersionedRecordVersion} from "..";

type VersionedChangesetId_1 = string;

export type VersionedChangesetId =
    | VersionedChangesetId_1
    ;

type VersionedChangeset_1 = {
    metadata: {type: "CHANGESET"; version: 1;};
    id: VersionedChangesetId;
    clientId: VersionedClientId;
    version: VersionedRecordVersion;
    operations: VersionedSlateOperation[];
};

export type VersionedChangeset =
    | VersionedChangeset_1
    ;
