/**
 * Escrows Checklists Controller
 *
 * Handles escrow checklist operations:
 * - getEscrowChecklists() - Get all checklists (loan, house, admin)
 * - updateEscrowChecklists() - Update all checklists
 * - getEscrowChecklistLoan() - Get loan checklist only
 * - updateEscrowChecklistLoan() - Update loan checklist
 * - getEscrowChecklistHouse() - Get house checklist only
 * - updateEscrowChecklistHouse() - Update house checklist
 * - getEscrowChecklistAdmin() - Get admin checklist only
 * - updateEscrowChecklistAdmin() - Update admin checklist
 */

const { pool } = require('../../../../config/database');
const { buildRestructuredEscrowResponse } = require('../../utils/escrows.helper');

/**
 * Get all checklists (loan, house, admin)
 */
async function getEscrowChecklists(req, res) {
  try {
    const { id } = req.params;

    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

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
    const fullResponse = buildRestructuredEscrowResponse(escrow);

    res.json({
      success: true,
      data: {
        'checklist-loan': fullResponse['checklist-loan'],
        'checklist-house': fullResponse['checklist-house'],
        'checklist-admin': fullResponse['checklist-admin'],
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
 * Update all checklists
 */
async function updateEscrowChecklists(req, res) {
  try {
    const { id } = req.params;
    const checklists = req.body;

    const isUUIDFormat = /^[0-9a-f]+-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    const query = `
      UPDATE escrows
      SET checklists = $2, updated_at = NOW()
      WHERE ${isUUIDFormat ? 'id = $1' : 'display_id = $1'}
      RETURNING id
    `;

    const result = await pool.query(query, [id, JSON.stringify(checklists)]);

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
      data: checklists,
      message: 'Escrow checklists updated successfully',
    });
  } catch (error) {
    console.error('Error updating escrow checklists:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to update escrow checklists',
      },
    });
  }
}

/**
 * Get loan checklist only
 */
async function getEscrowChecklistLoan(req, res) {
  try {
    const { id } = req.params;

    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

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
 * Update loan checklist
 */
async function updateEscrowChecklistLoan(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body;

    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    // Get current checklists
    const getQuery = `
      SELECT checklists FROM escrows
      WHERE ${isUUID ? 'id = $1' : 'display_id = $1'}
    `;

    const getResult = await pool.query(getQuery, [id]);

    if (getResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Escrow not found',
        },
      });
    }

    // Update loan checklist
    const checklists = getResult.rows[0].checklists || {};
    checklists.loan = { ...checklists.loan, ...updates };

    const updateQuery = `
      UPDATE escrows
      SET checklists = $1, updated_at = NOW()
      WHERE ${isUUID ? 'id = $2' : 'display_id = $2'}
      RETURNING *
    `;

    const result = await pool.query(updateQuery, [JSON.stringify(checklists), id]);
    const fullResponse = buildRestructuredEscrowResponse(result.rows[0]);

    res.json({
      success: true,
      data: fullResponse['checklist-loan'],
      message: 'Loan checklist updated successfully',
    });
  } catch (error) {
    console.error('Error updating loan checklist:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_ERROR',
        message: 'Failed to update loan checklist',
      },
    });
  }
}

/**
 * Get house checklist only
 */
async function getEscrowChecklistHouse(req, res) {
  try {
    const { id } = req.params;

    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

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
 * Update house checklist
 */
async function updateEscrowChecklistHouse(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body;

    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    // Get current checklists
    const getQuery = `
      SELECT checklists FROM escrows
      WHERE ${isUUID ? 'id = $1' : 'display_id = $1'}
    `;

    const getResult = await pool.query(getQuery, [id]);

    if (getResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Escrow not found',
        },
      });
    }

    // Update house checklist
    const checklists = getResult.rows[0].checklists || {};
    checklists.house = { ...checklists.house, ...updates };

    const updateQuery = `
      UPDATE escrows
      SET checklists = $1, updated_at = NOW()
      WHERE ${isUUID ? 'id = $2' : 'display_id = $2'}
      RETURNING *
    `;

    const result = await pool.query(updateQuery, [JSON.stringify(checklists), id]);
    const fullResponse = buildRestructuredEscrowResponse(result.rows[0]);

    res.json({
      success: true,
      data: fullResponse['checklist-house'],
      message: 'House checklist updated successfully',
    });
  } catch (error) {
    console.error('Error updating house checklist:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_ERROR',
        message: 'Failed to update house checklist',
      },
    });
  }
}

/**
 * Get admin checklist only
 */
async function getEscrowChecklistAdmin(req, res) {
  try {
    const { id } = req.params;

    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

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
 * Update admin checklist
 */
async function updateEscrowChecklistAdmin(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body;

    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    // Get current checklists
    const getQuery = `
      SELECT checklists FROM escrows
      WHERE ${isUUID ? 'id = $1' : 'display_id = $1'}
    `;

    const getResult = await pool.query(getQuery, [id]);

    if (getResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Escrow not found',
        },
      });
    }

    // Update admin checklist
    const checklists = getResult.rows[0].checklists || {};
    checklists.admin = { ...checklists.admin, ...updates };

    const updateQuery = `
      UPDATE escrows
      SET checklists = $1, updated_at = NOW()
      WHERE ${isUUID ? 'id = $2' : 'display_id = $2'}
      RETURNING *
    `;

    const result = await pool.query(updateQuery, [JSON.stringify(checklists), id]);
    const fullResponse = buildRestructuredEscrowResponse(result.rows[0]);

    res.json({
      success: true,
      data: fullResponse['checklist-admin'],
      message: 'Admin checklist updated successfully',
    });
  } catch (error) {
    console.error('Error updating admin checklist:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_ERROR',
        message: 'Failed to update admin checklist',
      },
    });
  }
}

module.exports = {
  getEscrowChecklists,
  updateEscrowChecklists,
  getEscrowChecklistLoan,
  updateEscrowChecklistLoan,
  getEscrowChecklistHouse,
  updateEscrowChecklistHouse,
  getEscrowChecklistAdmin,
  updateEscrowChecklistAdmin,
};
