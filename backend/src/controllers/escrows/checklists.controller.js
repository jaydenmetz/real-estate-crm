/**
 * Escrow Checklists Controller
 * Handles all checklist-related operations for escrows
 */

const { fetchEscrowById } = require('./shared');
const { buildRestructuredEscrowResponse } = require('../../helpers/escrows.helper');
const { pool } = require('../../config/database');
const websocketService = require('../../services/websocket.service');

class EscrowChecklistsController {
  /**
   * GET /v1/escrows/:id/checklists
   * Returns all 3 checklists (loan, house, admin)
   */
  static async getEscrowChecklists(req, res) {
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

      // Return all 3 checklist sections
      res.json({
        success: true,
        data: {
          loan: fullResponse['checklist-loan'],
          house: fullResponse['checklist-house'],
          admin: fullResponse['checklist-admin'],
        },
      });
    } catch (error) {
      console.error('Error fetching escrow checklists:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to fetch escrow checklists',
        },
      });
    }
  }

  /**
   * GET /v1/escrows/:id/checklist-loan
   * Returns loan checklist
   */
  static async getEscrowChecklistLoan(req, res) {
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

      const fullResponse = buildRestructuredEscrowResponse(escrow);

      res.json({
        success: true,
        data: fullResponse['checklist-loan'],
      });
    } catch (error) {
      console.error('Error fetching loan checklist:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to fetch loan checklist',
        },
      });
    }
  }

  /**
   * GET /v1/escrows/:id/checklist-house
   * Returns house checklist
   */
  static async getEscrowChecklistHouse(req, res) {
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

      const fullResponse = buildRestructuredEscrowResponse(escrow);

      res.json({
        success: true,
        data: fullResponse['checklist-house'],
      });
    } catch (error) {
      console.error('Error fetching house checklist:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to fetch house checklist',
        },
      });
    }
  }

  /**
   * GET /v1/escrows/:id/checklist-admin
   * Returns admin checklist
   */
  static async getEscrowChecklistAdmin(req, res) {
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

      const fullResponse = buildRestructuredEscrowResponse(escrow);

      res.json({
        success: true,
        data: fullResponse['checklist-admin'],
      });
    } catch (error) {
      console.error('Error fetching admin checklist:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to fetch admin checklist',
        },
      });
    }
  }

  /**
   * PUT /v1/escrows/:id/checklist-loan
   * Updates loan checklist
   */
  static async updateEscrowChecklistLoan(req, res) {
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

      // Merge existing loan checklist with updates
      const existingChecklists = escrow.checklists || {};
      const existingLoan = existingChecklists.loan || {};
      const mergedLoan = { ...existingLoan, ...updates };

      // Update the checklists JSONB field
      const updatedChecklists = {
        ...existingChecklists,
        loan: mergedLoan,
      };

      const result = await pool.query(
        `UPDATE escrows
         SET checklists = $1,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $2
         RETURNING *`,
        [JSON.stringify(updatedChecklists), escrow.id]
      );

      const updatedEscrow = result.rows[0];

      // Broadcast WebSocket update
      websocketService.broadcastEscrowUpdate(escrow.id, {
        type: 'checklist:updated',
        category: 'loan',
        data: mergedLoan,
      });

      const fullResponse = buildRestructuredEscrowResponse(updatedEscrow);

      res.json({
        success: true,
        data: fullResponse['checklist-loan'],
      });
    } catch (error) {
      console.error('Error updating loan checklist:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to update loan checklist',
        },
      });
    }
  }

  /**
   * PUT /v1/escrows/:id/checklist-house
   * Updates house checklist
   */
  static async updateEscrowChecklistHouse(req, res) {
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

      const existingChecklists = escrow.checklists || {};
      const existingHouse = existingChecklists.house || {};
      const mergedHouse = { ...existingHouse, ...updates };

      const updatedChecklists = {
        ...existingChecklists,
        house: mergedHouse,
      };

      const result = await pool.query(
        `UPDATE escrows
         SET checklists = $1,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $2
         RETURNING *`,
        [JSON.stringify(updatedChecklists), escrow.id]
      );

      const updatedEscrow = result.rows[0];

      websocketService.broadcastEscrowUpdate(escrow.id, {
        type: 'checklist:updated',
        category: 'house',
        data: mergedHouse,
      });

      const fullResponse = buildRestructuredEscrowResponse(updatedEscrow);

      res.json({
        success: true,
        data: fullResponse['checklist-house'],
      });
    } catch (error) {
      console.error('Error updating house checklist:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to update house checklist',
        },
      });
    }
  }

  /**
   * PUT /v1/escrows/:id/checklist-admin
   * Updates admin checklist
   */
  static async updateEscrowChecklistAdmin(req, res) {
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

      const existingChecklists = escrow.checklists || {};
      const existingAdmin = existingChecklists.admin || {};
      const mergedAdmin = { ...existingAdmin, ...updates };

      const updatedChecklists = {
        ...existingChecklists,
        admin: mergedAdmin,
      };

      const result = await pool.query(
        `UPDATE escrows
         SET checklists = $1,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $2
         RETURNING *`,
        [JSON.stringify(updatedChecklists), escrow.id]
      );

      const updatedEscrow = result.rows[0];

      websocketService.broadcastEscrowUpdate(escrow.id, {
        type: 'checklist:updated',
        category: 'admin',
        data: mergedAdmin,
      });

      const fullResponse = buildRestructuredEscrowResponse(updatedEscrow);

      res.json({
        success: true,
        data: fullResponse['checklist-admin'],
      });
    } catch (error) {
      console.error('Error updating admin checklist:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to update admin checklist',
        },
      });
    }
  }

  /**
   * PUT /v1/escrows/:id/checklists
   * Updates all checklists at once
   */
  static async updateEscrowChecklists(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body; // Expected: { loan: {...}, house: {...}, admin: {...} }

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

      // Merge existing checklists with updates
      const existingChecklists = escrow.checklists || {};
      const updatedChecklists = {
        loan: { ...(existingChecklists.loan || {}), ...(updates.loan || {}) },
        house: { ...(existingChecklists.house || {}), ...(updates.house || {}) },
        admin: { ...(existingChecklists.admin || {}), ...(updates.admin || {}) },
      };

      const result = await pool.query(
        `UPDATE escrows
         SET checklists = $1,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $2
         RETURNING *`,
        [JSON.stringify(updatedChecklists), escrow.id]
      );

      const updatedEscrow = result.rows[0];

      websocketService.broadcastEscrowUpdate(escrow.id, {
        type: 'checklist:updated',
        category: 'all',
        data: updatedChecklists,
      });

      const fullResponse = buildRestructuredEscrowResponse(updatedEscrow);

      res.json({
        success: true,
        data: {
          loan: fullResponse['checklist-loan'],
          house: fullResponse['checklist-house'],
          admin: fullResponse['checklist-admin'],
        },
      });
    } catch (error) {
      console.error('Error updating checklists:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to update checklists',
        },
      });
    }
  }

  /**
   * PATCH /v1/escrows/:id/checklist
   * Updates a single checklist item
   */
  static async updateChecklist(req, res) {
    try {
      const { id } = req.params;
      const { item, value, note } = req.body;

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

      // Parse item path (e.g., "loan.le" or "house.emd")
      const [category, field] = item.split('.');

      if (!category || !field) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_ITEM',
            message: 'Checklist item must be in format "category.field" (e.g., "loan.le")',
          },
        });
      }

      const existingChecklists = escrow.checklists || {};
      const categoryChecklist = existingChecklists[category] || {};

      // Update the specific field
      categoryChecklist[field] = value;

      // If note provided, store it (optional feature)
      if (note) {
        categoryChecklist[`${field}_note`] = note;
      }

      const updatedChecklists = {
        ...existingChecklists,
        [category]: categoryChecklist,
      };

      const result = await pool.query(
        `UPDATE escrows
         SET checklists = $1,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $2
         RETURNING *`,
        [JSON.stringify(updatedChecklists), escrow.id]
      );

      const updatedEscrow = result.rows[0];

      websocketService.broadcastEscrowUpdate(escrow.id, {
        type: 'checklist:updated',
        category,
        field,
        value,
      });

      const fullResponse = buildRestructuredEscrowResponse(updatedEscrow);

      res.json({
        success: true,
        data: {
          loan: fullResponse['checklist-loan'],
          house: fullResponse['checklist-house'],
          admin: fullResponse['checklist-admin'],
        },
      });
    } catch (error) {
      console.error('Error updating checklist item:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to update checklist item',
        },
      });
    }
  }
}

module.exports = EscrowChecklistsController;
