import { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import QuizContainer from "./components/QuizContainer";
import { getIframeParams, isInIframe } from "./utils/iframeParams";
import { learnCheckApi } from "./services/api";
import type { IframeParams, UserPreferences } from "./types";
import "./styles/App.css";

const queryClient = new QueryClient();

function App() {
  const [params, setParams] = useState<IframeParams | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const inIframe = isInIframe();

  useEffect(() => {
    const iframeParams = getIframeParams();

    if (!iframeParams) {
      setError("Missing required parameters: tutorial_id and user_id");
      return;
    }

    setParams(iframeParams);
  }, []);

  // Fetch user preferences when user_id changes
  useEffect(() => {
    if (params?.user_id) {
      learnCheckApi
        .getUserPreferences(params.user_id)
        .then((prefs) => {
          console.log("User preferences loaded:", prefs);
          console.log("Theme value:", prefs.theme);
          setPreferences(prefs);
        })
        .catch((err) => {
          console.error("Failed to load user preferences:", err);
          // Set default preferences on error
          setPreferences({
            theme: "light",
            fontSize: "medium",
            fontStyle: "default",
            layoutWidth: "fullWidth",
          });
        });
    }
  }, [params?.user_id]);

  if (error) {
    return (
      <div className="app-error-route">
        <div className="app-error-card">
          <h2 className="app-error-title">⚠️ Kesalahan Konfigurasi</h2>
          <p className="app-error-text">{error}</p>
          <div className="app-error-box">
            <p className="app-error-box-title">
              Parameter URL yang Diperlukan:
            </p>
            <ul className="app-error-list">
              <li>
                <span className="app-error-code">tutorial_id</span> - ID
                tutorial
              </li>
              <li>
                <span className="app-error-code">user_id</span> - ID pengguna
              </li>
            </ul>
            <p className="app-error-box-title">Contoh:</p>
            <code className="app-error-example">
              {window.location.origin}?tutorial_id=35363&user_id=1
            </code>
          </div>
        </div>
      </div>
    );
  }

  if (!params) {
    return (
      <div className="app-loading-root">
        <div className="app-loading-spinner"></div>
        <p className="app-loading-text">Memuat...</p>
      </div>
    );
  }

  // Apply preferences via CSS classes
  // Derive preferences dengan default
  const theme = preferences?.theme ?? "light";
  const fontSize = preferences?.fontSize ?? "medium";
  const fontStyle = preferences?.fontStyle ?? "default";
  const layoutWidth = preferences?.layoutWidth ?? "fullWidth";

  const rootClassNames = [
    "app-root",
    inIframe ? "app-root--embed" : "",
    theme === "dark" ? "dark app-root--dark" : "app-root--light",
  ]
    .filter(Boolean)
    .join(" ");

  const innerClassNames = [
    "app-inner",
    `app-font-size--${fontSize}`,
    fontStyle === "serif"
      ? "app-font-style--serif"
      : fontStyle === "open-dyslexic"
      ? "app-font-style--open-dyslexic"
      : "app-font-style--default",
    layoutWidth === "mediumWidth"
      ? "app-layout--mediumWidth"
      : "app-layout--fullWidth",
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <QueryClientProvider client={queryClient}>
      <div className={rootClassNames}>
        <div className={innerClassNames}>
          <QuizContainer
            tutorialId={params.tutorial_id}
            userId={params.user_id}
            isDark={theme === "dark"}
          />
        </div>
      </div>
    </QueryClientProvider>
  );
}

export default App;
