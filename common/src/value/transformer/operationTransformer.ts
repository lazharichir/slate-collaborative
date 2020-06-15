import {Operation, SetSelectionOperation} from "../action/Operation";
import {Point} from "../Point";
import {Range} from "../Range";
import {Path} from "../Path";
import {rangeTransformer} from "./rangeTransformer";
import {pointTransformer} from "./pointTransformer";


export function operationTransformer(operation: Operation, appliedOperation: Operation): Operation[] {
    if (appliedOperation.type === "set_selection") {
        return [operation];
    } else if (appliedOperation.type === "insert_text") {
        if (operation.type === "set_selection") {
            let {properties, newProperties} = operation;
            if (properties !== null) {
                if (properties.anchor !== undefined && properties.focus !== undefined) {
                    properties = rangeTransformer(properties as Range, appliedOperation);
                } else if (properties.anchor !== undefined) {
                    properties = {...properties, anchor: pointTransformer(properties.anchor, appliedOperation)}
                } else if (properties.focus !== undefined) {
                    properties = {...properties, focus: pointTransformer(properties.focus, appliedOperation)}
                }
            }
            if (newProperties !== null) {
                if (newProperties.anchor !== undefined && newProperties.focus !== undefined) {
                    newProperties = rangeTransformer(newProperties as Range, appliedOperation);
                } else if (newProperties.anchor !== undefined) {
                    newProperties = {...newProperties, anchor: pointTransformer(newProperties.anchor, appliedOperation)}
                } else if (newProperties.focus !== undefined) {
                    newProperties = {...newProperties, focus: pointTransformer(newProperties.focus, appliedOperation)}
                }
            }

            if (operation.properties !== properties || operation.newProperties !== newProperties) {
                return [{...operation, properties, newProperties} as SetSelectionOperation];
            } else {
                return [operation];
            }
        } else if (operation.type === "insert_text") {
            if (!Path.equals(appliedOperation.path, operation.path)) return [operation];
            if (appliedOperation.offset <= operation.offset) {
                return ([{...operation, offset: operation.offset + appliedOperation.text.length}])
            } else {
                return [operation];
            }
        } else if (operation.type === "remove_text") {
            if (!Path.equals(appliedOperation.path, operation.path)) return [operation];
            if (operation.offset + operation.text.length <= appliedOperation.offset) {
                return [operation];
            } else if (operation.offset >= appliedOperation.offset) {
                return [{...operation, offset: operation.offset + appliedOperation.text.length}]
            } else {
                return [{...operation, text: operation.text.substring(0, appliedOperation.offset - operation.offset) + appliedOperation.text + operation.text.substring(appliedOperation.offset - operation.offset) }]
            }
        }
        return [operation]
    } else if (appliedOperation.type === "remove_text") {
        if (operation.type === "set_selection") {
            let {properties, newProperties} = operation;
            if (properties !== null) {
                if (properties.anchor !== undefined && properties.focus !== undefined) {
                    properties = rangeTransformer(properties as Range, appliedOperation);
                } else if (properties.anchor !== undefined) {
                    properties = {...properties, anchor: pointTransformer(properties.anchor, appliedOperation)}
                } else if (properties.focus !== undefined) {
                    properties = {...properties, focus: pointTransformer(properties.focus, appliedOperation)}
                }
            }
            if (newProperties !== null) {
                if (newProperties.anchor !== undefined && newProperties.focus !== undefined) {
                    newProperties = rangeTransformer(newProperties as Range, appliedOperation);
                } else if (newProperties.anchor !== undefined) {
                    newProperties = {...newProperties, anchor: pointTransformer(newProperties.anchor, appliedOperation)}
                } else if (newProperties.focus !== undefined) {
                    newProperties = {...newProperties, focus: pointTransformer(newProperties.focus, appliedOperation)}
                }
            }

            if (operation.properties !== properties || operation.newProperties !== newProperties) {
                return [{...operation, properties, newProperties} as SetSelectionOperation];
            } else {
                return [operation];
            }
        } else if (operation.type === "insert_text") {
            if (!Path.equals(appliedOperation.path, operation.path)) return [operation];

            if (operation.offset >= appliedOperation.offset + appliedOperation.text.length) {
                return [{...operation, offset: operation.offset - appliedOperation.text.length}]
            } else if (appliedOperation.offset < operation.offset && operation.offset < appliedOperation.offset + appliedOperation.text.length) {
                return [];
            } else {
                return [operation];
            }
        } else if (operation.type === "remove_text") {
            if (!Path.equals(appliedOperation.path, operation.path)) return [operation];

            if (appliedOperation.offset + appliedOperation.text.length <= operation.offset) {
                return [{...operation, offset: operation.offset - appliedOperation.text.length}];
            } else if (appliedOperation.offset <= operation.offset && operation.offset <= appliedOperation.offset + appliedOperation.text.length) {
                if (operation.offset + operation.text.length <= appliedOperation.offset + appliedOperation.text.length) {
                    return [];
                } else {
                    return [{...operation, offset: appliedOperation.offset, text: operation.text.substring(appliedOperation.offset - operation.offset + appliedOperation.text.length)}];
                }
            } else if (appliedOperation.offset > operation.offset) {
                if (appliedOperation.offset > operation.offset + operation.text.length) {
                    return [operation];
                } else if (appliedOperation.offset + appliedOperation.text.length < operation.offset + operation.text.length) {
                    return [{
                        ...operation,
                        text: operation.text.substring(0, appliedOperation.offset - operation.offset) + operation.text.substring(appliedOperation.offset + appliedOperation.text.length - operation.offset)
                    }];
                } else {
                    return [{
                        ...operation,
                        text: operation.text.substring(0, appliedOperation.offset - operation.offset)
                    }]
                }
            }
        }
        return [operation];
    } else {
        return [operation]
    }
}
