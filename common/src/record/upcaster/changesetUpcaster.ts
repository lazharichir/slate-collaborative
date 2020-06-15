import {VersionedChangeset} from "./VersionedChangeset";
import {Changeset} from "../action/Changeset";

export function changesetUpcaster(value: VersionedChangeset): Changeset {
    return value;
}
