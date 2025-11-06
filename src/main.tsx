// src/main.tsx (or src/index.tsx)
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// ✅ Log once, inside module code compiled by Vite
console.log("API URL:", import.meta.env.VITE_API_URL ?? "(undefined)");

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
