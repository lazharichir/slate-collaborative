import {Path} from "./Path";

export type Point = {
    path: Path;
    offset: number;
};

function compare(a: Point, b: Point) {
    let pathCompare = Path.compare(a.path, b.path);
    if (pathCompare === 0) {
        if (a.offset < b.offset) return -1;
        if (a.offset > b.offset) return 1;
        return 0;
    } else {
        return pathCompare;
    }
}

function isBefore(a: Point, b: Point) {
    return compare(a, b) < 0;
}

function isAfter(a: Point, b: Point) {
    return compare(a, b) > 0;
}

function equals(a: Point, b: Point) {
    return compare(a, b) === 0;
}

export const Point = {
    compare,
    equals,
    isBefore,
    isAfter
};
