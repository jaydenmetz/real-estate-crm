/**
 * Escrows Financials Controller
 *
 * Handles escrow financial operations:
 * - getEscrowFinancials() - Get financial information
 * - updateEscrowFinancials() - Update financial information
 */

const { pool } = require('../../../../../config/infrastructure/database');
const { buildRestructuredEscrowResponse } = require('../../utils/escrows.helper');

/**
 * Get escrow financials
 */
async function getEscrowFinancials(req, res) {
  try {
    const { id } = req.params;

    // Detect if ID is UUID format
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    // Get the full escrow record
    const query = `
      SELECT * FROM escrows
      WHERE ${isUUID ? 'id = $1' : 'display_id = $1'}
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Escrow not found',
        },
      });
    }

    const escrow = result.rows[0];

    // Use the same response builder as getEscrowById
    const fullResponse = buildRestructuredEscrowResponse(escrow);

    // Return just the financials section
    res.json({
      success: true,
      data: fullResponse.financials,
    });
  } catch (error) {
    console.error('Error fetching escrow financials:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to fetch escrow financials',
      },
    });
  }
}

/**
 * Update escrow financials
 */
async function updateEscrowFinancials(req, res) {
  try {
    const { id } = req.params;
    const financials = req.body;

    // Clean the ID
    let cleanId = id;
    if (id.startsWith('escrow-')) {
      cleanId = id.substring(7);
    }

    const isUUIDFormat = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanId);

    // First get the current escrow to preserve existing financials
    const getCurrentQuery = `
      SELECT financials
      FROM escrows
      WHERE ${isUUIDFormat ? 'id = $1' : 'display_id = $1'}
    `;

    const currentResult = await pool.query(getCurrentQuery, [cleanId]);

    if (currentResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Escrow not found',
        },
      });
    }

    // Merge new financials with existing ones - handle JSON parsing
    let existingFinancials = currentResult.rows[0].financials || {};
    // If it's a string, parse it
    if (typeof existingFinancials === 'string') {
      try {
        existingFinancials = JSON.parse(existingFinancials);
      } catch (e) {
        existingFinancials = {};
      }
    }
    const mergedFinancials = { ...existingFinancials, ...financials };

    // Update with merged data
    const updateQuery = `
      UPDATE escrows
      SET financials = $2, updated_at = NOW()
      WHERE ${isUUIDFormat ? 'id = $1' : 'display_id = $1'}
      RETURNING id, financials
    `;

    const result = await pool.query(updateQuery, [cleanId, JSON.stringify(mergedFinancials)]);

    res.json({
      success: true,
      data: result.rows[0].financials,
      message: 'Financials updated successfully',
    });
  } catch (error) {
    console.error('Error updating financials:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to update financials',
      },
    });
  }
}

module.exports = {
  getEscrowFinancials,
  updateEscrowFinancials,
};
