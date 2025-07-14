const axios = require('axios');
const logger = require('../../../utils/logger');
const { query } = require('../../../config/database');
const twilioClient = require('../../../config/twilio');

class BuyerNurtureSpecialistAgent {
  constructor() {
    this.name = 'Buyer Nurture Specialist';
    this.model = 'claude-3-haiku-20240307';
    this.enabled = true;
  }

  async execute8x8Program(leadId) {
    // Tom Ferry's 8x8 program: 8 touches in 8 weeks
    const touchSchedule = [
      { week: 1, day: 1, type: 'welcome_call' },
      { week: 1, day: 3, type: 'market_update' },
      { week: 2, day: 1, type: 'new_listings' },
      { week: 3, day: 1, type: 'check_in_call' },
      { week: 4, day: 1, type: 'market_report' },
      { week: 5, day: 1, type: 'property_alert' },
      { week: 6, day: 1, type: 'follow_up_call' },
      { week: 8, day: 1, type: 'final_check_in' }
    ];

    for (const touch of touchSchedule) {
      await this.scheduleTouchPoint(leadId, touch);
    }
  }

  async execute33TouchProgram(clientId) {
    // Tom Ferry's 33-touch annual program for past clients
    const touchPoints = [
      // Monthly market updates (12)
      ...Array.from({ length: 12 }, (_, i) => ({
        month: i + 1,
        type: 'market_update',
        template: 'monthly_market_report'
      })),
      
      // Quarterly check-ins (4)
      ...Array.from({ length: 4 }, (_, i) => ({
        quarter: i + 1,
        type: 'personal_check_in',
        template: 'quarterly_touch'
      })),
      
      // Special occasions (17)
      { type: 'birthday', template: 'birthday_greeting' },
      { type: 'home_anniversary', template: 'home_anniversary' },
      { type: 'thanksgiving', template: 'thanksgiving_card' },
      { type: 'christmas', template: 'holiday_card' },
      { type: 'new_year', template: 'new_year_wishes' },
      { type: 'valentines', template: 'valentines_card' },
      { type: 'easter', template: 'easter_greeting' },
      { type: 'mothers_day', template: 'mothers_day' },
      { type: 'fathers_day', template: 'fathers_day' },
      { type: 'independence_day', template: 'july_4th' },
      { type: 'halloween', template: 'halloween_card' },
      { type: 'home_maintenance_spring', template: 'spring_maintenance' },
      { type: 'home_maintenance_fall', template: 'fall_maintenance' },
      { type: 'tax_season', template: 'tax_reminder' },
      { type: 'insurance_review', template: 'insurance_check' },
      { type: 'referral_request', template: 'referral_ask' },
      { type: 'client_appreciation', template: 'appreciation_event' }
    ];

    for (const touch of touchPoints) {
      await this.scheduleAnnualTouchPoint(clientId, touch);
    }
  }

  async sendMarketUpdate(clientId) {
    const client = await query('SELECT * FROM clients WHERE id = $1', [clientId]);
    if (!client.rows.length) return;

    const clientData = client.rows[0];
    
    // Get market data for client's area
    const marketData = await this.getMarketData(clientData.preferences?.preferredAreas || []);
    
    // Generate personalized market update
    const prompt = `
      Create a personalized market update for ${clientData.first_name} ${clientData.last_name}.
      Client preferences: ${JSON.stringify(clientData.preferences)}
      Market data: ${JSON.stringify(marketData)}
      
      Include:
      - Current market trends in their preferred areas
      - New listings that match their criteria
      - Recent sales in their price range
      - Actionable insights
      
      Keep it conversational and valuable.
    `;

    const response = await this.callClaude(prompt);
    
    // Send via email or SMS based on preference
    if (clientData.preferred_contact_method === 'Email' && clientData.email) {
      await this.sendEmail(clientData.email, 'Market Update', response.content);
    } else if (clientData.phone) {
      await this.sendSMS(clientData.phone, response.content);
    }
    
    // Log communication
    await this.logCommunication(clientId, 'market_update', response.content);
  }

  async scheduleTouchPoint(leadId, touch) {
    const scheduleDate = new Date();
    scheduleDate.setDate(scheduleDate.getDate() + (touch.week * 7) + touch.day - 1);
    
    // Store in database for later execution
    await query(
      'INSERT INTO scheduled_touches (lead_id, type, scheduled_date, status) VALUES ($1, $2, $3, $4)',
      [leadId, touch.type, scheduleDate, 'scheduled']
    );
  }

  async scheduleAnnualTouchPoint(clientId, touch) {
    // Calculate next occurrence date based on touch type
    let scheduleDate = new Date();
    
    if (touch.month) {
      scheduleDate.setMonth(touch.month - 1, 15); // 15th of each month
    } else if (touch.quarter) {
      scheduleDate.setMonth((touch.quarter - 1) * 3, 1); // First of quarter
    } else {
      // Special occasions - calculate based on type
      scheduleDate = this.calculateSpecialOccasionDate(touch.type);
    }
    
    await query(
      'INSERT INTO scheduled_touches (client_id, type, scheduled_date, status, template) VALUES ($1, $2, $3, $4, $5)',
      [clientId, touch.type, scheduleDate, 'scheduled', touch.template]
    );
  }

  calculateSpecialOccasionDate(type) {
    const now = new Date();
    const year = now.getFullYear();
    
    const dates = {
      'thanksgiving': new Date(year, 10, 23), // 4th Thursday of November (approx)
      'christmas': new Date(year, 11, 25),
      'new_year': new Date(year + 1, 0, 1),
      'valentines': new Date(year, 1, 14),
      'easter': new Date(year, 3, 15), // Approximate
      'mothers_day': new Date(year, 4, 12), // 2nd Sunday of May (approx)
      'fathers_day': new Date(year, 5, 16), // 3rd Sunday of June (approx)
      'independence_day': new Date(year, 6, 4),
      'halloween': new Date(year, 9, 31),
      'home_maintenance_spring': new Date(year, 2, 15), // March 15
      'home_maintenance_fall': new Date(year, 8, 15), // September 15
      'tax_season': new Date(year, 3, 1), // April 1
      'insurance_review': new Date(year, 0, 15), // January 15
    };
    
    return dates[type] || new Date();
  }

  async sendEmail(email, subject, content) {
    // Integration with email service would go here
    logger.info(`Email sent to ${email}: ${subject}`);
  }

  async sendSMS(phone, message) {
    if (!twilioClient) {
      logger.warn('Twilio client not initialized. SMS not sent.');
      return;
    }
    try {
      await twilioClient.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phone
      });
    } catch (error) {
      logger.error('SMS send failed:', error);
    }
  }

  async logCommunication(entityId, type, content) {
    await query(
      'INSERT INTO communications (entity_type, entity_id, type, direction, content, created_at) VALUES ($1, $2, $3, $4, $5, NOW())',
      ['client', entityId, type, 'outbound', content]
    );
  }

  async callClaude(prompt) {
    try {
      const response = await axios.post(
        'https://api.anthropic.com/v1/messages',
        {
          model: this.model,
          max_tokens: 800,
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

  async getMarketData(preferredAreas) {
    // Mock market data - in real implementation, integrate with MLS or market data API
    return {
      avgPrice: 450000,
      priceChange: 2.5,
      inventoryDays: 45,
      newListings: 23,
      areas: preferredAreas
    };
  }

  isEnabled() {
    return this.enabled;
  }

  setEnabled(enabled) {
    this.enabled = enabled;
    logger.info(`${this.name} ${enabled ? 'enabled' : 'disabled'}`);
  }
}

module.exports = new BuyerNurtureSpecialistAgent();