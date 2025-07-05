

// backend/src/services/ai/agents/financialAnalyst.js

const axios = require('axios');
const logger = require('../../../utils/logger');
const { query } = require('../../../config/database');
const { v4: uuidv4 } = require('uuid');

/**
 * AI Agent: Financial Analyst
 * Provides financial insights on listings and escrows:
 * calculates ROI, commission projections, cash flow, and budget adherence.
 */
class FinancialAnalystAgent {
  constructor() {
    this.name = 'Financial Analyst';
    this.model = 'claude-3-sonnet-20240307';
    this.enabled = true;
    this.responseTimeTarget = 10; // minutes
  }

  /**
   * Entry point: generate a financial report for a given deal.
   * @param {Object} dealData - escrow or listing record with relevant fields
   * @returns {Promise<Object>} report with summary and recommendations
   */
  async analyzeDeal(dealData) {
    const start = Date.now();
    try {
      logger.info(`Financial analysis started for deal ${dealData.id}`);

      // Generate AI-driven financial report
      const report = await this.generateFinancialReport(dealData);

      // Persist recommendations
      if (Array.isArray(report.recommendations) && report.recommendations.length) {
        await this.logRecommendations(dealData.id, report.recommendations);
      }

      const duration = ((Date.now() - start) / 1000 / 60).toFixed(2);
      logger.info(`Financial analysis completed for deal ${dealData.id} in ${duration} minutes`);

      return { dealId: dealData.id, summary: report.summary, recommendations: report.recommendations };
    } catch (err) {
      logger.error('Error in FinancialAnalystAgent.analyzeDeal:', err);
      throw err;
    }
  }

  /**
   * Generate a financial report using an AI model.
   * @param {Object} dealData
   * @returns {Promise<{ summary: string, recommendations: string[] }>}
   */
  async generateFinancialReport(dealData) {
    const prompt = `
      You are a real estate financial analyst. Given the following deal data:
      ${JSON.stringify(dealData)}

      Calculate key metrics: ROI, gross and net commissions, cash flow requirements, and budget variance.
      Provide actionable recommendations to improve profitability or manage cash flow.
      Respond with a JSON object:
      {
        "summary": "Brief summary of financial health",
        "recommendations": ["...]"
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
      return JSON.parse(resp.data.completion || resp.data.content);
    } catch (parseErr) {
      logger.error('Failed to parse financial report:', parseErr);
      return { summary: 'Could not parse AI response', recommendations: [] };
    }
  }

  /**
   * Persist AI-generated financial recommendations to the database.
   * @param {string} dealId
   * @param {string[]} recommendations
   */
  async logRecommendations(dealId, recommendations) {
    const insertSql = `
      INSERT INTO financial_recommendations
        (id, deal_id, recommendation, created_at)
      VALUES
        ${recommendations.map((_, i) => `($1, $${i + 2}, $${i + 2}, NOW())`).join(',')}
    `;
    const params = [uuidv4(), ...recommendations];
    await query(insertSql, params);
    logger.info(`Logged ${recommendations.length} financial recommendations for deal ${dealId}`);
  }

  isEnabled() {
    return this.enabled;
  }

  setEnabled(enabled) {
    this.enabled = enabled;
    logger.info(`${this.name} ${enabled ? 'enabled' : 'disabled'}`);
  }
}

module.exports = new FinancialAnalystAgent();