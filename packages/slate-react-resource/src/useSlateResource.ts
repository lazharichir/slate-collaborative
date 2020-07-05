import React from "react"
import {
	SlateOperation,
	SlateSelection,
	SlateValue,
} from "@wleroux/slate-value"
import {
	ClientId,
	Resource,
	ResourceId,
	ResourceRevision,
} from "@wleroux/resource"
import { ResourceService } from "@wleroux/resource-service"
import { SlateResourceServiceContext } from "./SlateResourceServiceContext"

type ResourceContext = {
	value: SlateValue
	selection: SlateSelection
	cursors: { [key: string]: SlateSelection }
	revision: ResourceRevision
	apply: (operations: SlateOperation[]) => void
	undo: () => void
	redo: () => void
}

// export function useSlateResource( id: ResourceId, clientId: ClientId, react: { useContext: typeof useContext useState: typeof useState useEffect: typeof useEffect useCallback: typeof useCallback useMemo: typeof useMemo } ): ResourceContext {

export function useSlateResource(
	id: ResourceId,
	clientId: ClientId,
): ResourceContext {
	let resourceService = React.useContext<
		ResourceService<SlateValue, SlateSelection, SlateOperation>
	>(SlateResourceServiceContext)
	let [resource, setResource] = React.useState<
		Resource<SlateValue, SlateSelection>
	>(Resource.DEFAULT(SlateValue.DEFAULT))
	React.useEffect(() => {
		return () => {
			setResource(Resource.DEFAULT(SlateValue.DEFAULT))
		}
	}, [setResource, id])

	React.useEffect(() => {
		let closePromise = resourceService.subscribe(id, setResource)
		return () => {
			closePromise.then((close) => close())
		}
	}, [resourceService, setResource, id])

	let apply = React.useCallback(
		(operations: SlateOperation[]) =>
			resourceService.applyOperations(id, clientId, operations),
		[resourceService, id, clientId]
	)
	let undo = React.useCallback(() => resourceService.applyUndo(id, clientId), [
		resourceService,
		id,
		clientId,
	])
	let redo = React.useCallback(() => resourceService.applyRedo(id, clientId), [
		resourceService,
		id,
		clientId,
	])

	let selection = React.useMemo(() => resource.cursors[clientId] || null, [
		resource.cursors,
		clientId,
	])
	let cursors = React.useMemo(() => {
		let otherCursors = { ...resource.cursors }
		delete otherCursors[clientId]
		return otherCursors
	}, [resource.cursors, clientId])

	return {
		value: resource.value,
		selection: selection,
		cursors: cursors,
		revision: resource.revision,
		apply,
		undo,
		redo,
	}
}
