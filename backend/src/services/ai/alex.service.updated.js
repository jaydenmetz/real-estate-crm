const BaseAIAgent = require('./BaseAIAgent');
const { query } = require('../../config/database');
const { format } = require('date-fns');
const logger = require('../../utils/logger');

class AlexService extends BaseAIAgent {
  constructor() {
    super('alex', 'Alex - Executive Assistant', 'claude-3-opus-20240229');
  }

  /**
   * Process message when agent is enabled
   */
  async processEnabledMessage(message, type, userId) {
    try {
      let context = this.conversationContext.get(userId) || [];
      
      context.push({
        role: 'user',
        content: message,
        timestamp: new Date().toISOString()
      });

      let systemPrompt = this.getSystemPrompt(type, message);
      
      const relevantData = await this.gatherRelevantData(message, userId);
      
      if (relevantData) {
        systemPrompt += `\n\nCurrent data context: ${JSON.stringify(relevantData)}`;
      }

      const response = await this.callClaudeAPI(systemPrompt, context);
      
      context.push({
        role: 'assistant',
        content: response.content,
        timestamp: new Date().toISOString()
      });

      if (context.length > 20) {
        context = context.slice(-20);
      }
      
      this.conversationContext.set(userId, context);

      return response.content;

    } catch (error) {
      logger.error('Error processing Alex message:', error);
      throw error;
    }
  }

  getSystemPrompt(type, message) {
    const basePrompt = `You are Alex, the Executive Assistant for a real estate team. 
You have a professional yet warm personality, and you're highly organized and proactive.
Your role is to help manage the team's daily operations, coordinate between departments, 
and ensure smooth communication.`;

    const prompts = {
      'daily-briefing': `${basePrompt}
Provide a comprehensive daily briefing that includes:
1. Key metrics and KPIs
2. Urgent tasks and priorities
3. Team member activities
4. Important reminders
5. Market insights
Keep it concise but informative, with actionable insights.`,

      'task-summary': `${basePrompt}
Analyze the current tasks and provide:
1. Priority tasks that need immediate attention
2. Overdue items
3. Upcoming deadlines
4. Suggested task delegation
5. Bottlenecks or concerns`,

      'general': `${basePrompt}
Respond helpfully to the user's request. Be concise but thorough.
If the request involves scheduling, coordination, or team management, 
provide specific actionable suggestions.`
    };

    return prompts[type] || prompts['general'];
  }

  async gatherRelevantData(message, userId) {
    const data = {};
    
    // Gather active escrows
    const escrows = await query(`
      SELECT COUNT(*) as total, 
             COUNT(CASE WHEN status = 'active' THEN 1 END) as active,
             COUNT(CASE WHEN closing_date < CURRENT_DATE + INTERVAL '7 days' THEN 1 END) as closing_soon
      FROM escrows 
      WHERE team_id = 'team_jm_default' 
      AND deleted_at IS NULL
    `);
    data.escrows = escrows.rows[0];

    // Gather leads
    const leads = await query(`
      SELECT COUNT(*) as total,
             COUNT(CASE WHEN lead_status = 'New' THEN 1 END) as new,
             COUNT(CASE WHEN created_at > CURRENT_DATE - INTERVAL '24 hours' THEN 1 END) as today
      FROM leads
    `);
    data.leads = leads.rows[0];

    // Gather appointments
    const appointments = await query(`
      SELECT COUNT(*) as total,
             COUNT(CASE WHEN date = CURRENT_DATE THEN 1 END) as today,
             COUNT(CASE WHEN date = CURRENT_DATE + INTERVAL '1 day' THEN 1 END) as tomorrow
      FROM appointments
      WHERE status = 'Scheduled'
    `);
    data.appointments = appointments.rows[0];

    return data;
  }

  async getDailyBriefing(userId) {
    const response = await this.processMessage('Generate daily briefing', 'daily-briefing', userId);
    
    if (response.success === false) {
      return response; // Return the disabled message
    }
    
    return {
      success: true,
      briefing: response,
      timestamp: new Date().toISOString()
    };
  }

  async getUrgentTasks(userId) {
    const response = await this.processMessage('Show urgent tasks', 'task-summary', userId);
    
    if (response.success === false) {
      return response; // Return the disabled message
    }
    
    return {
      success: true,
      tasks: response,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Override getMockResponse for Alex-specific demo responses
   */
  getMockResponse() {
    const mockResponses = {
      'daily-briefing': `Good morning! Here's your daily briefing:

📊 **Key Metrics**
- Active Escrows: 3
- Pipeline Value: $2.85M
- Leads This Week: 12

🎯 **Today's Priorities**
1. Follow up with the Chen family on inspection results
2. Review and sign listing agreement for 890 Market St
3. Prepare CMA for Pacific Beach property

📅 **Appointments**
- 10:00 AM: Buyer consultation (Wilson family)
- 2:00 PM: Property showing at 456 Ocean View Dr
- 4:00 PM: Team meeting

💡 **Action Items**
- Send DocuSign for Ocean View earnest money
- Schedule photographer for new Coronado listing
- Update MLS for price reduction on Sunset Cliffs

[Demo Mode: Enable Alex for live data and AI-powered insights]`,

      'task-summary': `Here are your urgent tasks:

🔴 **Critical (Due Today)**
1. Submit inspection response for Ocean View property
2. Send closing documents to escrow
3. Follow up with pre-approval for Wilson family

🟡 **Important (Due This Week)**
1. Complete listing presentation for La Jolla property
2. Update CRM with showing feedback
3. Review and approve marketing materials

🟢 **Upcoming**
1. Prepare for next week's closings
2. Schedule team training on new MLS features
3. Plan client appreciation event

[Demo Mode: Enable Alex for real-time task management]`
    };

    return {
      content: mockResponses['daily-briefing'],
      tokensUsed: 0
    };
  }
}

module.exports = AlexService;