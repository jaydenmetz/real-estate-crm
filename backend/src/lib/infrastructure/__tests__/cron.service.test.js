/**
 * Unit Tests: Cron Service
 * Tests scheduled task service initialization
 */

const cronService = require('../infrastructure/cron.service');
const logger = require('../../../utils/logger');

// Mock logger
jest.mock('../../../utils/logger');

describe('CronService Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('start()', () => {
    test('should log initialization message', () => {
      cronService.start();

      expect(logger.info).toHaveBeenCalledWith('✅ Cron service initialized (no active jobs)');
    });

    test('should be callable multiple times', () => {
      cronService.start();
      cronService.start();

      expect(logger.info).toHaveBeenCalledTimes(2);
    });

    test('should return undefined', () => {
      const result = cronService.start();

      expect(result).toBeUndefined();
    });
  });

  describe('Service Structure', () => {
    test('should export start method', () => {
      expect(cronService).toHaveProperty('start');
      expect(typeof cronService.start).toBe('function');
    });

    test('should not have other methods (placeholder service)', () => {
      const methods = Object.keys(cronService);
      expect(methods).toEqual(['start']);
    });
  });
});
