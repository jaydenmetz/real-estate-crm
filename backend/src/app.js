require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const Sentry = require('@sentry/node');
const swaggerUi = require('swagger-ui-express');
const {
  apiLimiter, authLimiter, strictLimiter, healthCheckLimiter, helmet: helmetConfig,
} = require('./middleware/security.middleware');
const { escrowValidationRules, validate, sanitizeRequestBody } = require('./middleware/validation.middleware');
const logger = require('./utils/logger');
const websocketService = require('./services/websocket.service');
const { initializeDatabase } = require('./config/database');
const { initializeRedis } = require('./config/redis');
const { errorLogging, requestLogging } = require('./middleware/errorLogging.middleware');

(async () => {
  try {
    await initializeDatabase();
    console.log('✅ Database ready');

    // Try to initialize Redis but don't fail if it's not available
    try {
      await initializeRedis();
      console.log('✅ Redis ready');
    } catch (redisErr) {
      console.warn('⚠️  Redis not available, continuing without cache', redisErr.message);
    }
  } catch (err) {
    console.error('❌ Failed to initialize database', err);
    process.exit(1);
  }
})();

const app = express();

// Trust proxy when running in production (needed for rate limiting and getting real IPs)
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', true);
}

// Enable compression for all responses
app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  level: 6, // Balanced compression level
}));

// Enhanced security headers from security middleware
app.use(helmetConfig);

const corsOptions = {
  origin(origin, callback) {
    const allowedOrigins = [
      'https://crm.jaydenmetz.com',
      'https://api.jaydenmetz.com',
      'http://localhost:3000',
      'http://localhost:3001',
    ];

    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Allow subdomains of jaydenmetz.com
    if (/^https:\/\/[a-z0-9-]+\.jaydenmetz\.com$/.test(origin)) {
      return callback(null, true);
    }

    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Team-ID', 'X-API-Key', 'API-Key', 'sentry-trace', 'baggage'],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// IMPORTANT: Handle preflight OPTIONS requests
app.options('*', cors(corsOptions));

app.use(cookieParser()); // Parse cookies for refresh tokens
app.use(express.json({
  limit: '10mb',
  type: ['application/json', 'text/plain'],
}));
app.use(express.urlencoded({
  extended: true,
  limit: '10mb',
}));

// Security middleware stack
app.use(sanitizeRequestBody); // XSS prevention via input sanitization
if (typeof requestLogging !== 'undefined') {
  app.use(requestLogging); // Request logging if available
}

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

app.use((req, res, next) => {
  const importantRoutes = ['/ai/', '/auth/', '/webhooks/'];
  const shouldLog = importantRoutes.some((route) => req.path.includes(route))
                   || req.method !== 'GET';

  if (shouldLog) {
    logger.info(`${req.method} ${req.path}`, {
      ip: req.ip,
      userAgent: req.get('user-agent')?.substring(0, 100),
    });
  }
  next();
});

// Simple test endpoint
app.get('/test-simple', (req, res) => {
  res.json({
    status: 'ok',
    time: new Date().toISOString(),
  });
});

app.get('/health', (req, res) => {
  const healthData = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.API_VERSION || '1.0.0',
    websocket: {
      status: websocketService.io ? 'running' : 'not_initialized',
      connections: websocketService.getConnectionCount(),
    },
    memory: process.memoryUsage(),
    uptime: process.uptime(),
  };

  res.json(healthData);
});

// Direct login endpoint removed for security

app.get('/ws/status', (req, res) => {
  res.json({
    status: websocketService.io ? 'active' : 'inactive',
    connectedClients: websocketService.getConnectionCount(),
    clientIds: websocketService.getConnectedClients(),
  });
});

// ============================================
// OpenAPI / Swagger Documentation
// ============================================
const swaggerSpec = require('./config/openapi.config');

// Serve OpenAPI JSON spec (for AI consumption)
app.get('/v1/openapi.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*'); // Allow AI tools to fetch
  res.send(swaggerSpec);
});

// Serve interactive Swagger UI documentation
app.use('/v1/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'Real Estate CRM API Documentation',
  customCss: '.swagger-ui .topbar { display: none }',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    showExtensions: true,
    showCommonExtensions: true,
  },
}));

// Import authentication middleware
const { authenticate } = require('./middleware/apiKey.middleware');

const apiRouter = express.Router();
apiRouter.use(apiLimiter); // API rate limiting

// Public routes with auth-specific rate limiting
apiRouter.use('/auth', authLimiter, require('./routes/auth.routes').router);

// Public status endpoints (no auth required)
apiRouter.use('/status', require('./routes/public-status.routes')); // Public: /status/public, /status/ping, /status/health

// Admin-only health endpoints (requires system_admin role)
apiRouter.use('/health', healthCheckLimiter, require('./routes/system-health.routes')); // Admin-only: Comprehensive system diagnostics

// Super simple test endpoint for debugging (bypass all middleware)
apiRouter.get('/test-endpoint', (req, res) => {
  res.json({ success: true, message: 'Test endpoint works' });
});

// API key validation moved to environment variables

// Test endpoint removed for security

// Test login endpoint removed for security

// API key management routes (requires JWT authentication)
apiRouter.use('/api-keys', require('./routes/apiKeys.routes'));

// AI Natural Language Query routes (requires authentication + strict rate limiting)
apiRouter.use('/ai', require('./routes/ai.routes'));

// Security events routes (requires authentication, except health)
const securityEventsRouter = express.Router();
securityEventsRouter.use('/', require('./routes/securityEvents-health.routes')); // Health endpoint (public)
securityEventsRouter.use('/', require('./routes/securityEvents.routes'));
// All other endpoints (authenticated)
apiRouter.use('/security-events', securityEventsRouter);

// GDPR compliance routes
apiRouter.use('/gdpr', require('./routes/gdpr.routes'));

// API Routes - Using professional .routes.js files with built-in auth
// Each route file handles its own authentication and validation
// Escrows routes - including health checks
const escrowsRouter = express.Router();
escrowsRouter.use('/', require('./routes/escrows.routes'));
escrowsRouter.use('/', require('./routes/escrows-health.routes')); // Health endpoints at /escrows/health/*
escrowsRouter.use('/', require('./routes/escrows-health-enhanced.routes'));
// Enhanced health at /escrows/health/enhanced
apiRouter.use('/escrows', escrowsRouter);

// Listings routes - including health checks
const listingsRouter = express.Router();
listingsRouter.use('/', require('./routes/listings.routes'));
listingsRouter.use('/', require('./routes/listings-health.routes'));
// Health endpoints at /listings/health/*
apiRouter.use('/listings', listingsRouter);
apiRouter.use('/clients', require('./routes/clients.routes'));
apiRouter.use('/appointments', require('./routes/appointments.routes'));
apiRouter.use('/leads', require('./routes/leads.routes'));
apiRouter.use('/analytics', require('./routes/analytics.routes'));
apiRouter.use('/communications', require('./routes/communications.routes'));
apiRouter.use('/documents', require('./routes/documents.routes'));
apiRouter.use('/webhooks', require('./routes/webhooks.routes')); // Webhooks bypass auth for external services

// Admin routes (requires system_admin role)
apiRouter.use('/admin', require('./routes/admin.routes'));

// Debug and test routes (development only)
if (process.env.NODE_ENV === 'development') {
  apiRouter.use('/debug', authenticate, require('./routes/debug.routes'));
  // Removed missing test routes
}

// Sentry test endpoint (available in all environments for testing)
apiRouter.get('/debug-sentry', (req, res) => {
  try {
    // This will trigger a test error for Sentry
    throw new Error('🧪 Sentry test error - This is a test error to verify Sentry is working correctly!');
  } catch (error) {
    // Let Sentry capture it and return a response
    if (typeof Sentry !== 'undefined') {
      Sentry.captureException(error, {
        tags: { type: 'test-error' },
        level: 'error',
        user: req.user || { id: 'anonymous' },
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'SENTRY_TEST',
        message: 'Sentry test error triggered successfully! Check your Sentry dashboard.',
      },
      timestamp: new Date().toISOString(),
    });
  }
});
apiRouter.use('/link-preview', authenticate, require('./routes/linkPreview.routes'));

// Financial routes
apiRouter.use('/commissions', require('./routes/commissions.routes'));
apiRouter.use('/invoices', require('./routes/invoices.routes'));
apiRouter.use('/expenses', require('./routes/expenses.routes'));

// Upload routes
apiRouter.use('/upload', require('./routes/upload.routes'));
apiRouter.use('/uploads', require('./routes/upload.routes'));

// Profile and Settings routes
apiRouter.use('/profiles', require('./routes/profiles.routes'));
apiRouter.use('/settings', require('./routes/settings.routes'));

// Onboarding routes
apiRouter.use('/onboarding', require('./routes/onboarding.routes'));

// Mount API router
app.use(`/${process.env.API_VERSION || 'v1'}`, apiRouter);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('public'));
}

// Sentry error handler (must be before other error middleware)
if (typeof Sentry !== 'undefined' && Sentry.setupExpressErrorHandler) {
  Sentry.setupExpressErrorHandler(app);
}

// 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Endpoint not found',
      suggestion: 'Check the API documentation for valid endpoints',
    },
    timestamp: new Date().toISOString(),
  });
});

// Enhanced error logging middleware
app.use(errorLogging);

// Final error handler with Sentry
app.use(function onError(err, req, res, next) {
  res.statusCode = 500;
  res.json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: process.env.NODE_ENV === 'production' ? 'An error occurred' : err.message,
      sentryId: res.sentry,
    },
  });
});

// Initialize job scheduler (cron jobs)
if (process.env.NODE_ENV !== 'test') {
  require('./jobs/scheduler');
}

module.exports = app;
