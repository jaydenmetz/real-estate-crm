/**
 * Geographic Anomaly Detection Service
 * Detects suspicious login locations based on IP geolocation
 *
 * NOTE: Uses free IP geolocation API (ip-api.com)
 * For production at scale, consider paid service (MaxMind, IPStack, etc.)
 *
 * Free tier limits: 45 requests/minute
 */

const { pool } = require('../config/database');
const SecurityEventService = require('./securityEvent.service');

class GeoAnomalyService {
  /**
   * Get geolocation data for an IP address
   * Uses free ip-api.com service
   */
  static async getIpGeolocation(ipAddress) {
    try {
      // Skip localhost/private IPs
      if (!ipAddress || ipAddress === '::1' || ipAddress.startsWith('127.') || ipAddress.startsWith('192.168.') || ipAddress.startsWith('10.')) {
        return {
          country: 'US',
          countryCode: 'US',
          region: 'CA',
          city: 'Local',
          lat: 0,
          lon: 0,
          timezone: 'America/Los_Angeles',
          isp: 'Local Network',
          isLocal: true,
        };
      }

      // Remove IPv6 prefix if present (::ffff:x.x.x.x)
      const cleanIp = ipAddress.replace('::ffff:', '');

      // Call free geolocation API
      const response = await fetch(`http://ip-api.com/json/${cleanIp}?fields=status,message,country,countryCode,region,regionName,city,lat,lon,timezone,isp,query`);
      const data = await response.json();

      if (data.status === 'fail') {
        console.error('Geolocation lookup failed:', data.message);
        return null;
      }

      return {
        country: data.country,
        countryCode: data.countryCode,
        region: data.regionName,
        city: data.city,
        lat: data.lat,
        lon: data.lon,
        timezone: data.timezone,
        isp: data.isp,
        query: data.query,
        isLocal: false,
      };
    } catch (error) {
      console.error('Error getting IP geolocation:', error);
      return null;
    }
  }

  /**
   * Get user's typical login locations (last 30 days)
   */
  static async getUserTypicalLocations(userId) {
    try {
      const result = await pool.query(`
        SELECT DISTINCT
          metadata->>'detected_country' as country,
          COUNT(*) as login_count
        FROM security_events
        WHERE user_id = $1
          AND event_type = 'login_success'
          AND created_at > NOW() - INTERVAL '30 days'
          AND metadata->>'detected_country' IS NOT NULL
        GROUP BY metadata->>'detected_country'
        ORDER BY login_count DESC
        LIMIT 5
      `, [userId]);

      return result.rows.map(row => ({
        country: row.country,
        loginCount: parseInt(row.login_count),
      }));
    } catch (error) {
      console.error('Error getting user typical locations:', error);
      return [];
    }
  }

  /**
   * Check if login location is anomalous
   * Returns { isAnomaly: boolean, geo: object, typicalLocations: array }
   */
  static async checkLoginAnomaly(userId, ipAddress) {
    try {
      // Get geolocation for current IP
      const geo = await this.getIpGeolocation(ipAddress);
      if (!geo) {
        return { isAnomaly: false, geo: null, typicalLocations: [] };
      }

      // Skip anomaly detection for local IPs
      if (geo.isLocal) {
        return { isAnomaly: false, geo, typicalLocations: [] };
      }

      // Get user's typical login countries
      const typicalLocations = await this.getUserTypicalLocations(userId);

      // If user has no login history, not an anomaly (first login)
      if (typicalLocations.length === 0) {
        return { isAnomaly: false, geo, typicalLocations: [] };
      }

      // Check if current country is in typical locations
      const isTypicalLocation = typicalLocations.some(
        loc => loc.country === geo.country
      );

      return {
        isAnomaly: !isTypicalLocation,
        geo,
        typicalLocations,
        expectedCountry: typicalLocations[0]?.country || 'Unknown',
      };
    } catch (error) {
      console.error('Error checking login anomaly:', error);
      return { isAnomaly: false, geo: null, typicalLocations: [] };
    }
  }

  /**
   * Log login with geolocation data
   * Call this after successful login to track location
   */
  static async logLoginWithGeo(req, user) {
    try {
      const ipAddress = req.ip || req.connection?.remoteAddress;

      // Check for anomaly
      const anomalyCheck = await this.checkLoginAnomaly(user.id, ipAddress);

      // If anomaly detected, log it
      if (anomalyCheck.isAnomaly) {
        await SecurityEventService.logGeoAnomaly(
          req,
          user,
          anomalyCheck.geo.country,
          anomalyCheck.expectedCountry
        );
      }

      // Update login success event with geolocation metadata
      // This is done via metadata field in the existing login_success event
      return {
        isAnomaly: anomalyCheck.isAnomaly,
        geo: anomalyCheck.geo,
        typicalLocations: anomalyCheck.typicalLocations,
      };
    } catch (error) {
      console.error('Error logging login with geo:', error);
      return { isAnomaly: false, geo: null, typicalLocations: [] };
    }
  }

  /**
   * Get all geographic anomalies for a user
   */
  static async getUserAnomalies(userId, daysBack = 30) {
    try {
      const result = await pool.query(`
        SELECT *
        FROM security_events
        WHERE user_id = $1
          AND event_type = 'geo_anomaly'
          AND created_at > NOW() - INTERVAL '1 day' * $2
        ORDER BY created_at DESC
      `, [userId, daysBack]);

      return result.rows;
    } catch (error) {
      console.error('Error getting user anomalies:', error);
      return [];
    }
  }
}

module.exports = GeoAnomalyService;
