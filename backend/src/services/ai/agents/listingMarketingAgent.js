

// backend/src/services/ai/agents/listingMarketingAgent.js

const axios = require('axios');
const logger = require('../../../utils/logger');
const Listing = require('../../../models/Listing');
const emailService = require('../../../services/email.service');
const twilioClient = require('../../../config/twilio');
const { v4: uuidv4 } = require('uuid');

/**
 * AI Agent: Listing Marketing Agent
 * Crafts tailored marketing campaigns for new and existing listings:
 * - Audience segmentation
 * - Campaign plan and copy
 * - Schedules and dispatches messages
 */
class ListingMarketingAgent {
  constructor() {
    this.name = 'Listing Marketing Agent';
    this.model = 'claude-3-sonnet-20240307';
    this.enabled = true;
  }

  /**
   * Entry point: create and launch marketing campaign for a listing.
   * @param {Object} listingData - The listing record
   */
  async marketListing(listingData) {
    try {
      logger.info(`Starting marketing for listing ${listingData.id}`);

      // 1. Analyze audience segments
      const audience = await this.segmentAudience(listingData);

      // 2. Generate campaign plan
      const plan = await this.generateCampaignPlan(listingData, audience);

      // 3. Execute campaign
      await this.executeCampaign(listingData, plan);

      // 4. Log campaign details
      await this.logCampaign(listingData.id, plan);

      logger.info(`Marketing campaign completed for listing ${listingData.id}`);
      return { listingId: listingData.id, campaignId: plan.campaignId };
    } catch (err) {
      logger.error('Error in ListingMarketingAgent.marketListing:', err);
      throw err;
    }
  }

  /**
   * Use AI to segment the audience for this listing.
   * @param {Object} listingData
   * @returns {Promise<Array>} array of segment descriptors
   */
  async segmentAudience(listingData) {
    const prompt = `
      You are a real estate marketing specialist. Given this listing:
      ${JSON.stringify(listingData)}

      Identify 3 priority audience segments (e.g., first-time homebuyers, investors, relocating families),
      and return as JSON array of { name: string, criteria: string }.
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
    try {
      return JSON.parse(resp.data.completion || resp.data.content);
    } catch (e) {
      logger.error('Failed to parse audience segments:', e);
      return [];
    }
  }

  /**
   * Generate a detailed campaign plan including channels, schedule, and copy.
   * @param {Object} listingData
   * @param {Array} audience
   * @returns {Promise<Object>} campaign plan
   */
  async generateCampaignPlan(listingData, audience) {
    const prompt = `
      Create a 3-step marketing campaign plan for this listing:
      Listing: ${JSON.stringify(listingData)}
      Audience segments: ${JSON.stringify(audience)}

      For each step include: channel (email, SMS, social), timing (relative), and message copy.
      Return as JSON:
      {
        "campaignId": "<unique id>",
        "steps": [
          { "channel": "...", "when": "...", "copy": "..." },
          ...
        ]
      }
    `;
    const resp = await axios.post(
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
    try {
      const plan = JSON.parse(resp.data.completion || resp.data.content);
      plan.campaignId = plan.campaignId || `cmp_${uuidv4().replace(/-/g, '').substr(0,8)}`;
      return plan;
    } catch (e) {
      logger.error('Failed to parse campaign plan:', e);
      return { campaignId: `cmp_${uuidv4().replace(/-/g, '').substr(0,8)}`, steps: [] };
    }
  }

  /**
   * Execute the campaign by sending messages via the specified channels.
   * @param {Object} listingData
   * @param {Object} plan
   */
  async executeCampaign(listingData, plan) {
    for (const step of plan.steps || []) {
      const { channel, copy, when } = step;
      const url = `${process.env.FRONTEND_URL}/listings/${listingData.id}`;
      const message = `${copy}\nLearn more: ${url}`;

      if (channel === 'email') {
        await emailService.send({
          subject: `Listing Update: ${listingData.address}`,
          html: `<p>${copy}</p><p><a href="${url}">View Listing</a></p>`
        });
      } else if (channel === 'sms' && listingData.agentPhone && twilioClient) {
        try {
          await twilioClient.messages.create({
            body: message,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: listingData.agentPhone
          });
        } catch (error) {
          console.error('Failed to send SMS:', error.message);
        }
      } else if (channel === 'social') {
        // placeholder: integrate with social media API
        logger.info(`Social post scheduled: ${copy}`);
      }
      // Optionally schedule based on 'when' if needed
      logger.info(`Executed campaign step: ${channel} - ${copy}`);
    }
  }

  /**
   * Log campaign metadata for audit.
   * @param {string} listingId
   * @param {Object} plan
   */
  async logCampaign(listingId, plan) {
    const insertSql = `
      INSERT INTO listing_campaigns
        (id, listing_id, plan, created_at)
      VALUES ($1, $2, $3, NOW())
    `;
    const params = [plan.campaignId, listingId, JSON.stringify(plan.steps)];
    await require('../../../config/database').query(insertSql, params);
    logger.info(`Logged marketing campaign ${plan.campaignId} for listing ${listingId}`);
  }

  isEnabled() {
    return this.enabled;
  }

  setEnabled(enabled) {
    this.enabled = enabled;
    logger.info(`${this.name} ${enabled ? 'enabled' : 'disabled'}`);
  }
}

module.exports = new ListingMarketingAgent();