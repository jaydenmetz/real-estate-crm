const { v4: uuidv4 } = require('uuid');
const { query } = require('../../../config/database');

class Lead {
  static async create(data) {
    const id = `lead_${uuidv4().replace(/-/g, '').substring(0, 12)}`;

    const text = `
      INSERT INTO leads (
        id, first_name, last_name, email, phone, lead_source,
        lead_type, lead_status, lead_score, lead_temperature,
        qualification, assigned_agent, campaign_info, property_interests, tags
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *
    `;

    const values = [
      id,
      data.firstName,
      data.lastName,
      data.email,
      data.phone,
      data.leadSource,
      data.leadType || 'Buyer',
      data.leadStatus || 'New',
      data.leadScore || 0,
      data.leadTemperature || 'Cool',
      JSON.stringify(data.qualification || {}),
      data.assignedAgent,
      JSON.stringify(data.campaignInfo || {}),
      JSON.stringify(data.propertyInterests || {}),
      data.tags || [],
    ];

    const result = await query(text, values);
    return result.rows[0];
  }

  static async findAll(filters = {}) {
    let text = `
      SELECT l.*,
        COUNT(*) OVER() as total_count
      FROM leads l
      WHERE 1=1
    `;

    const values = [];
    let paramCount = 0;

    if (filters.status) {
      paramCount++;
      text += ` AND l.lead_status = $${paramCount}`;
      values.push(filters.status);
    }

    if (filters.source) {
      paramCount++;
      text += ` AND l.lead_source = $${paramCount}`;
      values.push(filters.source);
    }

    if (filters.temperature) {
      paramCount++;
      text += ` AND l.lead_temperature = $${paramCount}`;
      values.push(filters.temperature);
    }

    if (filters.assignedAgent) {
      paramCount++;
      text += ` AND l.assigned_agent = $${paramCount}`;
      values.push(filters.assignedAgent);
    }

    if (filters.search) {
      paramCount++;
      text += ` AND (l.first_name ILIKE $${paramCount} OR l.last_name ILIKE $${paramCount} OR l.email ILIKE $${paramCount} OR l.phone ILIKE $${paramCount})`;
      values.push(`%${filters.search}%`);
    }

    if (filters.dateRange) {
      const today = new Date();
      let dateFilter;

      switch (filters.dateRange) {
        case 'today':
          dateFilter = 'DATE(l.date_created) = CURRENT_DATE';
          break;
        case 'week':
          dateFilter = 'l.date_created >= NOW() - INTERVAL \'7 days\'';
          break;
        case 'month':
          dateFilter = 'l.date_created >= NOW() - INTERVAL \'30 days\'';
          break;
      }

      if (dateFilter) {
        text += ` AND ${dateFilter}`;
      }
    }

    // Add sorting
    const sortField = filters.sort || 'date_created';
    const sortOrder = filters.order === 'asc' ? 'ASC' : 'DESC';
    text += ` ORDER BY l.${sortField} ${sortOrder}`;

    // Add pagination
    const limit = Math.min(filters.limit || 20, 100);
    const offset = ((filters.page || 1) - 1) * limit;
    text += ` LIMIT ${limit} OFFSET ${offset}`;

    const result = await query(text, values);

    return {
      leads: result.rows,
      total: result.rows.length > 0 ? parseInt(result.rows[0].total_count) : 0,
      page: filters.page || 1,
      pages: result.rows.length > 0 ? Math.ceil(result.rows[0].total_count / limit) : 0,
    };
  }

  static async findById(id) {
    const text = `
      SELECT l.*,
        array_agg(DISTINCT c.*) FILTER (WHERE c.id IS NOT NULL) as communications
      FROM leads l
      LEFT JOIN communications c ON c.entity_id = l.id AND c.entity_type = 'lead'
      WHERE l.id = $1
      GROUP BY l.id
    `;

    const result = await query(text, [id]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  static async update(id, data) {
    const fields = [];
    const values = [id];
    let paramCount = 1;

    Object.keys(data).forEach((key) => {
      if (key !== 'id' && key !== 'date_created') {
        paramCount++;
        if (typeof data[key] === 'object' && data[key] !== null) {
          fields.push(`${key} = $${paramCount}`);
          values.push(JSON.stringify(data[key]));
        } else {
          fields.push(`${key} = $${paramCount}`);
          values.push(data[key]);
        }
      }
    });

    fields.push('updated_at = NOW()');

    const text = `
      UPDATE leads 
      SET ${fields.join(', ')}
      WHERE id = $1
      RETURNING *
    `;

    const result = await query(text, values);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  static async logActivity(id, activity) {
    // Update lead with activity
    await query(
      'UPDATE leads SET number_of_contacts = number_of_contacts + 1, last_contact_date = NOW(), next_follow_up_date = $2 WHERE id = $1',
      [id, activity.nextFollowUp],
    );

    // Log communication
    const text = `
      INSERT INTO communications (
        entity_type, entity_id, type, direction, content, response, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
      RETURNING *
    `;

    const values = [
      'lead',
      id,
      activity.type,
      'outbound',
      activity.notes,
      activity.outcome,
    ];

    const result = await query(text, values);
    return result.rows[0];
  }

  static async calculateScore(qualificationData) {
    let score = 0;

    // Timeline scoring
    const timelineScores = {
      immediate: 25,
      '1-3months': 20,
      '3-6months': 15,
      '6-12months': 10,
      '12+months': 5,
    };
    score += timelineScores[qualificationData.timeline] || 5;

    // Financial readiness
    if (qualificationData.preApproved) score += 20;
    if (qualificationData.cashBuyer) score += 25;

    // Motivation
    const motivationScores = {
      high: 20,
      medium: 10,
      low: 5,
    };
    score += motivationScores[qualificationData.motivation] || 5;

    // No current agent
    if (!qualificationData.hasAgent) score += 15;

    // Engagement
    if (qualificationData.engagementLevel === 'high') score += 10;

    return Math.min(score, 100);
  }
}

module.exports = Lead;
