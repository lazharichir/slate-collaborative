export type VersionedPath_1 = number[];

export type VersionedPoint_1 = {
    path: VersionedPath_1;
    offset: number
};

export type VersionedRange_1 = {
    anchor: VersionedPoint_1;
    focus: VersionedPoint_1;
}

export type VersionedSelection_1 = null | VersionedRange_1;

export type VersionedText_1 = {
    text: string;
    [key: string]: unknown;
};

export type VersionedElement_1 = {
    children: VersionedNode_1[];
    [key: string]: unknown;
};

export type VersionedNode_1 =
    | VersionedElement_1
    | VersionedText_1
    ;

export type VersionedRecordVersion_1 = number;

export type VersionedValue_1 = {
    metadata: {
        type: "VALUE";
        version: 1;
    };
    children: VersionedNode_1[]
}

export type VersionedValue =
    | VersionedValue_1
    ;
