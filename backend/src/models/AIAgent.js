const { query } = require('../config/database');
const logger = require('../utils/logger');

class AIAgent {
  static async findAll() {
    const text = `
      SELECT 
        a.*,
        COALESCE(SUM(aa.tokens_used), 0) as tokens_today,
        COALESCE(COUNT(aa.id), 0) as tasks_today,
        (SELECT description FROM ai_activities 
         WHERE agent_id = a.id AND success = true 
         ORDER BY created_at DESC LIMIT 1) as current_task
      FROM ai_agents a
      LEFT JOIN ai_activities aa ON a.id = aa.agent_id 
        AND DATE(aa.created_at) = CURRENT_DATE
      GROUP BY a.id
      ORDER BY 
        CASE 
          WHEN a.role = 'executive' THEN 1
          WHEN a.role = 'manager' THEN 2
          WHEN a.role = 'agent' THEN 3
          ELSE 4
        END,
        a.name
    `;
    
    const result = await query(text);
    
    return result.rows.map(agent => ({
      ...agent,
      costToday: this.calculateCost(agent.tokens_today, agent.role)
    }));
  }
  
  static async updateStatus(id, enabled) {
    const text = `
      UPDATE ai_agents 
      SET enabled = $2, last_active = NOW()
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await query(text, [id, enabled]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    logger.info(`AI Agent ${id} ${enabled ? 'enabled' : 'disabled'}`);
    return result.rows[0];
  }
  
  static async logActivity(agentId, activity) {
    const text = `
      INSERT INTO ai_activities (
        agent_id, activity_type, entity_type, entity_id,
        description, tokens_used, duration_ms, success, error_message
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    
    const values = [
      agentId,
      activity.type,
      activity.entityType,
      activity.entityId,
      activity.description,
      activity.tokensUsed || 0,
      activity.duration || 0,
      activity.success !== false,
      activity.error || null
    ];
    
    const result = await query(text, values);
    
    // Update agent stats
    await query(
      'UPDATE ai_agents SET tasks_completed = tasks_completed + 1, tokens_used = tokens_used + $2 WHERE id = $1',
      [agentId, activity.tokensUsed || 0]
    );
    
    return result.rows[0];
  }
  
  static async getTokenUsage() {
    // Current month usage
    const currentMonth = await query(`
      SELECT 
        SUM(tokens_used) as total_tokens,
        COUNT(*) as total_activities
      FROM ai_activities 
      WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)
    `);
    
    // Usage by department
    const byDepartment = await query(`
      SELECT 
        a.department,
        a.role,
        SUM(aa.tokens_used) as tokens,
        COUNT(aa.id) as activities
      FROM ai_agents a
      LEFT JOIN ai_activities aa ON a.id = aa.agent_id
        AND DATE_TRUNC('month', aa.created_at) = DATE_TRUNC('month', CURRENT_DATE)
      GROUP BY a.department, a.role
      ORDER BY tokens DESC
    `);
    
    // Recent activities
    const recentActivities = await query(`
      SELECT 
        a.name as agent,
        aa.description as action,
        aa.created_at as time
      FROM ai_activities aa
      JOIN ai_agents a ON aa.agent_id = a.id
      ORDER BY aa.created_at DESC
      LIMIT 10
    `);
    
    const totalTokens = parseInt(currentMonth.rows[0]?.total_tokens || 0);
    const currentMonthCost = this.calculateTotalCost(totalTokens);
    const projectedCost = (currentMonthCost / new Date().getDate()) * 30;
    
    // Cost optimization suggestions
    const suggestions = [];
    if (projectedCost > 800) {
      suggestions.push({
        title: 'Switch Market Analyst to Haiku model',
        savings: '$30'
      });
    }
    if (totalTokens > 500000) {
      suggestions.push({
        title: 'Batch process daily reports',
        savings: '$15'
      });
    }
    
    return {
      currentMonthCost: currentMonthCost.toFixed(2),
      projectedCost: projectedCost.toFixed(2),
      totalTokens,
      byDepartment: byDepartment.rows,
      recentActivities: recentActivities.rows,
      suggestions
    };
  }
  
  static calculateCost(tokens, role) {
    // Rough cost calculation based on model
    const costPerMillion = {
      'executive': 15, // Opus
      'manager': 3,    // Sonnet
      'agent': 0.25    // Haiku
    };
    
    const rate = costPerMillion[role] || 1;
    return ((tokens / 1000000) * rate).toFixed(2);
  }
  
  static calculateTotalCost(totalTokens) {
    // Mixed model cost calculation
    // Assuming 10% Opus, 30% Sonnet, 60% Haiku
    const opusTokens = totalTokens * 0.1;
    const sonnetTokens = totalTokens * 0.3;
    const haikuTokens = totalTokens * 0.6;
    
    return (
      (opusTokens / 1000000) * 15 +
      (sonnetTokens / 1000000) * 3 +
      (haikuTokens / 1000000) * 0.25
    );
  }
}

module.exports = AIAgent;