import {VersionedChangeset, VersionedRecordId, VersionedRecordVersion} from "record";
import {VersionedSlateOperation} from "slate-value";

type SUBSCRIBE_TO_RECORD = {
    type: "subscribe";
    id: VersionedRecordId;
    since: "latest" | VersionedRecordVersion
};

type UNSUBSCRIBE_FROM_RECORD = {
    type: "unsubscribe";
    id: VersionedRecordId;
};

type APPLY_CHANGESET = {
    type: "apply_changeset";
    id: VersionedRecordId;
    changeset: VersionedChangeset<VersionedSlateOperation>;
};

type KEEP_ALIVE = {
    type: "keep_alive";
};

export type Request =
    | SUBSCRIBE_TO_RECORD
    | UNSUBSCRIBE_FROM_RECORD
    | APPLY_CHANGESET
    | KEEP_ALIVE
    ;