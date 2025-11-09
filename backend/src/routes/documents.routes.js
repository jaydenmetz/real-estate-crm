// backend/src/routes/documents.routes.js
const express = require('express');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();
const { query } = require('../config/database');

// SECURITY: All document routes require authentication
router.use(authenticate);

// GET all documents
router.get('/', async (req, res) => {
  try {
    const { rows } = await query('SELECT * FROM documents');
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// GET one document
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await query(
      'SELECT * FROM documents WHERE id = $1',
      [req.params.id],
    );
    if (!rows.length) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// POST new document
router.post('/', async (req, res) => {
  try {
    const {
      entity_type, entity_id, document_type, name, file_path, file_size, uploaded_by,
    } = req.body;
    const sql = `
      INSERT INTO documents
        (id, entity_type, entity_id, document_type, name, file_path, file_size, uploaded_by)
      VALUES
        (uuid_generate_v4(), $1,$2,$3,$4,$5,$6,$7)
      RETURNING *
    `;
    const params = [entity_type, entity_id, document_type, name, file_path, file_size, uploaded_by];
    const { rows } = await query(sql, params);
    res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// PUT update
router.put('/:id', async (req, res) => {
  try {
    const {
      document_type, name, file_path, file_size,
    } = req.body;
    const sql = `
      UPDATE documents
      SET document_type=$1, name=$2, file_path=$3, file_size=$4, uploaded_at=CURRENT_TIMESTAMP
      WHERE id=$5
      RETURNING *
    `;
    const params = [document_type, name, file_path, file_size, req.params.id];
    const { rows } = await query(sql, params);
    if (!rows.length) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// DELETE
router.delete('/:id', async (req, res) => {
  try {
    await query('DELETE FROM documents WHERE id=$1', [req.params.id]);
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

module.exports = router;
