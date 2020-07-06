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
	ResourceVersion,
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

export function useSlateResource(
	id: ResourceId,
	version: ResourceVersion,
	client: ClientId,
	delay: number = 2000
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
	}, [setResource, id, version])

	React.useEffect(() => {
		let closePromise = resourceService.subscribe(id, version, setResource)
		return () => {
			closePromise.then((close) => close())
		}
	}, [resourceService, setResource, id, version])

	let apply = React.useCallback(
		(operations: SlateOperation[]) =>
			resourceService.applyOperations(id, version, client, operations),
		[resourceService, id, version, client]
	)
	let undo = React.useCallback(() => resourceService.applyUndo(id, version, client), [
		resourceService,
		id,
		version,
		client,
	])
	let redo = React.useCallback(() => resourceService.applyRedo(id, version, client), [
		resourceService,
		id,
		version,
		client,
	])

	let selection = React.useMemo(() => resource.cursors[client] || null, [
		resource.cursors,
		client,
	])
	let cursors = React.useMemo(() => {
		let otherCursors = { ...resource.cursors }
		delete otherCursors[client]
		return otherCursors
	}, [resource.cursors, client])

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
