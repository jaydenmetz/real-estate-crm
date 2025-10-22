/**
 * KPI Service
 * Calculates and stores agent KPI metrics
 *
 * PHASE 4: Multi-Tenant Admin System - KPI Calculation
 *
 * Features:
 * - Conversion rate (leads → escrows)
 * - Show rate (scheduled → attended appointments)
 * - Monthly snapshots in agent_kpis table
 * - Trend analysis (month-over-month comparison)
 */

const { pool } = require('../config/database');

class KPIService {
  /**
   * Calculate KPIs for a specific user and time period
   * @param {string} userId - User ID
   * @param {Date} periodStart - Start of period
   * @param {Date} periodEnd - End of period
   * @returns {Promise<Object>} KPI data
   */
  static async calculateUserKPIs(userId, periodStart, periodEnd) {
    try {
      const query = `
        WITH user_data AS (
          SELECT
            u.id as user_id,
            u.broker_id,
            u.first_name,
            u.last_name
          FROM users u
          WHERE u.id = $1
        ),
        lead_stats AS (
          SELECT
            COUNT(*) as total_leads,
            COUNT(*) FILTER (WHERE created_at >= $2 AND created_at < $3) as new_leads,
            COUNT(*) FILTER (WHERE lead_status = 'converted' AND updated_at >= $2 AND updated_at < $3) as converted_leads
          FROM leads
          WHERE owner_id = $1
        ),
        appointment_stats AS (
          SELECT
            COUNT(*) as total_appointments,
            COUNT(*) FILTER (WHERE appointment_status IN ('completed', 'attended')) as completed_appointments,
            COUNT(*) FILTER (WHERE appointment_status = 'no_show') as no_shows
          FROM appointments
          WHERE owner_id = $1
            AND appointment_date >= $2
            AND appointment_date < $3
        ),
        escrow_stats AS (
          SELECT
            COUNT(*) as total_escrows,
            COALESCE(SUM(purchase_price), 0) as total_volume,
            COALESCE(SUM(
              CASE
                WHEN listing_side_commission IS NOT NULL AND listing_side_commission > 0
                THEN listing_side_commission
                WHEN buyer_side_commission IS NOT NULL AND buyer_side_commission > 0
                THEN buyer_side_commission
                ELSE 0
              END
            ), 0) as total_commission
          FROM escrows
          WHERE owner_id = $1
            AND created_at >= $2
            AND created_at < $3
        ),
        client_stats AS (
          SELECT
            COUNT(*) as total_clients
          FROM clients
          WHERE owner_id = $1
            AND created_at >= $2
            AND created_at < $3
        ),
        listing_stats AS (
          SELECT
            COUNT(*) as active_listings
          FROM listings
          WHERE owner_id = $1
            AND listing_status = 'active'
            AND created_at >= $2
            AND created_at < $3
        ),
        activity_stats AS (
          SELECT
            MAX(GREATEST(
              (SELECT MAX(updated_at) FROM escrows WHERE owner_id = $1),
              (SELECT MAX(updated_at) FROM clients WHERE owner_id = $1),
              (SELECT MAX(updated_at) FROM leads WHERE owner_id = $1),
              (SELECT MAX(updated_at) FROM appointments WHERE owner_id = $1),
              (SELECT MAX(updated_at) FROM listings WHERE owner_id = $1)
            )) as last_activity
        )
        SELECT
          ud.user_id,
          ud.broker_id,
          $2::date as period_start,
          $3::date as period_end,

          -- Lead metrics
          COALESCE(ls.total_leads, 0) as total_leads,
          COALESCE(ls.new_leads, 0) as new_leads,
          COALESCE(ls.converted_leads, 0) as converted_leads,
          CASE
            WHEN COALESCE(ls.new_leads, 0) > 0
            THEN ROUND((COALESCE(ls.converted_leads, 0)::numeric / ls.new_leads::numeric) * 100, 2)
            ELSE 0
          END as conversion_rate,

          -- Appointment metrics
          COALESCE(aps.total_appointments, 0) as total_appointments,
          COALESCE(aps.completed_appointments, 0) as completed_appointments,
          COALESCE(aps.no_shows, 0) as no_shows,
          CASE
            WHEN COALESCE(aps.total_appointments, 0) > 0
            THEN ROUND((COALESCE(aps.completed_appointments, 0)::numeric / aps.total_appointments::numeric) * 100, 2)
            ELSE 0
          END as show_rate,

          -- Production metrics
          COALESCE(es.total_escrows, 0) as total_escrows,
          COALESCE(cs.total_clients, 0) as total_clients,
          COALESCE(lst.active_listings, 0) as active_listings,
          COALESCE(es.total_volume, 0) as total_volume,
          COALESCE(es.total_commission, 0) as total_commission,

          -- Activity metrics
          acts.last_activity,
          CASE
            WHEN acts.last_activity IS NOT NULL
            THEN ($3::date - $2::date)
            ELSE 0
          END as days_active

        FROM user_data ud
        CROSS JOIN lead_stats ls
        CROSS JOIN appointment_stats aps
        CROSS JOIN escrow_stats es
        CROSS JOIN client_stats cs
        CROSS JOIN listing_stats lst
        CROSS JOIN activity_stats acts
      `;

      const result = await pool.query(query, [userId, periodStart, periodEnd]);

      if (result.rows.length === 0) {
        throw new Error('User not found');
      }

      return result.rows[0];
    } catch (error) {
      console.error('Error calculating user KPIs:', error);
      throw error;
    }
  }

  /**
   * Store KPI snapshot in agent_kpis table
   * @param {Object} kpiData - KPI data from calculateUserKPIs
   * @returns {Promise<Object>} Stored KPI record
   */
  static async storeKPISnapshot(kpiData) {
    try {
      const query = `
        INSERT INTO agent_kpis (
          user_id,
          broker_id,
          period_start,
          period_end,
          total_leads,
          new_leads,
          converted_leads,
          conversion_rate,
          total_appointments,
          completed_appointments,
          no_shows,
          show_rate,
          total_escrows,
          total_clients,
          active_listings,
          total_volume,
          total_commission,
          last_activity,
          days_active
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19
        )
        ON CONFLICT (user_id, period_start, period_end)
        DO UPDATE SET
          total_leads = EXCLUDED.total_leads,
          new_leads = EXCLUDED.new_leads,
          converted_leads = EXCLUDED.converted_leads,
          conversion_rate = EXCLUDED.conversion_rate,
          total_appointments = EXCLUDED.total_appointments,
          completed_appointments = EXCLUDED.completed_appointments,
          no_shows = EXCLUDED.no_shows,
          show_rate = EXCLUDED.show_rate,
          total_escrows = EXCLUDED.total_escrows,
          total_clients = EXCLUDED.total_clients,
          active_listings = EXCLUDED.active_listings,
          total_volume = EXCLUDED.total_volume,
          total_commission = EXCLUDED.total_commission,
          last_activity = EXCLUDED.last_activity,
          days_active = EXCLUDED.days_active
        RETURNING *
      `;

      const result = await pool.query(query, [
        kpiData.user_id,
        kpiData.broker_id,
        kpiData.period_start,
        kpiData.period_end,
        kpiData.total_leads,
        kpiData.new_leads,
        kpiData.converted_leads,
        kpiData.conversion_rate,
        kpiData.total_appointments,
        kpiData.completed_appointments,
        kpiData.no_shows,
        kpiData.show_rate,
        kpiData.total_escrows,
        kpiData.total_clients,
        kpiData.active_listings,
        kpiData.total_volume,
        kpiData.total_commission,
        kpiData.last_activity,
        kpiData.days_active,
      ]);

      return result.rows[0];
    } catch (error) {
      console.error('Error storing KPI snapshot:', error);
      throw error;
    }
  }

  /**
   * Get trend comparison (current vs previous period)
   * @param {string} userId - User ID
   * @param {Date} currentPeriodStart - Current period start
   * @param {Date} currentPeriodEnd - Current period end
   * @returns {Promise<Object>} Trend data with percentage changes
   */
  static async getTrendComparison(userId, currentPeriodStart, currentPeriodEnd) {
    try {
      // Calculate previous period (same duration)
      const periodDuration = new Date(currentPeriodEnd) - new Date(currentPeriodStart);
      const previousPeriodEnd = new Date(currentPeriodStart);
      const previousPeriodStart = new Date(currentPeriodStart.getTime() - periodDuration);

      // Get current and previous KPIs
      const [currentKPIs, previousKPIs] = await Promise.all([
        this.calculateUserKPIs(userId, currentPeriodStart, currentPeriodEnd),
        this.calculateUserKPIs(userId, previousPeriodStart, previousPeriodEnd),
      ]);

      // Calculate percentage changes
      const calculateChange = (current, previous) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous) * 100;
      };

      return {
        current: currentKPIs,
        previous: previousKPIs,
        trends: {
          total_leads: {
            value: currentKPIs.total_leads,
            change: calculateChange(currentKPIs.total_leads, previousKPIs.total_leads),
          },
          conversion_rate: {
            value: currentKPIs.conversion_rate,
            change: calculateChange(currentKPIs.conversion_rate, previousKPIs.conversion_rate),
          },
          show_rate: {
            value: currentKPIs.show_rate,
            change: calculateChange(currentKPIs.show_rate, previousKPIs.show_rate),
          },
          total_escrows: {
            value: currentKPIs.total_escrows,
            change: calculateChange(currentKPIs.total_escrows, previousKPIs.total_escrows),
          },
          total_volume: {
            value: currentKPIs.total_volume,
            change: calculateChange(currentKPIs.total_volume, previousKPIs.total_volume),
          },
        },
      };
    } catch (error) {
      console.error('Error calculating trend comparison:', error);
      throw error;
    }
  }

  /**
   * Calculate KPIs for all users in a brokerage
   * @param {string} brokerId - Broker ID
   * @param {Date} periodStart - Start of period
   * @param {Date} periodEnd - End of period
   * @returns {Promise<Array>} Array of KPI data for all users
   */
  static async calculateBrokerageKPIs(brokerId, periodStart, periodEnd) {
    try {
      // Get all active users under this broker
      const usersQuery = 'SELECT id FROM users WHERE broker_id = $1 AND is_active = TRUE';
      const usersResult = await pool.query(usersQuery, [brokerId]);

      // Calculate KPIs for each user
      const kpiPromises = usersResult.rows.map((user) =>
        this.calculateUserKPIs(user.id, periodStart, periodEnd)
      );

      const allKPIs = await Promise.all(kpiPromises);

      return allKPIs;
    } catch (error) {
      console.error('Error calculating brokerage KPIs:', error);
      throw error;
    }
  }

  /**
   * Store monthly snapshots for all users in a brokerage
   * @param {string} brokerId - Broker ID (optional, calculates for all if not provided)
   * @returns {Promise<Object>} Summary of stored snapshots
   */
  static async storeMonthlySnapshots(brokerId = null) {
    try {
      // Get first and last day of previous month
      const now = new Date();
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const periodStart = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1);
      const periodEnd = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 1);

      let usersQuery;
      let queryParams = [];

      if (brokerId) {
        usersQuery = 'SELECT id, broker_id FROM users WHERE broker_id = $1 AND is_active = TRUE';
        queryParams = [brokerId];
      } else {
        usersQuery = 'SELECT id, broker_id FROM users WHERE is_active = TRUE';
      }

      const usersResult = await pool.query(usersQuery, queryParams);

      const snapshotPromises = usersResult.rows.map(async (user) => {
        try {
          const kpiData = await this.calculateUserKPIs(user.id, periodStart, periodEnd);
          await this.storeKPISnapshot(kpiData);
          return { userId: user.id, success: true };
        } catch (error) {
          console.error(`Error storing snapshot for user ${user.id}:`, error);
          return { userId: user.id, success: false, error: error.message };
        }
      });

      const results = await Promise.all(snapshotPromises);

      const summary = {
        totalUsers: results.length,
        successful: results.filter((r) => r.success).length,
        failed: results.filter((r) => !r.success).length,
        period: {
          start: periodStart,
          end: periodEnd,
        },
        failedUsers: results.filter((r) => !r.success),
      };

      return summary;
    } catch (error) {
      console.error('Error storing monthly snapshots:', error);
      throw error;
    }
  }
}

module.exports = KPIService;
