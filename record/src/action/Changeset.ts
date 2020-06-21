import {RecordVersion} from "../Record";
import {randomUUID} from "./randomUUID";
import {ClientId} from "../ClientId";

export type ChangesetId = string;

export const ChangesetId = {
    generate: randomUUID as () => ChangesetId,
}

export type Changeset<O> = {
    metadata: {type: "CHANGESET"; version: 1;};
    id: ChangesetId;
    clientId: ClientId;
    version: RecordVersion;
    operations: O[];
};

function isMutationChangeset<O>(isMutationOperation: (operation: O) => boolean): (changeset: Changeset<O>) => boolean {
    return (changeset) => changeset.operations.some(isMutationOperation);
}

export const Changeset = {
    isMutationChangeset
};
