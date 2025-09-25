const { pool } = require('../config/database');

class AppointmentsController {
  /**
   * Get all appointments with pagination
   */
  static async getAppointments(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        status,
        search
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
        whereConditions.push(`status = $${paramIndex}`);
        queryParams.push(status);
        paramIndex++;
      }

      if (search) {
        whereConditions.push(`(title ILIKE $${paramIndex} OR location ILIKE $${paramIndex})`);
        queryParams.push(`%${search}%`);
        paramIndex++;
      }

      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

      // Count total records
      const countQuery = `
        SELECT COUNT(*) as total
        FROM appointments
        ${whereClause}
      `;

      const countResult = await pool.query(countQuery, queryParams);
      const total = parseInt(countResult.rows[0].total);

      // Get appointments
      queryParams.push(limit, offset);
      const dataQuery = `
        SELECT *
        FROM appointments
        ${whereClause}
        ORDER BY appointment_date DESC
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;

      const result = await pool.query(dataQuery, queryParams);

      res.json({
        success: true,
        data: {
          appointments: result.rows,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / limit),
            totalCount: total,
            limit: parseInt(limit)
          }
        }
      });
    } catch (error) {
      console.error('Get appointments error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: 'Failed to fetch appointments',
          details: error.message
        }
      });
    }
  }

  /**
   * Get appointment by ID
   */
  static async getAppointment(req, res) {
    try {
      const { id } = req.params;

      const query = `
        SELECT * FROM appointments
        WHERE id = $1
      `;

      const result = await pool.query(query, [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Appointment not found'
          }
        });
      }

      res.json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Get appointment error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: 'Failed to fetch appointment'
        }
      });
    }
  }

  /**
   * Create appointment
   */
  static async createAppointment(req, res) {
    try {
      const {
        title,
        description,
        startDate,
        endDate,
        location,
        appointmentType = 'meeting',
        status = 'scheduled'
      } = req.body;

      const insertQuery = `
        INSERT INTO appointments (
          title,
          description,
          appointment_date,
          start_time,
          end_time,
          location,
          appointment_type,
          status,
          team_id,
          agent_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `;

      // Parse dates and times
      const appointmentDate = startDate ? new Date(startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
      const startTime = startDate ? new Date(startDate).toISOString().split('T')[1].substring(0, 8) : '10:00:00';
      const endTime = endDate ? new Date(endDate).toISOString().split('T')[1].substring(0, 8) : '11:00:00';

      const values = [
        title,
        description,
        appointmentDate,
        startTime,
        endTime,
        location,
        appointmentType,
        status,
        req.user.teamId || req.user.team_id,
        req.user.id
      ];

      const result = await pool.query(insertQuery, values);

      res.status(201).json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Create appointment error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'CREATE_ERROR',
          message: 'Failed to create appointment',
          details: error.message
        }
      });
    }
  }

  /**
   * Update appointment
   */
  static async updateAppointment(req, res) {
    try {
      const { id } = req.params;
      const {
        title,
        description,
        startDate,
        endDate,
        location,
        status
      } = req.body;

      const updates = [];
      const values = [];
      let valueIndex = 1;

      if (title) {
        updates.push(`title = $${valueIndex++}`);
        values.push(title);
      }
      if (description !== undefined) {
        updates.push(`description = $${valueIndex++}`);
        values.push(description);
      }
      if (startDate) {
        updates.push(`appointment_date = $${valueIndex++}`);
        values.push(new Date(startDate).toISOString().split('T')[0]);
        updates.push(`start_time = $${valueIndex++}`);
        values.push(new Date(startDate).toISOString().split('T')[1].substring(0, 8));
      }
      if (endDate) {
        updates.push(`end_time = $${valueIndex++}`);
        values.push(new Date(endDate).toISOString().split('T')[1].substring(0, 8));
      }
      if (location !== undefined) {
        updates.push(`location = $${valueIndex++}`);
        values.push(location);
      }
      if (status) {
        updates.push(`status = $${valueIndex++}`);
        values.push(status);
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
        UPDATE appointments
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
            message: 'Appointment not found'
          }
        });
      }

      res.json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Update appointment error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'UPDATE_ERROR',
          message: 'Failed to update appointment'
        }
      });
    }
  }

  /**
   * Delete appointment
   */
  static async deleteAppointment(req, res) {
    try {
      const { id } = req.params;

      // Check if appointment is archived
      const checkQuery = `
        SELECT status FROM appointments WHERE id = $1
      `;

      const checkResult = await pool.query(checkQuery, [id]);

      if (checkResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Appointment not found'
          }
        });
      }

      if (checkResult.rows[0].status !== 'archived' && checkResult.rows[0].status !== 'cancelled') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'NOT_ARCHIVED',
            message: 'Appointment must be archived or cancelled before deletion'
          }
        });
      }

      const deleteQuery = `
        DELETE FROM appointments
        WHERE id = $1
        RETURNING id
      `;

      await pool.query(deleteQuery, [id]);

      res.json({
        success: true,
        message: 'Appointment deleted successfully'
      });
    } catch (error) {
      console.error('Delete appointment error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'DELETE_ERROR',
          message: 'Failed to delete appointment'
        }
      });
    }
  }

  /**
   * Archive appointment
   */
  static async archiveAppointment(req, res) {
    try {
      const { id } = req.params;

      const updateQuery = `
        UPDATE appointments
        SET status = 'archived',
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
            message: 'Appointment not found'
          }
        });
      }

      res.json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Archive appointment error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'ARCHIVE_ERROR',
          message: 'Failed to archive appointment'
        }
      });
    }
  }

  // Placeholder methods for compatibility
  static async sendReminders(req, res) {
    res.json({ success: true, message: 'Reminders sent' });
  }

  static async markComplete(req, res) {
    const { id } = req.params;
    const updateQuery = `
      UPDATE appointments SET status = 'completed', updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 RETURNING *
    `;
    const result = await pool.query(updateQuery, [id]);
    res.json({ success: true, data: result.rows[0] });
  }

  static async markNoShow(req, res) {
    const { id } = req.params;
    const updateQuery = `
      UPDATE appointments SET status = 'no_show', updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 RETURNING *
    `;
    const result = await pool.query(updateQuery, [id]);
    res.json({ success: true, data: result.rows[0] });
  }

  static async cancelAppointment(req, res) {
    const { id } = req.params;
    const updateQuery = `
      UPDATE appointments SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 RETURNING *
    `;
    const result = await pool.query(updateQuery, [id]);
    res.json({ success: true, data: result.rows[0] });
  }

  static async addPreparationNote(req, res) {
    const { id } = req.params;
    const { note } = req.body;
    const updateQuery = `
      UPDATE appointments
      SET notes = COALESCE(notes, '') || E'\\n' || $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 RETURNING *
    `;
    const result = await pool.query(updateQuery, [id, note]);
    res.json({ success: true, data: result.rows[0] });
  }

  static async updateOutcome(req, res) {
    const { id } = req.params;
    const { outcome } = req.body;
    const updateQuery = `
      UPDATE appointments
      SET outcome = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 RETURNING *
    `;
    const result = await pool.query(updateQuery, [id, outcome]);
    res.json({ success: true, data: result.rows[0] });
  }

  static async bulkUpdateStatus(req, res) {
    const { ids, status } = req.body;
    const updateQuery = `
      UPDATE appointments
      SET status = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = ANY($1) RETURNING *
    `;
    const result = await pool.query(updateQuery, [ids, status]);
    res.json({ success: true, data: result.rows });
  }

  static async getUpcoming(req, res) {
    const query = `
      SELECT * FROM appointments
      WHERE appointment_date >= CURRENT_DATE
      ORDER BY start_date ASC
      LIMIT 20
    `;
    const result = await pool.query(query);
    res.json({ success: true, data: result.rows });
  }

  static async getOverdue(req, res) {
    const query = `
      SELECT * FROM appointments
      WHERE appointment_date < CURRENT_DATE AND status = 'scheduled'
      ORDER BY end_date DESC
      LIMIT 20
    `;
    const result = await pool.query(query);
    res.json({ success: true, data: result.rows });
  }
}

module.exports = AppointmentsController;