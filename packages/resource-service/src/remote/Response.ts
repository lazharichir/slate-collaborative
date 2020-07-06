import {Changeset, Resource, ResourceId, ResourceVersion} from "@wleroux/resource";

type RESOURCE_LOADED<V, S> = {
    type: "resource_loaded";
	id: ResourceId;
	version: ResourceVersion
    resource: Resource<V, S>;
};

type CHANGESET_APPLIED<O> = {
    type: "changeset_applied";
	id: ResourceId;
	version: ResourceVersion
    changeset: Changeset<O>;
};

type KEEP_ALIVE = {
    type: "keep_alive";
};

export type Response<V, S, O> =
    | RESOURCE_LOADED<V, S>
    | CHANGESET_APPLIED<O>
    | KEEP_ALIVE
    ;
