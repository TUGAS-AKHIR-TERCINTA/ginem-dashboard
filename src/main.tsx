import React from "react";
import ReactDOM from "react-dom/client";
import "@/styles/globals.css";
import App from "@/App";
import { AppProviders } from "@/providers/app-providers";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </React.StrictMode>,
);
