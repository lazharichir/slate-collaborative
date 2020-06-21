import {Path} from "../Path";
import {SlateOperation} from "..";

export function pathTransform(path: Path, operation: SlateOperation, options: { affinity?: 'forward' | 'backward' | null } = {}): Path | null {
    const { affinity = 'forward' } = options
    if (path.length === 0) return path;

    if (operation.type === "insert_node") {
        if (Path.equals(operation.path, path) || Path.endsBefore(operation.path, path) || Path.isAncestor(operation.path, path)) {
            let newPath = [...path];
            newPath[operation.path.length - 1] += 1;
            return newPath;
        } else {
            return path;
        }
    } else if (operation.type === "remove_node") {
        if (Path.equals(operation.path, path) || Path.isAncestor(operation.path, path)) {
            return null;
        } else if (Path.endsBefore(operation.path, path)) {
            let newPath = [...path];
            newPath[operation.path.length - 1] -= 1;
            return newPath;
        } else {
            return path;
        }
    } else if (operation.type === "merge_node") {
        if (Path.equals(operation.path, path) || Path.endsBefore(operation.path, path)) {
            let newPath = [...path];
            newPath[operation.path.length - 1] -= 1
            return newPath;
        } else if (Path.isAncestor(operation.path, path)) {
            let newPath = [...path];
            newPath[operation.path.length - 1] -= 1
            newPath[operation.path.length] += operation.position
            return newPath;
        } else {
            return path;
        }
    } else if (operation.type === "split_node") {
        if (Path.equals(operation.path, path)) {
            if (affinity === 'forward') {
                let newPath = [...path];
                newPath[path.length - 1] += 1
                return newPath;
            } else if (affinity === 'backward') {
                // Nothing, because it still refers to the right path.
                return path;
            } else {
                return null;
            }
        } else if (Path.endsBefore(operation.path, path)) {
            let newPath = [...path];
            newPath[operation.path.length - 1] += 1
            return newPath;
        } else if (Path.isAncestor(operation.path, path) && path[operation.path.length] >= operation.position) {
            let newPath = [...path];
            newPath[operation.path.length - 1] += 1;
            newPath[operation.path.length] -= operation.position;
            return newPath;
        } else {
            return path;
        }
    } else if (operation.type === "move_node") {
        if (Path.equals(operation.path, operation.newPath)) {
            return path;
        }

        if (Path.isAncestor(operation.path, path) || Path.equals(operation.path, path)) {
            let newPath = [...operation.newPath];
            if (Path.endsBefore(operation.path, operation.newPath) && operation.path.length < operation.newPath.length) {
                newPath[operation.path.length - 1] -= 1
            }
            return newPath.concat(path.slice(operation.path.length));
        } else if (Path.isSibling(operation.path, operation.newPath) && (Path.isAncestor(operation.newPath, path) || Path.equals(operation.newPath, path))) {
            if (Path.endsBefore(operation.path, path)) {
                let newPath = [...path];
                newPath[operation.path.length - 1] -= 1;
                return newPath;
            } else {
                let newPath = [...path];
                newPath[operation.path.length - 1] += 1;
                return newPath;
            }
        } else if (Path.endsBefore(operation.newPath, path) || Path.equals(operation.newPath, path) || Path.isAncestor(operation.newPath, path)) {
            let newPath = [...path];
            if (Path.endsBefore(operation.path, path)) {
                newPath[operation.path.length - 1] -= 1
            }

            newPath[operation.newPath.length - 1] += 1
            return newPath;
        } else if (Path.endsBefore(operation.path, path)) {
            let newPath = [...path];
            if (Path.equals(operation.newPath, path)) {
                newPath[operation.newPath.length - 1] += 1
            }
            newPath[operation.path.length - 1] -= 1
            return newPath;
        } else {
            return path;
        }
    } else {
        return path;
    }
}
