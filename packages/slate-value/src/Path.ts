export type Path = number[];

function next(path: Path): Path {
    return path.slice(0, -1).concat(path[path.length - 1] + 1);
}
function previous(path: Path): Path {
    if (path[path.length - 1] === 0) {
        throw new Error(`first child`);
    }

    return path.slice(0, -1).concat(path[path.length - 1] - 1);
}
function isSibling(a: Path, b: Path) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length - 1; i ++) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}

function compare(a: Path, b: Path) {
    let common = Math.min(a.length, b.length);
    for (let i = 0; i < common; i ++) {
        if (a[i] < b[i]) return -1;
        if (a[i] > b[i]) return 1;
    }
    if (a.length < b.length) return -1;
    if (a.length > b.length) return 1;
    return 0;
}

function equals(a: Path, b: Path) {
    return compare(a, b) === 0;
}

function endsBefore(a: Path, b: Path): boolean {
    const as = a.slice(0, a.length - 1)
    const bs = b.slice(0, a.length - 1)
    return Path.equals(as, bs) && a[a.length - 1] < b[a.length - 1]
}

function isAncestor(a: Path, b: Path): boolean {
    if (a.length >= b.length) return false;
    return Path.equals(a, b.slice(0, a.length));
}

function isParent(a: Path, b: Path): boolean {
    if (a.length + 1 !== b.length) return false;
    return Path.equals(a, b.slice(0, a.length));
}

export const Path = {
    compare,
    equals,
    next,
    previous,
    endsBefore,
    isAncestor,
    isSibling,
    isParent
}