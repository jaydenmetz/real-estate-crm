const axios = require('axios');
const logger = require('../../../utils/logger');
const { query } = require('../../../config/database');
const Lead = require('../../../models/Lead');
const twilioClient = require('../../../config/twilio');

class BuyerLeadQualifierAgent {
  constructor() {
    this.name = 'Buyer Lead Qualifier';
    this.model = 'claude-3-haiku-20240307';
    this.enabled = true;
    this.responseTimeTarget = 5; // minutes
  }

  async processNewLead(leadData) {
    const startTime = Date.now();
    
    try {
      logger.info(`Processing new lead: ${leadData.id}`);
      
      // Send immediate response
      await this.sendImmediateResponse(leadData);
      
      // Apply LPMAMA qualification
      const qualificationData = await this.qualifyLead(leadData);
      
      // Calculate lead score
      const leadScore = this.calculateLeadScore(qualificationData);
      
      // Update lead with qualification data
      await Lead.update(leadData.id, {
        leadScore,
        leadStatus: 'Contacted',
        qualification: qualificationData,
        firstContactDate: new Date()
      });
      
      // Route based on score
      await this.routeLead(leadData.id, leadScore, qualificationData);
      
      const processingTime = (Date.now() - startTime) / 1000 / 60; // minutes
      logger.info(`Lead processed in ${processingTime.toFixed(2)} minutes`);
      
      return {
        leadId: leadData.id,
        score: leadScore,
        processingTime,
        routed: true
      };
    } catch (error) {
      logger.error('Error processing lead:', error);
      throw error;
    }
  }

  async sendImmediateResponse(leadData) {
    const message = `Hi ${leadData.firstName}! I'm Alex from the Metz Real Estate Team. I saw you were interested in ${leadData.propertyInterest || 'finding a home'}. I'd love to help! When would be a good time for a quick call to discuss what you're looking for?`;
    
    if (leadData.phone && twilioClient) {
      try {
        await twilioClient.messages.create({
          body: message,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: leadData.phone
        });
      } catch (error) {
        console.error('Failed to send SMS:', error.message);
      }
    }
    
    // Log communication
    await this.logCommunication(leadData.id, 'sms', message, 'outbound');
  }

  async qualifyLead(leadData) {
    // LPMAMA: Location, Price, Motivation, Agent, Mortgage, Appointment
    const prompt = `
      Analyze this lead information and extract LPMAMA qualification data:
      Lead Info: ${JSON.stringify(leadData)}
      
      Extract and structure:
      1. Location preferences
      2. Price range
      3. Motivation level and timeline
      4. Current agent status
      5. Mortgage/financing status
      6. Appointment readiness
      
      Return as JSON.
    `;
    
    const response = await this.callClaude(prompt);
    return JSON.parse(response.content);
  }

  calculateLeadScore(qualificationData) {
    let score = 0;
    
    // Timeline scoring
    const timelineScores = {
      'immediate': 25,
      '1-3months': 20,
      '3-6months': 15,
      '6-12months': 10,
      '12+months': 5
    };
    score += timelineScores[qualificationData.timeline] || 5;
    
    // Financial readiness
    if (qualificationData.preApproved) score += 20;
    if (qualificationData.cashBuyer) score += 25;
    
    // Motivation
    const motivationScores = {
      'high': 20,
      'medium': 10,
      'low': 5
    };
    score += motivationScores[qualificationData.motivation] || 5;
    
    // No current agent
    if (!qualificationData.hasAgent) score += 15;
    
    // Ready for appointment
    if (qualificationData.appointmentReady) score += 15;
    
    return Math.min(score, 100);
  }

  async routeLead(leadId, score, qualificationData) {
    if (score >= 80) {
      // Hot lead - schedule immediate consultation
      await this.scheduleConsultation(leadId, qualificationData);
    } else if (score >= 60) {
      // Warm lead - assign to nurture campaign
      await this.assignToNurture(leadId, 'warm');
    } else {
      // Cool/Cold lead - long-term nurture
      await this.assignToNurture(leadId, 'cool');
    }
  }

  async callClaude(prompt) {
    try {
      const response = await axios.post(
        'https://api.anthropic.com/v1/messages',
        {
          model: this.model,
          max_tokens: 500,
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

  isEnabled() {
    return this.enabled;
  }

  setEnabled(enabled) {
    this.enabled = enabled;
    logger.info(`${this.name} ${enabled ? 'enabled' : 'disabled'}`);
  }
}

module.exports = new BuyerLeadQualifierAgent();