import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./App.css"; // if you have global styles / Tailwind, otherwise you can remove this

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
