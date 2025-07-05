// backend/src/controllers/clients.controller.js
const pool = require('../config/database').pool;

// GET /clients
exports.getClients = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, first_name AS "firstName", last_name AS "lastName" FROM clients'
    );
    res.json({ clients: rows });
  } catch (err) {
    next(err);
  }
};

// POST /clients
exports.createClient = async (req, res, next) => {
  try {
    const { firstName, lastName } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO clients (first_name, last_name)
       VALUES ($1, $2)
       RETURNING id, first_name AS "firstName", last_name AS "lastName"`,
      [firstName, lastName]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
};