import gql from "graphql-tag";

export type GetDocumentValueArgs = {
	document: string
	version: string
	since?: number
}

export const GetDocumentValueQuery = gql`
	query GetDocumentValue($document: String!, $version: String!, $since: Int) {
		getDocumentValue(document: $document, version: $version, since: $since) {
			metadata
			revision
			value
			cursors
			since
		}
	}
`


export type SubscribeToDocumentMutationArgs = {
	document: string
	version: string
	since: number|`latest`
}

export const SubscribeToDocumentMutation = gql`
	# subscription SubscribeToDocument($document: String!, $version: String!, $since: Integer!) {
	# subscribeToDocument(document: $document, version: $version, since: $since) {
	subscription {
		subscribeToDocument {
			id
			document
			version
			revision
			client
			operations
			metadata
		}
	}
`

export type UnsubscribeFromDocumentMutationArgs = {
	document: string
	version: string
}

export const UnsubscribeFromDocumentMutation = gql`
	mutation UnsubscribeFromDocument($document: String!, $version: String!) {
		unsubscribeToDocument(document: $document, version: $version)
	}
`

export type AppplyChangesetToDocumentMutationArgs = {
	changeset: string
}

export const AppplyChangesetToDocumentMutation = gql`
	mutation AppplyChangesetToDocument($changeset: String!) {
		appplyChangesetToDocument(changeset: $changeset)
	}
`

export type KeepAliveForDocumentMutationArgs<O> = {
	document: string
	version: string
}

export const KeepAliveForDocumentMutation = gql`
	mutation KeepAliveForDocument($document: String!, $version: String!) {
		keepAliveForDocument(document: $document, version: $version)
	}
`









// export type SubscribeToDocumentMutationArgs = {
// 	document: string
// 	version: string
// 	since: number|`latest`
// }

// export const SubscribeToAppliedChangesets = gql`
// 	subscription SubscribeToAppliedChangesets($document: String!, $version: String!) {
// 		subscribeToDocument(document: $document, version: $version, since: $since) {
// 			type
// 			id
// 			version
// 			resource
// 		}
// 	}
// `
