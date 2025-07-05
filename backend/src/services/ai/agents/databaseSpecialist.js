

// backend/src/services/ai/agents/databaseSpecialist.js

const axios = require('axios');
const logger = require('../../../utils/logger');
const { query } = require('../../../config/database');
const { v4: uuidv4 } = require('uuid');

/**
 * AI Agent: Database Specialist
 * Analyzes database health, usage, and schema,
 * then generates optimization and maintenance recommendations.
 */
class DatabaseSpecialistAgent {
  constructor() {
    this.name = 'Database Specialist';
    this.model = 'claude-3-sonnet-20240307';
    this.enabled = true;
    // target maximum processing time in minutes
    this.responseTimeTarget = 15;
  }

  /**
   * Entry point: perform a full database analysis.
   * @returns {Promise<Object>} report with summary and recommendations
   */
  async analyzeDatabase() {
    const start = Date.now();
    try {
      logger.info('Starting database analysis');

      // Collect schema and usage info
      const info = await this.getSchemaUsageInfo();

      // Generate AI-driven recommendations
      const report = await this.generateReport(info);

      // Persist recommendations
      if (Array.isArray(report.recommendations) && report.recommendations.length) {
        await this.logRecommendations(report.recommendations);
      }

      const duration = ((Date.now() - start) / 1000 / 60).toFixed(2);
      logger.info(`Database analysis completed in ${duration} minutes`);

      return { summary: report.summary, recommendations: report.recommendations };
    } catch (err) {
      logger.error('Error in DatabaseSpecialistAgent.analyzeDatabase:', err);
      throw err;
    }
  }

  /**
   * Query Postgres system catalogs for table and index stats.
   * @returns {Promise<Object>}
   */
  async getSchemaUsageInfo() {
    const tableStats = await query(`
      SELECT
        schemaname,
        relname AS table_name,
        seq_scan,
        idx_scan,
        n_live_tup AS live_rows,
        n_dead_tup AS dead_rows
      FROM pg_stat_user_tables;
    `);
    const indexStats = await query(`
      SELECT
        schemaname,
        relname AS table_name,
        indexrelname AS index_name,
        idx_scan
      FROM pg_stat_all_indexes;
    `);
    return {
      tables: tableStats.rows,
      indexes: indexStats.rows
    };
  }

  /**
   * Generate a compliance report using an AI model.
   * @param {Object} info
   * @returns {Promise<{ summary: string, recommendations: string[] }>}
   */
  async generateReport(info) {
    const prompt = `
      You are a database specialist. Analyze the following Postgres stats for tables and indexes:
      ${JSON.stringify(info)}

      Identify:
      - Tables with high dead row counts
      - Missing or underused indexes
      - Suggestions for VACUUM or REINDEX operations
      - Any schema design improvements
      Respond with a JSON object:
      {
        "summary": "Brief overview",
        "recommendations": ["List of actionable recommendations"]
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
      logger.error('Failed to parse AI response for database report:', parseErr);
      return { summary: 'Could not parse AI response', recommendations: [] };
    }
  }

  /**
   * Persist AI-generated recommendations to the database.
   * @param {string[]} recommendations
   */
  async logRecommendations(recommendations) {
    const insertSql = `
      INSERT INTO database_recommendations
        (id, agent, recommendation, created_at)
      VALUES
        ${recommendations.map((_, i) => `($1, $${i + 2}, $${i + 2}, NOW())`).join(',')}
    `;
    const params = [uuidv4(), ...recommendations];
    await query(insertSql, params);
    logger.info(`Logged ${recommendations.length} database recommendations`);
  }

  isEnabled() {
    return this.enabled;
  }

  setEnabled(enabled) {
    this.enabled = enabled;
    logger.info(`${this.name} ${enabled ? 'enabled' : 'disabled'}`);
  }
}

module.exports = new DatabaseSpecialistAgent();