import { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import QuizContainer from './components/QuizContainer';
import { getIframeParams, isInIframe } from './utils/iframeParams';
import type { IframeParams } from './types';
import './App.css';

const queryClient = new QueryClient();

function App() {
  const [params, setParams] = useState<IframeParams | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inIframe = isInIframe();

  useEffect(() => {
    const iframeParams = getIframeParams();

    if (!iframeParams) {
      setError('Missing required parameters: tutorial_id and user_id');
      return;
    }

    setParams(iframeParams);
  }, []);

  if (error) {
    return (
      <div className="error-container">
        <div className="error-box">
          <h2>⚠️ Configuration Error</h2>
          <p>{error}</p>
          <div className="error-help">
            <p><strong>Required URL Parameters:</strong></p>
            <ul>
              <li><code>tutorial_id</code> - The tutorial ID</li>
              <li><code>user_id</code> - The user ID</li>
            </ul>
            <p><strong>Example:</strong></p>
            <code>
              {window.location.origin}?tutorial_id=35363&user_id=user123
            </code>
          </div>
        </div>
      </div>
    );
  }

  if (!params) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div className={`app ${inIframe ? 'in-iframe' : ''}`}>
        <QuizContainer
          tutorialId={params.tutorial_id}
          userId={params.user_id}
        />
      </div>
    </QueryClientProvider>
  );
}

export default App;
