import {Changeset, ResourceId, ResourceVersion, ResourceRevision} from "@wleroux/resource";

type SUBSCRIBE_TO_RESOURCE<V> = {
    type: "subscribe";
    id: ResourceId;
    version: ResourceVersion;
    since: "latest" | ResourceRevision
};


type UNSUBSCRIBE_FROM_RESOURCE = {
    type: "unsubscribe";
	id: ResourceId;
	version: ResourceVersion;
};

type APPLY_CHANGESET<O> = {
    type: "apply_changeset";
	id: ResourceId;
	version: ResourceVersion;
    changeset: Changeset<O>;
};

type KEEP_ALIVE = {
    type: "keep_alive";
};

export type Request<V, O> =
    | SUBSCRIBE_TO_RESOURCE<V>
    | UNSUBSCRIBE_FROM_RESOURCE
    | APPLY_CHANGESET<O>
    | KEEP_ALIVE
    ;