import {Changeset, Resource, ResourceId} from "@wleroux/resource";

type RECORD_LOADED<V, S> = {
    type: "resource_loaded";
    id: ResourceId;
    resource: Resource<V, S>;
};

type CHANGESET_APPLIED<O> = {
    type: "changeset_applied";
    id: ResourceId;
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
