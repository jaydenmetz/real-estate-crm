/**
 * Clients Notes Controller
 *
 * Handles notes and tags operations for client entities:
 * - addNote: Append a timestamped note to client's contact record
 * - bulkUpdateTags: Replace all tags for a client
 *
 * These operations modify the associated contact record in the contacts table,
 * as clients don't have their own notes/tags fields but inherit them from contacts.
 */

const { pool } = require('../../../../../config/database');
const logger = require('../../../../../utils/logger');

// POST /api/v1/clients/:id/notes
exports.addNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_CONTENT',
          message: 'Note content is required',
        },
      });
    }

    // Update notes in contacts table
    const query = `
      UPDATE contacts
      SET notes = COALESCE(notes, '') || E'\n' || $1 || ' - ' || NOW()::text,
          updated_at = NOW()
      WHERE id = (SELECT contact_id FROM clients WHERE id = $2)
      RETURNING notes
    `;

    const result = await pool.query(query, [content, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Client not found',
        },
      });
    }

    res.status(201).json({
      success: true,
      data: { notes: result.rows[0].notes },
    });
  } catch (error) {
    console.error('Add note error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'NOTE_ERROR',
        message: 'Failed to add note',
        details: error.message,
      },
    });
  }
};

// PATCH /api/v1/clients/:id/tags
exports.bulkUpdateTags = async (req, res) => {
  try {
    const { id } = req.params;
    const { tags } = req.body;

    if (!Array.isArray(tags)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_TAGS',
          message: 'Tags must be an array',
        },
      });
    }

    const query = `
      UPDATE contacts
      SET tags = $1, updated_at = NOW()
      WHERE id = (SELECT contact_id FROM clients WHERE id = $2)
      RETURNING tags
    `;

    const result = await pool.query(query, [tags, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Client not found',
        },
      });
    }

    res.json({
      success: true,
      data: { tags: result.rows[0].tags },
    });
  } catch (error) {
    console.error('Update tags error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'TAG_ERROR',
        message: 'Failed to update tags',
        details: error.message,
      },
    });
  }
};
