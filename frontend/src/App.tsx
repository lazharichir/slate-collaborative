import React, {ChangeEvent, useCallback, useState} from 'react';
import {randomUUID} from "./randomUUID";
import CollaborativeRichTextEditor from "./record/component/CollaborativeRichTextEditor";
import {ClientId, RecordId} from "record";

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

    let [recordId, setRecordId] = useState<RecordId>(() => {
        let storedRecordId = localStorage.getItem("recordId");
        if (storedRecordId === null) {
            let recordId = randomUUID();
            localStorage.setItem("recordId", recordId);
            return recordId;
        } else {
            return storedRecordId;
        }
    });
    let handleRecordIdChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        localStorage.setItem("recordId", event.target.value);
        setRecordId(event.target.value);
    }, [setRecordId]);

    return (
    <div className="App">
        <div>
            <label>Client ID:</label>
            <input value={clientId} onChange={handleClientIdChange} />
        </div>
        <div>
            <label>Record ID:</label>
            <input value={recordId} onChange={handleRecordIdChange} />
        </div>
        <CollaborativeRichTextEditor recordId={recordId} clientId={clientId} />
    </div>
  );
}

export default App;
