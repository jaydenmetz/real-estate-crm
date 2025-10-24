/**
 * Escrows Timeline Controller
 *
 * Handles escrow timeline and notes operations:
 * - getEscrowTimeline() - Get timeline information
 * - updateEscrowTimeline() - Update timeline information
 * - getEscrowNotes() - Get notes
 * - addEscrowNote() - Add a new note
 */

const { pool } = require('../../../config/database');
const { buildRestructuredEscrowResponse } = require('../utils/escrows.helper');

/**
 * Get escrow timeline
 */
async function getEscrowTimeline(req, res) {
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
 * Update escrow timeline
 */
async function updateEscrowTimeline(req, res) {
  try {
    const { id } = req.params;
    const timeline = req.body;

    // Clean the ID
    let cleanId = id;
    if (id.startsWith('escrow-')) {
      cleanId = id.substring(7);
    }

    const isUUIDFormat = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanId);

    // First get the current escrow to preserve existing timeline
    const getCurrentQuery = `
      SELECT timeline
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

    // Merge new timeline with existing one - handle JSON parsing
    let existingTimeline = currentResult.rows[0].timeline || {};
    // If it's a string, parse it
    if (typeof existingTimeline === 'string') {
      try {
        existingTimeline = JSON.parse(existingTimeline);
      } catch (e) {
        existingTimeline = {};
      }
    }
    const mergedTimeline = { ...existingTimeline, ...timeline };

    // Update with merged data
    const updateQuery = `
      UPDATE escrows
      SET timeline = $2, updated_at = NOW()
      WHERE ${isUUIDFormat ? 'id = $1' : 'display_id = $1'}
      RETURNING id, timeline
    `;

    const result = await pool.query(updateQuery, [cleanId, JSON.stringify(mergedTimeline)]);

    res.json({
      success: true,
      data: result.rows[0].timeline,
      message: 'Timeline updated successfully',
    });
  } catch (error) {
    console.error('Error updating timeline:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to update timeline',
      },
    });
  }
}

/**
 * Get escrow notes
 */
async function getEscrowNotes(req, res) {
  try {
    const { id } = req.params;

    // Detect if ID is UUID format
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    // Get the escrow record
    const query = `
      SELECT id, display_id, notes FROM escrows
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

    // Parse notes if they exist
    let notes = [];
    if (escrow.notes) {
      try {
        notes = typeof escrow.notes === 'string' ? JSON.parse(escrow.notes) : escrow.notes;
      } catch (e) {
        notes = [];
      }
    }

    res.json({
      success: true,
      data: notes,
    });
  } catch (error) {
    console.error('Error fetching escrow notes:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to fetch escrow notes',
      },
    });
  }
}

/**
 * Add a note to escrow
 */
async function addEscrowNote(req, res) {
  try {
    const { id } = req.params;
    const { note, type = 'general' } = req.body;

    // Detect if ID is UUID format
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    // Get the escrow record
    const query = `
      SELECT id, display_id, notes FROM escrows
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

    // Parse existing notes
    let notes = [];
    if (escrow.notes) {
      try {
        notes = typeof escrow.notes === 'string' ? JSON.parse(escrow.notes) : escrow.notes;
      } catch (e) {
        notes = [];
      }
    }

    // Add new note
    const newNote = {
      id: Date.now().toString(),
      content: note,
      type,
      createdAt: new Date().toISOString(),
      createdBy: req.user?.username || 'System',
    };

    notes.push(newNote);

    // Update escrow with new notes
    const updateQuery = `
      UPDATE escrows
      SET notes = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id
    `;

    await pool.query(updateQuery, [JSON.stringify(notes), escrow.id]);

    res.json({
      success: true,
      data: {
        note: newNote,
        totalNotes: notes.length,
      },
    });
  } catch (error) {
    console.error('Error adding escrow note:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to add note',
      },
    });
  }
}

module.exports = {
  getEscrowTimeline,
  updateEscrowTimeline,
  getEscrowNotes,
  addEscrowNote,
};
