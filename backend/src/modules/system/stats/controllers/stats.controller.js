/**
 * Stats Controller
 * Provides hierarchical statistics for broker/team/user dashboards
 *
 * PHASE 3: Multi-Tenant Admin System - Dashboard Stats
 * Single /home endpoint that returns all stats based on user role:
 * - Broker/System Admin: Returns broker + team (if selected) + user stats
 * - Team Owner: Returns team + user stats
 * - Agent: Returns user stats only
 *
 * The API key/JWT role determines what stats are included in response
 */

const { pool } = require('../../../../config/database');

/**
 * GET /v1/stats/home
 * Get all dashboard statistics based on user role
 *
 * Access: All authenticated users
 * Query Params:
 *   - teamId: UUID (optional, for broker to select specific team)
 *
 * Returns object with broker/team/user stats based on permissions
 */
const getHomeStats = async (req, res) => {
  try {
    const { id: userId, role, broker_id, team_id } = req.user;
    const { teamId: requestedTeamId } = req.query;

    const response = {
      success: true,
      data: {},
    };

    // TIER 1: Broker Stats (broker/system_admin only)
    const isBroker = role === 'broker' || role === 'system_admin';
    if (isBroker) {
      let brokerFilter = '';
      let brokerParams = [];

      if (role === 'broker' && broker_id) {
        brokerFilter = 'WHERE u.broker_id = $1';
        brokerParams.push(broker_id);
      }

      const brokerStatsQuery = `
        SELECT
          -- Escrows (always visible to broker)
          (SELECT COUNT(*) FROM escrows e
           JOIN users u ON e.owner_id = u.id ${brokerFilter}) as total_escrows,
          (SELECT COUNT(*) FROM escrows e
           JOIN users u ON e.owner_id = u.id
           WHERE e.escrow_status IN ('active', 'pending', 'in_escrow') ${brokerFilter ? 'AND ' + brokerFilter.replace('WHERE ', '') : ''}) as active_escrows,
          (SELECT COALESCE(SUM(e.purchase_price), 0) FROM escrows e
           JOIN users u ON e.owner_id = u.id
           WHERE e.escrow_status IN ('active', 'pending', 'in_escrow') ${brokerFilter ? 'AND ' + brokerFilter.replace('WHERE ', '') : ''}) as escrow_volume,

          -- Clients (always visible to broker)
          (SELECT COUNT(*) FROM clients c
           JOIN users u ON c.owner_id = u.id ${brokerFilter}) as total_clients,
          (SELECT COUNT(*) FROM clients c
           JOIN users u ON c.owner_id = u.id
           WHERE c.status = 'active' ${brokerFilter ? 'AND ' + brokerFilter.replace('WHERE ', '') : ''}) as active_clients,

          -- Listings (always visible to broker)
          (SELECT COUNT(*) FROM listings l
           JOIN users u ON l.owner_id = u.id ${brokerFilter}) as total_listings,
          (SELECT COUNT(*) FROM listings l
           JOIN users u ON l.owner_id = u.id
           WHERE l.listing_status = 'active' ${brokerFilter ? 'AND ' + brokerFilter.replace('WHERE ', '') : ''}) as active_listings,
          (SELECT COALESCE(SUM(l.list_price), 0) FROM listings l
           JOIN users u ON l.owner_id = u.id
           WHERE l.listing_status = 'active' ${brokerFilter ? 'AND ' + brokerFilter.replace('WHERE ', '') : ''}) as listing_inventory_value,

          -- Leads (PRIVACY: exclude is_private = TRUE)
          (SELECT COUNT(*) FROM leads ld
           JOIN users u ON ld.owner_id = u.id
           WHERE ld.is_private = FALSE ${brokerFilter ? 'AND ' + brokerFilter.replace('WHERE ', '') : ''}) as total_leads,
          (SELECT COUNT(*) FROM leads ld
           JOIN users u ON ld.owner_id = u.id
           WHERE ld.lead_status = 'active' AND ld.is_private = FALSE ${brokerFilter ? 'AND ' + brokerFilter.replace('WHERE ', '') : ''}) as active_leads,

          -- Appointments (INHERITED PRIVACY: exclude if linked to private lead)
          (SELECT COUNT(*) FROM appointments a
           JOIN users u ON a.owner_id = u.id
           WHERE (a.lead_id IS NULL OR a.lead_id NOT IN (
             SELECT id FROM leads WHERE is_private = TRUE
           )) ${brokerFilter ? 'AND ' + brokerFilter.replace('WHERE ', '') : ''}) as total_appointments,
          (SELECT COUNT(*) FROM appointments a
           JOIN users u ON a.owner_id = u.id
           WHERE a.status IN ('scheduled', 'confirmed')
           AND (a.lead_id IS NULL OR a.lead_id NOT IN (
             SELECT id FROM leads WHERE is_private = TRUE
           )) ${brokerFilter ? 'AND ' + brokerFilter.replace('WHERE ', '') : ''}) as upcoming_appointments
      `;

      const brokerResult = await pool.query(brokerStatsQuery, brokerParams);
      const brokerStats = brokerResult.rows[0];

      // Calculate KPIs
      const totalLeads = parseInt(brokerStats.total_leads) || 0;
      const totalEscrows = parseInt(brokerStats.total_escrows) || 0;
      const totalAppointments = parseInt(brokerStats.total_appointments) || 0;
      const upcomingAppointments = parseInt(brokerStats.upcoming_appointments) || 0;

      // Conversion rate: (escrows / leads) * 100
      const conversionRate = totalLeads > 0
        ? ((totalEscrows / totalLeads) * 100).toFixed(1)
        : 0;

      // Show rate: (upcoming appointments / total appointments) * 100
      // Note: In a complete system, this would be (attended / scheduled)
      const showRate = totalAppointments > 0
        ? ((upcomingAppointments / totalAppointments) * 100).toFixed(1)
        : 0;

      response.data.broker = {
        escrows: {
          total: totalEscrows,
          active: parseInt(brokerStats.active_escrows),
          volume: parseFloat(brokerStats.escrow_volume),
        },
        clients: {
          total: parseInt(brokerStats.total_clients),
          active: parseInt(brokerStats.active_clients),
        },
        listings: {
          total: parseInt(brokerStats.total_listings),
          active: parseInt(brokerStats.active_listings),
          inventoryValue: parseFloat(brokerStats.listing_inventory_value),
        },
        leads: {
          total: totalLeads,
          active: parseInt(brokerStats.active_leads),
        },
        appointments: {
          total: totalAppointments,
          upcoming: upcomingAppointments,
        },
        kpis: {
          conversionRate: parseFloat(conversionRate),
          showRate: parseFloat(showRate),
        },
      };
    }

    // TIER 2: Team Stats (team_owner/broker)
    const isTeamOwner = role === 'team_owner' || isBroker;
    if (isTeamOwner) {
      // Determine which team to query
      let targetTeamId = requestedTeamId || team_id;

      // Authorization: team_owner can only see their own team
      if (role === 'team_owner' && requestedTeamId && requestedTeamId !== team_id) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Team owners can only access their own team statistics',
          },
        });
      }

      if (targetTeamId) {
        const teamStatsQuery = `
          SELECT
            -- Escrows (always visible to team)
            (SELECT COUNT(*) FROM escrows e
             JOIN users u ON e.owner_id = u.id
             WHERE u.team_id = $1) as total_escrows,
            (SELECT COUNT(*) FROM escrows e
             JOIN users u ON e.owner_id = u.id
             WHERE e.escrow_status IN ('active', 'pending', 'in_escrow')
             AND u.team_id = $1) as active_escrows,
            (SELECT COALESCE(SUM(e.purchase_price), 0) FROM escrows e
             JOIN users u ON e.owner_id = u.id
             WHERE e.escrow_status IN ('active', 'pending', 'in_escrow')
             AND u.team_id = $1) as escrow_volume,

            -- Clients (always visible to team)
            (SELECT COUNT(*) FROM clients c
             JOIN users u ON c.owner_id = u.id
             WHERE u.team_id = $1) as total_clients,
            (SELECT COUNT(*) FROM clients c
             JOIN users u ON c.owner_id = u.id
             WHERE c.status = 'active'
             AND u.team_id = $1) as active_clients,

            -- Listings (always visible to team)
            (SELECT COUNT(*) FROM listings l
             JOIN users u ON l.owner_id = u.id
             WHERE u.team_id = $1) as total_listings,
            (SELECT COUNT(*) FROM listings l
             JOIN users u ON l.owner_id = u.id
             WHERE l.listing_status = 'active'
             AND u.team_id = $1) as active_listings,
            (SELECT COALESCE(SUM(l.list_price), 0) FROM listings l
             JOIN users u ON l.owner_id = u.id
             WHERE l.listing_status = 'active'
             AND u.team_id = $1) as listing_inventory_value,

            -- Leads (PRIVACY: exclude is_private = TRUE)
            (SELECT COUNT(*) FROM leads ld
             JOIN users u ON ld.owner_id = u.id
             WHERE ld.is_private = FALSE
             AND u.team_id = $1) as total_leads,
            (SELECT COUNT(*) FROM leads ld
             JOIN users u ON ld.owner_id = u.id
             WHERE ld.lead_status = 'active'
             AND ld.is_private = FALSE
             AND u.team_id = $1) as active_leads,

            -- Appointments (INHERITED PRIVACY: exclude if linked to private lead)
            (SELECT COUNT(*) FROM appointments a
             JOIN users u ON a.owner_id = u.id
             WHERE u.team_id = $1
             AND (a.lead_id IS NULL OR a.lead_id NOT IN (
               SELECT id FROM leads WHERE is_private = TRUE
             ))) as total_appointments,
            (SELECT COUNT(*) FROM appointments a
             JOIN users u ON a.owner_id = u.id
             WHERE u.team_id = $1
             AND a.status IN ('scheduled', 'confirmed')
             AND (a.lead_id IS NULL OR a.lead_id NOT IN (
               SELECT id FROM leads WHERE is_private = TRUE
             ))) as upcoming_appointments,

            -- Team metadata
            (SELECT name FROM teams WHERE team_id = $1) as team_name,
            (SELECT COUNT(*) FROM users WHERE team_id = $1 AND is_active = TRUE) as team_member_count
        `;

        const teamResult = await pool.query(teamStatsQuery, [targetTeamId]);
        const teamStats = teamResult.rows[0];

        // Calculate team KPIs
        const teamTotalLeads = parseInt(teamStats.total_leads) || 0;
        const teamTotalEscrows = parseInt(teamStats.total_escrows) || 0;
        const teamTotalAppointments = parseInt(teamStats.total_appointments) || 0;
        const teamUpcomingAppointments = parseInt(teamStats.upcoming_appointments) || 0;

        const teamConversionRate = teamTotalLeads > 0
          ? ((teamTotalEscrows / teamTotalLeads) * 100).toFixed(1)
          : 0;

        const teamShowRate = teamTotalAppointments > 0
          ? ((teamUpcomingAppointments / teamTotalAppointments) * 100).toFixed(1)
          : 0;

        response.data.team = {
          teamId: targetTeamId,
          teamName: teamStats.team_name,
          teamMemberCount: parseInt(teamStats.team_member_count),
          escrows: {
            total: teamTotalEscrows,
            active: parseInt(teamStats.active_escrows),
            volume: parseFloat(teamStats.escrow_volume),
          },
          clients: {
            total: parseInt(teamStats.total_clients),
            active: parseInt(teamStats.active_clients),
          },
          listings: {
            total: parseInt(teamStats.total_listings),
            active: parseInt(teamStats.active_listings),
            inventoryValue: parseFloat(teamStats.listing_inventory_value),
          },
          leads: {
            total: teamTotalLeads,
            active: parseInt(teamStats.active_leads),
          },
          appointments: {
            total: teamTotalAppointments,
            upcoming: teamUpcomingAppointments,
          },
          kpis: {
            conversionRate: parseFloat(teamConversionRate),
            showRate: parseFloat(teamShowRate),
          },
        };
      }
    }

    // TIER 3: User Stats (all users get their own stats)
    const userStatsQuery = `
      SELECT
        -- Escrows
        (SELECT COUNT(*) FROM escrows WHERE owner_id = $1) as total_escrows,
        (SELECT COUNT(*) FROM escrows
         WHERE owner_id = $1
         AND escrow_status IN ('active', 'pending', 'in_escrow')) as active_escrows,
        (SELECT COALESCE(SUM(purchase_price), 0) FROM escrows
         WHERE owner_id = $1
         AND escrow_status IN ('active', 'pending', 'in_escrow')) as escrow_volume,

        -- Clients
        (SELECT COUNT(*) FROM clients WHERE owner_id = $1) as total_clients,
        (SELECT COUNT(*) FROM clients
         WHERE owner_id = $1
         AND status = 'active') as active_clients,

        -- Listings
        (SELECT COUNT(*) FROM listings WHERE owner_id = $1) as total_listings,
        (SELECT COUNT(*) FROM listings
         WHERE owner_id = $1
         AND listing_status = 'active') as active_listings,
        (SELECT COALESCE(SUM(list_price), 0) FROM listings
         WHERE owner_id = $1
         AND listing_status = 'active') as listing_inventory_value,

        -- Leads (includes private leads since this is the owner)
        (SELECT COUNT(*) FROM leads WHERE owner_id = $1) as total_leads,
        (SELECT COUNT(*) FROM leads
         WHERE owner_id = $1
         AND lead_status = 'active') as active_leads,

        -- Appointments (includes appointments linked to private leads)
        (SELECT COUNT(*) FROM appointments WHERE owner_id = $1) as total_appointments,
        (SELECT COUNT(*) FROM appointments
         WHERE owner_id = $1
         AND status IN ('scheduled', 'confirmed')) as upcoming_appointments,

        -- User metadata
        (SELECT CONCAT(first_name, ' ', last_name) FROM users WHERE id = $1) as user_name,
        (SELECT role FROM users WHERE id = $1) as user_role
    `;

    const userResult = await pool.query(userStatsQuery, [userId]);
    const userStats = userResult.rows[0];

    // Calculate user KPIs
    const userTotalLeads = parseInt(userStats.total_leads) || 0;
    const userTotalEscrows = parseInt(userStats.total_escrows) || 0;
    const userTotalAppointments = parseInt(userStats.total_appointments) || 0;
    const userUpcomingAppointments = parseInt(userStats.upcoming_appointments) || 0;

    const userConversionRate = userTotalLeads > 0
      ? ((userTotalEscrows / userTotalLeads) * 100).toFixed(1)
      : 0;

    const userShowRate = userTotalAppointments > 0
      ? ((userUpcomingAppointments / userTotalAppointments) * 100).toFixed(1)
      : 0;

    response.data.user = {
      userId,
      userName: userStats.user_name,
      userRole: userStats.user_role,
      escrows: {
        total: userTotalEscrows,
        active: parseInt(userStats.active_escrows),
        volume: parseFloat(userStats.escrow_volume),
      },
      clients: {
        total: parseInt(userStats.total_clients),
        active: parseInt(userStats.active_clients),
      },
      listings: {
        total: parseInt(userStats.total_listings),
        active: parseInt(userStats.active_listings),
        inventoryValue: parseFloat(userStats.listing_inventory_value),
      },
      leads: {
        total: userTotalLeads,
        active: parseInt(userStats.active_leads),
      },
      appointments: {
        total: userTotalAppointments,
        upcoming: userUpcomingAppointments,
      },
      kpis: {
        conversionRate: parseFloat(userConversionRate),
        showRate: parseFloat(userShowRate),
      },
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching home stats:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'STATS_ERROR',
        message: 'Failed to fetch dashboard statistics',
      },
    });
  }
};

module.exports = {
  getHomeStats
};
