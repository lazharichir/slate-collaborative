import {
	Changeset,
	ClientId,
	Resource,
	ResourceId,
	ResourceVersion,
} from "@wleroux/resource"

export type LoadRemoteResource<V, S> = {
	type: "load_remote_resource"
	resource: Resource<V, S>
	document: ResourceId
	version: ResourceVersion
}

export type ApplyRemoteChangeset<O> = {
	type: "apply_remote_changeset"
	changeset: Changeset<O>
	document: ResourceId
	version: ResourceVersion
}

export type ApplyLocalOperations<O> = {
	type: "apply_local_operations"
	client: ClientId
	operations: O[]
	document: ResourceId
	version: ResourceVersion
}

export type SendChangeset<O> = {
	type: "send_changeset"
	inProgressChangeset: Changeset<O>
	outstandingChangesets: Changeset<O>[]
	document: ResourceId
	version: ResourceVersion
}

export type ApplyUndo = {
	type: "apply_undo"
	client: ClientId
	document: ResourceId
	version: ResourceVersion
}

export type ApplyRedo = {
	type: "apply_redo"
	client: ClientId
	document: ResourceId
	version: ResourceVersion
}

export type ResourceStoreAction<V, S, O> =
	| LoadRemoteResource<V, S>
	| ApplyRemoteChangeset<O>
	| ApplyLocalOperations<O>
	| ApplyUndo
	| ApplyRedo
	| SendChangeset<O>
