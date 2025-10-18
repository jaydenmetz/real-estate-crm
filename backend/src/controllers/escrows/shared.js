/**
 * Shared utilities and schema detection for escrows controllers
 */

const { pool } = require('../../config/database');

// Cache for schema detection (persists across requests for performance)
let schemaInfo = null;
let schemaPromise = null; // Prevents multiple concurrent schema detection calls

/**
 * Helper function to detect database schema
 * Cached to avoid redundant queries
 */
async function detectSchema() {
  // Return cached schema immediately
  if (schemaInfo) return schemaInfo;

  // If another request is already detecting schema, wait for it
  if (schemaPromise) return schemaPromise;

  // Start schema detection and cache the promise
  schemaPromise = (async () => {
    try {
      // Check what columns exist in the escrows table
      const result = await pool.query(`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = 'escrows'
        AND column_name IN ('id', 'numeric_id', 'team_sequence_id', 'net_commission', 'my_commission', 'acceptance_date', 'buyer_side_commission', 'opening_date', 'uuid')
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
 * Helper to fetch escrow by ID with flexible ID format support
 * @param {string} id - Can be UUID, numeric ID, or display ID (ESCROW-2025-0001)
 * @returns {Promise<Object|null>} Escrow row or null if not found
 */
async function fetchEscrowById(id) {
  // Strip the "escrow-" prefix if present
  if (id.startsWith('escrow-')) {
    id = id.substring(7);
  }

  const schema = await detectSchema();

  // Determine if ID is UUID format or display format
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  // Build query to handle UUID, numeric ID, or display ID
  let whereClause;

  if (isUUID) {
    // UUID format - use id column
    whereClause = 'e.id = $1';
  } else if (/^\d+$/.test(id)) {
    // Pure numeric - use numeric_id or team_sequence_id
    if (schema.hasNumericId) {
      whereClause = 'e.numeric_id = $1::integer';
    } else if (schema.hasTeamSequenceId) {
      whereClause = 'e.team_sequence_id = $1::integer';
    } else {
      whereClause = 'e.display_id = $1';
    }
  } else if (/^ESCROW-\d{4}-\d{4}$/i.test(id)) {
    // Display ID format (ESCROW-2025-0001)
    whereClause = 'e.display_id = $1';
  } else {
    // Try all three formats
    whereClause = '(e.id = $1 OR e.display_id = $1 OR (e.numeric_id IS NOT NULL AND e.numeric_id::text = $1))';
  }

  // Get escrow details
  const escrowQuery = `
    SELECT e.*
    FROM escrows e
    WHERE ${whereClause}
  `;

  const escrowResult = await pool.query(escrowQuery, [id]);

  if (escrowResult.rows.length === 0) {
    return null;
  }

  return escrowResult.rows[0];
}

module.exports = {
  detectSchema,
  fetchEscrowById,
  pool,
};
