import {RevisionedClientId, RevisionedResourceRevision} from "..";

type RevisionedChangesetId_1 = string;

export type RevisionedChangesetId =
    | RevisionedChangesetId_1
    ;

type RevisionedChangeset_1<VO> = {
    metadata: {type: "CHANGESET"; version: 1;};
    id: RevisionedChangesetId;
    clientId: RevisionedClientId;
    revision: RevisionedResourceRevision;
    operations: VO[];
};

export type RevisionedChangeset<VO> =
    | RevisionedChangeset_1<VO>
    ;
