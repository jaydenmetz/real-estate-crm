const { pool } = require('../../../../config/infrastructure/database');
const logger = require('../../../../utils/logger');

/**
 * BrokerProfile Service
 * Manages broker template data that auto-fills in agent documents
 * This is the "text fields that fill the same way every time"
 */
class BrokerProfileService {
  /**
   * Create or update broker profile
   * @param {UUID} brokerId - Broker ID
   * @param {Object} profileData - Broker profile information
   */
  static async upsertProfile(brokerId, profileData) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const {
        // Broker License Information
        brokerLicenseNumber,
        brokerLicenseState = 'CA',
        brokerLicenseExpiration,

        // Designated Officer
        designatedOfficerName,
        designatedOfficerLicense,
        designatedOfficerTitle = 'Designated Officer',

        // Corporation/Entity Information
        entityType,
        dbaName,
        corporationNumber,
        federalTaxId,

        // Main Office Address
        mainOfficeAddressLine1,
        mainOfficeAddressLine2,
        mainOfficeCity,
        mainOfficeState = 'CA',
        mainOfficeZip,
        mainOfficePhone,
        mainOfficeFax,

        // Branch Offices
        branchOffices = [],

        // Errors & Omissions Insurance
        eoInsuranceCarrier,
        eoInsurancePolicyNumber,
        eoInsuranceExpiration,
        eoInsuranceCoverageAmount,

        // Trust Account Information
        trustAccountBank,
        trustAccountName,
        trustAccountNumber,
        trustAccountRouting,

        // Document Template Fields
        templateFooterText,
        templateDisclosureText,
        templateLetterheadUrl,
        templateLogoUrl,

        // Compliance
        requiredDisclosures = [],
        contractAddendums = [],

        // Settings
        settings = {},
      } = profileData;

      // Insert or update broker profile
      const result = await client.query(`
        INSERT INTO broker_profiles (
          broker_id, broker_license_number, broker_license_state,
          broker_license_expiration, designated_officer_name,
          designated_officer_license, designated_officer_title,
          entity_type, dba_name, corporation_number, federal_tax_id,
          main_office_address_line1, main_office_address_line2,
          main_office_city, main_office_state, main_office_zip,
          main_office_phone, main_office_fax, branch_offices,
          eo_insurance_carrier, eo_insurance_policy_number,
          eo_insurance_expiration, eo_insurance_coverage_amount,
          trust_account_bank, trust_account_name, trust_account_number,
          trust_account_routing, template_footer_text,
          template_disclosure_text, template_letterhead_url,
          template_logo_url, required_disclosures, contract_addendums,
          settings
        )
        VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
          $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
          $21, $22, $23, $24, $25, $26, $27, $28, $29, $30,
          $31, $32, $33, $34
        )
        ON CONFLICT (broker_id)
        DO UPDATE SET
          broker_license_number = COALESCE($2, broker_profiles.broker_license_number),
          broker_license_state = COALESCE($3, broker_profiles.broker_license_state),
          broker_license_expiration = COALESCE($4, broker_profiles.broker_license_expiration),
          designated_officer_name = COALESCE($5, broker_profiles.designated_officer_name),
          designated_officer_license = COALESCE($6, broker_profiles.designated_officer_license),
          designated_officer_title = COALESCE($7, broker_profiles.designated_officer_title),
          entity_type = COALESCE($8, broker_profiles.entity_type),
          dba_name = COALESCE($9, broker_profiles.dba_name),
          corporation_number = COALESCE($10, broker_profiles.corporation_number),
          federal_tax_id = COALESCE($11, broker_profiles.federal_tax_id),
          main_office_address_line1 = COALESCE($12, broker_profiles.main_office_address_line1),
          main_office_address_line2 = COALESCE($13, broker_profiles.main_office_address_line2),
          main_office_city = COALESCE($14, broker_profiles.main_office_city),
          main_office_state = COALESCE($15, broker_profiles.main_office_state),
          main_office_zip = COALESCE($16, broker_profiles.main_office_zip),
          main_office_phone = COALESCE($17, broker_profiles.main_office_phone),
          main_office_fax = COALESCE($18, broker_profiles.main_office_fax),
          branch_offices = COALESCE($19, broker_profiles.branch_offices),
          eo_insurance_carrier = COALESCE($20, broker_profiles.eo_insurance_carrier),
          eo_insurance_policy_number = COALESCE($21, broker_profiles.eo_insurance_policy_number),
          eo_insurance_expiration = COALESCE($22, broker_profiles.eo_insurance_expiration),
          eo_insurance_coverage_amount = COALESCE($23, broker_profiles.eo_insurance_coverage_amount),
          trust_account_bank = COALESCE($24, broker_profiles.trust_account_bank),
          trust_account_name = COALESCE($25, broker_profiles.trust_account_name),
          trust_account_number = COALESCE($26, broker_profiles.trust_account_number),
          trust_account_routing = COALESCE($27, broker_profiles.trust_account_routing),
          template_footer_text = COALESCE($28, broker_profiles.template_footer_text),
          template_disclosure_text = COALESCE($29, broker_profiles.template_disclosure_text),
          template_letterhead_url = COALESCE($30, broker_profiles.template_letterhead_url),
          template_logo_url = COALESCE($31, broker_profiles.template_logo_url),
          required_disclosures = COALESCE($32, broker_profiles.required_disclosures),
          contract_addendums = COALESCE($33, broker_profiles.contract_addendums),
          settings = COALESCE($34, broker_profiles.settings),
          updated_at = CURRENT_TIMESTAMP
        RETURNING *
      `, [
        brokerId, brokerLicenseNumber, brokerLicenseState,
        brokerLicenseExpiration, designatedOfficerName,
        designatedOfficerLicense, designatedOfficerTitle,
        entityType, dbaName, corporationNumber, federalTaxId,
        mainOfficeAddressLine1, mainOfficeAddressLine2,
        mainOfficeCity, mainOfficeState, mainOfficeZip,
        mainOfficePhone, mainOfficeFax, JSON.stringify(branchOffices),
        eoInsuranceCarrier, eoInsurancePolicyNumber,
        eoInsuranceExpiration, eoInsuranceCoverageAmount,
        trustAccountBank, trustAccountName, trustAccountNumber,
        trustAccountRouting, templateFooterText,
        templateDisclosureText, templateLetterheadUrl,
        templateLogoUrl, requiredDisclosures, contractAddendums,
        settings,
      ]);

      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Error upserting broker profile:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get broker profile by broker ID
   */
  static async getProfileByBrokerId(brokerId) {
    const result = await pool.query(`
      SELECT
        bp.*,
        b.name as broker_name,
        b.company_name as broker_company_name,
        b.email as broker_email,
        b.phone as broker_phone,
        b.website as broker_website,
        b.logo_url as broker_logo_url
      FROM broker_profiles bp
      JOIN brokerages b ON bp.broker_id = b.id
      WHERE bp.broker_id = $1
    `, [brokerId]);

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0];
  }

  /**
   * Get broker profile for a user (via their supervising broker)
   */
  static async getProfileForUser(userId) {
    const result = await pool.query(`
      SELECT
        bp.*,
        b.name as broker_name,
        b.company_name as broker_company_name
      FROM user_profiles up
      JOIN brokerages b ON up.supervising_broker_id = b.id
      JOIN broker_profiles bp ON b.id = bp.broker_id
      WHERE up.user_id = $1
    `, [userId]);

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0];
  }

  /**
   * Delete broker profile
   */
  static async deleteProfile(brokerId) {
    const result = await pool.query(
      'DELETE FROM broker_profiles WHERE broker_id = $1 RETURNING *',
      [brokerId],
    );

    return result.rows[0];
  }
}

module.exports = BrokerProfileService;
