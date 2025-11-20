import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QuizPage } from "./pages/QuizPage";
import "./index.css"; // ⬅️ harus ada

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<QuizPage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
