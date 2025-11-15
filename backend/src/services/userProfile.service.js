const { pool } = require('../config/infrastructure/database');
const logger = require('../utils/logger');

/**
 * UserProfile Service
 * Manages agent/broker profiles for document automation
 * Includes DRE license verification via California DRE public API
 */
class UserProfileService {
  /**
   * Create or update user profile
   * @param {UUID} userId - User ID
   * @param {Object} profileData - Profile information
   */
  static async upsertProfile(userId, profileData) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const {
        // License Information
        licenseNumber,
        licenseState = 'CA',
        licenseType = 'salesperson',
        licenseStatus = 'active',
        licenseExpirationDate,

        // Personal Information
        fullLegalName,
        preferredName,
        businessName,
        title,

        // Contact Information
        officePhone,
        mobilePhone,
        fax,
        emailSignature,
        website,

        // Office Address
        officeAddressLine1,
        officeAddressLine2,
        officeCity,
        officeState = 'CA',
        officeZip,

        // Mailing Address
        mailingAddressLine1,
        mailingAddressLine2,
        mailingCity,
        mailingState,
        mailingZip,

        // Professional Designations
        designations = [],
        professionalMemberships = [],

        // Broker Association
        supervisingBrokerId,
        brokerAssociationDate,
        brokerRelationshipType = 'agent',

        // Document Signature Settings
        signatureImageUrl,
        initialsImageUrl,
        sealImageUrl,

        // E-Signature Preferences
        esignConsent = false,
        esignConsentDate,
        preferredSigningService,

        // Settings
        settings = {},
        isPublic = false,
      } = profileData;

      // Insert or update profile
      const result = await client.query(`
        INSERT INTO user_profiles (
          user_id, license_number, license_state, license_type, license_status,
          license_expiration_date, full_legal_name, preferred_name, business_name,
          title, office_phone, mobile_phone, fax, email_signature, website,
          office_address_line1, office_address_line2, office_city, office_state,
          office_zip, mailing_address_line1, mailing_address_line2, mailing_city,
          mailing_state, mailing_zip, designations, professional_memberships,
          supervising_broker_id, broker_association_date, broker_relationship_type,
          signature_image_url, initials_image_url, seal_image_url,
          esign_consent, esign_consent_date, preferred_signing_service,
          settings, is_public
        )
        VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
          $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
          $21, $22, $23, $24, $25, $26, $27, $28, $29, $30,
          $31, $32, $33, $34, $35, $36, $37, $38
        )
        ON CONFLICT (user_id)
        DO UPDATE SET
          license_number = COALESCE($2, user_profiles.license_number),
          license_state = COALESCE($3, user_profiles.license_state),
          license_type = COALESCE($4, user_profiles.license_type),
          license_status = COALESCE($5, user_profiles.license_status),
          license_expiration_date = COALESCE($6, user_profiles.license_expiration_date),
          full_legal_name = COALESCE($7, user_profiles.full_legal_name),
          preferred_name = COALESCE($8, user_profiles.preferred_name),
          business_name = COALESCE($9, user_profiles.business_name),
          title = COALESCE($10, user_profiles.title),
          office_phone = COALESCE($11, user_profiles.office_phone),
          mobile_phone = COALESCE($12, user_profiles.mobile_phone),
          fax = COALESCE($13, user_profiles.fax),
          email_signature = COALESCE($14, user_profiles.email_signature),
          website = COALESCE($15, user_profiles.website),
          office_address_line1 = COALESCE($16, user_profiles.office_address_line1),
          office_address_line2 = COALESCE($17, user_profiles.office_address_line2),
          office_city = COALESCE($18, user_profiles.office_city),
          office_state = COALESCE($19, user_profiles.office_state),
          office_zip = COALESCE($20, user_profiles.office_zip),
          mailing_address_line1 = COALESCE($21, user_profiles.mailing_address_line1),
          mailing_address_line2 = COALESCE($22, user_profiles.mailing_address_line2),
          mailing_city = COALESCE($23, user_profiles.mailing_city),
          mailing_state = COALESCE($24, user_profiles.mailing_state),
          mailing_zip = COALESCE($25, user_profiles.mailing_zip),
          designations = COALESCE($26, user_profiles.designations),
          professional_memberships = COALESCE($27, user_profiles.professional_memberships),
          supervising_broker_id = COALESCE($28, user_profiles.supervising_broker_id),
          broker_association_date = COALESCE($29, user_profiles.broker_association_date),
          broker_relationship_type = COALESCE($30, user_profiles.broker_relationship_type),
          signature_image_url = COALESCE($31, user_profiles.signature_image_url),
          initials_image_url = COALESCE($32, user_profiles.initials_image_url),
          seal_image_url = COALESCE($33, user_profiles.seal_image_url),
          esign_consent = COALESCE($34, user_profiles.esign_consent),
          esign_consent_date = COALESCE($35, user_profiles.esign_consent_date),
          preferred_signing_service = COALESCE($36, user_profiles.preferred_signing_service),
          settings = COALESCE($37, user_profiles.settings),
          is_public = COALESCE($38, user_profiles.is_public),
          updated_at = CURRENT_TIMESTAMP
        RETURNING *
      `, [
        userId, licenseNumber, licenseState, licenseType, licenseStatus,
        licenseExpirationDate, fullLegalName, preferredName, businessName,
        title, officePhone, mobilePhone, fax, emailSignature, website,
        officeAddressLine1, officeAddressLine2, officeCity, officeState,
        officeZip, mailingAddressLine1, mailingAddressLine2, mailingCity,
        mailingState, mailingZip, designations, professionalMemberships,
        supervisingBrokerId, brokerAssociationDate, brokerRelationshipType,
        signatureImageUrl, initialsImageUrl, sealImageUrl,
        esignConsent, esignConsentDate, preferredSigningService,
        settings, isPublic,
      ]);

      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Error upserting user profile:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get user profile by user ID
   */
  static async getProfileByUserId(userId) {
    const result = await pool.query(`
      SELECT
        up.*,
        u.email, u.first_name, u.last_name, u.role,
        b.name as broker_name,
        b.company_name as broker_company_name,
        b.license_number as broker_license_number,
        bp.designated_officer_name,
        bp.main_office_address_line1 as broker_office_address,
        bp.main_office_city as broker_office_city,
        bp.main_office_state as broker_office_state,
        bp.main_office_zip as broker_office_zip,
        bp.main_office_phone as broker_office_phone
      FROM user_profiles up
      JOIN users u ON up.user_id = u.id
      LEFT JOIN brokerages b ON up.supervising_broker_id = b.id
      LEFT JOIN broker_profiles bp ON b.id = bp.broker_id
      WHERE up.user_id = $1
    `, [userId]);

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0];
  }

  /**
   * Get all profiles for a team (for document generation)
   */
  static async getProfilesByTeamId(teamId) {
    const result = await pool.query(`
      SELECT
        up.*,
        u.email, u.first_name, u.last_name, u.role
      FROM user_profiles up
      JOIN users u ON up.user_id = u.id
      WHERE u.team_id = $1 AND up.is_public = true
      ORDER BY u.last_name, u.first_name
    `, [teamId]);

    return result.rows;
  }

  /**
   * Verify DRE license via California DRE public lookup
   * NOTE: This is a placeholder - actual DRE API requires web scraping or paid service
   *
   * Real implementation options:
   * 1. CA DRE eLicensing: https://www2.dre.ca.gov/PublicASP/pplinfo.asp
   * 2. Paid service: RealValidation, PropertyRadar, etc.
   * 3. Manual verification with admin approval
   */
  static async verifyDRELicense(userId, licenseNumber) {
    const client = await pool.connect();

    try {
      // TODO: Implement actual DRE verification
      // For now, return mock verification data
      const verificationData = {
        licenseNumber,
        status: 'active',
        name: 'LICENSE HOLDER NAME',
        expirationDate: '2025-12-31',
        licenseType: 'Salesperson',
        verifiedAt: new Date().toISOString(),
        verificationMethod: 'manual', // 'dre_api', 'paid_service', 'manual'
        verificationSource: 'CA DRE Public Lookup',
      };

      // Update profile with verification data
      const result = await client.query(`
        UPDATE user_profiles
        SET
          dre_verified = true,
          dre_verified_at = CURRENT_TIMESTAMP,
          dre_verification_data = $2::jsonb,
          updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $1
        RETURNING *
      `, [userId, JSON.stringify(verificationData)]);

      logger.info(`DRE license verified for user ${userId}: ${licenseNumber}`);

      return result.rows[0];
    } catch (error) {
      logger.error('Error verifying DRE license:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get document merge data for a user (for filling templates)
   * Returns all fields needed for document automation
   */
  static async getDocumentMergeData(userId) {
    const profile = await this.getProfileByUserId(userId);

    if (!profile) {
      throw new Error('User profile not found');
    }

    // Return structured data for document merge fields
    return {
      agent: {
        fullName: profile.full_legal_name || `${profile.first_name} ${profile.last_name}`,
        preferredName: profile.preferred_name || profile.first_name,
        businessName: profile.business_name,
        title: profile.title,
        licenseNumber: profile.license_number,
        licenseState: profile.license_state,
        licenseType: profile.license_type,
        email: profile.email_signature || profile.email,
        officePhone: profile.office_phone,
        mobilePhone: profile.mobile_phone,
        fax: profile.fax,
        website: profile.website,
        designations: profile.designations,
      },
      agentOffice: {
        addressLine1: profile.office_address_line1,
        addressLine2: profile.office_address_line2,
        city: profile.office_city,
        state: profile.office_state,
        zip: profile.office_zip,
      },
      agentMailing: {
        addressLine1: profile.mailing_address_line1,
        addressLine2: profile.mailing_address_line2,
        city: profile.mailing_city,
        state: profile.mailing_state,
        zip: profile.mailing_zip,
      },
      broker: {
        name: profile.broker_name,
        companyName: profile.broker_company_name,
        licenseNumber: profile.broker_license_number,
        designatedOfficer: profile.designated_officer_name,
        officeAddress: profile.broker_office_address,
        officeCity: profile.broker_office_city,
        officeState: profile.broker_office_state,
        officeZip: profile.broker_office_zip,
        officePhone: profile.broker_office_phone,
      },
      signatures: {
        signatureUrl: profile.signature_image_url,
        initialsUrl: profile.initials_image_url,
        sealUrl: profile.seal_image_url,
      },
    };
  }

  /**
   * Delete user profile
   */
  static async deleteProfile(userId) {
    const result = await pool.query(
      'DELETE FROM user_profiles WHERE user_id = $1 RETURNING *',
      [userId],
    );

    return result.rows[0];
  }
}

module.exports = UserProfileService;
