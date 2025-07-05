// backend/src/controllers/listings.controller.js

const { v4: uuidv4 } = require('uuid');
const pool = require('../config/database').pool;

/**
 * GET /v1/listings
 * List all listings with pagination.
 */
exports.getListings = async (req, res, next) => {
  try {
    const page   = parseInt(req.query.page,  10) || 1;
    const limit  = Math.min(parseInt(req.query.limit, 10) || 20, 100);
    const offset = (page - 1) * limit;

    // Total count for pagination
    const countRes = await pool.query('SELECT COUNT(*) FROM listings');
    const total    = parseInt(countRes.rows[0].count, 10);

    // Fetch page
    const { rows } = await pool.query(
      `SELECT
         id,
         address,
         price,
         status,
         agent_id        AS "agentId",
         created_at      AS "createdAt"
       FROM listings
       ORDER BY created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    res.json({
      listings: rows,
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
 * GET /v1/listings/:id
 * Retrieve a single listing by its ID.
 */
exports.getListing = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query(
      `SELECT
         id,
         address,
         price,
         status,
         agent_id   AS "agentId",
         created_at AS "createdAt"
       FROM listings
       WHERE id = $1`,
      [id]
    );
    if (!rows.length) {
      return res.status(404).json({ error: 'Listing not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /v1/listings
 * Create a new listing.
 */
exports.createListing = async (req, res, next) => {
  try {
    const { address, price, status = 'Active', agentId } = req.body;
    const id = `lst_${uuidv4().replace(/-/g, '').substr(0, 12)}`;

    const { rows } = await pool.query(
      `INSERT INTO listings (id, address, price, status, agent_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING
         id,
         address,
         price,
         status,
         agent_id    AS "agentId",
         created_at  AS "createdAt"`,
      [id, address, price, status, agentId]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /v1/listings/:id
 * Update an existing listing.
 */
exports.updateListing = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { address, price, status, agentId } = req.body;

    const { rows } = await pool.query(
      `UPDATE listings
         SET address    = COALESCE($2, address),
             price      = COALESCE($3, price),
             status     = COALESCE($4, status),
             agent_id   = COALESCE($5, agent_id),
             updated_at = NOW()
       WHERE id = $1
       RETURNING
         id,
         address,
         price,
         status,
         agent_id    AS "agentId",
         updated_at  AS "updatedAt"`,
      [id, address, price, status, agentId]
    );

    if (!rows.length) {
      return res.status(404).json({ error: 'Listing not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /v1/listings/:id
 * Remove a listing.
 */
exports.deleteListing = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM listings WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Listing not found' });
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

/**
 * POST /v1/listings/:id/price-reduction
 * Reduce the price of a listing by a specified amount.
 */
exports.priceReduction = async (req, res, next) => {
  try {
    const { id }     = req.params;
    const { amount } = req.body;

    const { rows } = await pool.query(
      `UPDATE listings
         SET price      = price - $2,
             updated_at = NOW()
       WHERE id = $1
       RETURNING
         id,
         address,
         price,
         status,
         agent_id    AS "agentId",
         updated_at  AS "updatedAt"`,
      [id, amount]
    );

    if (!rows.length) {
      return res.status(404).json({ error: 'Listing not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /v1/listings/:id/showings
 * Log a new showing event for a listing.
 */
exports.logShowing = async (req, res, next) => {
  try {
    const { id }                   = req.params;
    const { showingDate, agentId, notes } = req.body;
    const showId                   = `shw_${uuidv4().replace(/-/g, '').substr(0, 12)}`;

    const { rows } = await pool.query(
      `INSERT INTO showings (id, listing_id, showing_date, agent_id, notes)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING
         id                 AS "showingId",
         listing_id         AS "listingId",
         showing_date       AS "showingDate",
         agent_id           AS "agentId",
         notes`,
      [showId, id, showingDate, agentId, notes]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
};