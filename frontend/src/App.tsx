import { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import QuizContainer from "./features/quiz/components/QuizContainer";
import { isInIframe } from "./utils/iframeParams";
import { learnCheckApi } from "./services/api";
import type { UserPreferences } from "./types";
import { cn } from "./lib/utils";

const queryClient = new QueryClient();

import { useIframeParams } from "./hooks/useIframeParams";

function App() {
  const { params, error: paramsError } = useIframeParams();
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const inIframe = isInIframe();
  const error = paramsError;

  useEffect(() => {
    if (params?.user_id) {
      learnCheckApi
        .getUserPreferences(params.user_id)
        .then((prefs) => {
          setPreferences(prefs);
        })
        .catch(() => {
          setPreferences({
            theme: "light",
            fontSize: "medium",
            fontStyle: "default",
            layoutWidth: "mediumWidth",
          });
        });
    }
  }, [params?.user_id]);

  if (error) {
    return (
      <div className="min-h-screen flex justify-center items-center p-6 bg-slate-50 box-border dark:bg-slate-900">
        <div className="max-w-lg w-full p-8 rounded-[1.25rem] bg-white dark:bg-slate-800 shadow-[0_10px_25px_rgba(15,23,42,0.12)] box-border">
          <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">
            ⚠️ Kesalahan Konfigurasi
          </h2>
          <p className="mb-4 text-slate-700 dark:text-slate-300 text-[0.95rem]">
            {error}
          </p>
          <div className="mt-6 p-4 rounded-xl bg-slate-100 dark:bg-slate-700/50">
            <p className="font-semibold mb-2 text-slate-900 dark:text-white">
              Parameter URL yang Diperlukan:
            </p>
            <ul className="m-0 mb-4 pl-5 list-disc text-slate-700 dark:text-slate-300 text-sm">
              <li>
                <span className="inline-block px-1.5 py-0.5 rounded-md bg-slate-200 dark:bg-slate-600 font-mono text-xs">
                  tutorial_id
                </span>{" "}
                - ID tutorial
              </li>
              <li>
                <span className="inline-block px-1.5 py-0.5 rounded-md bg-slate-200 dark:bg-slate-600 font-mono text-xs">
                  user_id
                </span>{" "}
                - ID pengguna
              </li>
            </ul>
            <p className="font-semibold mb-2 text-slate-900 dark:text-white">
              Contoh:
            </p>
            <code className="block mt-2 p-2 rounded-md bg-slate-200 dark:bg-slate-600 font-mono text-[0.8rem] overflow-x-auto text-slate-900 dark:text-slate-100">
              {window.location.origin}?tutorial_id=35363&user_id=1
            </code>
          </div>
        </div>
      </div>
    );
  }

  if (!params) {
    return (
      <div className="min-h-screen flex justify-center items-center flex-col gap-4 bg-slate-50 dark:bg-slate-900">
        <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-primary-600 animate-spin"></div>
        <p className="text-slate-600 dark:text-slate-400 text-[0.95rem]">
          Memuat...
        </p>
      </div>
    );
  }

  const theme = preferences?.theme ?? "light";
  const fontSize = preferences?.fontSize ?? "medium";
  const fontStyle = preferences?.fontStyle ?? "default";
  const layoutWidth = preferences?.layoutWidth ?? "mediumWidth";

  const fontSizeClass =
    fontSize === "small"
      ? "text-sm"
      : fontSize === "large"
      ? "text-lg"
      : "text-base";

  const fontStyleClass =
    fontStyle === "serif"
      ? "font-serif"
      : fontStyle === "open-dyslexic"
      ? "font-[OpenDyslexic,sans-serif]"
      : "font-sans";

  const layoutClass =
    layoutWidth === "mediumWidth" ? "max-w-3xl mx-auto" : "max-w-full mx-auto";

  return (
    <QueryClientProvider client={queryClient}>
      <div
        className={cn(
          "bg-slate-50 text-slate-900 transition-colors duration-300 box-border",
          inIframe ? "min-h-full p-3 sm:p-4" : "min-h-screen p-4 sm:p-6 lg:p-8",
          theme === "dark" ? "dark bg-slate-900 text-slate-200" : "",
          fontSizeClass,
          fontStyleClass
        )}
      >
        <div className={cn("mx-auto", layoutClass)}>
          <QuizContainer
            tutorialId={params.tutorial_id}
            userId={params.user_id}
            isDark={theme === "dark"}
            fontSize={fontSize}
          />
        </div>
      </div>
    </QueryClientProvider>
  );
}

export default App;
