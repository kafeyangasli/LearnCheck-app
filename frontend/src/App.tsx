import { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Loader2, AlertTriangle } from "lucide-react";
import QuizContainer from "./components/QuizContainer";
import { getIframeParams, isInIframe } from "./utils/iframeParams";
import { learnCheckApi } from "./services/api";
import type { IframeParams, UserPreferences } from "./types";

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
        setError(
          "Parameter yang diperlukan tidak ditemukan: tutorial_id dan user_id",
        );
        setLoading(false);
        return;
      }

      setParams(iframeParams);

      try {
        const userPrefs = await learnCheckApi.getUserPreferences(
          iframeParams.user_id,
        );
        setPreferences(userPrefs);
      } catch (err) {
        console.error("Failed to load user preferences:", err);
        const defaultPrefs: UserPreferences = {
          theme: "light",
          fontSize: "medium",
          fontStyle: "default",
          layoutWidth: "centered",
        };
        setPreferences(defaultPrefs);
      } finally {
        setLoading(false);
      }
    };

    initializeApp();
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 max-w-lg">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-8 h-8 text-warning" />
            <h2 className="text-xl font-bold text-gray-800">
              Kesalahan Konfigurasi
            </h2>
          </div>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="font-semibold text-gray-700 mb-2">
              Parameter URL yang diperlukan:
            </p>
            <ul className="list-disc list-inside text-gray-600 mb-4 space-y-1">
              <li>
                <code className="bg-gray-200 px-1 rounded text-sm">
                  tutorial_id
                </code>{" "}
                - ID tutorial
              </li>
              <li>
                <code className="bg-gray-200 px-1 rounded text-sm">
                  user_id
                </code>{" "}
                - ID pengguna
              </li>
            </ul>
            <p className="font-semibold text-gray-700 mb-2">Contoh:</p>
            <code className="block bg-gray-800 text-white p-3 rounded text-sm overflow-x-auto">
              {window.location.origin}?tutorial_id=35363&user_id=1
            </code>
          </div>
        </div>
      </div>
    );
  }

  if (loading || !params || !preferences) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
        <p className="text-gray-600 font-medium">Memuat...</p>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div
        className={`min-h-screen bg-gray-100 ${inIframe ? "p-2" : "p-4"}`}
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

export default App;
