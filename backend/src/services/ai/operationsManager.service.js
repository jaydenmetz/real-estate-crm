

// backend/src/services/ai/operationsManager.service.js

const logger = require('../../utils/logger');
const BuyerManager    = require('./buyerManager.service');
const ListingManager  = require('./listingManager.service');
const TransactionCoordinator = require('./agents/transactionCoordinator');
const ShowingCoordinator     = require('./agents/showingCoordinator');
const ComplianceOfficer      = require('./agents/complianceOfficer');
const FinancialAnalyst       = require('./agents/financialAnalyst');
const DatabaseSpecialist     = require('./agents/databaseSpecialist');
const MarketAnalyst          = require('./agents/marketAnalyst');

class OperationsManagerService {
  /**
   * Handle a new lead by delegating to the Buyer Manager.
   * @param {Object} leadData
   * @returns {Promise<Object>}
   */
  static async onNewLead(leadData) {
    logger.info(`OperationsManager: New lead received ${leadData.id}`);
    return BuyerManager.handleNewLead(leadData);
  }

  /**
   * Handle a new listing by delegating to the Listing Manager.
   * @param {Object} listingData
   * @returns {Promise<Object>}
   */
  static async onNewListing(listingData) {
    logger.info(`OperationsManager: New listing received ${listingData.id}`);
    return ListingManager.handleNewListing(listingData);
  }

  /**
   * Run all daily operations:
   * - Buyer nurture cycles
   * - Listing marketing cycles
   * - Process transaction reminders
   * - Generate showings reminders
   * - Compliance reviews (if needed)
   */
  static async runDailyOperations() {
    logger.info('OperationsManager: Running daily operations');
    const results = {};

    try {
      results.buyerNurture = await BuyerManager.runNurtureCycle();
    } catch (err) {
      logger.error('Error in buyer nurture cycle', err);
      results.buyerNurture = { error: err.message };
    }

    try {
      results.listingMarketing = await ListingManager.runMarketingCycle();
    } catch (err) {
      logger.error('Error in listing marketing cycle', err);
      results.listingMarketing = { error: err.message };
    }

    try {
      results.transactionReminders = await TransactionCoordinator.processReminders();
    } catch (err) {
      logger.error('Error processing transaction reminders', err);
      results.transactionReminders = { error: err.message };
    }

    try {
      // If showing reminders are managed via a cron job, call here
      // Assuming showingCoordinator has a method to process reminders
      if (ShowingCoordinator.sendReminder) {
        // Placeholder: actual implementation may differ
        results.showingReminders = 'scheduled via cron job';
      }
    } catch (err) {
      logger.error('Error scheduling showing reminders', err);
      results.showingReminders = { error: err.message };
    }

    // Optionally run periodic analyses
    // e.g., compliance, financial, database, market
    try {
      // compliance reviews could be triggered here
      results.compliance = 'on-demand via controller';
    } catch (err) {
      logger.error('Error with compliance reviews', err);
      results.compliance = { error: err.message };
    }

    return results;
  }
}

module.exports = OperationsManagerService;