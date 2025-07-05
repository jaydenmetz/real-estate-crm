

// backend/src/controllers/leads.controller.js

const { v4: uuidv4 } = require('uuid');
const pool = require('../config/database').pool;

/**
 * GET /v1/leads
 * List all leads with optional filters (status, page, limit).
 */
exports.getLeads = async (req, res, next) => {
  try {
    const page   = parseInt(req.query.page, 10) || 1;
    const limit  = Math.min(parseInt(req.query.limit, 10) || 20, 100);
    const status = req.query.status; // e.g. "new", "contacted", "converted"
    const offset = (page - 1) * limit;

    // Build count query
    let countSql = 'SELECT COUNT(*) FROM leads';
    let dataSql  = `
      SELECT
        id,
        first_name   AS "firstName",
        last_name    AS "lastName",
        email,
        phone,
        status,
        created_at   AS "createdAt"
      FROM leads
    `;
    const params = [];
    if (status) {
      params.push(status);
      countSql += ' WHERE status = $1';
      dataSql  += ' WHERE status = $1';
    }
    dataSql += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);

    // Execute count
    const countRes = await pool.query(countSql, params);
    const total    = parseInt(countRes.rows[0].count, 10);

    // Fetch data
    params.push(limit, offset);
    const dataRes = await pool.query(dataSql, params);

    res.json({
      leads: dataRes.rows,
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
 * GET /v1/leads/:id
 * Retrieve a single lead by ID.
 */
exports.getLead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query(
      `SELECT
         id,
         first_name   AS "firstName",
         last_name    AS "lastName",
         email,
         phone,
         status,
         created_at   AS "createdAt",
         updated_at   AS "updatedAt"
       FROM leads
       WHERE id = $1`,
      [id]
    );
    if (!rows.length) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /v1/leads
 * Create a new lead.
 */
exports.createLead = async (req, res, next) => {
  try {
    const { firstName, lastName, email, phone, status = 'new' } = req.body;
    const id = `led_${uuidv4().replace(/-/g, '').substring(0,12)}`;
    const { rows } = await pool.query(
      `INSERT INTO leads (id, first_name, last_name, email, phone, status)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING
         id,
         first_name   AS "firstName",
         last_name    AS "lastName",
         email,
         phone,
         status,
         created_at   AS "createdAt"`,
      [id, firstName, lastName, email, phone, status]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /v1/leads/:id
 * Update an existing lead.
 */
exports.updateLead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, phone, status } = req.body;
    const { rows } = await pool.query(
      `UPDATE leads
         SET first_name = COALESCE($2, first_name),
             last_name  = COALESCE($3, last_name),
             email      = COALESCE($4, email),
             phone      = COALESCE($5, phone),
             status     = COALESCE($6, status),
             updated_at = NOW()
       WHERE id = $1
       RETURNING
         id,
         first_name   AS "firstName",
         last_name    AS "lastName",
         email,
         phone,
         status,
         updated_at   AS "updatedAt"`,
      [id, firstName, lastName, email, phone, status]
    );
    if (!rows.length) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /v1/leads/:id/convert
 * Convert a lead into a client (change status).
 */
exports.convertLead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query(
      `UPDATE leads
         SET status     = 'converted',
             updated_at = NOW()
       WHERE id = $1
       RETURNING id, status`,
      [id]
    );
    if (!rows.length) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /v1/leads/:id/activities
 * Log an activity or note on a lead.
 */
exports.logActivity = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { activity } = req.body;
    const activityId = `act_${uuidv4().replace(/-/g, '').substring(0,12)}`;
    const { rows } = await pool.query(
      `INSERT INTO lead_activities (id, lead_id, activity, created_at)
       VALUES ($1,$2,$3,NOW())
       RETURNING
         id                AS "activityId",
         lead_id           AS "leadId",
         activity,
         created_at        AS "createdAt"`,
      [activityId, id, activity]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
};