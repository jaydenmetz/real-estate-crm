

// backend/src/services/ai/agents/complianceOfficer.js

const axios = require('axios');
const logger = require('../../../utils/logger');
const { query } = require('../../../config/database');

/**
 * AI Agent: Compliance Officer
 * Reviews escrow and transaction data for compliance issues.
 */
class ComplianceOfficerAgent {
  constructor() {
    this.name = 'Compliance Officer';
    this.model = 'claude-3-sonnet-20240307';
    this.enabled = true;
    this.responseTimeTarget = 10; // minutes
  }

  /**
   * Entry point: analyze an escrow transaction for compliance.
   * @param {Object} escrowData - Escrow record with related buyers, sellers, and checklist.
   * @returns {Promise<Object>} compliance report
   */
  async reviewEscrow(escrowData) {
    const start = Date.now();
    try {
      logger.info(`Compliance review started for escrow ${escrowData.id}`);

      // Generate compliance summary
      const report = await this.generateComplianceReport(escrowData);

      // Persist any compliance issues
      if (report.issues && report.issues.length) {
        await this.logComplianceIssues(escrowData.id, report.issues);
      }

      const duration = ((Date.now() - start) / 1000 / 60).toFixed(2);
      logger.info(`Compliance review completed for escrow ${escrowData.id} in ${duration} minutes`);

      return { escrowId: escrowData.id, issues: report.issues, summary: report.summary };
    } catch (err) {
      logger.error('Error in ComplianceOfficerAgent.reviewEscrow:', err);
      throw err;
    }
  }

  /**
   * Generate a compliance report using an AI model.
   * @param {Object} escrowData
   * @returns {Promise<{ summary: string, issues: Array<string> }>}
   */
  async generateComplianceReport(escrowData) {
    const prompt = `
      You are a real estate compliance officer. Review the following escrow transaction data for compliance:
      ${JSON.stringify(escrowData)}

      Identify any missing documentation, deadline risks, or policy violations. 
      Respond with a JSON object:
      {
        "summary": "Brief summary of compliance status",
        "issues": ["List of individual issues, or empty array"]
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
      logger.error('Failed to parse compliance report:', parseErr);
      return { summary: 'Unable to parse AI response', issues: [] };
    }
  }

  /**
   * Persist compliance issues to the database.
   * @param {string} escrowId
   * @param {Array<string>} issues
   */
  async logComplianceIssues(escrowId, issues) {
    const sql = `
      INSERT INTO compliance_issues (escrow_id, issue, detected_at)
      VALUES ${issues.map((_, idx) => `( $1, $${idx + 2}, NOW() )`).join(',')}
    `;
    await query(sql, [escrowId, ...issues]);
    logger.info(`Logged ${issues.length} compliance issues for escrow ${escrowId}`);
  }

  /**
   * Enable or disable this agent.
   */
  isEnabled() {
    return this.enabled;
  }

  setEnabled(enabled) {
    this.enabled = enabled;
    logger.info(`${this.name} ${enabled ? 'enabled' : 'disabled'}`);
  }
}

module.exports = new ComplianceOfficerAgent();