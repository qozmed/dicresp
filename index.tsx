import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

console.log("System initialization sequence started...");

try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </React.StrictMode>
    );
    console.log("System mounted successfully.");
} catch (e) {
    console.error("CRITICAL SYSTEM FAILURE:", e);
    // Display error on screen
    rootElement.innerHTML = `
        <div style="height: 100vh; width: 100vw; background: #050508; color: #ff4444; display: flex; align-items: center; justify-content: center; font-family: monospace; flex-direction: column;">
            <h1>CRITICAL SYSTEM FAILURE</h1>
            <pre>${e instanceof Error ? e.stack : String(e)}</pre>
        </div>
    `;
}
