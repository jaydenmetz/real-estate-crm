const preferencesService = require('../services/preferences.service');

class PreferencesController {
  /**
   * GET /api/v1/preferences
   * Get all preferences for current user
   */
  async getAllPreferences(req, res) {
    try {
      const userId = req.user.id;
      const preferences = await preferencesService.getAllPreferences(userId);

      res.json({
        success: true,
        data: preferences,
      });
    } catch (error) {
      console.error('Error fetching preferences:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch preferences',
      });
    }
  }

  /**
   * GET /api/v1/preferences/:key
   * Get a specific preference
   */
  async getPreference(req, res) {
    try {
      const userId = req.user.id;
      const { key } = req.params;

      const value = await preferencesService.getPreference(userId, key);

      if (value === null) {
        return res.status(404).json({
          success: false,
          message: `Preference '${key}' not found`,
        });
      }

      res.json({
        success: true,
        data: value,
      });
    } catch (error) {
      console.error('Error fetching preference:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch preference',
      });
    }
  }

  /**
   * PUT /api/v1/preferences/:key
   * Set a specific preference
   * Body: { value: {...} }
   */
  async setPreference(req, res) {
    try {
      const userId = req.user.id;
      const { key } = req.params;
      const { value } = req.body;

      if (value === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Request body must include "value" field',
        });
      }

      const updated = await preferencesService.setPreference(userId, key, value);

      res.json({
        success: true,
        data: updated,
      });
    } catch (error) {
      console.error('Error setting preference:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to set preference',
      });
    }
  }

  /**
   * POST /api/v1/preferences/bulk
   * Set multiple preferences at once
   * Body: { preferences: { "escrows.viewMode": {...}, "leads.sortBy": {...} } }
   */
  async setPreferences(req, res) {
    try {
      const userId = req.user.id;
      const { preferences } = req.body;

      if (!preferences || typeof preferences !== 'object') {
        return res.status(400).json({
          success: false,
          message: 'Request body must include "preferences" object',
        });
      }

      const updated = await preferencesService.setPreferences(userId, preferences);

      res.json({
        success: true,
        data: updated,
      });
    } catch (error) {
      console.error('Error setting preferences:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to set preferences',
      });
    }
  }

  /**
   * DELETE /api/v1/preferences/:key
   * Delete a specific preference
   */
  async deletePreference(req, res) {
    try {
      const userId = req.user.id;
      const { key } = req.params;

      const deleted = await preferencesService.deletePreference(userId, key);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: `Preference '${key}' not found`,
        });
      }

      res.json({
        success: true,
        message: 'Preference deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting preference:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete preference',
      });
    }
  }
}

module.exports = new PreferencesController();
