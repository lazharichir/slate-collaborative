import {Record, RecordId} from "../record/Record";
import {Changeset} from "../record";

type RECORD_LOADED = {
    type: "record_loaded";
    id: RecordId;
    record: Record;
};

type CHANGESET_APPLIED = {
    type: "changeset_applied";
    id: RecordId;
    changeset: Changeset;
};

type KEEP_ALIVE = {
    type: "keep_alive";
};

export type Response =
    | RECORD_LOADED
    | CHANGESET_APPLIED
    | KEEP_ALIVE
    ;
