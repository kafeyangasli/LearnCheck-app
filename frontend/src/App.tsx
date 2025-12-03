import { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import QuizContainer from './components/QuizContainer';
import { getIframeParams, isInIframe } from './utils/iframeParams';
import { learnCheckApi } from './services/api';
import type { IframeParams, UserPreferences } from './types';


const queryClient = new QueryClient();

function App() {
  const [params, setParams] = useState<IframeParams | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const inIframe = isInIframe();

  useEffect(() => {
    const iframeParams = getIframeParams();

    if (!iframeParams) {
      setError('Missing required parameters: tutorial_id and user_id');
      return;
    }

    setParams(iframeParams);
  }, []);

  // Fetch user preferences when user_id changes
  useEffect(() => {
    if (params?.user_id) {
      learnCheckApi.getUserPreferences(params.user_id)
        .then((prefs) => {
          console.log('User preferences loaded:', prefs);
          console.log('Theme value:', prefs.theme);
          setPreferences(prefs);
        })
        .catch((err) => {
          console.error('Failed to load user preferences:', err);
          // Set default preferences on error
          setPreferences({
            theme: 'light',
            fontSize: 'medium',
            fontStyle: 'default',
            layoutWidth: 'centered',
          });
        });
    }
  }, [params?.user_id]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6 bg-gray-50">
        <div className="max-w-lg w-full p-8 bg-white rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold mb-4 text-gray-900">⚠️ Kesalahan Konfigurasi</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <p className="font-semibold text-gray-900 mb-2">Parameter URL yang Diperlukan:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-700 mb-4">
              <li><code className="px-2 py-0.5 bg-gray-200 rounded text-sm">tutorial_id</code> - ID tutorial</li>
              <li><code className="px-2 py-0.5 bg-gray-200 rounded text-sm">user_id</code> - ID pengguna</li>
            </ul>
            <p className="font-semibold text-gray-900 mb-2">Contoh:</p>
            <code className="block p-2 bg-gray-200 rounded text-sm overflow-x-auto">
              {window.location.origin}?tutorial_id=35363&user_id=user123
            </code>
          </div>
        </div>
      </div>
    );
  }

  if (!params) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-primary rounded-full animate-spin"></div>
        <p className="text-gray-600">Memuat...</p>
      </div>
    );
  }

  // Apply preferences via CSS classes
  const themeClass = preferences?.theme === 'dark' ? 'dark bg-gray-900' : '';
  const fontSizeClass =
    preferences?.fontSize === 'small' ? 'text-sm' :
      preferences?.fontSize === 'large' ? 'text-lg' : 'text-base';
  const fontStyleClass =
    preferences?.fontStyle === 'serif' ? 'font-serif' :
      preferences?.fontStyle === 'monospace' ? 'font-mono' : 'font-sans';
  const layoutWidthClass =
    preferences?.layoutWidth === 'fullWidth' ? 'max-w-full' :
      preferences?.layoutWidth === 'compact' ? 'max-w-4xl mx-auto' : 'max-w-6xl mx-auto';

  return (
    <QueryClientProvider client={queryClient}>
      <div className={`
        ${inIframe ? 'min-h-auto' : 'min-h-screen'}
        ${themeClass}
        ${fontSizeClass}
        ${fontStyleClass}
        ${layoutWidthClass}
        transition-colors duration-200
      `}>
        <QuizContainer
          tutorialId={params.tutorial_id}
          userId={params.user_id}
        />
      </div>
    </QueryClientProvider>
  );
}

export default App;

