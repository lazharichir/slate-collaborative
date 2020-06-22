import {Changeset, ResourceId, ResourceVersion} from "resource";

type SUBSCRIBE_TO_RESOURCE<V> = {
    type: "subscribe";
    id: ResourceId;
    since: "latest" | ResourceVersion
};


type UNSUBSCRIBE_FROM_RESOURCE = {
    type: "unsubscribe";
    id: ResourceId;
};

type APPLY_CHANGESET<O> = {
    type: "apply_changeset";
    id: ResourceId;
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