
// backend/src/models/Escrow.js

const { query } = require('../config/database');
const redis = require('../config/redis');
const logger = require('../utils/logger');
const { generateEscrowIds } = require('../utils/idGenerator');
const { emitWebhook } = require('../services/webhook.service');

class Escrow {
  /**
   * Create a new escrow record, along with buyers and sellers.
   * @param {Object} data
   * @returns {Promise<Object>} created escrow
   */
  static async create(data) {
    const id = `esc_${uuidv4().replace(/-/g, '').substring(0, 12)}`;
    const {
      propertyAddress,
      escrowStatus = 'Active',
      purchasePrice,
      earnestMoneyDeposit = purchasePrice * 0.01,
      downPayment,
      loanAmount = purchasePrice - downPayment,
      commissionPercentage = 2.5,
      grossCommission = purchasePrice * (commissionPercentage / 100),
      netCommission = grossCommission * 0.9,
      acceptanceDate,
      closingDate,
      propertyType = 'Single Family',
      leadSource,
      createdBy
    } = data;

    // Wrap in a transaction
    return await transaction(async (client) => {
      // Insert escrow
      const insertEscrowSql = `
        INSERT INTO escrows (
          id, property_address, escrow_status, purchase_price,
          earnest_money_deposit, down_payment, loan_amount,
          commission_percentage, gross_commission, net_commission,
          acceptance_date, closing_date, property_type,
          lead_source, created_by
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
        RETURNING *
      `;
      const params = [
        id, propertyAddress, escrowStatus, purchasePrice,
        earnestMoneyDeposit, downPayment, loanAmount,
        commissionPercentage, grossCommission, netCommission,
        acceptanceDate, closingDate, propertyType,
        leadSource, createdBy
      ];
      await client.query(insertEscrowSql, params);

      // Associate buyers
      if (Array.isArray(data.buyers) && data.buyers.length) {
        const buyerSql = `
          INSERT INTO escrow_buyers (escrow_id, client_id)
          VALUES ${data.buyers.map((_, i) => `($1, $${i + 2})`).join(', ')}
        `;
        await client.query(buyerSql, [id, ...data.buyers]);
      }

      // Associate sellers
      if (Array.isArray(data.sellers) && data.sellers.length) {
        const sellerSql = `
          INSERT INTO escrow_sellers (escrow_id, client_id)
          VALUES ${data.sellers.map((_, i) => `($1, $${i + 2})`).join(', ')}
        `;
        await client.query(sellerSql, [id, ...data.sellers]);
      }

      return this.findById(id);
    });
  }

  /**
   * Fetch paginated escrows, with filters.
   * @param {Object} filters
   */
  static async findAll(filters = {}) {
    const page    = parseInt(filters.page, 10) || 1;
    const limit   = Math.min(parseInt(filters.limit, 10) || 20, 100);
    const offset  = (page - 1) * limit;
    const status  = filters.status;
    let sql = `
      SELECT
        e.*,
        COALESCE(b.buyers, '[]')   AS buyers,
        COALESCE(s.sellers, '[]')  AS sellers
      FROM escrows e
      LEFT JOIN (
        SELECT escrow_id, jsonb_agg(jsonb_build_object('id', client_id)) AS buyers
        FROM escrow_buyers GROUP BY escrow_id
      ) b ON b.escrow_id = e.id
      LEFT JOIN (
        SELECT escrow_id, jsonb_agg(jsonb_build_object('id', client_id)) AS sellers
        FROM escrow_sellers GROUP BY escrow_id
      ) s ON s.escrow_id = e.id
      WHERE 1=1
    `;
    const params = [];
    if (status) {
      params.push(status);
      sql += ` AND e.escrow_status = $${params.length}`;
    }
    sql += ` ORDER BY e.created_at DESC LIMIT ${limit} OFFSET ${offset}`;

    const { rows } = await query(sql, params);
    const countSql = status
      ? 'SELECT COUNT(*) FROM escrows WHERE escrow_status = $1'
      : 'SELECT COUNT(*) FROM escrows';
    const countRes = await query(countSql, status ? [status] : []);
    const total = parseInt(countRes.rows[0].count, 10);

    return {
      escrows: rows,
      pagination: { total, page, pages: Math.ceil(total / limit), limit }
    };
  }

  /**
   * Fetch a single escrow by ID.
   * @param {string} id
   */
  static async findById(id) {
    const sql = `
      SELECT
        e.*,
        COALESCE(b.buyers, '[]')   AS buyers,
        COALESCE(s.sellers, '[]')  AS sellers
      FROM escrows e
      LEFT JOIN (
        SELECT escrow_id, jsonb_agg(jsonb_build_object('id', client_id)) AS buyers
        FROM escrow_buyers WHERE escrow_id = $1 GROUP BY escrow_id
      ) b ON b.escrow_id = e.id
      LEFT JOIN (
        SELECT escrow_id, jsonb_agg(jsonb_build_object('id', client_id)) AS sellers
        FROM escrow_sellers WHERE escrow_id = $1 GROUP BY escrow_id
      ) s ON s.escrow_id = e.id
      WHERE e.id = $1
      LIMIT 1
    `;
    const { rows } = await query(sql, [id]);
    return rows[0] || null;
  }

  /**
   * Update an escrow record.
   * @param {string} id
   * @param {Object} data
   */
  static async update(id, data) {
    const fields = [];
    const params = [id];
    let idx = 2;
    const mapping = {
      propertyAddress: 'property_address',
      escrowStatus:    'escrow_status',
      purchasePrice:   'purchase_price',
      earnestMoneyDeposit: 'earnest_money_deposit',
      downPayment:     'down_payment',
      loanAmount:      'loan_amount',
      commissionPercentage: 'commission_percentage',
      grossCommission: 'gross_commission',
      netCommission:   'net_commission',
      acceptanceDate:  'acceptance_date',
      closingDate:     'closing_date',
      propertyType:    'property_type',
      leadSource:      'lead_source'
    };
    for (const [key, col] of Object.entries(mapping)) {
      if (data[key] !== undefined) {
        fields.push(`${col} = $${idx++}`);
        params.push(data[key]);
      }
    }
    if (fields.length) {
      const sql = `
        UPDATE escrows
           SET ${fields.join(', ')}, updated_at = NOW()
         WHERE id = $1
         RETURNING *
      `;
      const { rows } = await query(sql, params);
      return rows[0] || null;
    }
    return this.findById(id);
  }

  /**
   * Delete an escrow and its associations.
   * @param {string} id
   */
  static async remove(id) {
    return await transaction(async (client) => {
      await client.query('DELETE FROM escrow_buyers WHERE escrow_id = $1', [id]);
      await client.query('DELETE FROM escrow_sellers WHERE escrow_id = $1', [id]);
      const res = await client.query('DELETE FROM escrows WHERE id = $1', [id]);
      return res.rowCount > 0;
    });
  }
}

module.exports = Escrow;