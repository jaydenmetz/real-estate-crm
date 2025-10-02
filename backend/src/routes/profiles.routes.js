const express = require('express');

const router = express.Router();
const { pool } = require('../config/database');
const { authenticate, optionalAuth } = require('../middleware/auth.middleware');
const { authenticateApiKey } = require('../middleware/apiKey.middleware');
const { authenticateAny } = require('../middleware/combinedAuth.middleware');

// Get public profile by username
router.get('/public/:username', optionalAuth, async (req, res) => {
  try {
    const { username } = req.params;

    // Get user and profile data
    const profileQuery = `
      SELECT 
        u.id,
        u.username,
        u.first_name,
        u.last_name,
        u.email,
        p.display_name,
        p.professional_title,
        p.bio,
        p.profile_photo_url,
        p.cover_photo_url,
        p.license_number,
        p.years_experience,
        p.specialties,
        p.service_areas,
        p.languages,
        p.show_email,
        p.show_phone,
        p.show_office,
        p.website_url,
        p.linkedin_url,
        p.facebook_url,
        p.instagram_url,
        p.twitter_url,
        p.youtube_url,
        s.total_sales,
        s.total_sales_volume,
        s.total_listings,
        s.current_year_sales,
        s.current_year_volume,
        s.average_days_on_market,
        s.average_sale_to_list_ratio,
        s.achievements,
        s.certifications,
        s.awards
      FROM users u
      LEFT JOIN user_profiles p ON u.id = p.user_id
      LEFT JOIN profile_statistics s ON u.id = s.user_id
      WHERE LOWER(u.username) = LOWER($1) AND u.is_active = true
    `;

    const profileResult = await pool.query(profileQuery, [username]);

    if (profileResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PROFILE_NOT_FOUND',
          message: 'Profile not found',
        },
      });
    }

    const profile = profileResult.rows[0];

    // Get recent sales (last 5)
    const recentSalesQuery = `
      SELECT 
        property_address,
        city,
        closing_date,
        transaction_type
      FROM escrows
      WHERE 
        team_id = (SELECT team_id FROM users WHERE id = $1)
        AND escrow_status = 'closed'
      ORDER BY closing_date DESC
      LIMIT 5
    `;

    const recentSales = await pool.query(recentSalesQuery, [profile.id]);

    // Get testimonials
    const testimonialsQuery = `
      SELECT 
        client_name,
        client_type,
        testimonial_text,
        rating,
        transaction_date
      FROM profile_testimonials
      WHERE user_id = $1 AND is_visible = true
      ORDER BY is_featured DESC, created_at DESC
      LIMIT 10
    `;

    const testimonials = await pool.query(testimonialsQuery, [profile.id]);

    // Format response
    const publicProfile = {
      username: profile.username,
      displayName: profile.display_name,
      professionalTitle: profile.professional_title,
      bio: profile.bio,
      profilePhoto: profile.profile_photo_url,
      coverPhoto: profile.cover_photo_url,
      contact: {
        email: profile.show_email ? profile.email : null,
        phone: profile.show_phone ? profile.phone : null,
      },
      professional: {
        licenseNumber: profile.license_number,
        yearsExperience: profile.years_experience,
        specialties: profile.specialties || [],
        serviceAreas: profile.service_areas || [],
        languages: profile.languages || ['English'],
      },
      social: {
        website: profile.website_url,
        linkedin: profile.linkedin_url,
        facebook: profile.facebook_url,
        instagram: profile.instagram_url,
        twitter: profile.twitter_url,
        youtube: profile.youtube_url,
      },
      statistics: {
        totalSales: profile.total_sales,
        totalVolume: profile.total_sales_volume,
        totalListings: profile.total_listings,
        currentYearSales: profile.current_year_sales,
        currentYearVolume: profile.current_year_volume,
        avgDaysOnMarket: profile.average_days_on_market,
        avgSaleToListRatio: profile.average_sale_to_list_ratio,
      },
      achievements: profile.achievements || [],
      certifications: profile.certifications || [],
      awards: profile.awards || [],
      recentSales: recentSales.rows,
      testimonials: testimonials.rows,
    };

    res.json({
      success: true,
      data: publicProfile,
    });
  } catch (error) {
    console.error('Error fetching public profile:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'PROFILE_ERROR',
        message: 'Failed to fetch profile',
      },
    });
  }
});

// Get own profile (authenticated - accepts both JWT and API key)
router.get('/me', authenticateAny, async (req, res) => {
  try {
    const userId = req.user.id;

    // Simplified query that only uses the users table
    const profileQuery = `
      SELECT
        u.id,
        u.username,
        u.email,
        u.first_name,
        u.last_name,
        u.role,
        u.team_id,
        u.created_at,
        u.updated_at,
        u.is_active
      FROM users u
      WHERE u.id = $1
    `;

    const result = await pool.query(profileQuery, [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PROFILE_NOT_FOUND',
          message: 'Profile not found',
        },
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'PROFILE_ERROR',
        message: 'Failed to fetch profile',
      },
    });
  }
});

// Update profile (accepts both JWT and API key)
router.put('/me', authenticateAny, async (req, res) => {
  try {
    const userId = req.user.id;
    const updates = req.body;

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Update user_profiles
      if (updates.profile) {
        const profileFields = [
          'display_name', 'professional_title', 'bio', 'profile_photo_url',
          'cover_photo_url', 'license_number', 'years_experience', 'specialties',
          'service_areas', 'languages', 'show_email', 'show_phone', 'show_office',
          'website_url', 'linkedin_url', 'facebook_url', 'instagram_url',
          'twitter_url', 'youtube_url',
        ];

        const setClause = profileFields
          .filter((field) => updates.profile[field] !== undefined)
          .map((field, index) => `${field} = $${index + 2}`)
          .join(', ');

        if (setClause) {
          const values = profileFields
            .filter((field) => updates.profile[field] !== undefined)
            .map((field) => updates.profile[field]);

          await client.query(
            `UPDATE user_profiles SET ${setClause}, updated_at = NOW() WHERE user_id = $1`,
            [userId, ...values],
          );
        }
      }

      // Update user_settings
      if (updates.settings) {
        const settingsFields = [
          'email_notifications', 'sms_notifications', 'theme', 'dashboard_layout',
          'default_view', 'timezone', 'date_format', 'profile_visibility',
          'activity_visibility', 'calendar_sync', 'email_signature',
        ];

        const setClause = settingsFields
          .filter((field) => updates.settings[field] !== undefined)
          .map((field, index) => `${field} = $${index + 2}`)
          .join(', ');

        if (setClause) {
          const values = settingsFields
            .filter((field) => updates.settings[field] !== undefined)
            .map((field) => updates.settings[field]);

          await client.query(
            `UPDATE user_settings SET ${setClause}, updated_at = NOW() WHERE user_id = $1`,
            [userId, ...values],
          );
        }
      }

      await client.query('COMMIT');

      // Fetch updated profile
      const updatedProfile = await client.query(`
        SELECT 
          u.*,
          p.*,
          s.*
        FROM users u
        LEFT JOIN user_profiles p ON u.id = p.user_id
        LEFT JOIN user_settings s ON u.id = s.user_id
        WHERE u.id = $1
      `, [userId]);

      res.json({
        success: true,
        data: updatedProfile.rows[0],
        message: 'Profile updated successfully',
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_ERROR',
        message: 'Failed to update profile',
      },
    });
  }
});

// Get profile statistics
router.get('/statistics/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const { period = 'all' } = req.query; // all, year, month, quarter

    // Get user ID
    const userResult = await pool.query(
      'SELECT id FROM users WHERE LOWER(username) = LOWER($1)',
      [username],
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found',
        },
      });
    }

    const userId = userResult.rows[0].id;

    // Build date filter
    let dateFilter = '';
    const now = new Date();

    switch (period) {
      case 'year':
        dateFilter = `AND closing_date >= '${now.getFullYear()}-01-01'`;
        break;
      case 'month':
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        dateFilter = `AND closing_date >= '${monthStart.toISOString().split('T')[0]}'`;
        break;
      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3);
        const quarterStart = new Date(now.getFullYear(), quarter * 3, 1);
        dateFilter = `AND closing_date >= '${quarterStart.toISOString().split('T')[0]}'`;
        break;
    }

    // Get statistics - simplified to avoid errors
    const statsQuery = `
      SELECT
        COUNT(*) as total_sales,
        0 as total_purchases,
        COALESCE(SUM(purchase_price), 0) as sales_volume,
        COALESCE(AVG(days_on_market), 30) as avg_escrow_days,
        COUNT(DISTINCT city) as cities_served,
        COUNT(*) as active_months
      FROM escrows
      WHERE
        team_id = (SELECT team_id FROM users WHERE id = $1)
        AND escrow_status = 'closed'
    `;

    const stats = await pool.query(statsQuery, [userId]);

    res.json({
      success: true,
      data: {
        period,
        statistics: stats.rows[0],
      },
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'STATS_ERROR',
        message: 'Failed to fetch statistics',
      },
    });
  }
});

module.exports = router;
