export type VersionedPath_1 = number[];

export type VersionedPath =
    | VersionedPath_1
    ;

export type VersionedPoint_1 = {
    path: VersionedPath_1;
    offset: number
};

export type VersionedRange_1 = {
    anchor: VersionedPoint_1;
    focus: VersionedPoint_1;
}

export type VersionedRange =
    | VersionedRange_1
    ;

export type VersionedSlateSelection_1 = null | VersionedRange_1;

export type VersionedSlateSelection =
    | VersionedSlateSelection_1
    ;

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

export type VersionedNode =
    | VersionedNode_1
    ;

export type VersionedSlateValue_1 = {
    metadata: {
        type: "SLATE_VALUE";
        version: 1;
    };
    children: VersionedNode[]
}

export type VersionedSlateValue =
    | VersionedSlateValue_1
    ;
