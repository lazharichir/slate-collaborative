import {Operation} from "../../value/action/Operation";
import {RecordVersion} from "../Record";
import {randomUUID} from "../../util/randomUUID";
import {ClientId} from "../ClientId";

export type ChangesetId = string;

export const ChangesetId = {
    generate: randomUUID as () => ChangesetId
}

export type Changeset = {
    metadata: {type: "CHANGESET"; version: 1;};
    id: ChangesetId;
    clientId: ClientId;
    version: RecordVersion;
    operations: Operation[];
};
