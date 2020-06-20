import {Operation} from "../action/Operation";
import {operationTransformer} from "./operationTransformer";

export function operationsTransformer(leftOperations: Operation[], topOperations: Operation[]): [Operation[], Operation[]] {
    if (leftOperations.length === 0 || topOperations.length === 0) {
        return [leftOperations, topOperations];
    } else if (leftOperations.length === 1 && topOperations.length === 1) {
        let right = operationTransformer(leftOperations[0], topOperations[0], false);
        let bottom = operationTransformer(topOperations[0], leftOperations[0], true);
        return [right, bottom];
    } else {
        let bottomOperations: Operation[] = [];
        let rightOperations: Operation[] = [];
        for (let left of leftOperations) {
            let leftOperation = [left];
            bottomOperations = [];
            for (let topOperation of topOperations) {
                let [right, bottom] = operationsTransformer(leftOperation, [topOperation]);

                leftOperation = right;
                bottomOperations = bottomOperations.concat(bottom);
            }

            rightOperations = rightOperations.concat(leftOperation);
            topOperations = bottomOperations;
        }
        return [rightOperations, bottomOperations];
    }
}
