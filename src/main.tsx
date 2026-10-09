import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

try {
  import('./utils/iconGenerator').then(({ generateIcons }) => {
    generateIcons();
  }).catch(err => console.warn('Icon generator no disponible:', err));

  import('./utils/offlineSync').then(({ setupSyncListeners, syncData, cleanSyncQueue }) => {
    setupSyncListeners();
    cleanSyncQueue();
    if (navigator.onLine) {
      syncData();
    }
  }).catch(err => console.warn('Offline sync no disponible:', err));
} catch (error) {
  console.warn('Error en inicialización:', error);
}

ReactDOM.createRoot(document.getElementById("root")!).render(<App />);
