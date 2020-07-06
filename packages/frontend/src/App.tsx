import React, {ChangeEvent, useCallback, useState} from 'react';
import {randomUUID} from "./util/randomUUID";
import CollaborativeRichTextEditor from "./editor/CollaborativeRichTextEditor";
import {ClientId, ResourceId, ResourceVersion} from "@wleroux/resource";
import {slateResourceService, SlateResourceServiceContext} from "@wleroux/slate-react-resource";
import {webSocketUrl} from "./config";

function App() {

	const params = new URLSearchParams(window.location.search)

	const clientId = params.get(`client`)
	const resourceId = params.get(`resourceId`)
	const resourceVersion = params.get(`resourceVersion`)

    // let [clientId, setClientId] = useState<ClientId>(() => {
    //     let storedClientId = localStorage.getItem("clientId");
    //     if (storedClientId === null) {
    //         let clientId = randomUUID();
    //         localStorage.setItem("clientId", clientId);
    //         return clientId;
    //     } else {
    //         return storedClientId;
    //     }
	// });
	
    // let handleClientIdChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    //     localStorage.setItem("clientId", event.target.value);
    //     setClientId(event.target.value);
    // }, [setClientId]);

    // let [resourceId, setResourceId] = useState<ResourceId>(() => {
    //     let storedResourceId = localStorage.getItem("resourceId");
    //     if (storedResourceId === null) {
    //         let resourceId = randomUUID();
    //         localStorage.setItem("resourceId", resourceId);
    //         return resourceId;
    //     } else {
    //         return storedResourceId;
    //     }
	// });

	// let [resourceVersion, setResourceVersion] = useState<ResourceVersion>(() => {
    //     let storedResourceVersion = localStorage.getItem("resourceVersion");
    //     if (storedResourceVersion === null) {
    //         let resourceVersion = randomUUID();
    //         localStorage.setItem("resourceVersion", resourceVersion);
    //         return resourceVersion;
    //     } else {
    //         return storedResourceVersion;
    //     }
	// });
	
    // let handleResourceIdChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    //     localStorage.setItem("resourceId", event.target.value);
    //     setResourceId(event.target.value);
	// }, [setResourceId]);
	
	// let handleResourceVersionChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    //     localStorage.setItem("resourceVersion", event.target.value);
    //     setResourceVersion(event.target.value);
	// }, [setResourceVersion]);
	
	if (!clientId || !resourceId || !resourceVersion)	
		return <div>No data in the query string.</div>;

    return (
    <div className="App">
        <SlateResourceServiceContext.Provider value={slateResourceService(webSocketUrl)}>

            {/* <div>
                <label>Client ID:</label>
                <input value={clientId} onChange={handleClientIdChange} />
            </div>

            <div>
                <label>Resource ID:</label>
                <input value={resourceId} onChange={handleResourceIdChange} />
            </div>

			<div>
                <label>Resource Version:</label>
                <input value={resourceVersion} onChange={handleResourceVersionChange} />
            </div> */}

            <CollaborativeRichTextEditor resourceId={resourceId} resourceVersion={resourceVersion} bufferFor={2000} clientId={clientId} />

        </SlateResourceServiceContext.Provider>
    </div>
  );
}

export default App;
