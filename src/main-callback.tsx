import React from 'react';
import ReactDOM from 'react-dom/client';
import { AuthCallback } from './pages/AuthCallback';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AuthCallback />
    </ErrorBoundary>
  </React.StrictMode>
);
