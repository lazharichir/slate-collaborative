type VersionResourceId_1 = string;

export type VersionedResourceId =
    | VersionResourceId_1
    ;

type VersionedClientId_1 = string;

export type VersionedClientId =
    | VersionedClientId_1
    ;

type VersionedResourceRevision_1 = number;

export type VersionedResourceRevision =
    | VersionedResourceRevision_1
    ;

type VersionedResource_1<VV, VS> = {
    metadata: {
        type: "RESOURCE";
        version: 1;
    };
    revision: VersionedResourceRevision;
    value: VV;
    cursors: {[key: string]: VS};
};

export type VersionedResource<VV, VS> =
    | VersionedResource_1<VV, VS>
    ;
