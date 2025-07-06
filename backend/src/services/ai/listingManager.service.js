const axios   = require('axios');
const logger  = require('../../utils/logger');
const { query } = require('../../config/database');

class ListingManagerService {
  constructor() {
    this.name       = 'Listing Manager';
    this.model      = 'claude-3-sonnet-20240229';
    this.enabled    = true;
    this.department = 'listing';
  }

  async performStatusCheck() {
    try {
      logger.info('Listing Manager performing status check...');

      // Check listing performance
      const performanceCheck = await this.checkListingPerformance();

      // Review pricing strategies
      const pricingCheck = await this.reviewPricingStrategies();

      // Monitor marketing effectiveness
      const marketingCheck = await this.checkMarketingEffectiveness();

      const status = {
        performanceCheck,
        pricingCheck,
        marketingCheck,
        timestamp: new Date()
      };

      // Report to Alex if issues found
      if (this.hasIssues(status)) {
        await this.escalateToAlex(status);
      }

      return status;
    } catch (error) {
      logger.error('Listing Manager status check failed:', error);
      throw error;
    }
  }

  async checkListingPerformance() {
    const result = await query(`
      SELECT 
        COUNT(*) AS total_active,
        AVG(days_on_market) AS avg_dom,
        COUNT(*) FILTER (WHERE days_on_market > 30) AS stale_listings,
        AVG(online_views) AS avg_views,
        AVG(total_showings) AS avg_showings
      FROM listings 
      WHERE listing_status = 'Active'
    `);

    const data = result.rows[0];
    const stalePercentage = data.total_active > 0
      ? (data.stale_listings / data.total_active) * 100
      : 0;

    return {
      totalActive: parseInt(data.total_active, 10),
      avgDaysOnMarket: parseFloat(data.avg_dom || 0),
      staleListings: parseInt(data.stale_listings, 10),
      stalePercentage: parseFloat(stalePercentage.toFixed(2)),
      avgViews: parseFloat(data.avg_views || 0),
      avgShowings: parseFloat(data.avg_showings || 0),
      target: { maxDOM: 25, maxStalePercentage: 20 },
      status:
        data.avg_dom <= 25 && stalePercentage <= 20
          ? 'good'
          : 'needs_attention'
    };
  }

  async reviewPricingStrategies() {
    const result = await query(`
      SELECT 
        l.id,
        l.property_address,
        l.list_price,
        l.days_on_market,
        COUNT(lph.id) AS price_reductions,
        l.online_views,
        l.total_showings
      FROM listings l
      LEFT JOIN listing_price_history lph 
        ON l.id = lph.listing_id 
        AND lph.reason != 'Initial listing'
      WHERE l.listing_status = 'Active'
        AND l.days_on_market > 14
      GROUP BY l.id
      HAVING l.online_views < 50 OR l.total_showings < 3
    `);

    const needsPriceReview = result.rows.map(row => ({
      id: row.id,
      address: row.property_address,
      listPrice: parseFloat(row.list_price),
      daysOnMarket: parseInt(row.days_on_market, 10),
      priceReductions: parseInt(row.price_reductions, 10),
      views: parseInt(row.online_views, 10),
      showings: parseInt(row.total_showings, 10),
      reason:
        row.online_views < 50
          ? 'Low online interest'
          : 'Few showings'
    }));

    return {
      needsPriceReview,
      count: needsPriceReview.length,
      status: needsPriceReview.length <= 2
        ? 'good'
        : 'needs_attention'
    };
  }

  async checkMarketingEffectiveness() {
    const result = await query(`
      SELECT 
        AVG(marketing_spent) AS avg_spent,
        AVG(online_views) AS avg_views,
        AVG(total_showings) AS avg_showings,
        COUNT(*) FILTER (WHERE professional_photos = true) AS with_photos,
        COUNT(*) FILTER (WHERE virtual_tour_link IS NOT NULL) AS with_tours,
        COUNT(*) AS total
      FROM listings 
      WHERE listing_status = 'Active'
        AND listing_date >= CURRENT_DATE - INTERVAL '90 days'
    `);

    const data = result.rows[0];
    const photoPercentage = data.total > 0
      ? (data.with_photos / data.total) * 100
      : 0;
    const tourPercentage = data.total > 0
      ? (data.with_tours / data.total) * 100
      : 0;
    const avgROI = data.avg_spent > 0
      ? data.avg_views / data.avg_spent
      : 0;

    return {
      avgMarketingSpent: parseFloat(data.avg_spent || 0),
      avgViews: parseFloat(data.avg_views || 0),
      avgShowings: parseFloat(data.avg_showings || 0),
      photoPercentage: parseFloat(photoPercentage.toFixed(2)),
      tourPercentage: parseFloat(tourPercentage.toFixed(2)),
      avgROI: parseFloat(avgROI.toFixed(2)),
      targets: { photoPercentage: 95, tourPercentage: 80, minROI: 2 },
      status:
        photoPercentage >= 95 &&
        tourPercentage >= 80 &&
        avgROI >= 2
          ? 'good'
          : 'needs_attention'
    };
  }

  async generatePricingRecommendation(listingId) {
    try {
      const listingResult = await query(
        'SELECT * FROM listings WHERE id = $1',
        [listingId]
      );
      if (listingResult.rows.length === 0) return null;
      const listing = listingResult.rows[0];

      // Get comparable sales data and market stats
      const comps = await this.getComparableSales(listing);
      const marketStats = await this.getMarketStatistics(
        listing.property_address
      );

      const prompt = `
You are a real estate pricing expert. Analyze this listing and provide pricing recommendations:

Listing Details:
- Address: ${listing.property_address}
- Current Price: ${listing.list_price}
- Days on Market: ${listing.days_on_market}
- Views: ${listing.online_views}
- Showings: ${listing.total_showings}
- Property Type: ${listing.property_type}
- Bedrooms: ${listing.bedrooms}
- Bathrooms: ${listing.bathrooms}
- Square Footage: ${listing.square_footage}

Comparable Sales: ${JSON.stringify(comps)}
Market Statistics: ${JSON.stringify(marketStats)}

Based on Tom Ferry's pricing strategies, provide:
1. Recommended price adjustment (if any)
2. Reasoning for the recommendation
3. Expected impact on showings and offers
4. Timeline for the adjustment

Format as JSON with: { recommendedPrice, adjustment, reasoning, expectedImpact, timeline }
      `;

      const response = await this.callClaude(prompt);
      const recommendation = JSON.parse(response.content);

      // Log the recommendation
      await query(
        `INSERT INTO ai_activities 
          (agent_id, activity_type, entity_type, entity_id, description, tokens_used)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          'listing_manager',
          'pricing_analysis',
          'listing',
          listingId,
          JSON.stringify(recommendation),
          response.usage?.total_tokens || 0
        ]
      );

      return recommendation;
    } catch (error) {
      logger.error('Error generating pricing recommendation:', error);
      throw error;
    }
  }

  async getComparableSales(listing) {
    const result = await query(
      `
      SELECT 
        property_address,
        list_price,
        bedrooms,
        bathrooms,
        square_footage,
        days_on_market
      FROM listings 
      WHERE listing_status = 'Sold'
        AND property_type = $1
        AND bedrooms = $2
        AND bathrooms BETWEEN $3 - 0.5 AND $3 + 0.5
        AND square_footage BETWEEN $4 * 0.8 AND $4 * 1.2
        AND NOW() - updated_at <= INTERVAL '90 days'
      ORDER BY updated_at DESC
      LIMIT 5
      `,
      [
        listing.property_type,
        listing.bedrooms,
        listing.bathrooms,
        listing.square_footage
      ]
    );
    return result.rows;
  }

  async getMarketStatistics(propertyAddress) {
    const result = await query(`
      SELECT 
        AVG(list_price) AS avg_list_price,
        AVG(days_on_market) AS avg_dom,
        COUNT(*) AS total_listings,
        COUNT(*) FILTER (WHERE listing_status = 'Sold') AS sold_count
      FROM listings 
      WHERE NOW() - created_at <= INTERVAL '90 days'
    `);

    const data = result.rows[0];
    return {
      avgListPrice: parseFloat(data.avg_list_price || 0),
      avgDaysOnMarket: parseFloat(data.avg_dom || 0),
      totalListings: parseInt(data.total_listings, 10),
      saleRatio:
        data.total_listings > 0
          ? data.sold_count / data.total_listings
          : 0
    };
  }

  async createMarketingPlan(listingId) {
    try {
      const listingResult = await query(
        'SELECT * FROM listings WHERE id = $1',
        [listingId]
      );
      if (listingResult.rows.length === 0) return null;

      const listing = listingResult.rows[0];
      const prompt = `
Create a comprehensive 21-point marketing plan for this listing following Tom Ferry's methodology:

Property: ${listing.property_address}
Price: ${listing.list_price}
Type: ${listing.property_type}
Bedrooms: ${listing.bedrooms}
Bathrooms: ${listing.bathrooms}

Include:
1. Pre-listing marketing (Coming Soon strategy)
2. Professional photography and media plan
3. Online marketing strategy (MLS, Zillow, etc.)
4. Social media campaign
5. Print marketing materials
6. Open house strategy
7. Agent outreach plan
8. Follow-up procedures

Format as JSON with timeline and specific actions.
      `;

      const response = await this.callClaude(prompt);
      const marketingPlan = JSON.parse(response.content);

      await query(
        'UPDATE listings SET marketing_plan = $1 WHERE id = $2',
        [JSON.stringify(marketingPlan), listingId]
      );

      return marketingPlan;
    } catch (error) {
      logger.error('Error creating marketing plan:', error);
      throw error;
    }
  }

  hasIssues(status) {
    return (
      status.performanceCheck.status === 'needs_attention' ||
      status.pricingCheck.status === 'needs_attention' ||
      status.marketingCheck.status === 'needs_attention'
    );
  }

  async escalateToAlex(status) {
    const alexService = require('./alex.service');
    if (!alexService.isEnabled()) return;

    const issues = [];

    if (status.performanceCheck.status === 'needs_attention') {
      issues.push(
        `Listing performance issues: ${status.performanceCheck.avgDaysOnMarket} avg DOM, ${status.performanceCheck.stalePercentage}% stale`
      );
    }
    if (status.pricingCheck.status === 'needs_attention') {
      issues.push(
        `${status.pricingCheck.count} listings need price review`
      );
    }
    if (status.marketingCheck.status === 'needs_attention') {
      issues.push('Marketing effectiveness below targets');
    }

    await alexService.handleManagerRequest({
      from: 'Listing Manager',
      priority: 'high',
      type: 'escalation',
      context: { department: 'listing', issues, status }
    });
  }

  async callClaude(prompt) {
    try {
      const response = await axios.post(
        'https://api.anthropic.com/v1/messages',
        {
          model: this.model,
          max_tokens: 1000,
          messages: [{ role: 'user', content: prompt }]
        },
        {
          headers: {
            'x-api-key': process.env.ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      logger.error('Claude API error:', error);
      throw error;
    }
  }

  isEnabled() {
    return this.enabled;
  }

  setEnabled(enabled) {
    this.enabled = enabled;
    logger.info(`${this.name} ${enabled ? 'enabled' : 'disabled'}`);
  }
}

module.exports = new ListingManagerService();