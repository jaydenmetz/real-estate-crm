/**
 * Admin Service
 *
 * Business logic for administrative operations.
 * Simple pass-through service for DDD compliance.
 *
 * Future enhancements:
 * - Complex admin workflows
 * - System-wide operations
 * - Bulk data management
 */

const { pool } = require('../../../../config/infrastructure/database');

/**
 * Get system statistics
 * @returns {Promise<Object>} System stats
 */
exports.getSystemStats = async () => {
  const stats = await pool.query(`
    SELECT
      (SELECT COUNT(*) FROM users WHERE deleted_at IS NULL) as total_users,
      (SELECT COUNT(*) FROM teams WHERE deleted_at IS NULL) as total_teams,
      (SELECT COUNT(*) FROM escrows WHERE deleted_at IS NULL) as total_escrows,
      (SELECT COUNT(*) FROM clients WHERE deleted_at IS NULL) as total_clients,
      (SELECT COUNT(*) FROM listings WHERE deleted_at IS NULL) as total_listings
  `);

  return stats.rows[0];
};

/**
 * Perform system health check
 * @returns {Promise<Object>} Health status
 */
exports.healthCheck = async () => {
  try {
    await pool.query('SELECT 1');
    return { status: 'healthy', database: 'connected' };
  } catch (error) {
    return { status: 'unhealthy', database: 'disconnected', error: error.message };
  }
};
