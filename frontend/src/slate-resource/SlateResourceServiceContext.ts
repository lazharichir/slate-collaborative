import React from "react";
import {
    slateSelectionsReducer,
    SlateOperation,
    slateOperationInverter,
    slateOperationsOptimizer,
    slateOperationsTransformer,
    slateOperationUpcaster,
    SlateSelection,
    SlateValue,
    slateValueReducer,
    slateValueUpcaster, VersionedSlateValue, VersionedSlateSelection, VersionedSlateOperation
} from "slate-value";
import {webSocketUrl} from "../config";
import {ResourceService, ResourceServiceImpl} from "resource-service";

const resourceService = new ResourceServiceImpl<VersionedSlateValue, SlateValue, VersionedSlateSelection, SlateSelection, VersionedSlateOperation, SlateOperation>(webSocketUrl, SlateValue.DEFAULT, slateValueReducer, slateValueUpcaster, slateSelectionsReducer, slateOperationsTransformer, slateOperationUpcaster, slateOperationInverter, slateOperationsOptimizer, SlateOperation.isMutationOperation);

export default React.createContext<ResourceService<SlateValue, SlateSelection, SlateOperation>>(resourceService);
