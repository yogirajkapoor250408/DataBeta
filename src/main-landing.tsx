import React from 'react';
import ReactDOM from 'react-dom/client';
import { LandingApp } from './LandingApp';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <LandingApp />
    </ErrorBoundary>
  </React.StrictMode>
);
