import React from 'react';
import { createRoot } from 'react-dom/client';
import * as Sentry from "@sentry/react";
import App from './App';
import './styles/globals.css';

// Initialize Sentry before anything else
Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_DSN, // Set in Railway environment variables
  environment: process.env.NODE_ENV || 'development',

  // Performance Monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Session Replay
  replaysSessionSampleRate: 0.1, // 10% of sessions
  replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors

  // Send default PII for better debugging
  sendDefaultPii: false, // Privacy-first

  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({
      maskAllText: true,
      maskAllInputs: true,
    }),
  ],

  // Ignore specific errors
  ignoreErrors: [
    'ResizeObserver loop limit exceeded',
    'ResizeObserver loop completed with undelivered notifications',
    'Non-Error promise rejection captured',
    'NetworkError',
    'Failed to fetch',
  ],
});

// Initialize network monitoring as early as possible
import './services/networkMonitor.service';

// Debug environment variables in development only
if (process.env.NODE_ENV !== 'production') {
  console.log('🔧 Environment Debug:', {
    NODE_ENV: process.env.NODE_ENV,
    REACT_APP_API_URL: process.env.REACT_APP_API_URL,
    REACT_APP_WS_URL: process.env.REACT_APP_WS_URL
  });
}

// Global error handler - Sentry will capture these automatically
window.addEventListener('error', (event) => {
  if (event.error && event.error.message && event.error.message.includes("Cannot read properties of undefined (reading 'style')")) {
    // Capture style errors with context
    Sentry.captureException(event.error, {
      tags: { type: 'style-error' },
      extra: {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        user: JSON.parse(localStorage.getItem('user') || '{}')
      }
    });
  }
});

// Sentry will handle unhandled rejections automatically

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);