const Sentry = require("@sentry/node");
// Profiling removed - not needed for basic error tracking
// const { nodeProfilingIntegration } = require("@sentry/profiling-node");

// Initialize Sentry before anything else (if DSN is provided)
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN, // Set in Railway environment variables

  environment: process.env.NODE_ENV || 'development',

  // Set sampling rates
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  // profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0, // Profiling disabled

  // Integrations
  integrations: [
    // Express auto-instrumentation
    new Sentry.Integrations.Http({ tracing: true }),
    new Sentry.Integrations.Express({
      app: true,
      router: true,
      middleware: true
    }),
    // Postgres tracking
    new Sentry.Integrations.Postgres(),
  ],

  // Performance monitoring
  enableTracing: true,

  // Send default PII for better debugging (IP addresses, etc)
  sendDefaultPii: false, // Set to false for privacy

  // Before send hook for filtering
  beforeSend(event, hint) {
    // Filter out specific errors
    if (event.exception) {
      const error = hint.originalException;

      // Don't send 404 errors
      if (error?.statusCode === 404) {
        return null;
      }

      // Don't send validation errors
      if (error?.name === 'ValidationError') {
        return null;
      }

      // Remove sensitive data
      if (event.request) {
        delete event.request.cookies;
        delete event.request.headers?.authorization;
        delete event.request.headers?.['x-api-key'];

        // Sanitize body
        if (event.request.data) {
          const sanitized = { ...event.request.data };
          delete sanitized.password;
          delete sanitized.token;
          delete sanitized.apiKey;
          delete sanitized.creditCard;
          delete sanitized.ssn;
          event.request.data = sanitized;
        }
      }
    }

    return event;
  },

  // Ignore specific errors
  ignoreErrors: [
    'NetworkError',
    'Failed to fetch',
    'ResizeObserver loop limit exceeded',
  ],
  });

  console.log('✅ Sentry instrumentation initialized');
} else {
  console.log('ℹ️ Sentry not configured (no DSN provided)');
}