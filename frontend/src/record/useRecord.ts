import {useCallback, useContext, useEffect, useMemo, useState} from "react";
import RecordServiceContext from "./service/context/RecordServiceContext";
import {SlateOperation, SlateSelection, SlateValue} from "slate-value";
import {ClientId, RecordId, RecordVersion} from "record";
import {SlateRecord} from "common";

type RecordContext = {
    value: SlateValue;
    selection: SlateSelection;
    cursors: {[key: string]: SlateSelection};
    version: RecordVersion;
    apply: (operations: SlateOperation[]) => void;
    undo: () => void;
    redo: () => void;
};

export default function useRecord(id: RecordId, clientId: ClientId): RecordContext {
    let recordService = useContext(RecordServiceContext);
    let [record, setRecord] = useState<SlateRecord>(SlateRecord.DEFAULT);
    useEffect(() => {
        return () => {
            setRecord(SlateRecord.DEFAULT)
        };
    }, [setRecord, id]);

    useEffect(() => {
        let closePromise = recordService.subscribe(id, setRecord);
        return () => {
            closePromise.then(close => close());
        };
    }, [recordService, setRecord, id]);

    let apply = useCallback((operations: SlateOperation[]) => recordService.applyOperations(id, clientId, operations), [recordService, id, clientId]);
    let undo = useCallback(() => recordService.applyUndo(id, clientId), [recordService, id, clientId]);
    let redo = useCallback(() => recordService.applyRedo(id, clientId), [recordService, id, clientId]);

    let selection = useMemo(() => record.cursors[clientId] || null, [record.cursors, clientId])
    let cursors = useMemo(() => {
        let otherCursors = {...record.cursors};
        delete otherCursors[clientId];
        return otherCursors;
    }, [record.cursors, clientId])

    return {
        value: record.value,
        selection: selection,
        cursors: cursors,
        version: record.version,
        apply,
        undo,
        redo
    };
}
