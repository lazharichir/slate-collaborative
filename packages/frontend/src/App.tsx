import React from 'react';
import CollaborativeRichTextEditor from "./editor/CollaborativeRichTextEditor";
import { graphqlSlateResourceService, SlateResourceServiceContext } from "@wleroux/slate-react-resource";
import { client } from "./graphql/client";

function App() {

	const params = new URLSearchParams(window.location.search)

	const clientId = params.get(`client`)
	const resourceId = params.get(`resourceId`)
	const resourceVersion = params.get(`resourceVersion`)

	if (!clientId || !resourceId || !resourceVersion)
		return <div>No data in the query string.</div>;

	return (
		<div className="App">
			<SlateResourceServiceContext.Provider value={graphqlSlateResourceService(client, 3000)}>
				<CollaborativeRichTextEditor 
					resourceId={resourceId} 
					resourceVersion={resourceVersion} 
					clientId={clientId} 
				/>
			</SlateResourceServiceContext.Provider>
		</div>
	);
}

export default App;
