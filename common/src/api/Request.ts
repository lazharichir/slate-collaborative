import {RecordId, RecordVersion} from "../record/Record";
import {Changeset} from "../record";

type SUBSCRIBE_TO_RECORD = {
    type: "subscribe";
    id: RecordId;
    since: "latest" | RecordVersion
};

type UNSUBSCRIBE_FROM_RECORD = {
    type: "unsubscribe";
    id: RecordId;
};

type APPLY_CHANGESET = {
    type: "apply_changeset";
    id: RecordId;
    changeset: Changeset;
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