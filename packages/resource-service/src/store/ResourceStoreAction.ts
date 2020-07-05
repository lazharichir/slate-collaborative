import {Changeset, ClientId, Resource} from "@wleroux/resource";

export type LoadRemoteResource<V, S> = {
    type: "load_remote_resource";
    resource: Resource<V, S>;
};

export type ApplyRemoteChangeset<O> = {
    type: "apply_remote_changeset";
    changeset: Changeset<O>;
};

export type ApplyLocalOperations<O> = {
    type: "apply_local_operations";
    client: ClientId;
    operations: O[];
};

export type SendChangeset<O> = {
    type: "send_changeset";
    inProgressChangeset: Changeset<O>;
    outstandingChangesets: Changeset<O>[];
};

export type ApplyUndo = {
    type: "apply_undo";
    client: ClientId;
};

export type ApplyRedo = {
    type: "apply_redo";
    client: ClientId;
};

export type ResourceStoreAction<V, S, O> =
    | LoadRemoteResource<V, S>
    | ApplyRemoteChangeset<O>
    | ApplyLocalOperations<O>
    | ApplyUndo
    | ApplyRedo
    | SendChangeset<O>
    ;
