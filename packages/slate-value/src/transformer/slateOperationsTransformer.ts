import {SlateOperation} from "..";
import {slateOperationTransformer} from "./slateOperationTransformer";

export function slateOperationsTransformer(leftOperations: SlateOperation[], topOperations: SlateOperation[], winBreaker: boolean): [SlateOperation[], SlateOperation[]] {
    if (leftOperations.length === 0 || topOperations.length === 0) {
        return [leftOperations, topOperations];
    } else if (leftOperations.length === 1 && topOperations.length === 1) {
        let right = slateOperationTransformer(leftOperations[0], topOperations[0], winBreaker);
        let bottom = slateOperationTransformer(topOperations[0], leftOperations[0], !winBreaker);
        return [right, bottom];
    } else {
        let bottomOperations: SlateOperation[] = [];
        let rightOperations: SlateOperation[] = [];
        for (let left of leftOperations) {
            let leftOperation = [left];
            bottomOperations = [];
            for (let topOperation of topOperations) {
                let [right, bottom] = slateOperationsTransformer(leftOperation, [topOperation], winBreaker);

                leftOperation = right;
                bottomOperations = bottomOperations.concat(bottom);
            }

            rightOperations = rightOperations.concat(leftOperation);
            topOperations = bottomOperations;
        }
        return [rightOperations, bottomOperations];
    }
}
