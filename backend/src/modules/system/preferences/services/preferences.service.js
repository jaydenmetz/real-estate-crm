const db = require('../../../../config/database');

class PreferencesService {
  /**
   * Get a specific preference for a user
   * @param {string} userId - User UUID
   * @param {string} key - Preference key (e.g., "escrows.viewMode")
   * @returns {Promise<Object|null>} Preference value or null if not found
   */
  async getPreference(userId, key) {
    const result = await db.query(
      `SELECT preference_value
       FROM user_preferences
       WHERE user_id = $1 AND preference_key = $2`,
      [userId, key]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0].preference_value;
  }

  /**
   * Get all preferences for a user
   * @param {string} userId - User UUID
   * @returns {Promise<Object>} Object with all preferences { "escrows.viewMode": {...}, ... }
   */
  async getAllPreferences(userId) {
    const result = await db.query(
      `SELECT preference_key, preference_value
       FROM user_preferences
       WHERE user_id = $1
       ORDER BY preference_key`,
      [userId]
    );

    // Convert array to object for easier access
    const preferences = {};
    result.rows.forEach(row => {
      preferences[row.preference_key] = row.preference_value;
    });

    return preferences;
  }

  /**
   * Set a preference for a user (upsert)
   * @param {string} userId - User UUID
   * @param {string} key - Preference key
   * @param {Object} value - Preference value (will be stored as JSONB)
   * @returns {Promise<Object>} Updated preference
   */
  async setPreference(userId, key, value) {
    const result = await db.query(
      `INSERT INTO user_preferences (user_id, preference_key, preference_value)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, preference_key)
       DO UPDATE SET
         preference_value = EXCLUDED.preference_value,
         updated_at = now()
       RETURNING *`,
      [userId, key, JSON.stringify(value)]
    );

    return result.rows[0];
  }

  /**
   * Delete a preference
   * @param {string} userId - User UUID
   * @param {string} key - Preference key
   * @returns {Promise<boolean>} True if deleted
   */
  async deletePreference(userId, key) {
    const result = await db.query(
      `DELETE FROM user_preferences
       WHERE user_id = $1 AND preference_key = $2`,
      [userId, key]
    );

    return result.rowCount > 0;
  }

  /**
   * Bulk set multiple preferences
   * @param {string} userId - User UUID
   * @param {Object} preferences - Object with key-value pairs
   * @returns {Promise<Array>} Array of updated preferences
   */
  async setPreferences(userId, preferences) {
    const updates = [];

    for (const [key, value] of Object.entries(preferences)) {
      const updated = await this.setPreference(userId, key, value);
      updates.push(updated);
    }

    return updates;
  }
}

module.exports = new PreferencesService();
