/**
 * Escrow Schema Detection Service
 *
 * Handles database schema detection with caching for performance.
 * This service detects which columns exist in the escrows table
 * to support multiple schema versions during migration.
 *
 * @module escrows/services/schema
 */

const { pool } = require('../../../../config/infrastructure/database');

// Cache for schema detection (persists across requests for performance)
let schemaInfo = null;
let schemaPromise = null; // Prevents multiple concurrent schema detection calls

/**
 * Detect database schema for escrows table
 *
 * This function checks which columns exist in the escrows table
 * and returns a schema info object. Results are cached for performance.
 *
 * @returns {Promise<Object>} Schema information object
 * @property {boolean} hasId - Whether 'id' column exists
 * @property {boolean} hasNumericId - Whether 'numeric_id' column exists
 * @property {boolean} hasTeamSequenceId - Whether 'team_sequence_id' column exists
 * @property {boolean} hasNetCommission - Whether 'net_commission' column exists
 * @property {boolean} hasMyCommission - Whether 'my_commission' column exists
 * @property {boolean} hasAcceptanceDate - Whether 'acceptance_date' column exists
 * @property {boolean} hasBuyerSideCommission - Whether 'buyer_side_commission' column exists
 * @property {boolean} hasOpeningDate - Whether 'opening_date' column exists
 * @property {boolean} hasUuid - Whether 'uuid' column exists
 *
 * @example
 * const schema = await detectSchema();
 * if (schema.hasNumericId) {
 *   query += ', numeric_id';
 * }
 */
async function detectSchema() {
  // Return cached schema immediately
  if (schemaInfo) {
    return schemaInfo;
  }

  // If another request is already detecting schema, wait for it
  if (schemaPromise) {
    return schemaPromise;
  }

  // Start schema detection and cache the promise
  schemaPromise = (async () => {
    try {
      // Check what columns exist in the escrows table
      const result = await pool.query(`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = 'escrows'
        AND column_name IN (
          'id', 'numeric_id', 'team_sequence_id',
          'net_commission', 'my_commission', 'acceptance_date',
          'buyer_side_commission', 'opening_date', 'uuid'
        )
      `);

      const columns = result.rows.map((row) => row.column_name);

      schemaInfo = {
        hasId: columns.includes('id'),
        hasNumericId: columns.includes('numeric_id'),
        hasTeamSequenceId: columns.includes('team_sequence_id'),
        hasNetCommission: columns.includes('net_commission'),
        hasMyCommission: columns.includes('my_commission'),
        hasAcceptanceDate: columns.includes('acceptance_date'),
        hasBuyerSideCommission: columns.includes('buyer_side_commission'),
        hasOpeningDate: columns.includes('opening_date'),
        hasUuid: columns.includes('uuid'),
      };

      return schemaInfo;
    } catch (error) {
      console.error('Schema detection error:', error);

      // Default to production schema if detection fails
      schemaInfo = {
        hasId: true, // Production should have id column
        hasNumericId: true,
        hasTeamSequenceId: true,
        hasNetCommission: true,
        hasMyCommission: false,
        hasAcceptanceDate: true,
        hasBuyerSideCommission: false,
        hasOpeningDate: false,
        hasUuid: false,
      };

      return schemaInfo;
    } finally {
      // Clear the promise so future errors can retry
      schemaPromise = null;
    }
  })();

  return schemaPromise;
}

/**
 * Clear cached schema information
 *
 * Useful for testing or when schema changes dynamically.
 * Forces next detectSchema() call to re-query the database.
 *
 * @example
 * await clearSchemaCache();
 * const freshSchema = await detectSchema();
 */
function clearSchemaCache() {
  schemaInfo = null;
  schemaPromise = null;
}

/**
 * Get cached schema info without querying database
 *
 * Returns null if schema hasn't been detected yet.
 * Use detectSchema() if you need to ensure schema is detected.
 *
 * @returns {Object|null} Cached schema info or null
 *
 * @example
 * const cached = getCachedSchema();
 * if (cached) {
 *   // Use cached info
 * } else {
 *   // Need to detect first
 *   const schema = await detectSchema();
 * }
 */
function getCachedSchema() {
  return schemaInfo;
}

module.exports = {
  detectSchema,
  clearSchemaCache,
  getCachedSchema
};
