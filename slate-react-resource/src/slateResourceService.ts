import {ResourceService, ResourceServiceImpl} from "resource-service";
import {
    SlateOperation,
    slateOperationInverter,
    slateOperationsOptimizer,
    slateOperationsTransformer,
    slateOperationUpcaster,
    SlateSelection,
    slateSelectionsReducer,
    SlateValue,
    slateValueReducer,
    slateValueUpcaster,
    VersionedSlateOperation,
    VersionedSlateSelection,
    VersionedSlateValue
} from "slate-value";

export function slateResourceService(webSocketUrl: string): ResourceService<SlateValue, SlateSelection, SlateOperation> {
    return new ResourceServiceImpl<VersionedSlateValue, SlateValue, VersionedSlateSelection, SlateSelection, VersionedSlateOperation, SlateOperation>(webSocketUrl, SlateValue.DEFAULT, slateValueReducer, slateValueUpcaster, slateSelectionsReducer, slateOperationsTransformer, slateOperationUpcaster, slateOperationInverter, slateOperationsOptimizer, SlateOperation.isMutationOperation);
}