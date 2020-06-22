import React, {ChangeEvent, useCallback, useState} from 'react';
import {randomUUID} from "./util/randomUUID";
import CollaborativeRichTextEditor from "./editor/CollaborativeRichTextEditor";
import {ClientId, ResourceId} from "@wleroux/resource";
import {slateResourceService, SlateResourceServiceContext} from "@wleroux/slate-react-resource";
import {webSocketUrl} from "./config";

function App() {
    let [clientId, setClientId] = useState<ClientId>(() => {
        let storedClientId = localStorage.getItem("clientId");
        if (storedClientId === null) {
            let clientId = randomUUID();
            localStorage.setItem("clientId", clientId);
            return clientId;
        } else {
            return storedClientId;
        }
    });
    let handleClientIdChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        localStorage.setItem("clientId", event.target.value);
        setClientId(event.target.value);
    }, [setClientId]);

    let [resourceId, setResourceId] = useState<ResourceId>(() => {
        let storedResourceId = localStorage.getItem("resourceId");
        if (storedResourceId === null) {
            let resourceId = randomUUID();
            localStorage.setItem("resourceId", resourceId);
            return resourceId;
        } else {
            return storedResourceId;
        }
    });
    let handleResourceIdChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        localStorage.setItem("resourceId", event.target.value);
        setResourceId(event.target.value);
    }, [setResourceId]);

    return (
    <div className="App">
        <SlateResourceServiceContext.Provider value={slateResourceService(webSocketUrl)}>
            <div>
                <label>Client ID:</label>
                <input value={clientId} onChange={handleClientIdChange} />
            </div>
            <div>
                <label>Record ID:</label>
                <input value={resourceId} onChange={handleResourceIdChange} />
            </div>
            <CollaborativeRichTextEditor resourceId={resourceId} clientId={clientId} />
        </SlateResourceServiceContext.Provider>
    </div>
  );
}

export default App;
