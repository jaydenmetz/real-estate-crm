/**
 * Escrow People Controller
 * Handles all people-related operations for escrows
 */

const { fetchEscrowById } = require('./shared');
const { buildRestructuredEscrowResponse } = require('../../helpers/escrows.helper');
const { pool } = require('../../config/database');
const websocketService = require('../../services/websocket.service');

class EscrowPeopleController {
  /**
   * GET /v1/escrows/:id/people
   * Returns the people JSONB object for an escrow
   */
  static async getEscrowPeople(req, res) {
    try {
      const { id } = req.params;

      const escrow = await fetchEscrowById(id);

      if (!escrow) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Escrow not found',
          },
        });
      }

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
   * PUT /v1/escrows/:id/people
   * Updates the people JSONB object for an escrow
   */
  static async updateEscrowPeople(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const escrow = await fetchEscrowById(id);

      if (!escrow) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Escrow not found',
          },
        });
      }

      // Update the people JSONB field
      const result = await pool.query(
        `UPDATE escrows
         SET people = $1,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $2
         RETURNING *`,
        [JSON.stringify(updates), escrow.id]
      );

      const updatedEscrow = result.rows[0];

      // Broadcast WebSocket update
      websocketService.broadcastEscrowUpdate(escrow.id, {
        type: 'people:updated',
        data: updates,
      });

      // Build full response
      const fullResponse = buildRestructuredEscrowResponse(updatedEscrow);

      res.json({
        success: true,
        data: fullResponse.people,
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
}

module.exports = EscrowPeopleController;
