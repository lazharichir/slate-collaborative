import React from 'react';
import CollaborativeRichTextEditor from "./editor/CollaborativeRichTextEditor";
import { slateResourceService, SlateResourceServiceContext } from "@wleroux/slate-react-resource";
import { webSocketUrl } from "./config";

function App() {

	const params = new URLSearchParams(window.location.search)

	const clientId = params.get(`client`)
	const resourceId = params.get(`resourceId`)
	const resourceVersion = params.get(`resourceVersion`)

	if (!clientId || !resourceId || !resourceVersion)
		return <div>No data in the query string.</div>;

	return (
		<div className="App">
			<SlateResourceServiceContext.Provider value={slateResourceService(webSocketUrl, 3000)}>
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
