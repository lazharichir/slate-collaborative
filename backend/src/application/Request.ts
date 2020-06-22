import {VersionedChangeset, VersionedResourceId, VersionedResourceVersion} from "resource";

type SUBSCRIBE_TO_RECORD<VV> = {
    type: "subscribe";
    id: VersionedResourceId;
    since: VersionedResourceVersion
} | {
    type: "subscribe";
    id: VersionedResourceId;
    since: "latest",
    defaultValue: VV
};

type UNSUBSCRIBE_FROM_RECORD = {
    type: "unsubscribe";
    id: VersionedResourceId;
};

type APPLY_CHANGESET<VO> = {
    type: "apply_changeset";
    id: VersionedResourceId;
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