import { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import QuizContainer from "./components/QuizContainer";
import { getIframeParams, isInIframe } from "./utils/iframeParams";
import { learnCheckApi } from "./services/api";
import type { IframeParams, UserPreferences } from "./types";
import "./App.css";

const queryClient = new QueryClient();

function App() {
  const [params, setParams] = useState<IframeParams | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const inIframe = isInIframe();

  useEffect(() => {
    const initializeApp = async () => {
      const iframeParams = getIframeParams();

      if (!iframeParams) {
        setError("Missing required parameters: tutorial_id and user_id");
        setLoading(false);
        return;
      }

      setParams(iframeParams);

      try {
        const userPrefs = await learnCheckApi.getUserPreferences(
          iframeParams.user_id,
        );
        setPreferences(userPrefs);
        applyTheme(userPrefs);
      } catch (err) {
        console.error("Failed to load user preferences:", err);
        const defaultPrefs: UserPreferences = {
          theme: "light",
          fontSize: "medium",
          fontStyle: "default",
          layoutWidth: "centered",
        };
        setPreferences(defaultPrefs);
        applyTheme(defaultPrefs);
      } finally {
        setLoading(false);
      }
    };

    initializeApp();
  }, []);

  if (error) {
    return (
      <div className="error-container">
        <div className="error-box">
          <h2>⚠️ Configuration Error</h2>
          <p>{error}</p>
          <div className="error-help">
            <p>
              <strong>Required URL Parameters:</strong>
            </p>
            <ul>
              <li>
                <code>tutorial_id</code> - The tutorial ID
              </li>
              <li>
                <code>user_id</code> - The user ID
              </li>
            </ul>
            <p>
              <strong>Example:</strong>
            </p>
            <code>{window.location.origin}?tutorial_id=35363&user_id=1</code>
          </div>
        </div>
      </div>
    );
  }

  if (loading || !params || !preferences) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div
        className={`app ${inIframe ? "in-iframe" : ""}`}
        data-theme={preferences.theme}
        data-font-size={preferences.fontSize}
        data-font-style={preferences.fontStyle}
        data-layout-width={preferences.layoutWidth}
      >
        <QuizContainer
          tutorialId={params.tutorial_id}
          userId={params.user_id}
        />
      </div>
    </QueryClientProvider>
  );
}

function applyTheme(prefs: UserPreferences) {
  const root = document.documentElement;

  if (prefs.theme === "dark") {
    root.style.setProperty("--primary-color", "#60a5fa");
    root.style.setProperty("--primary-hover", "#3b82f6");
    root.style.setProperty("--success-color", "#34d399");
    root.style.setProperty("--danger-color", "#f87171");
    root.style.setProperty("--warning-color", "#fbbf24");
    root.style.setProperty("--bg-color", "#0f172a");
    root.style.setProperty("--card-bg", "#1e293b");
    root.style.setProperty("--text-primary", "#f1f5f9");
    root.style.setProperty("--text-secondary", "#94a3b8");
    root.style.setProperty("--border-color", "#334155");
  } else {
    root.style.setProperty("--primary-color", "#3b82f6");
    root.style.setProperty("--primary-hover", "#2563eb");
    root.style.setProperty("--success-color", "#10b981");
    root.style.setProperty("--danger-color", "#ef4444");
    root.style.setProperty("--warning-color", "#f59e0b");
    root.style.setProperty("--bg-color", "#f8fafc");
    root.style.setProperty("--card-bg", "#ffffff");
    root.style.setProperty("--text-primary", "#1e293b");
    root.style.setProperty("--text-secondary", "#64748b");
    root.style.setProperty("--border-color", "#e2e8f0");
  }

  const fontSizeMap = {
    small: "14px",
    medium: "16px",
    large: "18px",
  };
  root.style.setProperty("--base-font-size", fontSizeMap[prefs.fontSize]);

  const fontFamilyMap = {
    default:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
    serif: 'Georgia, "Times New Roman", Times, serif',
    monospace: '"Courier New", Courier, monospace',
  };
  root.style.setProperty("--font-family", fontFamilyMap[prefs.fontStyle]);

  const layoutWidthMap = {
    fullWidth: "100%",
    centered: "800px",
    compact: "600px",
  };
  root.style.setProperty("--max-width", layoutWidthMap[prefs.layoutWidth]);
}

export default App;
