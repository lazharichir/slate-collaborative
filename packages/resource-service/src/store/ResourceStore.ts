import {Changeset, Resource} from "@wleroux/resource";

export type ResourceStore<V, S, O> = {
    remoteResource: Resource<V, S>,
    unprocessedChangesets: Changeset<O>[],
    localResource: Resource<V, S>,
    inProgressChangeset: null | Changeset<O>,
    outstandingChangesets: Changeset<O>[],
    undoQueue: Changeset<O>[],
    redoQueue: Changeset<O>[]
};

function defaultResourceStore<V, S, O>(defaultValue: V): ResourceStore<V, S, O> {
    return ({
        remoteResource: {
            metadata: {type: "RESOURCE", version: 1},
            version: 0,
            value: defaultValue,
            cursors: {}
        },
        unprocessedChangesets: [],
        localResource: {
            metadata: {type: "RESOURCE", version: 1},
            version: 0,
            value: defaultValue,
            cursors: {}
        },
        inProgressChangeset: null,
        outstandingChangesets: [],
        undoQueue: [],
        redoQueue: []
    } as ResourceStore<V, S, O>)
}

export const ResourceStore = {
    defaultResourceStore
};
