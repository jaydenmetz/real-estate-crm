
// backend/src/models/Appointment.js

const { query, transaction } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class Appointment {
  /**
   * Create a new appointment.
   * @param {Object} data
   * @returns {Promise<Object>} created appointment
   */
  static async create(data) {
    const id = `apt_${uuidv4().replace(/-/g, '').substring(0, 12)}`;
    const {
      title,
      description,
      appointmentDate,
      startTime,
      endTime,
      clientId,
      status = 'Scheduled'
    } = data;

    const sql = `
      INSERT INTO appointments
      (id, title, description, appointment_date, start_time, end_time, client_id, status)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING
        id,
        title,
        description,
        appointment_date AS "date",
        start_time       AS "startTime",
        end_time         AS "endTime",
        client_id        AS "clientId",
        status,
        created_at       AS "createdAt"
    `;
    const params = [id, title, description, appointmentDate, startTime, endTime, clientId, status];
    const { rows } = await query(sql, params);
    return rows[0];
  }

  /**
   * Fetch all appointments with optional date filter and pagination.
   * @param {Object} filters
   * @returns {Promise<Object>} { appointments: [], total, page, pages, limit }
   */
  static async findAll(filters = {}) {
    const page   = parseInt(filters.page, 10) || 1;
    const limit  = Math.min(parseInt(filters.limit, 10) || 20, 100);
    const offset = (page - 1) * limit;
    const date   = filters.date; // YYYY-MM-DD

    let countSql = 'SELECT COUNT(*) FROM appointments';
    let dataSql  = `
      SELECT
        id,
        title,
        description,
        appointment_date AS "date",
        start_time       AS "startTime",
        end_time         AS "endTime",
        client_id        AS "clientId",
        status,
        created_at       AS "createdAt"
      FROM appointments
    `;
    const params = [];
    if (date) {
      params.push(date);
      countSql += ' WHERE appointment_date = $1';
      dataSql  += ' WHERE appointment_date = $1';
    }
    dataSql += ` ORDER BY appointment_date DESC, start_time DESC LIMIT $${params.length+1} OFFSET $${params.length+2}`;
    params.push(limit, offset);

    const countRes = await query(countSql, params.slice(0, date ? 1 : 0));
    const total    = parseInt(countRes.rows[0].count, 10);
    const dataRes  = await query(dataSql, params);

    return {
      appointments: dataRes.rows,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit
      }
    };
  }

  /**
   * Fetch a single appointment by ID.
   * @param {string} id
   * @returns {Promise<Object|null>}
   */
  static async findById(id) {
    const sql = `
      SELECT
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
      WHERE id = $1
    `;
    const { rows } = await query(sql, [id]);
    return rows[0] || null;
  }

  /**
   * Update an appointment.
   * @param {string} id
   * @param {Object} data
   * @returns {Promise<Object|null>}
   */
  static async update(id, data) {
    const fields = [];
    const params = [id];
    let idx = 2;

    const columns = {
      title: 'title',
      description: 'description',
      appointmentDate: 'appointment_date',
      startTime: 'start_time',
      endTime: 'end_time',
      clientId: 'client_id',
      status: 'status'
    };

    for (const [key, col] of Object.entries(columns)) {
      if (data[key] !== undefined) {
        fields.push(`${col} = $${idx}`);
        params.push(data[key]);
        idx++;
      }
    }
    if (fields.length === 0) return await this.findById(id);

    const sql = `
      UPDATE appointments
        SET ${fields.join(', ')}, updated_at = NOW()
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
        updated_at       AS "updatedAt"
    `;
    const { rows } = await query(sql, params);
    return rows[0] || null;
  }

  /**
   * Change status to 'Cancelled'.
   * @param {string} id
   * @returns {Promise<Object|null>}
   */
  static async cancel(id) {
    const sql = `
      UPDATE appointments
        SET status = 'Cancelled', updated_at = NOW()
      WHERE id = $1
      RETURNING id, status
    `;
    const { rows } = await query(sql, [id]);
    return rows[0] || null;
  }

  /**
   * Change status to 'Completed'.
   * @param {string} id
   * @returns {Promise<Object|null>}
   */
  static async complete(id) {
    const sql = `
      UPDATE appointments
        SET status = 'Completed', updated_at = NOW()
      WHERE id = $1
      RETURNING id, status
    `;
    const { rows } = await query(sql, [id]);
    return rows[0] || null;
  }
}

module.exports = Appointment;