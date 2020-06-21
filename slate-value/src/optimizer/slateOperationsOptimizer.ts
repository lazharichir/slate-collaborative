import {SlateOperation} from "..";
import {Path} from "../Path";

export function slateOperationsOptimizer(operations: SlateOperation[]): SlateOperation[] {
    for (let i = 0; i < operations.length - 1; i ++) {
        let firstOperation = operations[i];
        let secondOperation = operations[i + 1];
        if (firstOperation.type === "insert_text" && secondOperation.type === "insert_text") {
            if (Path.equals(firstOperation.path, secondOperation.path)) {
                if (firstOperation.offset + firstOperation.text.length === secondOperation.offset) {
                    let newOperations = operations.slice();
                    newOperations[i] = {...firstOperation, text: firstOperation.text + secondOperation.text};
                    operations = newOperations.slice(0, i+1).concat(newOperations.slice(i + 2));
                    i --;
                } else if (firstOperation.offset === secondOperation.offset) {
                    let newOperations = operations.slice();
                    newOperations[i] = {...secondOperation, text: secondOperation.text + firstOperation.text};
                    operations = newOperations.slice(0, i+1).concat(newOperations.slice(i + 2));
                    i --;
                }
            }
        } else if (firstOperation.type === "remove_text" && secondOperation.type === "remove_text") {
            if (Path.equals(firstOperation.path, secondOperation.path)) {
                if (firstOperation.offset === secondOperation.offset) {
                    let newOperations = operations.slice();
                    newOperations[i] = {...firstOperation, text: firstOperation.text + secondOperation.text};
                    operations = newOperations.slice(0, i+1).concat(newOperations.slice(i + 2));
                    i --;
                } else if (firstOperation.offset === secondOperation.offset + secondOperation.text.length) {
                    let newOperations = operations.slice();
                    newOperations[i] = {...secondOperation, text: secondOperation.text + firstOperation.text};
                    operations = newOperations.slice(0, i+1).concat(newOperations.slice(i + 2));
                    i --;
                }
            }
        }
    }

    return operations;
}