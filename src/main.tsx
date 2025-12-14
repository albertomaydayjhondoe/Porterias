import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Debug logging
console.log("main.tsx: Starting application...");

// Handle GitHub Pages SPA redirect
const redirect = sessionStorage.getItem('gh-pages-redirect');
if (redirect) {
  console.log("main.tsx: Handling GitHub Pages redirect:", redirect);
  sessionStorage.removeItem('gh-pages-redirect');
  window.history.replaceState(null, '', redirect);
}

const rootElement = document.getElementById("root");
if (!rootElement) {
  const errorMsg = "Root element not found! Make sure there's a div with id='root' in your HTML.";
  console.error(errorMsg);
  document.body.innerHTML = `
    <div style="padding: 20px; text-align: center; font-family: Arial, sans-serif;">
      <h1 style="color: red;">Error de inicialización</h1>
      <p>${errorMsg}</p>
      <p>Revisa la consola del navegador para más detalles.</p>
    </div>
  `;
  throw new Error(errorMsg);
}

console.log("main.tsx: Root element found, starting React...");

try {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
  console.log("main.tsx: React app started successfully");
} catch (error) {
  console.error("main.tsx: Failed to render React app:", error);
  rootElement.innerHTML = `
    <div style="padding: 20px; text-align: center; font-family: Arial, sans-serif;">
      <h1 style="color: red;">Error al inicializar la aplicación</h1>
      <p>Ha ocurrido un error al cargar la aplicación.</p>
      <pre style="text-align: left; background: #f5f5f5; padding: 10px; border-radius: 4px;">${error}</pre>
      <button onclick="window.location.reload()" style="margin-top: 10px; padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">
        Recargar página
      </button>
    </div>
  `;
}
