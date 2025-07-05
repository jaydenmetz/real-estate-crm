

// backend/src/controllers/appointments.controller.js

const { v4: uuidv4 } = require('uuid');
const pool = require('../config/database').pool;

/**
 * GET /v1/appointments
 * List all appointments, with optional date filter (YYYY-MM-DD) and pagination.
 */
exports.getAppointments = async (req, res, next) => {
  try {
    const page   = parseInt(req.query.page, 10) || 1;
    const limit  = Math.min(parseInt(req.query.limit, 10) || 20, 100);
    const date   = req.query.date; // optional date filter
    const offset = (page - 1) * limit;

    // Count total
    let countQuery = 'SELECT COUNT(*) FROM appointments';
    let dataQuery  = `
      SELECT
        a.id,
        a.title,
        a.description,
        a.appointment_date AS "date",
        a.start_time       AS "startTime",
        a.end_time         AS "endTime",
        a.client_id        AS "clientId",
        a.status,
        a.created_at       AS "createdAt"
      FROM appointments a
    `;
    const params = [];
    if (date) {
      params.push(date);
      countQuery += ' WHERE appointment_date = $1';
      dataQuery  += ' WHERE appointment_date = $1';
    }
    dataQuery += ' ORDER BY appointment_date DESC, start_time DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);

    // Execute count
    const countRes = await pool.query(countQuery, params);
    const total    = parseInt(countRes.rows[0].count, 10);

    // Execute data fetch
    params.push(limit, offset);
    const dataRes = await pool.query(dataQuery, params);

    res.json({
      appointments: dataRes.rows,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /v1/appointments/:id
 * Retrieve a single appointment by ID.
 */
exports.getAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query(
      `SELECT
         id,
         title,
         description,
         appointment_date AS "date",
         start_time       AS "startTime",
         end_time         AS "endTime",
         client_id        AS "clientId",
         status,
         created_at       AS "createdAt",
         updated_at       AS "updatedAt"
       FROM appointments
       WHERE id = $1`,
      [id]
    );
    if (!rows.length) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /v1/appointments
 * Create a new appointment.
 */
exports.createAppointment = async (req, res, next) => {
  try {
    const {
      title,
      description,
      appointmentDate,
      startTime,
      endTime,
      clientId,
      status = 'Scheduled'
    } = req.body;

    const id = `apt_${uuidv4().replace(/-/g, '').substring(0, 12)}`;

    const { rows } = await pool.query(
      `INSERT INTO appointments
        (id, title, description, appointment_date, start_time, end_time, client_id, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING
         id,
         title,
         description,
         appointment_date AS "date",
         start_time       AS "startTime",
         end_time         AS "endTime",
         client_id        AS "clientId",
         status,
         created_at       AS "createdAt"`,
      [id, title, description, appointmentDate, startTime, endTime, clientId, status]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /v1/appointments/:id
 * Update an existing appointment.
 */
exports.updateAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      appointmentDate,
      startTime,
      endTime,
      clientId,
      status
    } = req.body;

    const { rows } = await pool.query(
      `UPDATE appointments
         SET
           title             = COALESCE($2, title),
           description       = COALESCE($3, description),
           appointment_date  = COALESCE($4, appointment_date),
           start_time        = COALESCE($5, start_time),
           end_time          = COALESCE($6, end_time),
           client_id         = COALESCE($7, client_id),
           status            = COALESCE($8, status),
           updated_at        = NOW()
       WHERE id = $1
       RETURNING
         id,
         title,
         description,
         appointment_date AS "date",
         start_time       AS "startTime",
         end_time         AS "endTime",
         client_id        AS "clientId",
         status,
         updated_at       AS "updatedAt"`,
      [id, title, description, appointmentDate, startTime, endTime, clientId, status]
    );

    if (!rows.length) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /v1/appointments/:id/cancel
 * Mark an appointment as cancelled.
 */
exports.cancelAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query(
      `UPDATE appointments
         SET status = 'Cancelled', updated_at = NOW()
       WHERE id = $1
       RETURNING id, status`,
      [id]
    );
    if (!rows.length) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /v1/appointments/:id/complete
 * Mark an appointment as completed.
 */
exports.completeAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query(
      `UPDATE appointments
         SET status = 'Completed', updated_at = NOW()
       WHERE id = $1
       RETURNING id, status`,
      [id]
    );
    if (!rows.length) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};