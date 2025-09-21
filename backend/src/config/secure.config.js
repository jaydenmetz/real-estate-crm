const crypto = require('crypto');

module.exports = {
  database: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: false }
  },
  jwt: {
    secret: process.env.JWT_SECRET || crypto.randomBytes(64).toString('hex'),
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  },
  sentry: {
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'production'
  },
  redis: {
    url: process.env.REDIS_URL
  },
  api: {
    port: process.env.PORT || 3001,
    corsOrigin: process.env.FRONTEND_URL || 'https://crm.jaydenmetz.com'
  }
};