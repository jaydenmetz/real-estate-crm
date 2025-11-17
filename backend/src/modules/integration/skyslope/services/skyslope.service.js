/**
 * SkySlope Service
 *
 * Business logic for SkySlope integration (transaction management platform).
 * Simple integration service for DDD compliance.
 */

const axios = require('axios');
const { pool } = require('../../../../config/infrastructure/database');

/**
 * Get SkySlope API credentials from environment
 */
const getSkySloperConfig = () => ({
  apiKey: process.env.SKYSLOPE_API_KEY,
  apiSecret: process.env.SKYSLOPE_API_SECRET,
  baseUrl: process.env.SKYSLOPE_BASE_URL || 'https://api.skyslope.com/v1'
});

/**
 * Sync transaction to SkySlope
 * @param {string} escrowId - Escrow ID to sync
 * @returns {Promise<Object>} Sync result
 */
exports.syncTransaction = async (escrowId) => {
  const config = getSkySloperConfig();

  if (!config.apiKey || !config.apiSecret) {
    const error = new Error('SkySlope API credentials not configured');
    error.code = 'CONFIG_ERROR';
    throw error;
  }

  // Get escrow data
  const escrowResult = await pool.query(
    'SELECT * FROM escrows WHERE id = $1 AND deleted_at IS NULL',
    [escrowId]
  );

  if (escrowResult.rows.length === 0) {
    const error = new Error('Escrow not found');
    error.code = 'NOT_FOUND';
    throw error;
  }

  const escrow = escrowResult.rows[0];

  // Map escrow data to SkySlope format
  const transactionData = {
    property_address: escrow.property_address,
    closing_date: escrow.closing_date,
    purchase_price: escrow.purchase_price,
    escrow_status: escrow.escrow_status,
    // Additional mappings as needed
  };

  try {
    const response = await axios.post(
      `${config.baseUrl}/transactions`,
      transactionData,
      {
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Log sync event
    await pool.query(
      `INSERT INTO skyslope_sync_log (id, escrow_id, sync_status, skyslope_transaction_id, created_at)
       VALUES (gen_random_uuid(), $1, 'success', $2, NOW())`,
      [escrowId, response.data.transaction_id]
    );

    return {
      status: 'success',
      skyslope_transaction_id: response.data.transaction_id,
      synced_at: new Date().toISOString()
    };
  } catch (error) {
    // Log failure
    await pool.query(
      `INSERT INTO skyslope_sync_log (id, escrow_id, sync_status, error_message, created_at)
       VALUES (gen_random_uuid(), $1, 'failed', $2, NOW())`,
      [escrowId, error.message]
    );

    const err = new Error('Failed to sync with SkySlope');
    err.code = 'SYNC_ERROR';
    err.details = error.message;
    throw err;
  }
};

/**
 * Fetch transaction from SkySlope
 * @param {string} skyslope_transaction_id - SkySlope transaction ID
 * @returns {Promise<Object>} Transaction data
 */
exports.fetchTransaction = async (skyslope_transaction_id) => {
  const config = getSkySloperConfig();

  if (!config.apiKey || !config.apiSecret) {
    const error = new Error('SkySlope API credentials not configured');
    error.code = 'CONFIG_ERROR';
    throw error;
  }

  try {
    const response = await axios.get(
      `${config.baseUrl}/transactions/${skyslope_transaction_id}`,
      {
        headers: {
          'Authorization': `Bearer ${config.apiKey}`
        }
      }
    );

    return response.data;
  } catch (error) {
    const err = new Error('Failed to fetch from SkySlope');
    err.code = 'FETCH_ERROR';
    err.details = error.message;
    throw err;
  }
};

/**
 * Get sync status for escrow
 * @param {string} escrowId - Escrow ID
 * @returns {Promise<Object>} Sync status
 */
exports.getSyncStatus = async (escrowId) => {
  const result = await pool.query(
    `SELECT * FROM skyslope_sync_log
     WHERE escrow_id = $1
     ORDER BY created_at DESC
     LIMIT 1`,
    [escrowId]
  );

  if (result.rows.length === 0) {
    return {
      status: 'never_synced',
      last_sync: null
    };
  }

  const lastSync = result.rows[0];
  return {
    status: lastSync.sync_status,
    last_sync: lastSync.created_at,
    skyslope_transaction_id: lastSync.skyslope_transaction_id,
    error_message: lastSync.error_message
  };
};

/**
 * Bulk sync multiple transactions
 * @param {Array<string>} escrowIds - Array of escrow IDs
 * @returns {Promise<Object>} Bulk sync results
 */
exports.bulkSync = async (escrowIds) => {
  const results = {
    success: [],
    failed: []
  };

  for (const escrowId of escrowIds) {
    try {
      const syncResult = await exports.syncTransaction(escrowId);
      results.success.push({
        escrow_id: escrowId,
        ...syncResult
      });
    } catch (error) {
      results.failed.push({
        escrow_id: escrowId,
        error: error.message
      });
    }
  }

  return results;
};
