import {VersionedSlateSelection} from "./VersionedSlateValue";
import {SlateSelection} from "../SlateSelection";

export function slateSelectionUpcaster(versionedSelection: VersionedSlateSelection): SlateSelection {
    return versionedSelection;
}
