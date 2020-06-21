import {
    slateCursorsReducer,
    SlateOperation,
    slateOperationInverter,
    slateOperationsOptimizer,
    slateOperationsTransformer,
    slateOperationUpcaster,
    SlateSelection,
    slateSelectionUpcaster,
    SlateValue, slateValueReducer,
    slateValueUpcaster,
    VersionedSlateOperation,
    VersionedSlateSelection,
    VersionedSlateValue
} from "slate-value";
import * as Record from "record";
import {Changeset, VersionedChangeset, VersionedRecord} from "record";

export {Request} from "./api/Request";
export {Response} from "./api/Response";

export type VersionedSlateRecord = VersionedRecord<VersionedSlateValue, VersionedSlateSelection>
export type VersionedSlateChangeset = VersionedChangeset<VersionedSlateOperation>
export type SlateChangeset = Changeset<SlateOperation>;
export const SlateChangeset = {
    isMutationSlateChangeset: Changeset.isMutationChangeset(SlateOperation.isMutationOperation)
};
export type SlateRecord = Record.Record<SlateValue, SlateSelection>;

export const slateRecordReducer = Record.recordReducer<SlateValue, SlateSelection, SlateOperation>(slateValueReducer, slateCursorsReducer);
export const slateRecordUpcaster = Record.recordUpcaster<VersionedSlateValue, SlateValue, VersionedSlateSelection, SlateSelection>(slateValueUpcaster, slateSelectionUpcaster);
export const slateChangesetInverter = Record.changesetInverter<SlateOperation>(slateOperationInverter);
export const slateChangesetsTransformer = Record.changesetsTransformer<SlateOperation>(slateOperationsTransformer);
export const slateChangesetUpcaster = Record.changesetUpcaster<VersionedSlateOperation, SlateOperation>(slateOperationUpcaster);
export const slateChangesetsOptimizer = Record.changesetsOptimizer<SlateOperation>(slateOperationsOptimizer);
export const SlateRecord = {
    DEFAULT: Record.Record.DEFAULT<SlateValue, SlateSelection>(SlateValue.DEFAULT)
}