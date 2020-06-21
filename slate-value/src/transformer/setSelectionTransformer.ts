import {Range} from "../Range";
import {SetSelectionOperation, SlateOperation} from "../action/SlateOperation";
import {pointTransformer} from "./pointTransformer";
import {rangeTransformer} from "./rangeTransformer";

function propertiesTransformer(range: null | Partial<Range>, appliedOperation: SlateOperation): Partial<Range> | null {
    if (range === null) return null;
    if (range.anchor !== undefined && range.focus !== undefined) {
        return rangeTransformer(range as Range, appliedOperation);
    } else if (range.anchor !== undefined) {
        let anchor = pointTransformer(range.anchor, appliedOperation);
        if (anchor === null) return null;
        if (anchor !== range.anchor) {
            return ({...range, anchor});
        }
    } else if (range.focus !== undefined) {
        let focus = pointTransformer(range.focus, appliedOperation);
        if (focus === null) return null;
        if (focus !== range.focus) {
            return ({...range, focus});
        }
    }
    return range;
}

export function setSelectionTransformer(operation: SetSelectionOperation, appliedOperation: SlateOperation, _: boolean): SetSelectionOperation[] {
    if (appliedOperation.type === "set_selection" || appliedOperation.type === "set_node") return [operation];
    let properties = propertiesTransformer(operation.properties, appliedOperation);
    let newProperties = propertiesTransformer(operation.newProperties, appliedOperation);
    if (properties === null && newProperties === null) return [];

    if (properties !== operation.properties || newProperties !== operation.newProperties) {
        return [{...operation, properties, newProperties} as SetSelectionOperation]
    } else {
        return [operation];
    }
}
