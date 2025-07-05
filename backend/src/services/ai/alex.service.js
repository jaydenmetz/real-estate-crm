const axios = require('axios');
const logger = require('../../utils/logger');
const { query } = require('../../config/database');
const twilioClient = require('../../config/twilio');
const { format } = require('date-fns');

class AlexService {
  constructor() {
    this.name = 'Alex - Executive Assistant';
    this.model = 'claude-3-opus-20240229';
    this.enabled = true;
  }

  async generateDailyBriefing() {
    try {
      // Gather all data for briefing
      const [appointments, urgentTasks, newLeads, closings] = await Promise.all([
        this.getTodayAppointments(),
        this.getUrgentTasks(),
        this.getNewLeads(),
        this.getUpcomingClosings()
      ]);

      // Generate briefing using Claude
      const prompt = `
        You are Alex, an executive assistant for a real estate agent.
        Create a concise, actionable daily briefing based on this data:
        
        Today's Appointments: ${JSON.stringify(appointments)}
        Urgent Tasks: ${JSON.stringify(urgentTasks)}
        New Leads (last 24h): ${JSON.stringify(newLeads)}
        Closings This Week: ${JSON.stringify(closings)}
        
        Format the briefing to be friendly, professional, and action-oriented.
        Prioritize the most important items.
      `;

      const response = await this.callClaude(prompt);
      
      // Send via multiple channels
      await this.sendBriefing(response.content, {
        appointments: appointments.length,
        urgentTasks: urgentTasks.length,
        newLeads: newLeads.length,
        closingsThisWeek: closings.length
      });

      return response.content;
    } catch (error) {
      logger.error('Error generating daily briefing:', error);
      throw error;
    }
  }

  async handleManagerRequest(request) {
    const { from, priority, type, context } = request;
    
    logger.info(`Manager request from ${from}:`, { priority, type });

    // Process based on request type
    switch (type) {
      case 'decision_needed':
        return this.processDecisionRequest(context);
      case 'escalation':
        return this.handleEscalation(context);
      case 'coordination':
        return this.coordinateManagers(context);
      default:
        return this.generalManagerSupport(request);
    }
  }

  async sendClientCommunication(data) {
    const { to, type, context, template } = data;
    
    try {
      let message;
      
      // Generate message based on context
      if (template) {
        message = await this.getMessageTemplate(template, context);
      } else {
        message = await this.generateMessage(context);
      }

      // Send via appropriate channel
      if (type === 'sms') {
        await twilioClient.messages.create({
          body: message,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: to
        });
      }

      // Log communication
      await this.logCommunication({
        to,
        type,
        message,
        context,
        timestamp: new Date()
      });

      return { success: true, message: 'Communication sent' };
    } catch (error) {
      logger.error('Error sending communication:', error);
      throw error;
    }
  }

  async callClaude(prompt) {
    try {
      const response = await axios.post(
        'https://api.anthropic.com/v1/messages',
        {
          model: this.model,
          max_tokens: 1000,
          messages: [{ role: 'user', content: prompt }]
        },
        {
          headers: {
            'x-api-key': process.env.ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      logger.error('Claude API error:', error);
      throw error;
    }
  }

  // Helper methods
  async getTodayAppointments() {
    const today = format(new Date(), 'yyyy-MM-dd');
    const result = await query(
      'SELECT * FROM appointments WHERE date = $1 ORDER BY start_time',
      [today]
    );
    return result.rows;
  }

  async getUrgentTasks() {
    const result = await query(`
      SELECT * FROM (
        SELECT 'escrow' as type, id, property_address as description, 
               'EMD Due' as task, emd_due_date as deadline
        FROM escrows 
        WHERE emd_due_date <= NOW() + INTERVAL '24 hours' 
          AND escrow_status = 'Active'
        
        UNION ALL
        
        SELECT 'escrow' as type, id, property_address as description,
               'Contingency Removal' as task, contingency_removal_date as deadline
        FROM escrows
        WHERE contingency_removal_date <= NOW() + INTERVAL '48 hours'
          AND escrow_status = 'Active'
      ) tasks
      ORDER BY deadline
      LIMIT 10
    `);
    return result.rows;
  }

  async getNewLeads() {
    const result = await query(
      `SELECT * FROM leads 
       WHERE created_at >= NOW() - INTERVAL '24 hours'
       ORDER BY lead_score DESC`,
      []
    );
    return result.rows;
  }

  async getUpcomingClosings() {
    const result = await query(
      `SELECT * FROM escrows 
       WHERE closing_date BETWEEN NOW() AND NOW() + INTERVAL '7 days'
         AND escrow_status = 'Active'
       ORDER BY closing_date`,
      []
    );
    return result.rows;
  }

  async sendBriefing(content, stats) {
    // Implementation for sending briefing via SMS, email, etc.
    logger.info('Daily briefing sent:', stats);
  }

  isEnabled() {
    return this.enabled;
  }

  setEnabled(enabled) {
    this.enabled = enabled;
    logger.info(`Alex service ${enabled ? 'enabled' : 'disabled'}`);
  }
}

module.exports = new AlexService();