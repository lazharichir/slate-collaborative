import {RecordVersion} from "../Record";
import {randomUUID} from "../../util/randomUUID";
import {ClientId} from "../ClientId";
import {SlateOperation} from "slate-value";

export type ChangesetId = string;

export const ChangesetId = {
    generate: randomUUID as () => ChangesetId,
}

export type Changeset = {
    metadata: {type: "CHANGESET"; version: 1;};
    id: ChangesetId;
    clientId: ClientId;
    version: RecordVersion;
    operations: SlateOperation[];
};

function isMutationChangeset(changeset: Changeset){
    return changeset.operations.some(SlateOperation.isMutationOperation);
}

export const Changeset = {
    isMutationChangeset
};
