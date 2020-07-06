export type ResourceId = string;
export type ResourceVersion = string;
export type ResourceRevision = number;

export type Resource<V, S> = {
    metadata: {
        type: "RESOURCE";
        version: 1;
	};
    revision: ResourceRevision;
    value: V;
    cursors: {[key: string]: S};
};

function defaultResource<V, S>(value: V): Resource<V, S> {
    return ({
        metadata: {type: "RESOURCE", version: 1},
        revision: 0,
        value: value,
        cursors: {}
    });
}

export const Resource = {
    DEFAULT: defaultResource
};
