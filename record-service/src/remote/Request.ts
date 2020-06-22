import {VersionedChangeset, VersionedRecordId, VersionedRecordVersion} from "record";

type SUBSCRIBE_TO_RECORD = {
    type: "subscribe";
    id: VersionedRecordId;
    since: "latest" | VersionedRecordVersion
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

export type Request<VO> =
    | SUBSCRIBE_TO_RECORD
    | UNSUBSCRIBE_FROM_RECORD
    | APPLY_CHANGESET<VO>
    | KEEP_ALIVE
    ;