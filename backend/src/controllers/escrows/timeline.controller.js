/**
 * Escrow Timeline Controller
 * Handles all timeline-related operations for escrows
 */

const { fetchEscrowById } = require('./shared');
const { buildRestructuredEscrowResponse } = require('../../helpers/escrows.helper');
const { pool } = require('../../config/database');
const websocketService = require('../../services/websocket.service');

class EscrowTimelineController {
  /**
   * GET /v1/escrows/:id/timeline
   * Returns the timeline object with key dates
   */
  static async getEscrowTimeline(req, res) {
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

      // Return just the timeline section
      res.json({
        success: true,
        data: fullResponse.timeline,
      });
    } catch (error) {
      console.error('Error fetching escrow timeline:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to fetch escrow timeline',
        },
      });
    }
  }

  /**
   * PUT /v1/escrows/:id/timeline
   * Updates the timeline JSONB object for an escrow
   */
  static async updateEscrowTimeline(req, res) {
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

      // Merge existing timeline with updates (preserves other dates)
      const existingTimeline = escrow.timeline || {};
      const mergedTimeline = { ...existingTimeline, ...updates };

      // Update the timeline JSONB field
      const result = await pool.query(
        `UPDATE escrows
         SET timeline = $1,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $2
         RETURNING *`,
        [JSON.stringify(mergedTimeline), escrow.id]
      );

      const updatedEscrow = result.rows[0];

      // Broadcast WebSocket update
      websocketService.broadcastEscrowUpdate(escrow.id, {
        type: 'timeline:updated',
        data: mergedTimeline,
      });

      // Build full response
      const fullResponse = buildRestructuredEscrowResponse(updatedEscrow);

      res.json({
        success: true,
        data: fullResponse.timeline,
      });
    } catch (error) {
      console.error('Error updating escrow timeline:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to update escrow timeline',
        },
      });
    }
  }
}

module.exports = EscrowTimelineController;
