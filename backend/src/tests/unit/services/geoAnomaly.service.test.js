/**
 * Unit Tests: GeoAnomaly Service
 * Tests geographic anomaly detection for security monitoring
 */

const GeoAnomalyService = require('../../../services/geoAnomaly.service');
const SecurityEventService = require('../../../services/securityEvent.service');
const { pool } = require('../../../config/infrastructure/database');

// Mock dependencies
jest.mock('../../../config/database');
jest.mock('../../../services/securityEvent.service');

// Mock global fetch
global.fetch = jest.fn();

describe('GeoAnomalyService Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    console.error = jest.fn(); // Suppress console.error in tests
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getIpGeolocation()', () => {
    test('should return local data for localhost IPv4', async () => {
      const result = await GeoAnomalyService.getIpGeolocation('127.0.0.1');

      expect(result).toMatchObject({
        country: 'US',
        countryCode: 'US',
        region: 'CA',
        city: 'Local',
        lat: 0,
        lon: 0,
        timezone: 'America/Los_Angeles',
        isp: 'Local Network',
        isLocal: true,
      });
      expect(fetch).not.toHaveBeenCalled();
    });

    test('should return local data for localhost IPv6', async () => {
      const result = await GeoAnomalyService.getIpGeolocation('::1');

      expect(result.isLocal).toBe(true);
      expect(result.city).toBe('Local');
      expect(fetch).not.toHaveBeenCalled();
    });

    test('should return local data for private IP 192.168.x.x', async () => {
      const result = await GeoAnomalyService.getIpGeolocation('192.168.1.100');

      expect(result.isLocal).toBe(true);
      expect(fetch).not.toHaveBeenCalled();
    });

    test('should return local data for private IP 10.x.x.x', async () => {
      const result = await GeoAnomalyService.getIpGeolocation('10.0.0.1');

      expect(result.isLocal).toBe(true);
      expect(fetch).not.toHaveBeenCalled();
    });

    test('should handle null IP address', async () => {
      const result = await GeoAnomalyService.getIpGeolocation(null);

      expect(result.isLocal).toBe(true);
      expect(fetch).not.toHaveBeenCalled();
    });

    test('should call geolocation API for public IP', async () => {
      const mockResponse = {
        status: 'success',
        country: 'United States',
        countryCode: 'US',
        regionName: 'California',
        city: 'Los Angeles',
        lat: 34.0522,
        lon: -118.2437,
        timezone: 'America/Los_Angeles',
        isp: 'AT&T',
        query: '8.8.8.8',
      };

      fetch.mockResolvedValueOnce({
        json: async () => mockResponse,
      });

      const result = await GeoAnomalyService.getIpGeolocation('8.8.8.8');

      expect(fetch).toHaveBeenCalledWith(
        'http://ip-api.com/json/8.8.8.8?fields=status,message,country,countryCode,region,regionName,city,lat,lon,timezone,isp,query'
      );
      expect(result).toMatchObject({
        country: 'United States',
        countryCode: 'US',
        region: 'California',
        city: 'Los Angeles',
        lat: 34.0522,
        lon: -118.2437,
        timezone: 'America/Los_Angeles',
        isp: 'AT&T',
        query: '8.8.8.8',
        isLocal: false,
      });
    });

    test('should strip IPv6 prefix from IP address', async () => {
      fetch.mockResolvedValueOnce({
        json: async () => ({ status: 'success', country: 'US', countryCode: 'US', regionName: 'CA', city: 'LA', lat: 0, lon: 0, timezone: 'PST', isp: 'ISP', query: '1.2.3.4' }),
      });

      await GeoAnomalyService.getIpGeolocation('::ffff:1.2.3.4');

      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('1.2.3.4'));
    });

    test('should return null when API returns fail status', async () => {
      fetch.mockResolvedValueOnce({
        json: async () => ({ status: 'fail', message: 'Invalid IP' }),
      });

      const result = await GeoAnomalyService.getIpGeolocation('invalid-ip');

      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalledWith('Geolocation lookup failed:', 'Invalid IP');
    });

    test('should return null on fetch error', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await GeoAnomalyService.getIpGeolocation('8.8.8.8');

      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalledWith('Error getting IP geolocation:', expect.any(Error));
    });
  });

  describe('getUserTypicalLocations()', () => {
    test('should query database for user typical countries', async () => {
      const mockRows = [
        { country: 'United States', login_count: '15' },
        { country: 'Canada', login_count: '3' },
      ];

      pool.query.mockResolvedValueOnce({ rows: mockRows });

      const result = await GeoAnomalyService.getUserTypicalLocations('user-123');

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT DISTINCT'),
        ['user-123']
      );
      expect(result).toEqual([
        { country: 'United States', loginCount: 15 },
        { country: 'Canada', loginCount: 3 },
      ]);
    });

    test('should return empty array when no login history', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      const result = await GeoAnomalyService.getUserTypicalLocations('new-user');

      expect(result).toEqual([]);
    });

    test('should return empty array on database error', async () => {
      pool.query.mockRejectedValueOnce(new Error('DB connection failed'));

      const result = await GeoAnomalyService.getUserTypicalLocations('user-123');

      expect(result).toEqual([]);
      expect(console.error).toHaveBeenCalledWith('Error getting user typical locations:', expect.any(Error));
    });

    test('should query only last 30 days', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      await GeoAnomalyService.getUserTypicalLocations('user-123');

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining("INTERVAL '30 days'"),
        expect.any(Array)
      );
    });

    test('should limit to 5 countries', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      await GeoAnomalyService.getUserTypicalLocations('user-123');

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('LIMIT 5'),
        expect.any(Array)
      );
    });
  });

  describe('checkLoginAnomaly()', () => {
    test('should return no anomaly for local IP', async () => {
      const result = await GeoAnomalyService.checkLoginAnomaly('user-123', '127.0.0.1');

      expect(result.isAnomaly).toBe(false);
      expect(result.geo.isLocal).toBe(true);
      expect(result.typicalLocations).toEqual([]);
    });

    test('should return no anomaly when geolocation fails', async () => {
      fetch.mockRejectedValueOnce(new Error('API error'));

      const result = await GeoAnomalyService.checkLoginAnomaly('user-123', '8.8.8.8');

      expect(result.isAnomaly).toBe(false);
      expect(result.geo).toBeNull();
    });

    test('should return no anomaly for first-time login (no history)', async () => {
      fetch.mockResolvedValueOnce({
        json: async () => ({ status: 'success', country: 'France', countryCode: 'FR', regionName: 'IDF', city: 'Paris', lat: 0, lon: 0, timezone: 'CET', isp: 'ISP', query: '1.2.3.4' }),
      });
      pool.query.mockResolvedValueOnce({ rows: [] });

      const result = await GeoAnomalyService.checkLoginAnomaly('new-user', '1.2.3.4');

      expect(result.isAnomaly).toBe(false);
      expect(result.geo.country).toBe('France');
      expect(result.typicalLocations).toEqual([]);
    });

    test('should return no anomaly when country matches typical location', async () => {
      fetch.mockResolvedValueOnce({
        json: async () => ({ status: 'success', country: 'United States', countryCode: 'US', regionName: 'CA', city: 'LA', lat: 0, lon: 0, timezone: 'PST', isp: 'ISP', query: '1.2.3.4' }),
      });
      pool.query.mockResolvedValueOnce({
        rows: [{ country: 'United States', login_count: '10' }],
      });

      const result = await GeoAnomalyService.checkLoginAnomaly('user-123', '1.2.3.4');

      expect(result.isAnomaly).toBe(false);
      expect(result.geo.country).toBe('United States');
      expect(result.typicalLocations).toHaveLength(1);
    });

    test('should detect anomaly when country does not match typical locations', async () => {
      fetch.mockResolvedValueOnce({
        json: async () => ({ status: 'success', country: 'Russia', countryCode: 'RU', regionName: 'Moscow', city: 'Moscow', lat: 0, lon: 0, timezone: 'MSK', isp: 'ISP', query: '1.2.3.4' }),
      });
      pool.query.mockResolvedValueOnce({
        rows: [{ country: 'United States', login_count: '15' }],
      });

      const result = await GeoAnomalyService.checkLoginAnomaly('user-123', '1.2.3.4');

      expect(result.isAnomaly).toBe(true);
      expect(result.geo.country).toBe('Russia');
      expect(result.expectedCountry).toBe('United States');
      expect(result.typicalLocations).toHaveLength(1);
    });

    test('should handle errors gracefully', async () => {
      fetch.mockRejectedValueOnce(new Error('Unexpected error'));

      const result = await GeoAnomalyService.checkLoginAnomaly('user-123', '8.8.8.8');

      expect(result.isAnomaly).toBe(false);
      expect(result.geo).toBeNull();
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('logLoginWithGeo()', () => {
    test('should log geo anomaly when detected', async () => {
      const mockReq = {
        ip: '1.2.3.4',
      };
      const mockUser = { id: 'user-123', email: 'test@example.com' };

      fetch.mockResolvedValueOnce({
        json: async () => ({ status: 'success', country: 'China', countryCode: 'CN', regionName: 'Beijing', city: 'Beijing', lat: 0, lon: 0, timezone: 'CST', isp: 'ISP', query: '1.2.3.4' }),
      });
      pool.query.mockResolvedValueOnce({
        rows: [{ country: 'United States', login_count: '20' }],
      });
      SecurityEventService.logGeoAnomaly = jest.fn();

      const result = await GeoAnomalyService.logLoginWithGeo(mockReq, mockUser);

      expect(result.isAnomaly).toBe(true);
      expect(SecurityEventService.logGeoAnomaly).toHaveBeenCalledWith(
        mockReq,
        mockUser,
        'China',
        'United States'
      );
    });

    test('should not log anomaly when location is typical', async () => {
      const mockReq = { ip: '1.2.3.4' };
      const mockUser = { id: 'user-123' };

      fetch.mockResolvedValueOnce({
        json: async () => ({ status: 'success', country: 'United States', countryCode: 'US', regionName: 'CA', city: 'LA', lat: 0, lon: 0, timezone: 'PST', isp: 'ISP', query: '1.2.3.4' }),
      });
      pool.query.mockResolvedValueOnce({
        rows: [{ country: 'United States', login_count: '10' }],
      });
      SecurityEventService.logGeoAnomaly = jest.fn();

      const result = await GeoAnomalyService.logLoginWithGeo(mockReq, mockUser);

      expect(result.isAnomaly).toBe(false);
      expect(SecurityEventService.logGeoAnomaly).not.toHaveBeenCalled();
    });

    test('should get IP from connection.remoteAddress if req.ip missing', async () => {
      const mockReq = {
        connection: { remoteAddress: '127.0.0.1' },
      };
      const mockUser = { id: 'user-123' };

      const result = await GeoAnomalyService.logLoginWithGeo(mockReq, mockUser);

      expect(result.geo.isLocal).toBe(true);
    });

    test('should handle errors gracefully', async () => {
      const mockReq = { ip: '8.8.8.8' };
      const mockUser = { id: 'user-123' };

      fetch.mockRejectedValueOnce(new Error('API error'));

      const result = await GeoAnomalyService.logLoginWithGeo(mockReq, mockUser);

      expect(result.isAnomaly).toBe(false);
      expect(result.geo).toBeNull();
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('getUserAnomalies()', () => {
    test('should query security events for geo anomalies', async () => {
      const mockRows = [
        { event_type: 'geo_anomaly', created_at: new Date() },
        { event_type: 'geo_anomaly', created_at: new Date() },
      ];

      pool.query.mockResolvedValueOnce({ rows: mockRows });

      const result = await GeoAnomalyService.getUserAnomalies('user-123', 30);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining("event_type = 'geo_anomaly'"),
        ['user-123', 30]
      );
      expect(result).toHaveLength(2);
    });

    test('should default to 30 days if not specified', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      await GeoAnomalyService.getUserAnomalies('user-123');

      expect(pool.query).toHaveBeenCalledWith(
        expect.any(String),
        ['user-123', 30]
      );
    });

    test('should return empty array on database error', async () => {
      pool.query.mockRejectedValueOnce(new Error('DB error'));

      const result = await GeoAnomalyService.getUserAnomalies('user-123');

      expect(result).toEqual([]);
      expect(console.error).toHaveBeenCalled();
    });

    test('should order results by created_at descending', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      await GeoAnomalyService.getUserAnomalies('user-123', 7);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY created_at DESC'),
        ['user-123', 7]
      );
    });
  });
});
