import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/global.css";
import "./styles/imports.css";
import { SiteDataProvider } from "./admin/SiteDataContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <SiteDataProvider>
      <App />
    </SiteDataProvider>
  </React.StrictMode>
);
