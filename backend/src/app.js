// src/app.js

require('dotenv').config();
const express       = require('express');
const cors          = require('cors');
const helmet        = require('helmet');
const rateLimit     = require('./middleware/rateLimit.middleware');
const logger        = require('./utils/logger');

const app = express();

// ─── Security Middleware ───────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin:      process.env.FRONTEND_URL,
  credentials: true
}));

// ─── Body Parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Request Logging ──────────────────────────────────────────────────────────
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip:        req.ip,
    userAgent: req.get('user-agent')
  });
  next();
});

// ─── Health Check Endpoint ────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status:    'healthy',
    timestamp: new Date().toISOString(),
    version:   process.env.API_VERSION
  });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
const apiRouter = express.Router();

// Apply rate limiting
apiRouter.use(rateLimit);

// Mount individual route modules
apiRouter.use('/escrows',      require('./routes/escrows.routes'));
apiRouter.use('/listings',     require('./routes/listings.routes'));
apiRouter.use('/clients',      require('./routes/clients.routes'));
apiRouter.use('/appointments', require('./routes/appointments.routes'));
apiRouter.use('/leads',        require('./routes/leads.routes'));
apiRouter.use('/ai',           require('./routes/ai.routes'));
apiRouter.use('/webhooks',     require('./routes/webhooks.routes'));

// Prefix all API routes with your version, e.g. "/v1"
app.use(`/${process.env.API_VERSION}`, apiRouter);

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code:    'NOT_FOUND',
      message: 'Endpoint not found'
    }
  });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);

  const status  = err.status || 500;
  const message = err.message || 'Internal server error';

  res.status(status).json({
    success: false,
    error: {
      code:    err.code || 'INTERNAL_ERROR',
      message: message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    },
    timestamp: new Date().toISOString()
  });
});

module.exports = app;