

// backend/src/services/ai/agents/buyerNurtureSpecialist.js

const axios = require('axios');
const logger = require('../../../utils/logger');
const Lead = require('../../../models/Lead');
const twilioClient = require('../../../config/twilio');
const emailService = require('../../../services/email.service');

class BuyerNurtureSpecialistAgent {
  constructor() {
    this.name = 'Buyer Nurture Specialist';
    this.model = 'claude-3-sonnet-20240307';
    this.enabled = true;
    this.followUpIntervalHours = 48; // default interval between follow-ups
  }

  /**
   * Entry point for nurturing a lead: send tailored nurture content
   * and schedule the next follow-up.
   * @param {Object} leadData - The lead record from database
   */
  async nurtureLead(leadData) {
    const start = Date.now();
    try {
      logger.info(`Nurturing lead: ${leadData.id}`);

      // Generate personalized content
      const content = await this.generateNurtureContent(leadData);

      // Send via SMS or email based on lead preference
      await this.deliverNurtureMessage(leadData, content);

      // Log the communication
      await this.logCommunication(leadData.id, leadData.preferredChannel, content);

      // Schedule next follow-up
      await this.scheduleNextFollowUp(leadData.id);

      const duration = ((Date.now() - start) / 1000).toFixed(2);
      logger.info(`Nurture complete for lead ${leadData.id} in ${duration}s`);
    } catch (err) {
      logger.error('Error in BuyerNurtureSpecialistAgent.nurtureLead:', err);
      throw err;
    }
  }

  /**
   * Generate nurture message content using an AI model.
   * @param {Object} leadData
   * @returns {Promise<string>}
   */
  async generateNurtureContent(leadData) {
    const prompt = `
      You are a real estate nurturing specialist. Craft a friendly, helpful follow-up message for this buyer lead:
      Lead: ${JSON.stringify(leadData)}
      Include:
      - A brief recap of their preferences
      - Relevant market insights
      - A soft call-to-action to continue the conversation
      Respond in 2-3 sentences.
    `;

    const resp = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: this.model,
        max_tokens: 300,
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

    return resp.data.completion || resp.data.content;
  }

  /**
   * Deliver the message via the lead's preferred channel.
   * @param {Object} leadData
   * @param {string} content
   */
  async deliverNurtureMessage(leadData, content) {
    const channel = leadData.preferredChannel || 'email';
    if (channel === 'sms' && leadData.phone) {
      await twilioClient.messages.create({
        body: content,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: leadData.phone
      });
    } else if (leadData.email) {
      await emailService.send({
        to: leadData.email,
        subject: 'Quick Follow-Up',
        text: content
      });
    } else {
      logger.warn(`No valid contact channel for lead ${leadData.id}`);
    }
  }

  /**
   * Log outbound communications for audit.
   * @param {string} leadId
   * @param {string} channel
   * @param {string} message
   */
  async logCommunication(leadId, channel, message) {
    await Lead.logActivity(leadId, `[${channel.toUpperCase()}] ${message}`);
  }

  /**
   * Schedule the next follow-up by creating a job in Redis or scheduling service.
   * @param {string} leadId
   */
  async scheduleNextFollowUp(leadId) {
    const nextAt = Date.now() + this.followUpIntervalHours * 3600 * 1000;
    // Example: use Redis sorted set or job scheduler:
    await require('../../../config/redis').getRedisClient().zAdd(
      'nurture:queue',
      { score: nextAt, value: leadId }
    );
    logger.info(`Scheduled next follow-up for lead ${leadId} at ${new Date(nextAt).toISOString()}`);
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