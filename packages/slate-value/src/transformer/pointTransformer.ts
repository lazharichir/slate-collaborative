import {Point} from "../Point";
import {SlateOperation} from "..";
import {Path} from "../Path";
import {pathTransform} from "./pathTransformer";

export function pointTransformer(point: Point, appliedOperation: SlateOperation): Point | null {
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
    } else if (appliedOperation.type === "split_node") {
        if (Path.equals(appliedOperation.path, point.path)) {
            if (point.offset >= appliedOperation.position) {
                let newPath = Path.next(point.path);
                return {path: newPath, offset: point.offset - appliedOperation.position};
            } else {
                return point;
            }
        } else {
            let newPath = pathTransform(point.path, appliedOperation)!;
            if (newPath !== point.path) {
                return {...point, path: newPath};
            } else {
                return point;
            }
        }
    } else if (appliedOperation.type === "merge_node") {
        if (Path.equals(appliedOperation.path, point.path)) {
            let newPath = Path.previous(point.path);
            return {path: newPath, offset: point.offset + appliedOperation.position};
        } else {
            let newPath = pathTransform(point.path, appliedOperation)!;
            if (newPath !== point.path) {
                return {...point, path: newPath};
            } else {
                return point;
            }
        }
    } else {
        let newPath = pathTransform(point.path, appliedOperation);
        if (newPath === null) return null;
        if (newPath !== point.path) {
            return {...point, path: newPath};
        } else {
            return point;
        }
    }
}