const crypto = require('crypto');

// Use DATABASE_URL if available (Railway), otherwise use individual env vars
const getDatabaseConfig = () => {
  if (process.env.DATABASE_URL) {
    return {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    };
  }

  // Fallback to Railway's default connection info if DATABASE_URL not set
  return {
    host: process.env.DB_HOST || 'ballast.proxy.rlwy.net',
    port: process.env.DB_PORT || 20017,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'ueLIWnvALZWVbRdnOmpLGsrrukeGLGQQ',
    database: process.env.DB_NAME || 'railway',
    ssl: { rejectUnauthorized: false },
  };
};

module.exports = {
  database: getDatabaseConfig(),
  jwt: {
    secret: process.env.JWT_SECRET || crypto.randomBytes(64).toString('hex'),
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },
  sentry: {
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'production',
  },
  redis: {
    url: process.env.REDIS_URL,
  },
  api: {
    port: process.env.PORT || 3001,
    corsOrigin: process.env.FRONTEND_URL || 'https://crm.jaydenmetz.com',
  },
};
