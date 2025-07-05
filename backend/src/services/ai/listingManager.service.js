

// backend/src/services/ai/listingManager.service.js

const Listing = require('../../models/Listing');
const listingLaunch = require('./agents/listingLaunchSpecialist');
const listingMarketing = require('./agents/listingMarketingAgent');
const marketAnalyst = require('./agents/marketAnalyst');
const logger = require('../../utils/logger');

class ListingManagerService {
  /**
   * Entry point for newly created listings.
   * - Launches the listing (marketing copy, announcements).
   * - Initiates a marketing campaign.
   * @param {Object} listingData - The new listing record
   */
  static async handleNewListing(listingData) {
    const result = { listingId: listingData.id, launched: false, marketed: false };
    try {
      logger.info(`Handling new listing ${listingData.id}`);

      if (listingLaunch.isEnabled()) {
        await listingLaunch.launchListing(listingData);
        result.launched = true;
      } else {
        logger.info('Listing Launch Specialist is disabled; skipping launch.');
      }

      if (listingMarketing.isEnabled()) {
        await listingMarketing.marketListing(listingData);
        result.marketed = true;
      } else {
        logger.info('Listing Marketing Agent is disabled; skipping marketing.');
      }

      return result;
    } catch (err) {
      logger.error(`Error in ListingManagerService.handleNewListing for ${listingData.id}:`, err);
      throw err;
    }
  }

  /**
   * Periodic campaign runner.
   * Fetches active listings and runs marketing campaigns for each.
   * @param {Object} [options] - Optional pagination or filters
   */
  static async runMarketingCycle({ page = 1, limit = 50 } = {}) {
    logger.info('Starting marketing cycle for active listings');
    const { listings } = await Listing.findAll({ page, limit });
    const results = [];

    for (const listing of listings) {
      try {
        if (listingMarketing.isEnabled()) {
          await listingMarketing.marketListing(listing);
          results.push({ listingId: listing.id, marketed: true });
        } else {
          results.push({ listingId: listing.id, marketed: false, reason: 'Marketing agent disabled' });
        }
      } catch (err) {
        logger.error(`Error marketing listing ${listing.id}:`, err);
        results.push({ listingId: listing.id, marketed: false, error: err.message });
      }
    }

    logger.info(`Completed marketing cycle for ${listings.length} listings`);
    return { total: listings.length, details: results };
  }

  /**
   * Generate a market analysis report for a given area.
   * Delegates to the Market Analyst agent.
   * @param {Object} areaParams - { zip, radiusMiles, propertyType }
   */
  static async analyzeMarket(areaParams) {
    if (!marketAnalyst.isEnabled()) {
      logger.info('Market Analyst Agent is disabled; skipping analysis');
      return { skipped: true, reason: 'Agent disabled' };
    }
    return await marketAnalyst.analyzeMarket(areaParams);
  }
}

module.exports = ListingManagerService;