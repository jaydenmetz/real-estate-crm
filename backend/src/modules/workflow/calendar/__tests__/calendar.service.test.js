/**
 * Unit Tests: Calendar Service
 * Tests calendar integration, meeting link generation, and ICS file creation
 */

const calendarService = require('../services/calendar.service');
const logger = require('../../../../utils/logger');
const crypto = require('crypto');

// Mock logger and crypto
jest.mock('../../../../utils/logger');
jest.mock('crypto');

describe('CalendarService Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock crypto.randomBytes
    crypto.randomBytes = jest.fn()
      .mockReturnValueOnce(Buffer.from('abc123')) // First call (meetingId)
      .mockReturnValueOnce(Buffer.from('pass')); // Second call (password)
  });

  describe('generateVideoMeetingLink()', () => {
    test('should generate Google Meet link by default', async () => {
      const details = {
        title: 'Property Showing - 123 Main St',
      };

      const result = await calendarService.generateVideoMeetingLink(details);

      expect(result).toMatchObject({
        provider: 'meet',
        url: expect.stringContaining('https://meet.google.com/'),
        meetingId: expect.any(String),
        password: expect.any(String),
        instructions: expect.stringContaining('Join the video meeting'),
      });
    });

    test('should generate unique meeting IDs', async () => {
      crypto.randomBytes = jest.fn()
        .mockReturnValueOnce(Buffer.from('meeting1'))
        .mockReturnValueOnce(Buffer.from('pass1'))
        .mockReturnValueOnce(Buffer.from('meeting2'))
        .mockReturnValueOnce(Buffer.from('pass2'));

      const result1 = await calendarService.generateVideoMeetingLink({ title: 'Meeting 1' });
      const result2 = await calendarService.generateVideoMeetingLink({ title: 'Meeting 2' });

      expect(result1.meetingId).not.toBe(result2.meetingId);
      expect(result1.password).not.toBe(result2.password);
    });

    test('should log meeting generation', async () => {
      const details = { title: 'Client Consultation' };

      await calendarService.generateVideoMeetingLink(details);

      expect(logger.info).toHaveBeenCalledWith('Generated video meeting link:', expect.objectContaining({
        provider: 'meet',
        appointmentTitle: 'Client Consultation',
      }));
    });

    test('should handle errors gracefully', async () => {
      crypto.randomBytes = jest.fn().mockImplementation(() => {
        throw new Error('Crypto failure');
      });

      await expect(
        calendarService.generateVideoMeetingLink({ title: 'Test' })
      ).rejects.toThrow('Crypto failure');

      expect(logger.error).toHaveBeenCalledWith('Failed to generate video meeting link:', expect.any(Error));
    });
  });

  describe('sendInvites()', () => {
    test('should send invites to all attendees', async () => {
      const options = {
        appointment: { _id: 'appt-123' },
        attendees: [
          { email: 'client1@example.com', firstName: 'John', lastName: 'Doe' },
          { email: 'client2@example.com', firstName: 'Jane', lastName: 'Smith' },
        ],
        includeVideoLink: true,
      };

      const result = await calendarService.sendInvites(options);

      expect(result.success).toBe(true);
      expect(result.invitesSent).toBe(2);
      expect(result.invites).toHaveLength(2);
      expect(result.invites[0]).toMatchObject({
        to: 'client1@example.com',
        status: 'pending',
        sentAt: expect.any(Date),
      });
    });

    test('should handle empty attendees list', async () => {
      const options = {
        appointment: { _id: 'appt-456' },
        attendees: [],
        includeVideoLink: false,
      };

      const result = await calendarService.sendInvites(options);

      expect(result.success).toBe(true);
      expect(result.invitesSent).toBe(0);
      expect(result.invites).toHaveLength(0);
    });

    test('should log invite sending', async () => {
      const options = {
        appointment: { _id: 'appt-789' },
        attendees: [{ email: 'test@example.com' }],
        includeVideoLink: false,
      };

      await calendarService.sendInvites(options);

      expect(logger.info).toHaveBeenCalledWith('Sending calendar invites:', {
        appointmentId: 'appt-789',
        attendeeCount: 1,
        includeVideoLink: false,
      });
    });

    test('should handle errors when sending invites', async () => {
      const options = {
        appointment: { _id: null }, // Force error
        attendees: [{ email: 'test@example.com' }],
      };

      // Force an error by making map throw
      options.attendees = null;

      await expect(
        calendarService.sendInvites(options)
      ).rejects.toThrow();

      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('sendUpdateNotifications()', () => {
    test('should send update notifications for time changes', async () => {
      const options = {
        appointment: { _id: 'appt-update-123' },
        attendees: [
          { email: 'user1@example.com' },
          { email: 'user2@example.com' },
        ],
        changeType: 'time_changed',
      };

      const result = await calendarService.sendUpdateNotifications(options);

      expect(result.success).toBe(true);
      expect(result.notificationsSent).toBe(2);
      expect(result.notifications[0].type).toBe('time_changed');
    });

    test('should handle different change types', async () => {
      const changeTypes = ['time_changed', 'location_changed', 'details_updated'];

      for (const changeType of changeTypes) {
        const result = await calendarService.sendUpdateNotifications({
          appointment: { _id: 'appt-123' },
          attendees: [{ email: 'test@example.com' }],
          changeType,
        });

        expect(result.notifications[0].type).toBe(changeType);
      }
    });

    test('should log update notifications', async () => {
      const options = {
        appointment: { _id: 'appt-log-test' },
        attendees: [{ email: 'user@example.com' }],
        changeType: 'location_changed',
      };

      await calendarService.sendUpdateNotifications(options);

      expect(logger.info).toHaveBeenCalledWith('Sending update notifications:', {
        appointmentId: 'appt-log-test',
        changeType: 'location_changed',
        attendeeCount: 1,
      });
    });
  });

  describe('sendCancellationNotices()', () => {
    test('should send cancellation notices with reason', async () => {
      const options = {
        appointment: { _id: 'appt-cancel-123' },
        attendees: [
          { email: 'client@example.com' },
        ],
        reason: 'Client requested rescheduling',
      };

      const result = await calendarService.sendCancellationNotices(options);

      expect(result.success).toBe(true);
      expect(result.noticesSent).toBe(1);
      expect(result.notices[0]).toMatchObject({
        to: 'client@example.com',
        reason: 'Client requested rescheduling',
        sentAt: expect.any(Date),
      });
    });

    test('should handle multiple attendees for cancellation', async () => {
      const attendees = Array.from({ length: 5 }, (_, i) => ({
        email: `attendee${i}@example.com`,
      }));

      const result = await calendarService.sendCancellationNotices({
        appointment: { _id: 'appt-999' },
        attendees,
        reason: 'Weather conditions',
      });

      expect(result.noticesSent).toBe(5);
      expect(result.notices).toHaveLength(5);
    });
  });

  describe('sendReminder()', () => {
    test('should send appointment reminders', async () => {
      const options = {
        appointment: { _id: 'appt-reminder-123' },
        attendees: [{ email: 'client@example.com' }],
        reminderType: '1_hour_before',
      };

      const result = await calendarService.sendReminder(options);

      expect(result.success).toBe(true);
      expect(result.remindersSent).toBe(1);
      expect(result.reminders[0].reminderType).toBe('1_hour_before');
    });

    test('should support multiple reminder types', async () => {
      const reminderTypes = ['1_hour_before', '24_hours_before', '1_week_before'];

      for (const reminderType of reminderTypes) {
        const result = await calendarService.sendReminder({
          appointment: { _id: 'appt-123' },
          attendees: [{ email: 'test@example.com' }],
          reminderType,
        });

        expect(result.reminders[0].reminderType).toBe(reminderType);
      }
    });
  });

  describe('generateICS()', () => {
    test('should generate valid ICS calendar file', () => {
      const appointment = {
        _id: 'appt-ics-123',
        title: 'Property Showing',
        description: 'Showing at 123 Main St',
        startTime: '2025-10-05T14:00:00.000Z',
        endTime: '2025-10-05T15:00:00.000Z',
        location: '123 Main St, Tehachapi, CA',
        attendees: [
          { email: 'buyer@example.com', firstName: 'John', lastName: 'Buyer' },
        ],
      };

      const ics = calendarService.generateICS(appointment);

      expect(ics).toContain('BEGIN:VCALENDAR');
      expect(ics).toContain('END:VCALENDAR');
      expect(ics).toContain('BEGIN:VEVENT');
      expect(ics).toContain('END:VEVENT');
      expect(ics).toContain('SUMMARY:Property Showing');
      expect(ics).toContain('LOCATION:123 Main St, Tehachapi, CA');
      expect(ics).toContain('ATTENDEE;CN="John Buyer"');
      expect(ics).toContain('mailto:buyer@example.com');
    });

    test('should include video meeting link in description', () => {
      const appointment = {
        _id: 'appt-video-123',
        title: 'Virtual Consultation',
        description: 'Discuss property options',
        startTime: '2025-10-05T10:00:00.000Z',
        endTime: '2025-10-05T11:00:00.000Z',
        videoMeetingLink: {
          url: 'https://meet.google.com/abc-defg-hij',
        },
      };

      const ics = calendarService.generateICS(appointment);

      expect(ics).toContain('Video Link: https://meet.google.com/abc-defg-hij');
    });

    test('should handle appointment without attendees', () => {
      const appointment = {
        _id: 'appt-solo-123',
        title: 'Site Visit',
        startTime: '2025-10-06T09:00:00.000Z',
        endTime: '2025-10-06T10:00:00.000Z',
      };

      const ics = calendarService.generateICS(appointment);

      expect(ics).toContain('SUMMARY:Site Visit');
      expect(ics).not.toContain('ATTENDEE');
      expect(ics).toContain('LOCATION:TBD');
    });

    test('should include 1-hour reminder alarm', () => {
      const appointment = {
        _id: 'appt-alarm-123',
        title: 'Meeting',
        startTime: '2025-10-07T14:00:00.000Z',
        endTime: '2025-10-07T15:00:00.000Z',
      };

      const ics = calendarService.generateICS(appointment);

      expect(ics).toContain('BEGIN:VALARM');
      expect(ics).toContain('TRIGGER:-PT1H');
      expect(ics).toContain('ACTION:DISPLAY');
      expect(ics).toContain('END:VALARM');
    });

    test('should format dates correctly for ICS standard', () => {
      const appointment = {
        _id: 'appt-date-format-123',
        title: 'Test',
        startTime: '2025-10-05T14:30:00.000Z',
        endTime: '2025-10-05T15:30:00.000Z',
      };

      const ics = calendarService.generateICS(appointment);

      // ICS format: YYYYMMDDTHHMMSSZ (no hyphens, colons, or milliseconds)
      expect(ics).toMatch(/DTSTART:20251005T\d{6}Z/);
      expect(ics).toMatch(/DTEND:20251005T\d{6}Z/);
    });
  });

  describe('syncWithGoogleCalendar()', () => {
    test('should return mock success message', async () => {
      const options = {
        appointmentId: 'appt-123',
        userEmail: 'agent@example.com',
      };

      const result = await calendarService.syncWithGoogleCalendar(options);

      expect(result.success).toBe(true);
      expect(result.message).toContain('not implemented');
      expect(logger.info).toHaveBeenCalledWith('Syncing with Google Calendar:', options);
    });
  });

  describe('syncWithOutlook()', () => {
    test('should return mock success message', async () => {
      const options = {
        appointmentId: 'appt-456',
        userEmail: 'agent@example.com',
      };

      const result = await calendarService.syncWithOutlook(options);

      expect(result.success).toBe(true);
      expect(result.message).toContain('not implemented');
      expect(logger.info).toHaveBeenCalledWith('Syncing with Outlook:', options);
    });
  });

  describe('calculateTravelTime()', () => {
    test('should calculate mock travel time', () => {
      const origin = '123 Main St, Tehachapi, CA';
      const destination = '456 Oak Ave, Bakersfield, CA';

      const result = calendarService.calculateTravelTime(origin, destination);

      expect(result).toMatchObject({
        distance: expect.stringMatching(/\d+\.\d+ km/),
        duration: expect.any(Number),
        durationText: expect.stringMatching(/\d+ minutes/),
        trafficConditions: 'normal',
      });
    });

    test('should return duration between 8 and 52 minutes', () => {
      // Distance: 5-35 km, Speed: 40 km/h
      // Min: (5/40)*60 = 7.5 min (ceil = 8)
      // Max: (35/40)*60 = 52.5 min (ceil = 53)
      const results = [];

      for (let i = 0; i < 10; i++) {
        const result = calendarService.calculateTravelTime('A', 'B');
        results.push(result.duration);
      }

      results.forEach(duration => {
        expect(duration).toBeGreaterThanOrEqual(8);
        expect(duration).toBeLessThanOrEqual(53);
      });
    });

    test('should include distance in kilometers', () => {
      const result = calendarService.calculateTravelTime('Start', 'End');

      expect(result.distance).toMatch(/\d+\.\d+ km/);
      const distanceValue = parseFloat(result.distance);
      expect(distanceValue).toBeGreaterThanOrEqual(5);
      expect(distanceValue).toBeLessThanOrEqual(35);
    });
  });

  describe('Meeting Providers Configuration', () => {
    test('should have Google Meet enabled by default', () => {
      const service = calendarService;

      expect(service.meetingProviders.meet.enabled).toBe(true);
      expect(service.meetingProviders.meet.baseUrl).toBe('https://meet.google.com/');
    });

    test('should have Zoom and Teams disabled by default', () => {
      const service = calendarService;

      expect(service.meetingProviders.zoom.enabled).toBe(false);
      expect(service.meetingProviders.teams.enabled).toBe(false);
    });

    test('should have correct base URLs for all providers', () => {
      const service = calendarService;

      expect(service.meetingProviders.zoom.baseUrl).toBe('https://zoom.us/j/');
      expect(service.meetingProviders.meet.baseUrl).toBe('https://meet.google.com/');
      expect(service.meetingProviders.teams.baseUrl).toBe('https://teams.microsoft.com/meet/');
    });
  });
});
