type VersionedPath_1 = number[];

export type VersionedPath =
    | VersionedPath_1
    ;

type VersionedPoint_1 = {
    path: VersionedPath_1;
    offset: number
};

type VersionedRange_1 = {
    anchor: VersionedPoint_1;
    focus: VersionedPoint_1;
}

export type VersionedRange =
    | VersionedRange_1
    ;

type VersionedSlateSelection_1 = null | VersionedRange_1;

export type VersionedSlateSelection =
    | VersionedSlateSelection_1
    ;

type VersionedText_1 = {
    text: string;
    [key: string]: unknown;
};

type VersionedElement_1 = {
    children: VersionedNode_1[];
    [key: string]: unknown;
};

type VersionedNode_1 =
    | VersionedElement_1
    | VersionedText_1
    ;

export type VersionedNode =
    | VersionedNode_1
    ;

type VersionedSlateValue_1 = {
    metadata: {
        type: "SLATE_VALUE";
        version: 1;
    };
    children: VersionedNode[]
}

export type VersionedSlateValue =
    | VersionedSlateValue_1
    ;
