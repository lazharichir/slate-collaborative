import {Record, RecordId} from "record";
import {Changeset} from "record";
import {SlateOperation, SlateSelection, SlateValue} from "slate-value";

type RECORD_LOADED = {
    type: "record_loaded";
    id: RecordId;
    record: Record<SlateValue, SlateSelection>;
};

type CHANGESET_APPLIED = {
    type: "changeset_applied";
    id: RecordId;
    changeset: Changeset<SlateOperation>;
};

type KEEP_ALIVE = {
    type: "keep_alive";
};

export type Response =
    | RECORD_LOADED
    | CHANGESET_APPLIED
    | KEEP_ALIVE
    ;
