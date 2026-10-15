import React from "react";
import ReactDOM from "react-dom/client";
import { invoke } from "@tauri-apps/api/core";
import { App } from "./App";
import "./index.css";

if (typeof window !== "undefined") {
  (window as any).__TAURI__ = (window as any).__TAURI__ || {
    core: {
      invoke,
    },
  };
}

const rootElement = document.getElementById("root");
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
