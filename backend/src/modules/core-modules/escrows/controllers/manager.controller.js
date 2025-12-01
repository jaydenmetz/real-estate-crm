/**
 * Escrows Manager Controller
 *
 * Provides aggregated AI Manager dashboard data for the escrows module.
 * This endpoint is optimized for the AI Manager hero card, providing
 * all necessary stats in a single request.
 *
 * GET /v1/escrows/manager
 *
 * Response includes:
 * - Summary stats (managed count, due soon, docs pending, compliance rate)
 * - Quick action items (deadlines, signatures needed, follow-ups)
 * - AI activity log (recent automated actions)
 * - Configuration status
 */

const { pool } = require('../../../../config/database');

/**
 * Get AI Manager dashboard data
 *
 * Aggregates escrow data for the AI Manager dashboard including:
 * - Total managed escrows (active, pending)
 * - Escrows with deadlines in next 48 hours
 * - Documents awaiting signature
 * - Compliance rate (on-time closings)
 * - Quick action items
 * - Recent activity
 */
const getManagerDashboard = async (req, res) => {
  try {
    const { team_id } = req.user;
    const { period = '1_month' } = req.query;

    // Calculate date range based on period
    let dateFilter = '';
    switch (period) {
      case '1_day':
        dateFilter = "AND e.created_at >= NOW() - INTERVAL '1 day'";
        break;
      case '1_month':
        dateFilter = "AND e.created_at >= NOW() - INTERVAL '1 month'";
        break;
      case '1_year':
        dateFilter = "AND e.created_at >= NOW() - INTERVAL '1 year'";
        break;
      case 'ytd':
        dateFilter = "AND e.created_at >= DATE_TRUNC('year', NOW())";
        break;
      default:
        dateFilter = "AND e.created_at >= NOW() - INTERVAL '1 month'";
    }

    // Get summary stats
    const statsQuery = `
      WITH active_escrows AS (
        SELECT *
        FROM escrows e
        WHERE e.team_id = $1
          AND e.deleted_at IS NULL
          AND e.is_archived = false
          AND e.escrow_status IN ('Active', 'Pending', 'In Progress')
          ${dateFilter}
      ),
      deadline_escrows AS (
        SELECT *
        FROM active_escrows
        WHERE closing_date IS NOT NULL
          AND closing_date <= NOW() + INTERVAL '48 hours'
          AND closing_date >= NOW()
      ),
      docs_pending AS (
        SELECT e.id,
               COALESCE(jsonb_array_length(e.documents), 0) as doc_count,
               (
                 SELECT COUNT(*)
                 FROM generated_documents gd
                 WHERE gd.escrow_id = e.id
                   AND gd.signing_status IN ('sent', 'pending', 'awaiting_signature')
               ) as pending_signatures
        FROM active_escrows e
      ),
      closed_escrows AS (
        SELECT
          COUNT(*) as total_closed,
          COUNT(*) FILTER (WHERE actual_coe_date <= closing_date OR actual_coe_date IS NULL) as on_time
        FROM escrows e
        WHERE e.team_id = $1
          AND e.deleted_at IS NULL
          AND e.escrow_status = 'Closed'
          ${dateFilter}
      ),
      follow_ups AS (
        SELECT COUNT(*) as count
        FROM tasks t
        WHERE t.team_id = $1
          AND t.deleted_at IS NULL
          AND t.status NOT IN ('completed', 'cancelled')
          AND t.related_entity_type = 'escrow'
          AND t.due_date <= NOW() + INTERVAL '24 hours'
      )
      SELECT
        (SELECT COUNT(*) FROM active_escrows) as managed_count,
        (SELECT COUNT(*) FROM deadline_escrows) as due_in_48h,
        (SELECT COALESCE(SUM(pending_signatures), 0) FROM docs_pending) as docs_pending,
        (SELECT CASE
          WHEN total_closed > 0 THEN ROUND((on_time::numeric / total_closed::numeric) * 100)
          ELSE 100
        END FROM closed_escrows) as compliance_rate,
        (SELECT count FROM follow_ups) as follow_ups_needed
    `;

    const statsResult = await pool.query(statsQuery, [team_id]);
    const stats = statsResult.rows[0];

    // Get quick action items
    const quickItemsQuery = `
      WITH deadline_items AS (
        SELECT
          id,
          property_address,
          closing_date,
          'deadline' as item_type
        FROM escrows
        WHERE team_id = $1
          AND deleted_at IS NULL
          AND is_archived = false
          AND escrow_status IN ('Active', 'Pending', 'In Progress')
          AND closing_date IS NOT NULL
          AND closing_date <= NOW() + INTERVAL '48 hours'
          AND closing_date >= NOW()
        ORDER BY closing_date ASC
        LIMIT 5
      ),
      pending_docs AS (
        SELECT
          gd.id,
          gd.document_name,
          gd.signing_status,
          e.property_address,
          'document' as item_type
        FROM generated_documents gd
        JOIN escrows e ON gd.escrow_id = e.id
        WHERE e.team_id = $1
          AND gd.signing_status IN ('sent', 'pending', 'awaiting_signature')
        ORDER BY gd.created_at ASC
        LIMIT 5
      ),
      pending_tasks AS (
        SELECT
          t.id,
          t.name,
          t.due_date,
          t.priority,
          t.related_entity_id as escrow_id,
          'task' as item_type
        FROM tasks t
        WHERE t.team_id = $1
          AND t.deleted_at IS NULL
          AND t.status NOT IN ('completed', 'cancelled')
          AND t.related_entity_type = 'escrow'
          AND t.due_date <= NOW() + INTERVAL '24 hours'
        ORDER BY t.due_date ASC
        LIMIT 5
      )
      SELECT * FROM deadline_items
      UNION ALL
      SELECT id, document_name as property_address, NULL as closing_date, item_type FROM pending_docs
      UNION ALL
      SELECT id, name as property_address, due_date as closing_date, item_type FROM pending_tasks
    `;

    const quickItemsResult = await pool.query(quickItemsQuery, [team_id]);

    // Get recent activity (reminders sent, automated actions)
    const activityQuery = `
      SELECT
        ta.id,
        ta.action_type,
        ta.description,
        ta.created_at,
        t.name as task_name,
        t.related_entity_id as escrow_id
      FROM task_activity ta
      JOIN tasks t ON ta.task_id = t.id
      WHERE t.team_id = $1
        AND ta.created_at >= NOW() - INTERVAL '24 hours'
      ORDER BY ta.created_at DESC
      LIMIT 10
    `;

    const activityResult = await pool.query(activityQuery, [team_id]);

    // Count reminders sent today
    const reminderCountQuery = `
      SELECT COUNT(*) as reminders_sent
      FROM task_activity ta
      JOIN tasks t ON ta.task_id = t.id
      WHERE t.team_id = $1
        AND ta.action_type IN ('reminder_sent', 'notification_sent', 'email_sent')
        AND ta.created_at >= DATE_TRUNC('day', NOW())
    `;

    const reminderResult = await pool.query(reminderCountQuery, [team_id]);

    // Build response
    const response = {
      success: true,
      data: {
        // Summary stats for the stat cards
        stats: {
          managed_count: parseInt(stats.managed_count) || 0,
          due_in_48h: parseInt(stats.due_in_48h) || 0,
          docs_pending: parseInt(stats.docs_pending) || 0,
          compliance_rate: parseInt(stats.compliance_rate) || 100,
        },

        // Quick action items for the chips
        quick_items: {
          deadlines_48h: parseInt(stats.due_in_48h) || 0,
          docs_awaiting_signature: parseInt(stats.docs_pending) || 0,
          follow_ups_needed: parseInt(stats.follow_ups_needed) || 0,
          reminders_sent_today: parseInt(reminderResult.rows[0]?.reminders_sent) || 0,
        },

        // Detailed items for drill-down
        items: {
          deadlines: quickItemsResult.rows.filter(r => r.item_type === 'deadline'),
          documents: quickItemsResult.rows.filter(r => r.item_type === 'document'),
          tasks: quickItemsResult.rows.filter(r => r.item_type === 'task'),
        },

        // Recent activity log
        recent_activity: activityResult.rows,

        // AI status
        ai_status: {
          is_active: true,
          monitoring_all: true,
          next_summary: '5 PM',
          last_action: activityResult.rows[0]?.created_at || null,
        },

        // Period for reference
        period,
      },
    };

    return res.json(response);
  } catch (error) {
    console.error('Error fetching manager dashboard:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch AI Manager dashboard data',
      message: error.message,
    });
  }
};

module.exports = {
  getManagerDashboard,
};
