import {VersionedChangeset, VersionedRecordId, VersionedRecordVersion} from "record";

type SUBSCRIBE_TO_RECORD<VV> = {
    type: "subscribe";
    id: VersionedRecordId;
    since: VersionedRecordVersion
} | {
    type: "subscribe";
    id: VersionedRecordId;
    since: "latest",
    defaultValue: VV
};

type UNSUBSCRIBE_FROM_RECORD = {
    type: "unsubscribe";
    id: VersionedRecordId;
};

type APPLY_CHANGESET<VO> = {
    type: "apply_changeset";
    id: VersionedRecordId;
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