const { pool } = require('../config/database');

class LeadsController {
  /**
   * Get all leads with pagination
   */
  static async getLeads(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        status,
        search,
        source
      } = req.query;

      const offset = (page - 1) * limit;

      // Build WHERE conditions
      let whereConditions = [];
      let queryParams = [];
      let paramIndex = 1;

      // Add team filter if user has teamId
      if (req.user.teamId || req.user.team_id) {
        whereConditions.push(`team_id = $${paramIndex}`);
        queryParams.push(req.user.teamId || req.user.team_id);
        paramIndex++;
      }

      if (status && status !== 'all') {
        whereConditions.push(`lead_status = $${paramIndex}`);
        queryParams.push(status);
        paramIndex++;
      }

      if (source && source !== 'all') {
        whereConditions.push(`lead_source = $${paramIndex}`);
        queryParams.push(source);
        paramIndex++;
      }

      if (search) {
        whereConditions.push(`(first_name ILIKE $${paramIndex} OR last_name ILIKE $${paramIndex} OR email ILIKE $${paramIndex})`);
        queryParams.push(`%${search}%`);
        paramIndex++;
      }

      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

      // Count total records
      const countQuery = `
        SELECT COUNT(*) as total
        FROM leads
        ${whereClause}
      `;

      const countResult = await pool.query(countQuery, queryParams);
      const total = parseInt(countResult.rows[0].total);

      // Get leads
      queryParams.push(limit, offset);
      const dataQuery = `
        SELECT *
        FROM leads
        ${whereClause}
        ORDER BY created_at DESC
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;

      const result = await pool.query(dataQuery, queryParams);

      res.json({
        success: true,
        data: {
          leads: result.rows,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / limit),
            totalCount: total,
            limit: parseInt(limit)
          }
        }
      });
    } catch (error) {
      console.error('Get leads error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: 'Failed to fetch leads',
          details: error.message
        }
      });
    }
  }

  /**
   * Get lead by ID
   */
  static async getLead(req, res) {
    try {
      const { id } = req.params;

      const query = `
        SELECT * FROM leads
        WHERE id = $1
      `;

      const result = await pool.query(query, [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Lead not found'
          }
        });
      }

      res.json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Get lead error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: 'Failed to fetch lead'
        }
      });
    }
  }

  /**
   * Create lead
   */
  static async createLead(req, res) {
    try {
      const {
        firstName,
        lastName,
        email = `lead_${Date.now()}@example.com`,
        phone,
        leadSource = 'website',
        leadType = 'buyer',
        status = 'new',
        notes
      } = req.body;

      const insertQuery = `
        INSERT INTO leads (
          first_name,
          last_name,
          email,
          phone,
          lead_source,
          lead_status,
          notes,
          team_id,
          assigned_agent_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `;

      const values = [
        firstName,
        lastName,
        email,
        phone,
        leadSource,
        status,
        notes,
        req.user.teamId || req.user.team_id,
        req.user.id
      ];

      const result = await pool.query(insertQuery, values);

      res.status(201).json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Create lead error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'CREATE_ERROR',
          message: 'Failed to create lead',
          details: error.message
        }
      });
    }
  }

  /**
   * Update lead
   */
  static async updateLead(req, res) {
    try {
      const { id } = req.params;
      const {
        firstName,
        lastName,
        email,
        phone,
        status,
        leadType,
        notes
      } = req.body;

      const updates = [];
      const values = [];
      let valueIndex = 1;

      if (firstName) {
        updates.push(`first_name = $${valueIndex++}`);
        values.push(firstName);
      }
      if (lastName) {
        updates.push(`last_name = $${valueIndex++}`);
        values.push(lastName);
      }
      if (email) {
        updates.push(`email = $${valueIndex++}`);
        values.push(email);
      }
      if (phone !== undefined) {
        updates.push(`phone = $${valueIndex++}`);
        values.push(phone);
      }
      if (status) {
        updates.push(`lead_status = $${valueIndex++}`);
        values.push(status);
      }
      if (notes !== undefined) {
        updates.push(`notes = $${valueIndex++}`);
        values.push(notes);
      }

      if (updates.length === 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'NO_UPDATES',
            message: 'No fields to update'
          }
        });
      }

      updates.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(id);

      const updateQuery = `
        UPDATE leads
        SET ${updates.join(', ')}
        WHERE id = $${valueIndex}
        RETURNING *
      `;

      const result = await pool.query(updateQuery, values);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Lead not found'
          }
        });
      }

      res.json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Update lead error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'UPDATE_ERROR',
          message: 'Failed to update lead'
        }
      });
    }
  }

  /**
   * Delete lead
   */
  static async deleteLead(req, res) {
    try {
      const { id } = req.params;

      // Check if lead is archived
      const checkQuery = `
        SELECT lead_status FROM leads WHERE id = $1
      `;

      const checkResult = await pool.query(checkQuery, [id]);

      if (checkResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Lead not found'
          }
        });
      }

      if (checkResult.rows[0].lead_status !== 'archived') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'NOT_ARCHIVED',
            message: 'Lead must be archived before deletion'
          }
        });
      }

      const deleteQuery = `
        DELETE FROM leads
        WHERE id = $1
        RETURNING id
      `;

      await pool.query(deleteQuery, [id]);

      res.json({
        success: true,
        message: 'Lead deleted successfully'
      });
    } catch (error) {
      console.error('Delete lead error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'DELETE_ERROR',
          message: 'Failed to delete lead'
        }
      });
    }
  }

  /**
   * Archive lead
   */
  static async archiveLead(req, res) {
    try {
      const { id } = req.params;

      const updateQuery = `
        UPDATE leads
        SET lead_status = 'archived',
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *
      `;

      const result = await pool.query(updateQuery, [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Lead not found'
          }
        });
      }

      res.json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Archive lead error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'ARCHIVE_ERROR',
          message: 'Failed to archive lead'
        }
      });
    }
  }

  // Placeholder methods for compatibility
  static async convertToClient(req, res) {
    res.json({ success: true, message: 'Lead converted to client' });
  }

  static async assignLead(req, res) {
    const { id } = req.params;
    const { agentId } = req.body;
    const updateQuery = `
      UPDATE leads SET assigned_agent_id = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 RETURNING *
    `;
    const result = await pool.query(updateQuery, [id, agentId]);
    res.json({ success: true, data: result.rows[0] });
  }

  static async updateScore(req, res) {
    const { id } = req.params;
    const { score } = req.body;
    const updateQuery = `
      UPDATE leads SET lead_score = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 RETURNING *
    `;
    const result = await pool.query(updateQuery, [id, score]);
    res.json({ success: true, data: result.rows[0] });
  }

  static async addNote(req, res) {
    const { id } = req.params;
    const { note } = req.body;
    const updateQuery = `
      UPDATE leads
      SET notes = COALESCE(notes, '') || E'\\n' || $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 RETURNING *
    `;
    const result = await pool.query(updateQuery, [id, note]);
    res.json({ success: true, data: result.rows[0] });
  }

  static async bulkAssign(req, res) {
    const { leadIds, agentId } = req.body;
    const updateQuery = `
      UPDATE leads
      SET assigned_agent_id = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = ANY($1) RETURNING *
    `;
    const result = await pool.query(updateQuery, [leadIds, agentId]);
    res.json({ success: true, data: result.rows });
  }

  static async bulkUpdateStatus(req, res) {
    const { leadIds, status } = req.body;
    const updateQuery = `
      UPDATE leads
      SET lead_status = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = ANY($1) RETURNING *
    `;
    const result = await pool.query(updateQuery, [leadIds, status]);
    res.json({ success: true, data: result.rows });
  }

  static async searchDuplicates(req, res) {
    res.json({ success: true, data: [] });
  }

  static async mergeLead(req, res) {
    res.json({ success: true, message: 'Leads merged' });
  }

  static async getLeadActivity(req, res) {
    res.json({ success: true, data: [] });
  }

  static async getLeadTimeline(req, res) {
    res.json({ success: true, data: [] });
  }

  static async recordActivity(req, res) {
    const { id } = req.params;
    const { activity } = req.body;
    res.json({ success: true, message: 'Activity recorded', leadId: id, activity });
  }

  /**
   * Batch delete leads (hard delete - only after archiving)
   * This endpoint is used by the health dashboard to test batch delete functionality
   * Enforces archive-before-delete workflow for data safety
   * Will only delete if all leads have been archived (lead_status = 'archived')
   */
  static async batchDeleteLeads(req, res) {
    const client = await pool.connect();
    try {
      const { ids } = req.body;
      const teamId = req.user.teamId || req.user.team_id;

      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'IDs must be a non-empty array'
          }
        });
      }

      await client.query('BEGIN');

      // First verify all leads exist and are archived
      const verifyQuery = `
        SELECT id, first_name, last_name, lead_status
        FROM leads
        WHERE id = ANY($1)
        AND team_id = $2
      `;

      const verifyResult = await client.query(verifyQuery, [ids, teamId]);

      if (verifyResult.rows.length !== ids.length) {
        await client.query('ROLLBACK');
        const foundIds = verifyResult.rows.map(row => row.id);
        const notFoundIds = ids.filter(id => !foundIds.includes(id));

        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: `Some leads not found: ${notFoundIds.join(', ')}`,
            notFoundIds
          }
        });
      }

      // Check if all are archived
      const notArchivedLeads = verifyResult.rows.filter(row => row.lead_status !== 'archived');
      if (notArchivedLeads.length > 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          error: {
            code: 'NOT_ARCHIVED',
            message: 'All leads must be archived before deletion',
            notArchivedIds: notArchivedLeads.map(l => l.id)
          }
        });
      }

      // Delete all leads
      const deleteQuery = `
        DELETE FROM leads
        WHERE id = ANY($1)
        AND team_id = $2
        AND lead_status = 'archived'
        RETURNING id, first_name, last_name
      `;

      const deleteResult = await client.query(deleteQuery, [ids, teamId]);

      await client.query('COMMIT');

      console.log('Batch delete leads completed', {
        deletedCount: deleteResult.rows.length,
        deletedBy: req.user?.email || 'unknown',
        leadIds: deleteResult.rows.map(row => row.id)
      });

      res.json({
        success: true,
        data: {
          deletedCount: deleteResult.rows.length,
          deletedLeads: deleteResult.rows,
          message: `Successfully deleted ${deleteResult.rows.length} leads`
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error in batch delete leads:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'BATCH_DELETE_ERROR',
          message: 'Failed to batch delete leads'
        }
      });
    } finally {
      client.release();
    }
  }
}

module.exports = LeadsController;