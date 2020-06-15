import {VersionedOperation_1} from "../../value/upcaster/VersionedOperation";
import {VersionedRecordVersion_1} from "../../value/upcaster/VersionedValue";
import {VersionedClientId_1} from "./VersionedRecord";

export type VersionedChangesetId_1 = string;
export type VersionedChangeset_1 = {
    metadata: {type: "CHANGESET"; version: 1;};
    id: VersionedChangesetId_1;
    clientId: VersionedClientId_1;
    version: VersionedRecordVersion_1;
    operations: VersionedOperation_1[];
};

export type VersionedChangeset =
    | VersionedChangeset_1
    ;
