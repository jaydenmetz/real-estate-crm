const logger = require('../utils/logger');

/**
 * IP Geolocation Service
 * Uses ip-api.com free tier (45 requests/minute, no API key required)
 *
 * API Documentation: https://ip-api.com/docs/api:json
 *
 * Free tier limits:
 * - 45 requests per minute
 * - No API key required
 * - HTTP only (HTTPS requires paid plan)
 *
 * Response format:
 * {
 *   status: 'success',
 *   country: 'United States',
 *   countryCode: 'US',
 *   region: 'CA',
 *   regionName: 'California',
 *   city: 'Los Angeles',
 *   zip: '90012',
 *   lat: 34.0522,
 *   lon: -118.2437,
 *   timezone: 'America/Los_Angeles',
 *   isp: 'Charter Communications',
 *   org: 'Spectrum',
 *   as: 'AS20001 Charter Communications Inc'
 * }
 */
class IpGeolocationService {
  /**
   * Get location data from IP address
   * @param {string} ipAddress - IP address to lookup
   * @returns {Promise<object|null>} Location data or null if failed
   */
  static async getLocation(ipAddress) {
    try {
      // Skip localhost/private IPs
      if (!ipAddress || ipAddress === '::1' || ipAddress.startsWith('127.') || ipAddress.startsWith('192.168.') || ipAddress.startsWith('10.')) {
        logger.info('Skipping geolocation for localhost/private IP:', ipAddress);
        return {
          city: 'localhost',
          region: null,
          country: null,
          lat: null,
          lng: null,
          timezone: null,
        };
      }

      // Call ip-api.com free API
      const response = await fetch(`http://ip-api.com/json/${ipAddress}?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp`);

      if (!response.ok) {
        logger.error('IP geolocation API request failed:', response.statusText);
        return null;
      }

      const data = await response.json();

      if (data.status === 'fail') {
        logger.warn('IP geolocation failed:', data.message || 'Unknown error');
        return null;
      }

      // Transform to our schema
      return {
        city: data.city || null,
        region: data.regionName || null,
        country: data.countryCode || null,
        lat: data.lat || null,
        lng: data.lon || null,
        timezone: data.timezone || null,
        isp: data.isp || null,
      };
    } catch (error) {
      logger.error('IP geolocation service error:', error);
      return null;
    }
  }

  /**
   * Get location with caching (to avoid hitting rate limits)
   * Uses in-memory cache with 24-hour TTL
   */
  static locationCache = new Map();
  static CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

  static async getLocationCached(ipAddress) {
    const cached = this.locationCache.get(ipAddress);

    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      logger.info('Using cached location for IP:', ipAddress);
      return cached.data;
    }

    const location = await this.getLocation(ipAddress);

    if (location) {
      this.locationCache.set(ipAddress, {
        data: location,
        timestamp: Date.now(),
      });
    }

    return location;
  }

  /**
   * Format location for display
   * @param {object} location - Location data from getLocation()
   * @returns {string} Formatted location string
   */
  static formatLocation(location) {
    if (!location) return 'Unknown';

    const parts = [];

    if (location.city) parts.push(location.city);
    if (location.region) parts.push(location.region);
    if (location.country) parts.push(location.country);

    return parts.length > 0 ? parts.join(', ') : 'Unknown';
  }

  /**
   * Detect if login is from unusual location
   * @param {string} userId - User ID
   * @param {object} currentLocation - Current login location
   * @returns {Promise<boolean>} True if location is suspicious
   */
  static async isAnomalousLocation(userId, currentLocation) {
    // Future: Query user's past login locations from security_events
    // For now, just a placeholder
    //
    // Logic:
    // 1. Get user's last 10 login locations
    // 2. If current location is >500 miles from all of them, flag as suspicious
    // 3. If current country differs from usual country, flag as suspicious

    return false; // TODO: Implement anomaly detection
  }

  /**
   * Clear cache (useful for testing)
   */
  static clearCache() {
    this.locationCache.clear();
  }
}

module.exports = IpGeolocationService;
