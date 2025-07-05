

// backend/src/services/ai/agents/listingLaunchSpecialist.js

const axios = require('axios');
const logger = require('../../../utils/logger');
const Listing = require('../../../models/Listing');
const twilioClient = require('../../../config/twilio');
const emailService = require('../../../services/email.service');

/**
 * AI Agent: Listing Launch Specialist
 * Coordinates the launch of a new listing:
 * - Crafts marketing copy
 * - Schedules announcements
 * - Notifies team members
 */
class ListingLaunchSpecialistAgent {
  constructor() {
    this.name = 'Listing Launch Specialist';
    this.model = 'claude-3-sonnet-20240307';
    this.enabled = true;
  }

  /**
   * Main entry point: launch a new listing.
   * @param {Object} listingData - Listing record
   */
  async launchListing(listingData) {
    try {
      logger.info(`Launching listing ${listingData.id}`);

      // Generate marketing copy
      const copy = await this.generateMarketingCopy(listingData);

      // Send announcement via email & SMS
      await this.sendAnnouncement(listingData, copy);

      // Log the campaign in database
      await this.logCampaign(listingData.id, copy);

      logger.info(`Listing ${listingData.id} launch complete`);
      return { listingId: listingData.id };
    } catch (err) {
      logger.error('Error in ListingLaunchSpecialistAgent.launchListing:', err);
      throw err;
    }
  }

  /**
   * Generate property description and social copy using AI.
   * @param {Object} listingData
   * @returns {Promise<string>} marketing copy
   */
  async generateMarketingCopy(listingData) {
    const prompt = `
      You are a real estate marketing specialist. Given this listing data:
      ${JSON.stringify(listingData)}

      Write:
      1. A catchy headline (max 10 words).
      2. A 2-sentence property description.
      3. A 1-sentence social media teaser.
      Return as JSON:
      {
        "headline": "...",
        "description": "...",
        "teaser": "..."
      }
    `;

    const resp = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: this.model,
        max_tokens: 400,
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

    const content = resp.data.completion || resp.data.content;
    try {
      return JSON.parse(content);
    } catch (e) {
      logger.error('Failed to parse marketing copy JSON:', e);
      throw new Error('Invalid AI response for marketing copy');
    }
  }

  /**
   * Send out notifications: email to list, SMS to agent.
   * @param {Object} listingData
   * @param {Object} copy
   */
  async sendAnnouncement(listingData, copy) {
    const { headline, description, teaser } = copy;
    const emailBody = `
      <h1>${headline}</h1>
      <p>${description}</p>
      <p><i>${teaser}</i></p>
      <p>Learn more: ${process.env.FRONTEND_URL}/listings/${listingData.id}</p>
    `;

    // Send email to subscribers
    await emailService.send({
      subject: `Just Listed: ${headline}`,
      html: emailBody
    });

    // Send SMS to listing agent
    if (listingData.agentId) {
      const agent = await Listing.findById(listingData.id);
      if (agent && agent.agentPhone) {
        await twilioClient.messages.create({
          body: `New listing live: ${headline}. View at ${process.env.FRONTEND_URL}/listings/${listingData.id}`,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: agent.agentPhone
        });
      }
    }
  }

  /**
   * Log the campaign details in a table.
   * @param {string} listingId
   * @param {Object} copy
   */
  async logCampaign(listingId, copy) {
    const insertSql = `
      INSERT INTO listing_campaigns (id, listing_id, headline, description, teaser, created_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
    `;
    const campaignId = `cmp_${Math.random().toString(36).substr(2, 9)}`;
    await require('../../../config/database').query(insertSql, [
      campaignId,
      listingId,
      copy.headline,
      copy.description,
      copy.teaser
    ]);
    logger.info(`Logged listing campaign ${campaignId} for listing ${listingId}`);
  }

  isEnabled() {
    return this.enabled;
  }

  setEnabled(enabled) {
    this.enabled = enabled;
    logger.info(`${this.name} ${enabled ? 'enabled' : 'disabled'}`);
  }
}

module.exports = new ListingLaunchSpecialistAgent();