import React from 'react';
import { createRoot } from 'react-dom/client';
import * as Sentry from "@sentry/react";
import App from './App';
import './styles/globals.css';

// Force rebuild - 2025-01-17 16:45 PST
// HARDCODED DSN - Railway env vars not working during build
const SENTRY_DSN = 'https://2d2e91e606017090b37b82c997bd3eb9@o4510050439200768.ingest.us.sentry.io/4510050490253312';

// Debug: Log to verify
// // console.log('🔍 Sentry DSN:', SENTRY_DSN);

// Initialize Sentry before anything else
Sentry.init({
  dsn: SENTRY_DSN, // Hardcoded to ensure it works
  environment: process.env.NODE_ENV || 'development',
  debug: false, // Disable debug mode in production

  // Release configuration for release health
  release: process.env.REACT_APP_VERSION || 'real-estate-crm@1.0.0',

  // Session tracking for release health
  autoSessionTracking: true, // Enable automatic session tracking
  sessionTrackingIntervalMillis: 30000, // Session heartbeat interval (30 seconds)

  // Performance Monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  tracePropagationTargets: [
    'localhost',
    'api.jaydenmetz.com',
    /^https:\/\/api\.jaydenmetz\.com\/v1/,
  ],

  // Session Replay
  replaysSessionSampleRate: 0.1, // 10% of sessions
  replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors

  // Send default PII for better debugging (includes IP addresses)
  sendDefaultPii: true, // Enable for better error context

  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({
      maskAllText: true,
      maskAllInputs: true,
      blockAllMedia: true,
    }),
  ],

  // Before send hook for filtering
  beforeSend(event, hint) {
    // Filter out non-critical network errors
    if (event.exception?.values?.[0]?.value?.includes('Load failed')) {
      return null;
    }

    // Always send errors to Sentry (removed development filter)
    return event;
  },

  // Ignore specific errors
  ignoreErrors: [
    'ResizeObserver loop limit exceeded',
    'ResizeObserver loop completed with undelivered notifications',
    'Non-Error promise rejection captured',
    'NetworkError',
    'Failed to fetch',
    'Load failed',
    'AbortError',
    'Network request failed',
  ],
});

// Initialize network monitoring as early as possible
import './services/networkMonitor.service';

// Make Sentry globally available for debugging
window.Sentry = Sentry;

// Debug environment variables in development only
if (process.env.NODE_ENV !== 'production') {
  // // console.log('🔧 Environment Debug:', {
  //   NODE_ENV: process.env.NODE_ENV,
  //   REACT_APP_API_URL: process.env.REACT_APP_API_URL,
  //   REACT_APP_WS_URL: process.env.REACT_APP_WS_URL
  // });
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
);// Force rebuild Mon Nov  3 14:41:00 PST 2025
