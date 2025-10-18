/**
 * Escrow Financials Controller
 * Handles all financial-related operations for escrows
 */

const { fetchEscrowById } = require('./shared');
const { buildRestructuredEscrowResponse } = require('../../helpers/escrows.helper');
const { pool } = require('../../config/database');
const websocketService = require('../../services/websocket.service');

class EscrowFinancialsController {
  /**
   * GET /v1/escrows/:id/financials
   * Returns the financials object with commission breakdown
   */
  static async getEscrowFinancials(req, res) {
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
   * PUT /v1/escrows/:id/financials
   * Updates the financials JSONB object and related database columns
   */
  static async updateEscrowFinancials(req, res) {
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

      // Merge existing financials with updates
      const existingFinancials = escrow.financials || {};
      const mergedFinancials = { ...existingFinancials, ...updates };

      // Build SET clause for database columns that map to financial fields
      const dbUpdates = {};
      if (updates.purchasePrice !== undefined) dbUpdates.purchase_price = updates.purchasePrice;
      if (updates.grossCommission !== undefined) dbUpdates.gross_commission = updates.grossCommission;
      if (updates.netCommission !== undefined) dbUpdates.net_commission = updates.netCommission;
      if (updates.agentSplit !== undefined || updates.agent1099Income !== undefined) {
        dbUpdates.my_commission = updates.agent1099Income || updates.agentSplit || updates.agentNet || 0;
      }
      if (updates.commissionPercentage !== undefined) dbUpdates.commission_percentage = updates.commissionPercentage;
      if (updates.commissionAdjustments !== undefined) dbUpdates.commission_adjustments = updates.commissionAdjustments;
      if (updates.expenseAdjustments !== undefined) dbUpdates.expense_adjustments = updates.expenseAdjustments;

      // Build dynamic UPDATE query
      const setClause = Object.keys(dbUpdates)
        .map((key, index) => `${key} = $${index + 2}`)
        .join(', ');

      const values = [JSON.stringify(mergedFinancials), ...Object.values(dbUpdates), escrow.id];

      const query = `
        UPDATE escrows
        SET financials = $1,
            ${setClause}${setClause ? ',' : ''}
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $${values.length}
        RETURNING *
      `;

      const result = await pool.query(query, values);
      const updatedEscrow = result.rows[0];

      // Broadcast WebSocket update
      websocketService.broadcastEscrowUpdate(escrow.id, {
        type: 'financials:updated',
        data: mergedFinancials,
      });

      // Build full response
      const fullResponse = buildRestructuredEscrowResponse(updatedEscrow);

      res.json({
        success: true,
        data: fullResponse.financials,
      });
    } catch (error) {
      console.error('Error updating escrow financials:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to update escrow financials',
        },
      });
    }
  }
}

module.exports = EscrowFinancialsController;
