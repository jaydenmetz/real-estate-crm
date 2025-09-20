import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

/**
 * Initialize Sentry for React application
 */
export const initializeSentry = () => {
  const SENTRY_DSN = process.env.REACT_APP_SENTRY_DSN;

  if (!SENTRY_DSN) {
    console.log('Sentry not configured (no DSN provided)');
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    integrations: [
      new BrowserTracing({
        // Set tracingOrigins to control what URLs are traced
        tracingOrigins: [
          'localhost',
          'crm.jaydenmetz.com',
          'api.jaydenmetz.com',
          /^\//
        ],
        // Capture interactions (clicks, navigation)
        routingInstrumentation: Sentry.reactRouterV6Instrumentation(
          React.useEffect,
          useLocation,
          useNavigationType,
          createRoutesFromChildren,
          matchRoutes
        ),
      }),
      new Sentry.Replay({
        // Mask all text and inputs for privacy
        maskAllText: true,
        maskAllInputs: true,
        // Only capture replays on errors
        sessionSampleRate: 0.1, // 10% of sessions
        errorSampleRate: 1.0, // 100% of sessions with errors
      }),
    ],

    // Performance monitoring
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

    // Release tracking
    release: process.env.REACT_APP_VERSION || '1.0.0',

    // Before send hook for filtering
    beforeSend(event, hint) {
      // Don't send events in development unless specified
      if (process.env.NODE_ENV === 'development' && !process.env.REACT_APP_SENTRY_FORCE) {
        console.log('Sentry event suppressed in development:', event);
        return null;
      }

      // Filter out specific errors
      if (event.exception) {
        const error = hint.originalException;

        // Don't send network errors for non-critical endpoints
        if (error?.name === 'NetworkError' || error?.message?.includes('fetch')) {
          return null;
        }

        // Don't send canceled requests
        if (error?.name === 'AbortError') {
          return null;
        }

        // Filter out browser extension errors
        if (error?.stack?.includes('extension://')) {
          return null;
        }
      }

      // Remove sensitive data from breadcrumbs
      if (event.breadcrumbs) {
        event.breadcrumbs = event.breadcrumbs.map(breadcrumb => {
          if (breadcrumb.category === 'fetch' || breadcrumb.category === 'xhr') {
            // Remove auth headers from breadcrumbs
            if (breadcrumb.data?.request_headers) {
              delete breadcrumb.data.request_headers.authorization;
              delete breadcrumb.data.request_headers['x-api-key'];
            }
          }
          return breadcrumb;
        });
      }

      return event;
    },

    // Ignore specific errors
    ignoreErrors: [
      // Browser errors
      'ResizeObserver loop limit exceeded',
      'ResizeObserver loop completed with undelivered notifications',
      'Non-Error promise rejection captured',
      // Network errors
      'NetworkError',
      'Failed to fetch',
      // React errors that are handled
      'ChunkLoadError',
      'Loading chunk',
      // Extension errors
      'Extension context invalidated',
    ],

    // Don't send default PII
    sendDefaultPii: false,
  });

  console.log('✅ Sentry error tracking initialized');
};

/**
 * Set user context for Sentry
 */
export const setSentryUser = (user) => {
  if (!process.env.REACT_APP_SENTRY_DSN) return;

  if (user) {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      username: user.username,
    });
  } else {
    Sentry.setUser(null);
  }
};

/**
 * Capture custom error with context
 */
export const captureError = (error, context = {}) => {
  if (!process.env.REACT_APP_SENTRY_DSN) {
    console.error('Error captured locally:', error, context);
    return;
  }

  Sentry.withScope((scope) => {
    // Add custom context
    Object.keys(context).forEach(key => {
      scope.setContext(key, context[key]);
    });

    // Add tags for filtering
    if (context.tags) {
      Object.keys(context.tags).forEach(tag => {
        scope.setTag(tag, context.tags[tag]);
      });
    }

    // Capture the error
    Sentry.captureException(error);
  });
};

/**
 * Capture custom message
 */
export const captureMessage = (message, level = 'info', context = {}) => {
  if (!process.env.REACT_APP_SENTRY_DSN) {
    console.log('Message captured locally:', message, context);
    return;
  }

  Sentry.withScope((scope) => {
    // Add custom context
    Object.keys(context).forEach(key => {
      scope.setContext(key, context[key]);
    });

    // Capture the message
    Sentry.captureMessage(message, level);
  });
};

/**
 * Track user interactions
 */
export const trackInteraction = (name, data = {}) => {
  if (!process.env.REACT_APP_SENTRY_DSN) return;

  Sentry.addBreadcrumb({
    category: 'user-interaction',
    message: name,
    level: 'info',
    data,
  });
};

/**
 * Profiler component for performance monitoring
 */
export const SentryProfiler = ({ name, children }) => {
  if (!process.env.REACT_APP_SENTRY_DSN) {
    return children;
  }

  return (
    <Sentry.Profiler name={name}>
      {children}
    </Sentry.Profiler>
  );
};

/**
 * Error boundary with Sentry integration
 */
export const SentryErrorBoundary = Sentry.ErrorBoundary;

/**
 * WithProfiler HOC
 */
export const withProfiler = Sentry.withProfiler;

export default {
  initializeSentry,
  setSentryUser,
  captureError,
  captureMessage,
  trackInteraction,
  SentryProfiler,
  SentryErrorBoundary,
  withProfiler,
};