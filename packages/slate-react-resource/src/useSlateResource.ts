import {useCallback, useContext, useEffect, useMemo, useState} from "react";
import {SlateOperation, SlateSelection, SlateValue} from "@wleroux/slate-value";
import {ClientId, Resource, ResourceId, ResourceVersion} from "@wleroux/resource";
import {ResourceService} from "@wleroux/resource-service";
import {SlateResourceServiceContext} from "./SlateResourceServiceContext";

type ResourceContext = {
    value: SlateValue;
    selection: SlateSelection;
    cursors: {[key: string]: SlateSelection};
    version: ResourceVersion;
    apply: (operations: SlateOperation[]) => void;
    undo: () => void;
    redo: () => void;
};

export function useSlateResource(id: ResourceId, clientId: ClientId): ResourceContext {
    let resourceService = useContext<ResourceService<SlateValue, SlateSelection, SlateOperation>>(SlateResourceServiceContext);
    let [resource, setResource] = useState<Resource<SlateValue, SlateSelection>>(Resource.DEFAULT(SlateValue.DEFAULT));
    useEffect(() => {
        return () => {
            setResource(Resource.DEFAULT(SlateValue.DEFAULT))
        };
    }, [setResource, id]);

    useEffect(() => {
        let closePromise = resourceService.subscribe(id, setResource);
        return () => {
            closePromise.then(close => close());
        };
    }, [resourceService, setResource, id]);

    let apply = useCallback((operations: SlateOperation[]) => resourceService.applyOperations(id, clientId, operations), [resourceService, id, clientId]);
    let undo = useCallback(() => resourceService.applyUndo(id, clientId), [resourceService, id, clientId]);
    let redo = useCallback(() => resourceService.applyRedo(id, clientId), [resourceService, id, clientId]);

    let selection = useMemo(() => resource.cursors[clientId] || null, [resource.cursors, clientId])
    let cursors = useMemo(() => {
        let otherCursors = {...resource.cursors};
        delete otherCursors[clientId];
        return otherCursors;
    }, [resource.cursors, clientId])

    return {
        value: resource.value,
        selection: selection,
        cursors: cursors,
        version: resource.version,
        apply,
        undo,
        redo
    };
}
