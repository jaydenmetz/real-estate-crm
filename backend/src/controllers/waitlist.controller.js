const { pool } = require('../config/database');

/**
 * Waitlist Controller
 *
 * Handles registration requests when public registration is closed.
 * Stores user information for future account creation.
 */
class WaitlistController {
  /**
   * Add user to waitlist
   * POST /api/v1/waitlist
   */
  static async addToWaitlist(req, res) {
    const client = await pool.connect();

    try {
      const {
        email,
        username,
        firstName,
        lastName,
        phone,
        companyName,
        companySize,
        interestedFeatures,
        howHeardAboutUs,
        referralSource,
        message
      } = req.body;

      // Validate required fields
      if (!email || !username || !firstName || !lastName) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_FIELDS',
            message: 'Email, username, first name, and last name are required'
          }
        });
      }

      // Convert to lowercase
      const emailLower = email.toLowerCase();
      const usernameLower = username.toLowerCase();

      // Check if already on waitlist
      const existing = await client.query(
        'SELECT id, email, status FROM waitlist WHERE LOWER(email) = $1 OR LOWER(username) = $2',
        [emailLower, usernameLower]
      );

      if (existing.rows.length > 0) {
        const entry = existing.rows[0];

        if (entry.status === 'converted') {
          return res.status(400).json({
            success: false,
            error: {
              code: 'ALREADY_REGISTERED',
              message: 'An account with this email or username already exists'
            }
          });
        }

        return res.status(400).json({
          success: false,
          error: {
            code: 'ALREADY_ON_WAITLIST',
            message: 'You are already on our waitlist. We will contact you soon!'
          }
        });
      }

      // Check if user exists (belt and suspenders)
      const userExists = await client.query(
        'SELECT id FROM users WHERE LOWER(email) = $1 OR LOWER(username) = $2',
        [emailLower, usernameLower]
      );

      if (userExists.rows.length > 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'USER_EXISTS',
            message: 'An account with this email or username already exists'
          }
        });
      }

      // Capture request metadata
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.get('user-agent');

      // Insert into waitlist
      const insertQuery = `
        INSERT INTO waitlist (
          email, username, first_name, last_name, phone,
          company_name, company_size, interested_features,
          how_heard_about_us, referral_source, message,
          ip_address, user_agent, status, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5,
          $6, $7, $8,
          $9, $10, $11,
          $12, $13, 'pending', NOW(), NOW()
        )
        RETURNING id, email, first_name, last_name, created_at
      `;

      const result = await client.query(insertQuery, [
        emailLower,
        usernameLower,
        firstName,
        lastName,
        phone || null,
        companyName || null,
        companySize || null,
        interestedFeatures || null,
        howHeardAboutUs || null,
        referralSource || null,
        message || null,
        ipAddress,
        userAgent
      ]);

      const waitlistEntry = result.rows[0];

      // TODO: Send confirmation email
      // await EmailService.sendWaitlistConfirmation(waitlistEntry);

      res.status(201).json({
        success: true,
        message: 'Thank you for your interest! We will notify you when registration opens.',
        data: {
          id: waitlistEntry.id,
          email: waitlistEntry.email,
          firstName: waitlistEntry.first_name,
          lastName: waitlistEntry.last_name,
          createdAt: waitlistEntry.created_at
        }
      });

    } catch (error) {
      console.error('Waitlist registration error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'WAITLIST_ERROR',
          message: 'Failed to join waitlist. Please try again later.'
        }
      });
    } finally {
      client.release();
    }
  }

  /**
   * Check username availability for waitlist
   * GET /api/v1/waitlist/check-username/:username
   */
  static async checkUsername(req, res) {
    try {
      const { username } = req.params;
      const usernameLower = username.toLowerCase();

      // Check both waitlist and users table
      const [waitlistCheck, userCheck] = await Promise.all([
        pool.query('SELECT id FROM waitlist WHERE LOWER(username) = $1', [usernameLower]),
        pool.query('SELECT id FROM users WHERE LOWER(username) = $1', [usernameLower])
      ]);

      const available = waitlistCheck.rows.length === 0 && userCheck.rows.length === 0;

      res.json({
        success: true,
        data: {
          username,
          available
        }
      });

    } catch (error) {
      console.error('Username check error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'CHECK_ERROR',
          message: 'Failed to check username availability'
        }
      });
    }
  }

  /**
   * Admin: Get waitlist entries
   * GET /api/v1/waitlist/admin
   */
  static async getWaitlist(req, res) {
    try {
      const { status, limit = 100, offset = 0 } = req.query;

      let query = `
        SELECT
          id, email, username, first_name, last_name, phone,
          company_name, company_size, how_heard_about_us,
          status, priority, created_at
        FROM waitlist
      `;

      const params = [];
      if (status) {
        params.push(status);
        query += ` WHERE status = $${params.length}`;
      }

      query += ` ORDER BY priority DESC, created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      params.push(limit, offset);

      const result = await pool.query(query, params);

      res.json({
        success: true,
        data: result.rows,
        meta: {
          total: result.rows.length,
          limit: parseInt(limit),
          offset: parseInt(offset)
        }
      });

    } catch (error) {
      console.error('Get waitlist error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: 'Failed to fetch waitlist'
        }
      });
    }
  }
}

module.exports = WaitlistController;
