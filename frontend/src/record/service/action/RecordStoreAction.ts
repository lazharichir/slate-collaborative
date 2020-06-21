import {Changeset} from "common/record/action/Changeset";
import {Record} from "common/record/Record";
import {ClientId} from "common/record/ClientId";
import {SlateOperation} from "slate-value";

export type LoadRemoteRecord = {
    type: "load_remote_record";
    record: Record;
};

export type ApplyRemoteChangeset = {
    type: "apply_remote_changeset";
    changeset: Changeset;
};

export type ApplyLocalOperations = {
    type: "apply_local_operations";
    clientId: ClientId;
    operations: SlateOperation[];
};

export type SendChangeset = {
    type: "send_changeset";
    inProgressChangeset: Changeset;
    outstandingChangesets: Changeset[];
};

export type ApplyUndo = {
    type: "apply_undo";
    clientId: ClientId;
};

export type ApplyRedo = {
    type: "apply_redo";
    clientId: ClientId;
};

export type RecordStoreAction =
    | LoadRemoteRecord
    | ApplyRemoteChangeset
    | ApplyLocalOperations
    | ApplyUndo
    | ApplyRedo
    | SendChangeset
    ;
