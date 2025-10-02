const { pool } = require('../config/database');
const logger = require('../utils/logger');

/**
 * Onboarding Service
 * Manages tutorial progress and generates sample data for new users
 */
class OnboardingService {
  /**
   * Generate complete sample dataset for new user
   * Creates realistic data following the money trail: Leads → Appointments → Clients → Listings → Escrows
   */
  static async generateSampleData(userId) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const sampleGroupId = `onboarding-${userId}`;
      const createdData = {};

      // 1. Create Sample Lead (Sarah Thompson - Hot Buyer)
      createdData.lead = await this.createSampleLead(userId, sampleGroupId, client);

      // 2. Create Sample Appointment (Property Showing for Sarah)
      createdData.appointment = await this.createSampleAppointment(
        userId,
        sampleGroupId,
        createdData.lead,
        client,
      );

      // 3. Create Sample Client (Mark Rodriguez - Seller)
      createdData.client = await this.createSampleClient(userId, sampleGroupId, client);

      // 4. Create Sample Listing (Mark's Property)
      createdData.listing = await this.createSampleListing(
        userId,
        sampleGroupId,
        createdData.client,
        client,
      );

      // 5. Create Sample Escrow (Active Transaction - Almost Closed!)
      createdData.escrow = await this.createSampleEscrow(userId, sampleGroupId, client);

      // 6. Initialize or update onboarding progress
      await this.initializeProgress(userId, client);

      await client.query('COMMIT');

      logger.info(`Sample data generated for user ${userId}`, {
        sampleGroupId,
        itemsCreated: Object.keys(createdData).length,
      });

      return {
        success: true,
        sampleGroupId,
        data: createdData,
      };
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Error generating sample data:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Create sample lead: Sarah Thompson - Hot buyer with appointment scheduled
   */
  static async createSampleLead(userId, sampleGroupId, client) {
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    const result = await client.query(`
      INSERT INTO leads (
        lead_owner_id, first_name, last_name, email, phone,
        status, source, lead_type, timeline, notes,
        is_sample, sample_group_id, created_at
      ) VALUES (
        $1, 'Sarah', 'Thompson', 'sarah.thompson@example.com', '(555) 234-5678',
        'hot', 'Open House - 123 Oak Street', 'buyer', '30-60 days',
        'Pre-approved with Wells Fargo for up to $525K. Looking to relocate for work. Interested in 3BR homes in Tehachapi area with mountain views.',
        true, $2, $3
      ) RETURNING *
    `, [userId, sampleGroupId, twoDaysAgo]);

    return result.rows[0];
  }

  /**
   * Create sample appointment: Property showing for Sarah tomorrow at 2 PM
   */
  static async createSampleAppointment(userId, sampleGroupId, lead, client) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(14, 0, 0, 0); // 2:00 PM

    const endTime = new Date(tomorrow);
    endTime.setHours(15, 0, 0, 0); // 3:00 PM

    const result = await client.query(`
      INSERT INTO appointments (
        agent_id, title, appointment_type, start_time, end_time,
        location, status, notes,
        is_sample, sample_group_id
      ) VALUES (
        $1, 'Property Showing - Sarah Thompson', 'Property Showing',
        $2, $3, '456 Pine Avenue, Tehachapi, CA 93561', 'confirmed',
        'Showing 3 properties in $450-525K range. Sarah is pre-approved and ready to move quickly. Prepare CMA and showing sheets.',
        true, $4
      ) RETURNING *
    `, [userId, tomorrow, endTime, sampleGroupId]);

    return result.rows[0];
  }

  /**
   * Create sample client: Mark Rodriguez - Seller ready to list
   */
  static async createSampleClient(userId, sampleGroupId, client) {
    const result = await client.query(`
      INSERT INTO clients (
        user_id, first_name, last_name, email, phone,
        client_type, status, property_address, city, state, zip_code,
        notes,
        is_sample, sample_group_id
      ) VALUES (
        $1, 'Mark', 'Rodriguez', 'mark.rodriguez@example.com', '(555) 345-6789',
        'seller', 'active', '789 Mountain View Drive', 'Tehachapi', 'CA', '93561',
        'Relocating to San Diego for new job. Needs to list within 2 weeks. Home is move-in ready with recent upgrades. Estimated value $575K based on recent comps.',
        true, $2
      ) RETURNING *
    `, [userId, sampleGroupId]);

    return result.rows[0];
  }

  /**
   * Create sample listing: Mark's property - Active on MLS
   */
  static async createSampleListing(userId, sampleGroupId, clientData, client) {
    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

    const result = await client.query(`
      INSERT INTO listings (
        user_id, property_address, city, state, zip_code,
        bedrooms, bathrooms, square_feet, lot_size,
        list_price, property_type, status, listing_date,
        mls_number, description,
        is_sample, sample_group_id, created_at
      ) VALUES (
        $1, '789 Mountain View Drive', 'Tehachapi', 'CA', '93561',
        4, 3, 2450, '0.25 acres',
        599000, 'Single Family', 'active', $2,
        'TC2025001', 'Stunning mountain views from this beautifully upgraded 4BR/3BA home. Move-in ready with modern kitchen, new flooring, fresh paint. Large backyard perfect for entertaining. Close to schools and shopping.',
        true, $3, $2
      ) RETURNING *
    `, [userId, fiveDaysAgo, sampleGroupId]);

    return result.rows[0];
  }

  /**
   * Create sample escrow: Active transaction 18 days in, closing in 12 days!
   */
  static async createSampleEscrow(userId, sampleGroupId, client) {
    const eighteenDaysAgo = new Date();
    eighteenDaysAgo.setDate(eighteenDaysAgo.getDate() - 18);

    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

    const twelveDaysFromNow = new Date();
    twelveDaysFromNow.setDate(twelveDaysFromNow.getDate() + 12);

    const result = await client.query(`
      INSERT INTO escrows (
        id, property_address, city, state, zip_code,
        escrow_status, purchase_price, escrow_number,
        opened_date, estimated_closing_date,
        buyer_agent_name, seller_agent_name,
        buyer_name, seller_name,
        commission_percentage, gross_commission,
        escrow_company, title_company,
        transaction_type, property_type,
        created_by, team_id,
        is_sample, sample_group_id, created_at
      ) VALUES (
        'ESC-2025-SAMPLE', '321 Valley Road', 'Tehachapi', 'CA', '93561',
        'active', 485000, 'ESC-2025-SAMPLE',
        $1, $2,
        'You (Sample Agent)', 'Patricia Williams',
        'Jennifer & Michael Chen', 'Patricia Williams',
        3.0, 14550.00,
        'First American Title', 'First American Title',
        'sale', 'Single Family',
        $3, NULL,
        true, $4, $1
      ) RETURNING *
    `, [eighteenDaysAgo, twelveDaysFromNow, userId, sampleGroupId]);

    return result.rows[0];
  }

  /**
   * Initialize onboarding progress for new user
   */
  static async initializeProgress(userId, client = null) {
    const query = `
      INSERT INTO onboarding_progress (
        user_id, sample_data_generated, current_step, steps_completed
      ) VALUES ($1, true, 'welcome', 0)
      ON CONFLICT (user_id)
      DO UPDATE SET
        sample_data_generated = true,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;

    if (client) {
      const result = await client.query(query, [userId]);
      return result.rows[0];
    }

    const result = await pool.query(query, [userId]);
    return result.rows[0];
  }

  /**
   * Get onboarding progress for user
   */
  static async getProgress(userId) {
    const result = await pool.query(
      'SELECT * FROM onboarding_progress WHERE user_id = $1',
      [userId],
    );

    if (result.rows.length === 0) {
      // Create initial progress record if doesn't exist
      return this.initializeProgress(userId);
    }

    return result.rows[0];
  }

  /**
   * Update progress for a specific step
   */
  static async updateProgress(userId, step) {
    const stepColumnMap = {
      welcome: 'welcome_shown',
      escrow: 'escrow_tour_completed',
      listings: 'listing_tour_completed',
      clients: 'client_tour_completed',
      appointments: 'appointment_tour_completed',
      leads: 'lead_tour_completed',
      marketplace: 'marketplace_introduced',
      features: 'features_introduced',
    };

    const columnName = stepColumnMap[step];
    if (!columnName) {
      throw new Error(`Invalid step: ${step}`);
    }

    // Determine next step
    const stepOrder = ['welcome', 'escrow', 'listings', 'clients', 'appointments', 'leads', 'marketplace', 'features'];
    const currentIndex = stepOrder.indexOf(step);
    const nextStep = currentIndex < stepOrder.length - 1 ? stepOrder[currentIndex + 1] : 'completed';

    const result = await pool.query(`
      UPDATE onboarding_progress
      SET
        ${columnName} = true,
        steps_completed = steps_completed + 1,
        current_step = $2,
        tutorial_completed = CASE WHEN $3 THEN true ELSE tutorial_completed END,
        completed_at = CASE WHEN $3 THEN CURRENT_TIMESTAMP ELSE completed_at END,
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $1 AND ${columnName} = false
      RETURNING *
    `, [userId, nextStep, nextStep === 'completed']);

    return result.rows[0];
  }

  /**
   * Mark tutorial as skipped
   */
  static async skipTutorial(userId) {
    const result = await pool.query(`
      UPDATE onboarding_progress
      SET
        skipped = true,
        skipped_at = CURRENT_TIMESTAMP,
        current_step = 'skipped',
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $1
      RETURNING *
    `, [userId]);

    return result.rows[0];
  }

  /**
   * Reset tutorial progress (for replay)
   */
  static async resetProgress(userId) {
    const result = await pool.query(`
      UPDATE onboarding_progress
      SET
        welcome_shown = false,
        escrow_tour_completed = false,
        listing_tour_completed = false,
        client_tour_completed = false,
        appointment_tour_completed = false,
        lead_tour_completed = false,
        marketplace_introduced = false,
        features_introduced = false,
        tutorial_completed = false,
        completed_at = NULL,
        skipped = false,
        skipped_at = NULL,
        current_step = 'welcome',
        steps_completed = 0,
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $1
      RETURNING *
    `, [userId]);

    return result.rows[0];
  }

  /**
   * Delete all sample data for user
   */
  static async deleteSampleData(userId) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const sampleGroupId = `onboarding-${userId}`;

      // Delete sample data from all tables
      const deletedCounts = {
        leads: 0,
        appointments: 0,
        clients: 0,
        listings: 0,
        escrows: 0,
      };

      const leadsResult = await client.query(
        'DELETE FROM leads WHERE sample_group_id = $1 RETURNING id',
        [sampleGroupId],
      );
      deletedCounts.leads = leadsResult.rowCount;

      const appointmentsResult = await client.query(
        'DELETE FROM appointments WHERE sample_group_id = $1 RETURNING id',
        [sampleGroupId],
      );
      deletedCounts.appointments = appointmentsResult.rowCount;

      const clientsResult = await client.query(
        'DELETE FROM clients WHERE sample_group_id = $1 RETURNING id',
        [sampleGroupId],
      );
      deletedCounts.clients = clientsResult.rowCount;

      const listingsResult = await client.query(
        'DELETE FROM listings WHERE sample_group_id = $1 RETURNING id',
        [sampleGroupId],
      );
      deletedCounts.listings = listingsResult.rowCount;

      const escrowsResult = await client.query(
        'DELETE FROM escrows WHERE sample_group_id = $1 RETURNING id',
        [sampleGroupId],
      );
      deletedCounts.escrows = escrowsResult.rowCount;

      // Update onboarding progress
      await client.query(`
        UPDATE onboarding_progress
        SET
          sample_data_deleted = true,
          sample_data_deleted_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $1
      `, [userId]);

      await client.query('COMMIT');

      logger.info(`Sample data deleted for user ${userId}`, deletedCounts);

      return {
        success: true,
        deletedCounts,
      };
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Error deleting sample data:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get sample data for user (for tutorial display)
   */
  static async getSampleData(userId) {
    const sampleGroupId = `onboarding-${userId}`;

    const [leads, appointments, clients, listings, escrows] = await Promise.all([
      pool.query('SELECT * FROM leads WHERE sample_group_id = $1', [sampleGroupId]),
      pool.query('SELECT * FROM appointments WHERE sample_group_id = $1', [sampleGroupId]),
      pool.query('SELECT * FROM clients WHERE sample_group_id = $1', [sampleGroupId]),
      pool.query('SELECT * FROM listings WHERE sample_group_id = $1', [sampleGroupId]),
      pool.query('SELECT * FROM escrows WHERE sample_group_id = $1', [sampleGroupId]),
    ]);

    return {
      lead: leads.rows[0] || null,
      appointment: appointments.rows[0] || null,
      client: clients.rows[0] || null,
      listing: listings.rows[0] || null,
      escrow: escrows.rows[0] || null,
    };
  }

  /**
   * Submit feedback after tutorial completion
   */
  static async submitFeedback(userId, feedback) {
    const { rating, nps, helpful, suggestions, featuresLiked, submittedAt } = feedback;

    // Store feedback in onboarding_progress metadata
    await pool.query(
      `UPDATE onboarding_progress
       SET updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $1`,
      [userId]
    );

    logger.info(`Feedback submitted by user ${userId}`, { rating, nps, helpful });

    // In a real implementation, you might store this in a separate feedback table
    // For now, we'll just log it and return success
    return {
      feedbackReceived: true,
      rating,
      nps,
      submittedAt: submittedAt || new Date().toISOString(),
    };
  }

  /**
   * Get analytics/stats for user's onboarding
   */
  static async getAnalytics(userId) {
    const result = await pool.query(
      `SELECT
         tutorial_completed,
         completed_at,
         steps_completed,
         total_steps,
         skipped,
         skipped_at,
         created_at,
         updated_at
       FROM onboarding_progress
       WHERE user_id = $1`,
      [userId]
    );

    if (!result.rows[0]) {
      return null;
    }

    const progress = result.rows[0];

    // Calculate time-based analytics
    let totalTimeSeconds = null;
    let averageStepTime = null;

    if (progress.completed_at && progress.created_at) {
      const startTime = new Date(progress.created_at);
      const endTime = new Date(progress.completed_at);
      totalTimeSeconds = Math.floor((endTime - startTime) / 1000);
      averageStepTime = totalTimeSeconds / progress.total_steps;
    }

    return {
      tutorial_completed: progress.tutorial_completed,
      completed_at: progress.completed_at,
      steps_completed: progress.steps_completed,
      total_steps: progress.total_steps,
      completion_percentage: (progress.steps_completed / progress.total_steps) * 100,
      skipped: progress.skipped,
      skipped_at: progress.skipped_at,
      total_time_seconds: totalTimeSeconds,
      average_step_time: averageStepTime,
      started_at: progress.created_at,
    };
  }

  /**
   * Track step timing (for analytics)
   */
  static async trackStepTiming(userId, step, timeSpentSeconds) {
    // In a full implementation, this would store in a separate analytics table
    // For now, we'll just log it
    logger.info(`Step timing tracked for user ${userId}`, { step, timeSpentSeconds });

    return {
      tracked: true,
      step,
      timeSpentSeconds,
    };
  }
}

module.exports = OnboardingService;
