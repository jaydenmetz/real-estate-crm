/**
 * Escrows People Controller
 *
 * Handles escrow people/participants operations:
 * - getEscrowPeople() - Get people/participants information
 * - updateEscrowPeople() - Update people/participants information
 */

const { pool } = require('../../../../config/database');
const { buildRestructuredEscrowResponse } = require('../../utils/escrows.helper');
const { detectSchema } = require('../../services/schema.service');

/**
 * Get escrow people/participants
 */
async function getEscrowPeople(req, res) {
  try {
    let { id } = req.params;

    // Strip the "escrow-" prefix if present
    if (id.startsWith('escrow-')) {
      id = id.substring(7);
    }

    // Detect schema
    const schema = await detectSchema();

    // Determine if ID is UUID format or display format
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    // Build query to handle UUID, numeric ID, or display ID
    let whereClause;
    if (isUUID) {
      whereClause = 'e.id = $1';
    } else if (/^\d+$/.test(id)) {
      if (schema.hasNumericId) {
        whereClause = 'e.numeric_id = $1::integer';
      } else if (schema.hasTeamSequenceId) {
        whereClause = 'e.team_sequence_id = $1::integer';
      } else {
        whereClause = 'e.display_id = $1';
      }
    } else {
      whereClause = '(e.id = $1 OR e.display_id = $1 OR (e.numeric_id IS NOT NULL AND e.numeric_id::text = $1))';
    }

    // Get escrow details
    const escrowQuery = `
      SELECT
        e.*
      FROM escrows e
      WHERE ${whereClause}
    `;

    const escrowResult = await pool.query(escrowQuery, [id]);

    if (escrowResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Escrow not found',
        },
      });
    }

    const escrow = escrowResult.rows[0];

    // Build the full response using the existing function
    const fullResponse = buildRestructuredEscrowResponse(escrow);

    // Return just the people section
    res.json({
      success: true,
      data: fullResponse.people,
    });
  } catch (error) {
    console.error('Error fetching escrow people:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to fetch escrow people',
      },
    });
  }
}

/**
 * Update escrow people/participants
 */
async function updateEscrowPeople(req, res) {
  try {
    const { id } = req.params;
    const people = req.body;

    const isUUIDFormat = /^[0-9a-f]+-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    const query = `
      UPDATE escrows
      SET people = $2, updated_at = NOW()
      WHERE ${isUUIDFormat ? 'id = $1' : 'display_id = $1'}
      RETURNING id
    `;

    const result = await pool.query(query, [id, JSON.stringify(people)]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Escrow not found',
        },
      });
    }

    res.json({
      success: true,
      data: people,
      message: 'Escrow people updated successfully',
    });
  } catch (error) {
    console.error('Error updating escrow people:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to update escrow people',
      },
    });
  }
}

module.exports = {
  getEscrowPeople,
  updateEscrowPeople,
};
