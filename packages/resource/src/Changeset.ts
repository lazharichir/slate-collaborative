import { ResourceRevision, ResourceId, ResourceVersion } from "./Resource"
import { ClientId } from "./ClientId"

export type ChangesetId = string

export type Changeset<O> = {
	metadata: { type: "CHANGESET"; version: 1 }
	id: ChangesetId
	document: ResourceId
	version: ResourceVersion
	client: ClientId
	revision: ResourceRevision
	operations: O[]
}

function isMutationChangeset<O>(
	isMutationOperation: (operation: O) => boolean
): (changeset: Changeset<O>) => boolean {
	return (changeset) => changeset.operations.some(isMutationOperation)
}

export const Changeset = {
	isMutationChangeset,
}
