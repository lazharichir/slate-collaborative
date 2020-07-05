import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import "./index.css";
import * as serviceWorker from "./serviceWorker";

ReactDOM.render(

      <App />,
  document.getElementById('root')
);

serviceWorker.register({
    onUpdate: registration => {
        const waitingServiceWorker = registration.waiting
        if (waitingServiceWorker) {
            waitingServiceWorker.addEventListener("statechange", event => {
                //@ts-ignore
                if (event.target.state === "activated") {
                    window.location.reload()
                }
            });
            waitingServiceWorker.postMessage({ type: "SKIP_WAITING" });
        }
    }
});
