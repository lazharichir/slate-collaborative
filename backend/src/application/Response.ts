import {Changeset, Record, RecordId} from "record";

type RECORD_LOADED<V, S> = {
    type: "record_loaded";
    id: RecordId;
    record: Record<V, S>;
};

type CHANGESET_APPLIED<O> = {
    type: "changeset_applied";
    id: RecordId;
    changeset: Changeset<O>;
};

type KEEP_ALIVE = {
    type: "keep_alive";
};

export type Response<V, S, O> =
    | RECORD_LOADED<V, S>
    | CHANGESET_APPLIED<O>
    | KEEP_ALIVE
    ;
