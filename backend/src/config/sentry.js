const Sentry = require('@sentry/node');
const { CaptureConsole } = require('@sentry/integrations');

/**
 * Initialize Sentry error tracking
 * Only enabled in production or when SENTRY_DSN is set
 */
const initializeSentry = (app) => {
  const { SENTRY_DSN } = process.env;

  if (!SENTRY_DSN) {
    // console.log('📊 Sentry not configured (no DSN provided)');
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    integrations: [
      // Automatically capture console errors
      new CaptureConsole({
        levels: ['error', 'warn'],
      }),
      // Express integration
      new Sentry.Integrations.Http({ tracing: true }),
      new Sentry.Integrations.Express({ app }),
      // Database queries
      new Sentry.Integrations.Postgres(),
    ],

    // Performance monitoring
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0, // 10% in production

    // Session tracking
    autoSessionTracking: true,

    // Release tracking
    release: process.env.npm_package_version || '1.0.0',

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

    // User context
    beforeBreadcrumb(breadcrumb) {
      // Filter out sensitive breadcrumbs
      if (breadcrumb.category === 'console' && breadcrumb.level === 'debug') {
        return null;
      }
      return breadcrumb;
    },
  });

  // Add user context middleware
  app.use((req, res, next) => {
    if (req.user) {
      Sentry.setUser({
        id: req.user.id,
        email: req.user.email,
        username: req.user.username,
        ip_address: req.ip,
      });
    }
    next();
  });

  // console.log('✅ Sentry error tracking initialized');
};

/**
 * Capture custom error with context
 */
const captureError = (error, context = {}) => {
  if (!process.env.SENTRY_DSN) return;

  Sentry.withScope((scope) => {
    // Add custom context
    Object.keys(context).forEach((key) => {
      scope.setContext(key, context[key]);
    });

    // Capture the error
    Sentry.captureException(error);
  });
};

/**
 * Capture custom message
 */
const captureMessage = (message, level = 'info', context = {}) => {
  if (!process.env.SENTRY_DSN) return;

  Sentry.withScope((scope) => {
    // Add custom context
    Object.keys(context).forEach((key) => {
      scope.setContext(key, context[key]);
    });

    // Capture the message
    Sentry.captureMessage(message, level);
  });
};

/**
 * Track custom transaction
 */
const trackTransaction = async (name, operation, callback) => {
  if (!process.env.SENTRY_DSN) {
    return await callback();
  }

  const transaction = Sentry.startTransaction({
    op: operation,
    name,
  });

  Sentry.getCurrentHub().configureScope((scope) => scope.setSpan(transaction));

  try {
    const result = await callback();
    transaction.setStatus('ok');
    return result;
  } catch (error) {
    transaction.setStatus('internal_error');
    throw error;
  } finally {
    transaction.finish();
  }
};

/**
 * Error handler middleware (should be last)
 */
const errorHandler = () => Sentry.Handlers.errorHandler({
  shouldHandleError(error) {
    // Capture all 500 errors
    if (error.status === 500) {
      return true;
    }
    // Capture specific error types
    if (error.name === 'DatabaseError' || error.name === 'SystemError') {
      return true;
    }
    return false;
  },
});

/**
 * Request handler middleware (should be first)
 */
const requestHandler = () => Sentry.Handlers.requestHandler();

/**
 * Tracing handler middleware
 */
const tracingHandler = () => Sentry.Handlers.tracingHandler();

module.exports = {
  initializeSentry,
  captureError,
  captureMessage,
  trackTransaction,
  errorHandler,
  requestHandler,
  tracingHandler,
  Sentry,
};
