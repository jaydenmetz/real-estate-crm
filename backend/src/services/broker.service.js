const { pool } = require('../config/database');

class BrokerService {
  /**
   * Create a new broker
   */
  static async createBroker(brokerData) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const {
        name,
        companyName,
        licenseNumber,
        licenseState,
        email,
        phone,
        address,
        city,
        state,
        zipCode,
        website,
        logoUrl,
        commissionSplitDefault,
        monthlyFee,
        transactionFee,
      } = brokerData;

      const result = await client.query(`
        INSERT INTO brokers (
          name, company_name, license_number, license_state, email,
          phone, address, city, state, zip_code, website, logo_url,
          commission_split_default, monthly_fee, transaction_fee
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        RETURNING *
      `, [
        name, companyName, licenseNumber, licenseState, email,
        phone, address, city, state, zipCode, website, logoUrl,
        commissionSplitDefault, monthlyFee, transactionFee,
      ]);

      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Link an existing team to a broker
   */
  static async addTeamToBroker(brokerId, teamId, options = {}) {
    const {
      commissionSplit,
      monthlyFee,
      transactionFee,
    } = options;

    const result = await pool.query(`
      INSERT INTO broker_teams (
        broker_id, team_id, commission_split, monthly_fee, transaction_fee
      ) VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (broker_id, team_id) 
      DO UPDATE SET
        commission_split = COALESCE($3, broker_teams.commission_split),
        monthly_fee = COALESCE($4, broker_teams.monthly_fee),
        transaction_fee = COALESCE($5, broker_teams.transaction_fee)
      RETURNING *
    `, [brokerId, teamId, commissionSplit, monthlyFee, transactionFee]);

    return result.rows[0];
  }

  /**
   * Give an existing user broker-level permissions
   */
  static async addUserToBroker(brokerId, userId, role = 'viewer') {
    const result = await pool.query(`
      INSERT INTO broker_users (broker_id, user_id, role)
      VALUES ($1, $2, $3)
      ON CONFLICT (broker_id, user_id)
      DO UPDATE SET role = $3
      RETURNING *
    `, [brokerId, userId, role]);

    return result.rows[0];
  }

  /**
   * Get all teams under a broker
   */
  static async getBrokerTeams(brokerId) {
    const result = await pool.query(`
      SELECT 
        t.*,
        bt.commission_split,
        bt.monthly_fee,
        bt.transaction_fee,
        bt.status as broker_team_status,
        bt.joined_at
      FROM teams t
      JOIN broker_teams bt ON t.team_id = bt.team_id
      WHERE bt.broker_id = $1 AND bt.status = 'active'
      ORDER BY bt.joined_at DESC
    `, [brokerId]);

    return result.rows;
  }

  /**
   * Get all users in teams under a broker
   */
  static async getBrokerUsers(brokerId) {
    const result = await pool.query(`
      SELECT DISTINCT
        u.*,
        t.name as team_name,
        t.team_id,
        bu.role as broker_role
      FROM users u
      JOIN teams t ON u.team_id = t.team_id
      JOIN broker_teams bt ON t.team_id = bt.team_id
      LEFT JOIN broker_users bu ON bu.user_id = u.id AND bu.broker_id = $1
      WHERE bt.broker_id = $1 AND bt.status = 'active'
      ORDER BY t.name, u.last_name, u.first_name
    `, [brokerId]);

    return result.rows;
  }

  /**
   * Get broker by ID
   */
  static async getBrokerById(brokerId) {
    const result = await pool.query(`
      SELECT 
        b.*,
        COUNT(DISTINCT bt.team_id) as team_count,
        COUNT(DISTINCT u.id) as user_count
      FROM brokerages b
      LEFT JOIN broker_teams bt ON b.id = bt.broker_id AND bt.status = 'active'
      LEFT JOIN teams t ON bt.team_id = t.team_id
      LEFT JOIN users u ON u.team_id = t.team_id
      WHERE b.id = $1
      GROUP BY b.id
    `, [brokerId]);

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0];
  }

  /**
   * Get all brokers
   */
  static async getAllBrokers() {
    const result = await pool.query(`
      SELECT 
        b.*,
        COUNT(DISTINCT bt.team_id) as team_count,
        COUNT(DISTINCT u.id) as user_count
      FROM brokerages b
      LEFT JOIN broker_teams bt ON b.id = bt.broker_id AND bt.status = 'active'
      LEFT JOIN teams t ON bt.team_id = t.team_id
      LEFT JOIN users u ON u.team_id = t.team_id
      WHERE b.is_active = true
      GROUP BY b.id
      ORDER BY b.created_at DESC
    `);

    return result.rows;
  }

  /**
   * Get broker statistics
   */
  static async getBrokerStats(brokerId) {
    const stats = {};

    // Get team count
    const teamResult = await pool.query(`
      SELECT COUNT(*) as count
      FROM broker_teams
      WHERE broker_id = $1 AND status = 'active'
    `, [brokerId]);
    stats.totalTeams = parseInt(teamResult.rows[0].count);

    // Get user count
    const userResult = await pool.query(`
      SELECT COUNT(DISTINCT u.id) as count
      FROM users u
      JOIN teams t ON u.team_id = t.team_id
      JOIN broker_teams bt ON t.team_id = bt.team_id
      WHERE bt.broker_id = $1 AND bt.status = 'active'
    `, [brokerId]);
    stats.totalUsers = parseInt(userResult.rows[0].count);

    // Get escrow count and volume
    const escrowResult = await pool.query(`
      SELECT 
        COUNT(DISTINCT e.id) as escrow_count,
        SUM(e.purchase_price) as total_volume,
        SUM(e.net_commission) as total_commission
      FROM escrows e
      JOIN teams t ON e.team_id = t.team_id
      JOIN broker_teams bt ON t.team_id = bt.team_id
      WHERE bt.broker_id = $1 AND bt.status = 'active'
    `, [brokerId]);

    stats.totalEscrows = parseInt(escrowResult.rows[0].escrow_count || 0);
    stats.totalVolume = parseFloat(escrowResult.rows[0].total_volume || 0);
    stats.totalCommission = parseFloat(escrowResult.rows[0].total_commission || 0);

    // Get monthly revenue
    const revenueResult = await pool.query(`
      SELECT 
        SUM(bt.monthly_fee) as monthly_fees,
        COUNT(*) * AVG(bt.transaction_fee) as estimated_transaction_fees
      FROM broker_teams bt
      WHERE bt.broker_id = $1 AND bt.status = 'active'
    `, [brokerId]);

    stats.monthlyRevenue = parseFloat(revenueResult.rows[0].monthly_fees || 0);
    stats.estimatedTransactionFees = parseFloat(revenueResult.rows[0].estimated_transaction_fees || 0);

    return stats;
  }

  /**
   * Update broker information
   */
  static async updateBroker(brokerId, updates) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(updates).forEach((key) => {
      if (updates[key] !== undefined) {
        const snakeCase = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
        fields.push(`${snakeCase} = $${paramCount}`);
        values.push(updates[key]);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(brokerId);

    const result = await pool.query(`
      UPDATE brokers
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount}
      RETURNING *
    `, values);

    if (result.rows.length === 0) {
      throw new Error('Broker not found');
    }

    return result.rows[0];
  }

  /**
   * Check if user has broker permissions
   */
  static async userHasBrokerAccess(userId, brokerId, requiredRole = null) {
    const result = await pool.query(`
      SELECT role, is_active
      FROM broker_users
      WHERE user_id = $1 AND broker_id = $2
    `, [userId, brokerId]);

    if (result.rows.length === 0 || !result.rows[0].is_active) {
      return false;
    }

    if (!requiredRole) {
      return true;
    }

    const roleHierarchy = {
      owner: 4,
      admin: 3,
      manager: 2,
      viewer: 1,
    };

    const userRole = result.rows[0].role;
    return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
  }
}

module.exports = BrokerService;
