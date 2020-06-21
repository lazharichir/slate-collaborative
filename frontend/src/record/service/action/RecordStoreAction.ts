import {SlateOperation} from "slate-value";
import {SlateChangeset, SlateRecord} from "common";
import {ClientId} from "record";

export type LoadRemoteRecord = {
    type: "load_remote_record";
    record: SlateRecord;
};

export type ApplyRemoteChangeset = {
    type: "apply_remote_changeset";
    changeset: SlateChangeset;
};

export type ApplyLocalOperations = {
    type: "apply_local_operations";
    clientId: ClientId;
    operations: SlateOperation[];
};

export type SendChangeset = {
    type: "send_changeset";
    inProgressChangeset: SlateChangeset;
    outstandingChangesets: SlateChangeset[];
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
