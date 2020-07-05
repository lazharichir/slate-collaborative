type RevisionedResourceId_1 = string;

export type RevisionedResourceId =
    | RevisionedResourceId_1
    ;

type RevisionedClientId_1 = string;

export type RevisionedClientId =
    | RevisionedClientId_1
    ;

type RevisionedResourceRevision_1 = number;

export type RevisionedResourceRevision =
    | RevisionedResourceRevision_1
    ;

type RevisionedResource_1<VV, VS> = {
    metadata: {
        type: "RESOURCE";
        version: 1;
    };
    revision: RevisionedResourceRevision;
    value: VV;
    cursors: {[key: string]: VS};
};

export type RevisionedResource<VV, VS> =
    | RevisionedResource_1<VV, VS>
    ;
