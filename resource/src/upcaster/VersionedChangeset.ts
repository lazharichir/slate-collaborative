import {VersionedClientId, VersionedResourceVersion} from "..";

type VersionedChangesetId_1 = string;

export type VersionedChangesetId =
    | VersionedChangesetId_1
    ;

type VersionedChangeset_1<VO> = {
    metadata: {type: "CHANGESET"; version: 1;};
    id: VersionedChangesetId;
    clientId: VersionedClientId;
    version: VersionedResourceVersion;
    operations: VO[];
};

export type VersionedChangeset<VO> =
    | VersionedChangeset_1<VO>
    ;
