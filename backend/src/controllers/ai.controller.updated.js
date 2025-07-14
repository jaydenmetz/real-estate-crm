const logger = require('../utils/logger');
const { query } = require('../config/database');
const AlexService = require('../services/ai/alex.service.updated');
const alex = new AlexService();

exports.getAgents = async (req, res) => {
  try {
    // Fetch agents from database
    const result = await query(`
      SELECT 
        a.*,
        COALESCE(u.tokens_used, 0) as tokens_today,
        COALESCE(u.api_calls, 0) as api_calls_today,
        COALESCE(u.estimated_cost, 0) as cost_today
      FROM ai_agents a
      LEFT JOIN ai_token_usage u ON u.agent_id = a.id 
        AND u.date = CURRENT_DATE
      ORDER BY a.department, a.name
    `);
    
    const agents = result.rows.map(agent => ({
      id: agent.id,
      name: agent.name,
      role: agent.role,
      department: agent.department,
      avatar: `/api/placeholder/40/40`,
      status: agent.enabled ? 'active' : 'disabled',
      enabled: agent.enabled,
      lastActive: agent.last_active,
      tasksCompleted: agent.tasks_completed,
      efficiency: agent.enabled ? '98%' : 'N/A',
      currentTask: agent.enabled ? 'Monitoring for new tasks' : agent.disabled_message,
      tokensUsed: agent.tokens_used,
      tokensToday: agent.tokens_today,
      apiCallsToday: agent.api_calls_today,
      costToday: agent.cost_today,
      monthlyTokenLimit: agent.monthly_token_limit,
      tokenWarningThreshold: agent.token_warning_threshold
    }));
    
    res.json({
      success: true,
      data: agents
    });
  } catch (error) {
    logger.error('Error fetching agents:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch AI agents'
      }
    });
  }
};

exports.toggleAgent = async (req, res) => {
  try {
    const { id } = req.params;
    const { enabled } = req.body;
    
    // Update database
    const result = await query(
      `UPDATE ai_agents 
       SET enabled = $1, last_active = CASE WHEN $1 = true THEN CURRENT_TIMESTAMP ELSE last_active END
       WHERE id = $2
       RETURNING *`,
      [enabled, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'AGENT_NOT_FOUND',
          message: 'Agent not found'
        }
      });
    }
    
    const agent = result.rows[0];
    
    // Log the action
    logger.info(`AI Agent ${agent.name} (${id}) has been ${enabled ? 'enabled' : 'disabled'}`);
    
    // Return response with warning if enabling
    const response = {
      success: true,
      data: {
        id: agent.id,
        name: agent.name,
        enabled: agent.enabled,
        updatedAt: new Date().toISOString()
      },
      message: enabled 
        ? `${agent.name} has been enabled. API calls will now be charged to your Anthropic account.`
        : `${agent.name} has been disabled. No API calls will be made.`
    };
    
    if (enabled && !process.env.ANTHROPIC_API_KEY) {
      response.warning = 'No ANTHROPIC_API_KEY found in environment variables. Agent will use mock responses.';
    }
    
    res.json(response);
  } catch (error) {
    logger.error('Error toggling agent:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'TOGGLE_ERROR',
        message: 'Failed to toggle agent status'
      }
    });
  }
};

exports.getTokenUsage = async (req, res) => {
  try {
    const { startDate, endDate, agentId } = req.query;
    
    let conditions = ['1=1'];
    let values = [];
    let valueIndex = 1;
    
    if (startDate) {
      conditions.push(`date >= $${valueIndex}`);
      values.push(startDate);
      valueIndex++;
    }
    
    if (endDate) {
      conditions.push(`date <= $${valueIndex}`);
      values.push(endDate);
      valueIndex++;
    }
    
    if (agentId) {
      conditions.push(`agent_id = $${valueIndex}`);
      values.push(agentId);
      valueIndex++;
    }
    
    // Get token usage
    const usageResult = await query(`
      SELECT 
        agent_id,
        SUM(tokens_used) as total_tokens,
        SUM(api_calls) as total_calls,
        SUM(estimated_cost) as total_cost,
        MIN(date) as period_start,
        MAX(date) as period_end
      FROM ai_token_usage
      WHERE ${conditions.join(' AND ')}
      GROUP BY agent_id
    `, values);
    
    // Get total across all agents
    const totalResult = await query(`
      SELECT 
        SUM(tokens_used) as total_tokens,
        SUM(api_calls) as total_calls,
        SUM(estimated_cost) as total_cost
      FROM ai_token_usage
      WHERE ${conditions.join(' AND ')}
    `, values);
    
    const total = totalResult.rows[0] || { total_tokens: 0, total_calls: 0, total_cost: 0 };
    
    res.json({
      success: true,
      data: {
        totalTokens: parseInt(total.total_tokens) || 0,
        totalCalls: parseInt(total.total_calls) || 0,
        totalCost: parseFloat(total.total_cost) || 0,
        period: {
          start: usageResult.rows[0]?.period_start || startDate || new Date(new Date().setDate(1)).toISOString(),
          end: usageResult.rows[0]?.period_end || endDate || new Date().toISOString()
        },
        byAgent: usageResult.rows.map(row => ({
          agentId: row.agent_id,
          tokens: parseInt(row.total_tokens) || 0,
          calls: parseInt(row.total_calls) || 0,
          cost: parseFloat(row.total_cost) || 0
        }))
      }
    });
  } catch (error) {
    logger.error('Error fetching token usage:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'USAGE_ERROR',
        message: 'Failed to fetch token usage'
      }
    });
  }
};

exports.getDailyBriefing = async (req, res) => {
  try {
    const userId = req.user?.id || 'default';
    const briefing = await alex.getDailyBriefing(userId);
    
    // Check if agent is disabled
    if (!briefing.success && briefing.error === 'AGENT_DISABLED') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'AGENT_DISABLED',
          message: briefing.message,
          agentId: briefing.agentId,
          agentName: briefing.agentName
        }
      });
    }
    
    res.json(briefing);
  } catch (error) {
    logger.error('Error getting daily briefing:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'BRIEFING_ERROR',
        message: 'Failed to generate daily briefing'
      }
    });
  }
};

exports.getUrgentTasks = async (req, res) => {
  try {
    const userId = req.user?.id || 'default';
    const tasks = await alex.getUrgentTasks(userId);
    
    // Check if agent is disabled
    if (!tasks.success && tasks.error === 'AGENT_DISABLED') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'AGENT_DISABLED',
          message: tasks.message,
          agentId: tasks.agentId,
          agentName: tasks.agentName
        }
      });
    }
    
    res.json(tasks);
  } catch (error) {
    logger.error('Error getting urgent tasks:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'TASKS_ERROR',
        message: 'Failed to fetch urgent tasks'
      }
    });
  }
};

exports.processLead = async (req, res) => {
  try {
    const { leadData, agentId } = req.body;
    
    // Check if the specific agent is enabled
    const agentResult = await query(
      'SELECT enabled, name, disabled_message FROM ai_agents WHERE id = $1',
      [agentId || 'buyer_lead_qualifier']
    );
    
    if (agentResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'AGENT_NOT_FOUND',
          message: 'AI agent not found'
        }
      });
    }
    
    const agent = agentResult.rows[0];
    
    if (!agent.enabled) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'AGENT_DISABLED',
          message: agent.disabled_message || `${agent.name} is disabled. Toggle the agent on to process leads.`,
          agentId: agentId,
          agentName: agent.name
        }
      });
    }
    
    // Process lead (mock for now)
    res.json({
      success: true,
      data: {
        leadId: leadData.id,
        status: 'processed',
        qualificationScore: 85,
        recommendedActions: ['Send welcome email', 'Schedule consultation'],
        agentNotes: 'High-quality lead with pre-approval'
      }
    });
  } catch (error) {
    logger.error('Error processing lead:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'PROCESS_ERROR',
        message: 'Failed to process lead'
      }
    });
  }
};