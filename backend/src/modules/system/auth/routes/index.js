/**
 * Auth Module - Routes Index
 * Centralizes all authentication route exports
 */

const { router, authenticateToken } = require('./auth.routes');

module.exports = { router, authenticateToken };
