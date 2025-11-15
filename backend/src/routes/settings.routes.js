const express = require('express');

const router = express.Router();
const { pool } = require('../config/infrastructure/database');
const { authenticate } = require('../middleware/auth/auth.middleware');

// Get user settings
router.get('/', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;

    const settingsQuery = `
      SELECT 
        s.*,
        u.email,
        u.username,
        u.first_name,
        u.last_name,
        p.slug,
        p.display_name
      FROM user_settings s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN user_profiles p ON u.id = p.user_id
      WHERE s.user_id = $1
    `;

    const result = await pool.query(settingsQuery, [userId]);

    if (result.rows.length === 0) {
      // Create default settings if they don't exist
      await pool.query(
        'INSERT INTO user_settings (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING',
        [userId],
      );

      const newResult = await pool.query(settingsQuery, [userId]);
      return res.json({
        success: true,
        data: newResult.rows[0],
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SETTINGS_ERROR',
        message: 'Failed to fetch settings',
      },
    });
  }
});

// Update settings
router.put('/', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      emailNotifications,
      smsNotifications,
      theme,
      dashboardLayout,
      defaultView,
      timezone,
      dateFormat,
      profileVisibility,
      activityVisibility,
      calendarSync,
      emailSignature,
    } = req.body;

    const updates = [];
    const values = [userId];
    let paramCount = 1;

    if (emailNotifications !== undefined) {
      paramCount++;
      updates.push(`email_notifications = $${paramCount}`);
      values.push(emailNotifications);
    }

    if (smsNotifications !== undefined) {
      paramCount++;
      updates.push(`sms_notifications = $${paramCount}`);
      values.push(smsNotifications);
    }

    if (theme !== undefined) {
      paramCount++;
      updates.push(`theme = $${paramCount}`);
      values.push(theme);
    }

    if (dashboardLayout !== undefined) {
      paramCount++;
      updates.push(`dashboard_layout = $${paramCount}`);
      values.push(dashboardLayout);
    }

    if (defaultView !== undefined) {
      paramCount++;
      updates.push(`default_view = $${paramCount}`);
      values.push(defaultView);
    }

    if (timezone !== undefined) {
      paramCount++;
      updates.push(`timezone = $${paramCount}`);
      values.push(timezone);
    }

    if (dateFormat !== undefined) {
      paramCount++;
      updates.push(`date_format = $${paramCount}`);
      values.push(dateFormat);
    }

    if (profileVisibility !== undefined) {
      paramCount++;
      updates.push(`profile_visibility = $${paramCount}`);
      values.push(profileVisibility);
    }

    if (activityVisibility !== undefined) {
      paramCount++;
      updates.push(`activity_visibility = $${paramCount}`);
      values.push(activityVisibility);
    }

    if (calendarSync !== undefined) {
      paramCount++;
      updates.push(`calendar_sync = $${paramCount}`);
      values.push(calendarSync);
    }

    if (emailSignature !== undefined) {
      paramCount++;
      updates.push(`email_signature = $${paramCount}`);
      values.push(emailSignature);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NO_UPDATES',
          message: 'No updates provided',
        },
      });
    }

    updates.push('updated_at = NOW()');

    const query = `
      UPDATE user_settings 
      SET ${updates.join(', ')}
      WHERE user_id = $1
      RETURNING *
    `;

    const result = await pool.query(query, values);

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Settings updated successfully',
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_ERROR',
        message: 'Failed to update settings',
      },
    });
  }
});

// Update notification preferences
router.put('/notifications', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { email, sms } = req.body;

    const updates = [];
    const values = [userId];
    let paramCount = 1;

    if (email) {
      paramCount++;
      updates.push(`email_notifications = email_notifications || $${paramCount}::jsonb`);
      values.push(JSON.stringify(email));
    }

    if (sms) {
      paramCount++;
      updates.push(`sms_notifications = sms_notifications || $${paramCount}::jsonb`);
      values.push(JSON.stringify(sms));
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NO_UPDATES',
          message: 'No notification preferences provided',
        },
      });
    }

    const query = `
      UPDATE user_settings 
      SET ${updates.join(', ')}, updated_at = NOW()
      WHERE user_id = $1
      RETURNING email_notifications, sms_notifications
    `;

    const result = await pool.query(query, values);

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Notification preferences updated',
    });
  } catch (error) {
    console.error('Error updating notifications:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_ERROR',
        message: 'Failed to update notification preferences',
      },
    });
  }
});

// Get theme preference
router.get('/theme', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      'SELECT theme FROM user_settings WHERE user_id = $1',
      [userId],
    );

    res.json({
      success: true,
      data: {
        theme: result.rows[0]?.theme || 'light',
      },
    });
  } catch (error) {
    console.error('Error fetching theme:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'THEME_ERROR',
        message: 'Failed to fetch theme',
      },
    });
  }
});

// Quick theme toggle
router.post('/theme/toggle', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(`
      UPDATE user_settings 
      SET theme = CASE 
        WHEN theme = 'light' THEN 'dark'
        WHEN theme = 'dark' THEN 'light'
        ELSE 'light'
      END,
      updated_at = NOW()
      WHERE user_id = $1
      RETURNING theme
    `, [userId]);

    res.json({
      success: true,
      data: {
        theme: result.rows[0].theme,
      },
      message: `Theme switched to ${result.rows[0].theme}`,
    });
  } catch (error) {
    console.error('Error toggling theme:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'THEME_ERROR',
        message: 'Failed to toggle theme',
      },
    });
  }
});

module.exports = router;
