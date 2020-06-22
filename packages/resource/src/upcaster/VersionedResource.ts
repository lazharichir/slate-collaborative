type VersionedResourceId_1 = string;

export type VersionedResourceId =
    | VersionedResourceId_1
    ;

type VersionedClientId_1 = string;

export type VersionedClientId =
    | VersionedClientId_1
    ;

type VersionedResourceVersion_1 = number;

export type VersionedResourceVersion =
    | VersionedResourceVersion_1
    ;

type VersionedResource_1<VV, VS> = {
    metadata: {
        type: "RESOURCE";
        version: 1;
    };
    version: VersionedResourceVersion;
    value: VV;
    cursors: {[key: string]: VS};
};

export type VersionedResource<VV, VS> =
    | VersionedResource_1<VV, VS>
    ;
