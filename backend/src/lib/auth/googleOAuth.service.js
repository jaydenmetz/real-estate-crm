const { OAuth2Client } = require('google-auth-library');
const { pool } = require('../../config/infrastructure/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const OnboardingService = require('../../modules/system/onboarding/services/onboarding.service');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const jwtSecret = process.env.JWT_SECRET;
const jwtAccessExpiry = process.env.JWT_ACCESS_TOKEN_EXPIRY || '15m';

class GoogleOAuthService {
  /**
   * Verify Google ID token and return user information
   */
  static async verifyGoogleToken(idToken) {
    try {
      const ticket = await client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();

      return {
        email: payload.email,
        emailVerified: payload.email_verified,
        firstName: payload.given_name,
        lastName: payload.family_name,
        picture: payload.picture,
        googleId: payload.sub,
      };
    } catch (error) {
      throw new Error(`Invalid Google token: ${error.message}`);
    }
  }

  /**
   * Sign in or register user with Google OAuth
   */
  static async signInWithGoogle(idToken) {
    const dbClient = await pool.connect();

    try {
      await dbClient.query('BEGIN');

      // Verify the Google token
      const googleUser = await this.verifyGoogleToken(idToken);

      if (!googleUser.emailVerified) {
        throw new Error('Email not verified with Google');
      }

      // Check if user exists
      let user = await dbClient.query(
        'SELECT id, email, username, first_name, last_name, role, is_active, google_id FROM users WHERE email = $1',
        [googleUser.email.toLowerCase()],
      );

      if (user.rows.length === 0) {
        // Create new user (Google OAuth registration)
        const randomPassword = await bcrypt.hash(Math.random().toString(36), 10);

        // Use email as username for Google OAuth users (lowercase)
        const username = googleUser.email.toLowerCase();

        const createUserQuery = `
          INSERT INTO users (
            email, username, password_hash, first_name, last_name, role,
            google_id, profile_picture_url, is_active, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, NOW(), NOW())
          RETURNING id, email, username, first_name, last_name, role, is_active, google_id, profile_picture_url
        `;

        user = await dbClient.query(createUserQuery, [
          googleUser.email.toLowerCase(),
          username, // Username = email for Google OAuth users
          randomPassword, // Random password (user won't use it)
          googleUser.firstName,
          googleUser.lastName,
          'agent', // Default role
          googleUser.googleId,
          googleUser.picture,
        ]);

        await dbClient.query('COMMIT');

        // Generate sample data and initialize onboarding (async, don't block response)
        OnboardingService.generateSampleData(user.rows[0].id).catch((err) => {
          console.error('Failed to generate sample data:', err);
        });

        OnboardingService.initializeProgress(user.rows[0].id).catch((err) => {
          console.error('Failed to initialize onboarding:', err);
        });
      } else {
        // Update existing user with Google ID if not set
        if (!user.rows[0].google_id) {
          await dbClient.query(
            'UPDATE users SET google_id = $1, profile_picture_url = $2, updated_at = NOW() WHERE id = $3',
            [googleUser.googleId, googleUser.picture, user.rows[0].id],
          );
          user.rows[0].google_id = googleUser.googleId;
          user.rows[0].profile_picture_url = googleUser.picture;
        }

        await dbClient.query('COMMIT');
      }

      const userData = user.rows[0];

      // Generate JWT token
      const token = jwt.sign(
        {
          id: userData.id,
          email: userData.email,
          role: userData.role,
        },
        jwtSecret,
        { expiresIn: jwtAccessExpiry },
      );

      return {
        success: true,
        token,
        user: {
          id: userData.id,
          email: userData.email,
          username: userData.username,
          firstName: userData.first_name,
          lastName: userData.last_name,
          role: userData.role,
          googleId: userData.google_id,
          profilePictureUrl: userData.profile_picture_url,
        },
      };
    } catch (error) {
      await dbClient.query('ROLLBACK');
      throw error;
    } finally {
      dbClient.release();
    }
  }
}

module.exports = GoogleOAuthService;
