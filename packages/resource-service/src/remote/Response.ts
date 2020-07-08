import {Changeset, Resource, ResourceId, ResourceVersion} from "@wleroux/resource";

export type RESOURCE_LOADED<V, S> = {
    type: "resource_loaded";
	document: ResourceId;
	version: ResourceVersion
    resource: Resource<V, S>;
};

export type CHANGESET_APPLIED<O> = {
    type: "changeset_applied";
	document: ResourceId;
	version: ResourceVersion
    changeset: Changeset<O>;
};

export type KEEP_ALIVE = {
    type: "keep_alive";
};

export type Response<V, S, O> =
    | RESOURCE_LOADED<V, S>
    | CHANGESET_APPLIED<O>
    | KEEP_ALIVE
    ;
