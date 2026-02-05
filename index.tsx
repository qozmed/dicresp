import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

const rootElement = document.getElementById('root');

// Global error handler for startup crashes (before React mounts)
window.onerror = function(message, source, lineno) {
  console.error("Window Error Caught:", message, source, lineno);
  if (rootElement) {
    // Forcefully remove the static loading text and show error
    rootElement.innerHTML = `
      <div style="position: absolute; top: 0; left: 0; height: 100vh; width: 100vw; background: #000; color: #ff3333; display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: monospace; padding: 20px; text-align: center; overflow: auto; z-index: 100000;">
        <h1 style="font-size: 24px; margin-bottom: 16px; border-bottom: 1px solid #ff3333; padding-bottom: 8px;">SYSTEM INITIALIZATION FAILURE</h1>
        <p style="margin-bottom: 8px; font-weight: bold;">${message}</p>
        <p style="font-size: 12px; opacity: 0.7; word-break: break-all;">${source} : ${lineno}</p>
      </div>
    `;
  }
};

if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

console.log("System initialization sequence started...");

try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log("System mounted successfully.");
} catch (e) {
    console.error("CRITICAL SYSTEM FAILURE:", e);
    // Visual fallback if React crashes during render
    rootElement.innerHTML = `
      <div style="position: absolute; top: 0; left: 0; height: 100vh; width: 100vw; background: #000; color: #ff3333; display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: monospace; padding: 20px; text-align: center; z-index: 100000;">
        <h1 style="font-size: 24px; margin-bottom: 16px;">CRITICAL FAILURE</h1>
        <p>The system encountered a fatal error.</p>
        <pre style="margin-top: 20px; text-align: left; background: #111; padding: 10px; border: 1px solid #333; max-width: 100%; overflow: auto;">${e}</pre>
      </div>
    `;
}
