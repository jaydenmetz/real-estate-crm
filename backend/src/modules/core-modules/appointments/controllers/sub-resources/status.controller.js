/**
 * Appointments Status Controller
 *
 * Handles appointment status management operations:
 * - cancelAppointment: Cancel an appointment (set status to 'cancelled')
 * - markComplete: Mark an appointment as completed
 *
 * @module modules/appointments/controllers/status
 */

const { pool } = require('../../../../config/database');
const logger = require('../../../../utils/logger');

// POST /api/v1/appointments/:id/cancel
exports.cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      UPDATE appointments
      SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND deleted_at IS NULL
      RETURNING *
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Appointment not found',
        },
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Appointment cancelled successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Error cancelling appointment:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CANCEL_ERROR',
        message: 'Failed to cancel appointment',
        details: error.message,
      },
    });
  }
};

// POST /api/v1/appointments/:id/complete
exports.markComplete = async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      UPDATE appointments
      SET status = 'Completed', updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND deleted_at IS NULL
      RETURNING *
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Appointment not found',
        },
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Appointment marked as completed',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Error marking appointment complete:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'COMPLETE_ERROR',
        message: 'Failed to mark appointment as complete',
        details: error.message,
      },
    });
  }
};
