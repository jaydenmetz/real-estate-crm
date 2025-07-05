

// backend/src/models/AIAgent.js

const { query } = require('../config/database');

/**
 * Model for AI Agent configurations.
 * Represents rows in the ai_agents table.
 */
class AIAgent {
  /**
   * Fetch all AI agents.
   * @returns {Promise<Array>} List of agent objects.
   */
  static async findAll() {
    const sql = `
      SELECT
        id,
        name,
        role,
        department,
        enabled,
        last_run      AS "lastRun",
        config        AS "config"
      FROM ai_agents
      ORDER BY name ASC
    `;
    const { rows } = await query(sql);
    return rows;
  }

  /**
   * Fetch a single agent by ID.
   * @param {string} id
   * @returns {Promise<Object|null>}
   */
  static async findById(id) {
    const sql = `
      SELECT
        id,
        name,
        role,
        department,
        enabled,
        last_run      AS "lastRun",
        config        AS "config"
      FROM ai_agents
      WHERE id = $1
    `;
    const { rows } = await query(sql, [id]);
    return rows[0] || null;
  }

  /**
   * Update the enabled status of an agent.
   * @param {string} id
   * @param {boolean} enabled
   * @returns {Promise<Object>} Updated agent object.
   */
  static async updateStatus(id, enabled) {
    const sql = `
      UPDATE ai_agents
         SET enabled = $2,
             last_run = NOW()
       WHERE id = $1
       RETURNING
         id,
         name,
         role,
         department,
         enabled,
         last_run      AS "lastRun",
         config        AS "config"
    `;
    const { rows } = await query(sql, [id, enabled]);
    return rows[0];
  }

  /**
   * Save or update an agent configuration.
   * If id is provided, updates existing; otherwise creates a new row.
   * @param {Object} agentData
   * @returns {Promise<Object>} Created or updated agent.
   */
  static async upsert(agentData) {
    if (agentData.id) {
      // update existing
      const fields = [];
      const values = [];
      let idx = 2;
      if (agentData.name !== undefined) {
        fields.push(`name = $${idx++}`);
        values.push(agentData.name);
      }
      if (agentData.role !== undefined) {
        fields.push(`role = $${idx++}`);
        values.push(agentData.role);
      }
      if (agentData.department !== undefined) {
        fields.push(`department = $${idx++}`);
        values.push(agentData.department);
      }
      if (agentData.enabled !== undefined) {
        fields.push(`enabled = $${idx++}`);
        values.push(agentData.enabled);
      }
      if (agentData.config !== undefined) {
        fields.push(`config = $${idx++}`);
        values.push(agentData.config);
      }
      const sql = `
        UPDATE ai_agents
           SET ${fields.join(', ')}, last_run = NOW()
         WHERE id = $1
         RETURNING *
      `;
      const { rows } = await query(sql, [agentData.id, ...values]);
      return rows[0];
    } else {
      // insert new
      const sql = `
        INSERT INTO ai_agents (name, role, department, enabled, config, last_run)
        VALUES ($1, $2, $3, $4, $5, NOW())
        RETURNING *
      `;
      const { rows } = await query(sql, [
        agentData.name,
        agentData.role,
        agentData.department,
        agentData.enabled ?? true,
        agentData.config ?? {}
      ]);
      return rows[0];
    }
  }
}

module.exports = AIAgent;