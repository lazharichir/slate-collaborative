import {VersionedClientId, VersionedResourceRevision} from "..";

type VersionedChangesetId_1 = string;

export type VersionedChangesetId =
    | VersionedChangesetId_1
    ;

type VersionedChangeset_1<VO> = {
    metadata: {type: "CHANGESET"; version: 1;};
    id: VersionedChangesetId;
    clientId: VersionedClientId;
    revision: VersionedResourceRevision;
    operations: VO[];
};

export type VersionedChangeset<VO> =
    | VersionedChangeset_1<VO>
    ;
