/**
 * Leads Conversion Controller
 *
 * Handles lead conversion and activity tracking:
 * - convertToClient: Convert a lead to a client (with transaction)
 * - recordActivity: Record activity/interaction with a lead
 *
 * @module controllers/leads/conversion
 */

const { pool } = require('../../../../../config/database');
const logger = require('../../../../../utils/logger');

// POST /api/v1/leads/:id/convert
exports.convertToClient = async (req, res) => {
  const client = await pool.connect();

  try {
    const { id } = req.params;

    await client.query('BEGIN');

    // Get lead data
    const leadQuery = 'SELECT * FROM leads WHERE id = $1 AND deleted_at IS NULL';
    const leadResult = await client.query(leadQuery, [id]);

    if (leadResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Lead not found',
        },
      });
    }

    const lead = leadResult.rows[0];

    // Create contact first
    const contactQuery = `
      INSERT INTO contacts (
        contact_type, first_name, last_name, email, phone,
        notes, team_id, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      RETURNING id
    `;

    const contactValues = [
      'buyer', // Default to buyer for converted leads
      lead.first_name,
      lead.last_name,
      lead.email,
      lead.phone,
      `Converted from lead. Original notes: ${lead.notes || 'None'}`,
      lead.team_id,
    ];

    const contactResult = await client.query(contactQuery, contactValues);
    const contactId = contactResult.rows[0].id;

    // Create client from lead
    const clientQuery = `
      INSERT INTO clients (contact_id, client_type, status, created_at, updated_at)
      VALUES ($1, $2, 'active', NOW(), NOW())
      RETURNING *
    `;

    const clientResult = await client.query(clientQuery, [contactId, 'buyer']);
    const newClient = clientResult.rows[0];

    // Update lead with conversion info
    const updateLeadQuery = `
      UPDATE leads
      SET converted_to_client_id = $1, lead_status = 'converted', updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;

    const updatedLeadResult = await client.query(updateLeadQuery, [newClient.id, id]);

    await client.query('COMMIT');

    res.json({
      success: true,
      data: {
        client: newClient,
        lead: updatedLeadResult.rows[0],
      },
      message: 'Lead successfully converted to client',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Error converting lead to client:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CONVERT_ERROR',
        message: 'Failed to convert lead to client',
        details: error.message,
      },
    });
  } finally {
    client.release();
  }
};

// POST /api/v1/leads/:id/activities
exports.recordActivity = async (req, res) => {
  try {
    const { id } = req.params;
    const { activityType, notes } = req.body;

    // Update last contact date and add notes
    const query = `
      UPDATE leads
      SET
        last_contact_date = CURRENT_DATE,
        notes = CASE
          WHEN notes IS NULL OR notes = '' THEN $1
          ELSE notes || E'\n\n[' || CURRENT_TIMESTAMP || '] ' || $1
        END,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 AND deleted_at IS NULL
      RETURNING *
    `;

    const activityNote = `${activityType}: ${notes || 'Contact made'}`;
    const result = await pool.query(query, [activityNote, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Lead not found',
        },
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Activity recorded successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Error recording lead activity:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'ACTIVITY_ERROR',
        message: 'Failed to record activity',
        details: error.message,
      },
    });
  }
};
