import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');

// Global error handler for startup crashes (before React mounts)
window.onerror = function(message, source, lineno) {
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="height: 100vh; width: 100vw; background: #000; color: #ff3333; display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: monospace; padding: 20px; text-align: center;">
        <h1 style="font-size: 24px; margin-bottom: 16px;">SYSTEM FAILURE</h1>
        <p style="margin-bottom: 8px;">INIT_ERROR: ${message}</p>
        <p style="font-size: 12px; opacity: 0.7;">${source} : ${lineno}</p>
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
      <div style="height: 100vh; width: 100vw; background: #000; color: #ff3333; display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: monospace; padding: 20px; text-align: center;">
        <h1 style="font-size: 24px; margin-bottom: 16px;">CRITICAL FAILURE</h1>
        <p>The system encountered a fatal error.</p>
        <pre style="margin-top: 20px; text-align: left; background: #111; padding: 10px; border: 1px solid #333;">${e}</pre>
      </div>
    `;
}
