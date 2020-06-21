export type RecordId = string;
export type RecordVersion = number;

export type Record<V, S> = {
    metadata: {
        type: "RECORD";
        version: 1;
    };
    version: RecordVersion;
    value: V;
    cursors: {[key: string]: S};
};

function defaultRecord<V, S>(value: V): Record<V, S> {
    return ({
        metadata: {type: "RECORD", version: 1},
        version: 0,
        value: value,
        cursors: {}
    });
}

export const Record = {
    DEFAULT: defaultRecord
};
