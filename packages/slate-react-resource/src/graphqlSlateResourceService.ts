import { ApolloClient } from "@apollo/client";
import { ResourceService, ResourceServiceGraphQLImpl } from "@wleroux/resource-service"
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
	VersionedSlateValue,
} from "@wleroux/slate-value"

export function graphqlSlateResourceService<TCacheShape = any>(
	apolloClient: ApolloClient<TCacheShape>,
	delay: number = 0,
): ResourceService<SlateValue, SlateSelection, SlateOperation> {
	return new ResourceServiceGraphQLImpl<
		VersionedSlateValue,
		SlateValue,
		VersionedSlateSelection,
		SlateSelection,
		VersionedSlateOperation,
		SlateOperation,
		any
	>(
		apolloClient,
		delay,
		SlateValue.DEFAULT,
		slateValueReducer,
		slateValueUpcaster,
		slateSelectionsReducer,
		slateOperationsTransformer,
		slateOperationUpcaster,
		slateOperationInverter,
		slateOperationsOptimizer,
		SlateOperation.isMutationOperation,
	)
}
