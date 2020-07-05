import {VersionedChangeset, VersionedResourceId, VersionedResourceVersion, VersionedResourceRevision} from "@wleroux/resource";

type SUBSCRIBE_TO_RECORD<VV> = {
    type: "subscribe";
    id: VersionedResourceId;
    version: VersionedResourceVersion;
    since: "latest" | VersionedResourceRevision
};

type UNSUBSCRIBE_FROM_RECORD = {
    type: "unsubscribe";
	id: VersionedResourceId;
	version: VersionedResourceVersion;
};

type APPLY_CHANGESET<VO> = {
    type: "apply_changeset";
	id: VersionedResourceId;
	version: VersionedResourceVersion;
    changeset: VersionedChangeset<VO>;
};

type KEEP_ALIVE = {
    type: "keep_alive";
};

export type Request<VV, VO> =
    | SUBSCRIBE_TO_RECORD<VV>
    | UNSUBSCRIBE_FROM_RECORD
    | APPLY_CHANGESET<VO>
    | KEEP_ALIVE
    ;