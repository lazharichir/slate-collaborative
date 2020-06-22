import {Changeset, ClientId} from "record";
import {Record} from "record";

export type LoadRemoteRecord<V, S> = {
    type: "load_remote_record";
    record: Record<V, S>;
};

export type ApplyRemoteChangeset<O> = {
    type: "apply_remote_changeset";
    changeset: Changeset<O>;
};

export type ApplyLocalOperations<O> = {
    type: "apply_local_operations";
    clientId: ClientId;
    operations: O[];
};

export type SendChangeset<O> = {
    type: "send_changeset";
    inProgressChangeset: Changeset<O>;
    outstandingChangesets: Changeset<O>[];
};

export type ApplyUndo = {
    type: "apply_undo";
    clientId: ClientId;
};

export type ApplyRedo = {
    type: "apply_redo";
    clientId: ClientId;
};

export type RecordStoreAction<V, S, O> =
    | LoadRemoteRecord<V, S>
    | ApplyRemoteChangeset<O>
    | ApplyLocalOperations<O>
    | ApplyUndo
    | ApplyRedo
    | SendChangeset<O>
    ;
