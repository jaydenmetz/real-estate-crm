

// backend/src/services/ai/agents/showingCoordinator.js

const axios = require('axios');
const logger = require('../../../utils/logger');
const { query } = require('../../../config/database');
const Appointment = require('../../../models/Appointment');
const Listing = require('../../../models/Listing');
const twilioClient = require('../../../config/twilio');
const emailService = require('../../../services/email.service');

/**
 * AI Agent: Showing Coordinator
 * Manages scheduling, confirmations, and reminders for property showings.
 */
class ShowingCoordinatorAgent {
  constructor() {
    this.name = 'Showing Coordinator';
    this.model = 'claude-3-sonnet-20240307';
    this.enabled = true;
    this.reminderLeadTimeMinutes = 60; // send reminder 1 hour before show
  }

  /**
   * Coordinate a new showing: schedule, confirm, and notify parties.
   * @param {Object} data - { listingId, clientId, preferredTimes: [ISO strings] }
   */
  async scheduleShowing(data) {
    try {
      logger.info(`Scheduling showing for listing ${data.listingId} and client ${data.clientId}`);

      // Pick best time via AI
      const chosenTime = await this.selectBestTime(data.preferredTimes);

      // Create appointment record
      const appointment = await Appointment.create({
        title: `Showing: ${data.listingId}`,
        description: `Property showing for listing ${data.listingId}`,
        appointmentDate: chosenTime.split('T')[0],
        startTime: chosenTime,
        endTime: new Date(new Date(chosenTime).getTime() + 30 * 60000).toISOString(), // +30min
        clientId: data.clientId,
        status: 'Scheduled'
      });

      // Notify client and agent
      await this.sendConfirmation(appointment);

      // Schedule reminder
      await this.scheduleReminder(appointment);

      return appointment;
    } catch (err) {
      logger.error('Error in scheduleShowing:', err);
      throw err;
    }
  }

  /**
   * Use AI to pick the best time from preferred options.
   * @param {string[]} times - ISO datetime strings
   * @returns {Promise<string>} chosen ISO datetime string
   */
  async selectBestTime(times) {
    const prompt = `
      You are a showing coordinator AI. Given these preferred times:
      ${JSON.stringify(times)}
      Choose the single best time considering typical availability and convenience.
      Respond with that ISO datetime only.
    `;
    const resp = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: this.model,
        max_tokens: 50,
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
    return resp.data.completion?.trim() || times[0];
  }

  /**
   * Send confirmation notifications via SMS and email.
   * @param {Object} appointment
   */
  async sendConfirmation(appointment) {
    const when = `${appointment.date} at ${appointment.startTime}`;
    const listing = await Listing.findById(appointment.listingId);
    const message = `Your showing is confirmed for ${when}. Address: ${listing.address}`;
    
    // Send SMS to client
    if (appointment.clientId) {
      const clientCell = await query(
        'SELECT phone FROM clients WHERE id = $1', [appointment.clientId]
      ).then(r => r.rows[0]?.phone);
      if (clientCell) {
        await twilioClient.messages.create({
          body: message,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: clientCell
        });
      }
    }

    // Send email to agent
    if (listing.agentId) {
      const agentEmail = await query(
        'SELECT email FROM agents WHERE id = $1', [listing.agentId]
      ).then(r => r.rows[0]?.email);
      if (agentEmail) {
        await emailService.send({
          to: agentEmail,
          subject: 'Showing Confirmed',
          text: message
        });
      }
    }

    await this.logEvent(appointment.id, `Confirmation sent: ${message}`);
  }

  /**
   * Schedule a reminder via Redis or job scheduler.
   * @param {Object} appointment
   */
  async scheduleReminder(appointment) {
    const remindAt = new Date(new Date(appointment.startTime).getTime() - this.reminderLeadTimeMinutes * 60000).toISOString();
    const redis = require('../../../config/redis').getRedisClient();
    await redis.zAdd('showing_reminders', { score: Date.parse(remindAt), value: appointment.id });
    logger.info(`Scheduled reminder for appointment ${appointment.id} at ${remindAt}`);
  }

  /**
   * Send reminder notifications.
   * Called by a cron job based on Redis schedule.
   * @param {Object} appointment
   */
  async sendReminder(appointment) {
    const message = `Reminder: You have a showing today at ${appointment.startTime}.`;
    // Similar SMS/email logic as confirmation...
    await this.sendConfirmation(appointment);
    await this.logEvent(appointment.id, 'Reminder sent');
  }

  /**
   * Log coordinator events to database.
   * @param {string} appointmentId
   * @param {string} note
   */
  async logEvent(appointmentId, note) {
    await query(
      `INSERT INTO showing_logs (id, appointment_id, note, created_at)
       VALUES ($1, $2, $3, NOW())`,
      [`log_${Date.now()}`, appointmentId, note]
    );
    logger.info(`Logged event for appointment ${appointmentId}: ${note}`);
  }

  isEnabled() {
    return this.enabled;
  }

  setEnabled(enabled) {
    this.enabled = enabled;
    logger.info(`${this.name} ${enabled ? 'enabled' : 'disabled'}`);
  }
}

module.exports = new ShowingCoordinatorAgent();