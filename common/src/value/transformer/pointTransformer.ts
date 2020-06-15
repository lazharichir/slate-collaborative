import {Point} from "../Point";
import {Operation} from "../action/Operation";
import {Path} from "../Path";
import {pathTransform} from "./pathTransformer";

export function pointTransformer(point: Point, appliedOperation: Operation): Point {
    if (appliedOperation.type === "insert_text") {
        if (!Path.equals(appliedOperation.path, point.path)) return point;
        if (appliedOperation.offset <= point.offset) {
            return ({...point, offset: point.offset + appliedOperation.text.length});
        } else {
            return point;
        }
    } else if (appliedOperation.type === "remove_text") {
        if (!Path.equals(appliedOperation.path, point.path)) return point;

        if (appliedOperation.offset <= point.offset && appliedOperation.offset + appliedOperation.text.length >= point.offset) {
            return ({...point, offset: appliedOperation.offset});
        } else if (appliedOperation.offset + appliedOperation.text.length <= point.offset) {
            return ({...point, offset: point.offset - appliedOperation.text.length});
        } else {
            return point;
        }
    } else if (appliedOperation.type === "insert_node") {
        let newPath = pathTransform(point.path, appliedOperation)!;
        if (newPath !== point.path) {
            return ({...point, path: newPath});
        } else {
            return point;
        }
    }

    let newPath = pathTransform(point.path, appliedOperation)!;
    if (newPath !== point.path) {
        return {...point, path: newPath};
    } else {
        return point;
    }
}