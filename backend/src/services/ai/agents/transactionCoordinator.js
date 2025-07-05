

// backend/src/services/ai/agents/transactionCoordinator.js

const axios = require('axios');
const logger = require('../../../utils/logger');
const Escrow = require('../../../models/Escrow');
const twilioClient = require('../../../config/twilio');
const emailService = require('../../../services/email.service');
const { getRedisClient } = require('../../../config/redis');
const { v4: uuidv4 } = require('uuid');

/**
 * AI Agent: Transaction Coordinator
 * Orchestrates closing tasks, monitors deadlines, and sends reminders
 * to buyers, sellers, and service providers.
 */
class TransactionCoordinatorAgent {
  constructor() {
    this.name = 'Transaction Coordinator';
    this.model = 'claude-3-sonnet-20240307';
    this.enabled = true;
    // lead time in hours before task deadline to send reminder
    this.reminderLeadTimeHours = 24;
  }

  /**
   * Entry point: coordinate a new or updated escrow
   * @param {Object} escrowData - full escrow record including checklist items
   */
  async coordinate(escrowData) {
    const start = Date.now();
    try {
      logger.info(`Coordinating escrow ${escrowData.id}`);

      // Generate detailed task plan from AI
      const plan = await this.generateTaskPlan(escrowData);

      // Persist and schedule each task
      for (const task of plan.tasks || []) {
        await this.scheduleTask(escrowData.id, task);
      }

      const duration = ((Date.now() - start) / 1000).toFixed(2);
      logger.info(`Coordination for escrow ${escrowData.id} completed in ${duration}s`);
      return { escrowId: escrowData.id, tasksScheduled: plan.tasks.length };
    } catch (err) {
      logger.error('Error in TransactionCoordinatorAgent.coordinate:', err);
      throw err;
    }
  }

  /**
   * Use AI to generate a checklist of closing tasks with deadlines and assignees.
   * @param {Object} escrowData
   * @returns {Promise<{ tasks: Array<{ item: string, dueDate: string, assignee: string }> }>}
   */
  async generateTaskPlan(escrowData) {
    const prompt = `
      You are a transaction coordinator. Given this escrow data:
      ${JSON.stringify(escrowData)}

      Generate a JSON array named "tasks" listing each closing task:
      - item: description of the task
      - dueDate: ISO date string
      - assignee: who is responsible (buyer, seller, lender, title company)
    `;
    const resp = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: this.model,
        max_tokens: 500,
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
    try {
      const content = resp.data.completion || resp.data.content;
      const plan = JSON.parse(content);
      return plan;
    } catch (e) {
      logger.error('Failed to parse AI task plan:', e);
      return { tasks: [] };
    }
  }

  /**
   * Persist a task into Redis for scheduling reminders, and update escrow checklist.
   * @param {string} escrowId
   * @param {{ item: string, dueDate: string, assignee: string }} task
   */
  async scheduleTask(escrowId, task) {
    // Update escrow checklist
    await Escrow.update(escrowId, {}); // ensure escrow exists
    await Escrow.updateChecklist(escrowId, task.item, false, `Assigned to ${task.assignee}`);

    // Schedule reminder in Redis sorted set
    const remindAt = new Date(new Date(task.dueDate).getTime() - this.reminderLeadTimeHours * 3600 * 1000).getTime();
    const redis = getRedisClient();
    const entry = JSON.stringify({ escrowId, item: task.item, assignee: task.assignee });
    await redis.zAdd('transaction:reminders', { score: remindAt, value: entry });
    logger.info(`Scheduled reminder for "${task.item}" on escrow ${escrowId} at ${new Date(remindAt).toISOString()}`);
  }

  /**
   * Process due reminders: send notifications and mark checklist.
   * Invoked by a recurring job.
   */
  async processReminders() {
    const redis = getRedisClient();
    const now = Date.now();
    const entries = await redis.zRangeByScore('transaction:reminders', 0, now);
    for (const entry of entries) {
      try {
        const { escrowId, item, assignee } = JSON.parse(entry);
        await this.sendReminder(escrowId, item, assignee);
        // Mark as reminded
        await redis.zRem('transaction:reminders', entry);
      } catch (e) {
        logger.error('Error processing reminder entry:', e);
      }
    }
  }

  /**
   * Send reminder notifications via SMS or email.
   * @param {string} escrowId
   * @param {string} item
   * @param {string} assignee
   */
  async sendReminder(escrowId, item, assignee) {
    const msg = `Reminder: "${item}" for escrow ${escrowId} is due soon.`;
    // Send to assignee - lookup contact info as needed
    if (assignee === 'buyer' || assignee === 'seller') {
      const clientPhone = await query('SELECT phone FROM clients WHERE id = (SELECT client_id FROM escrow_buyers WHERE escrow_id = $1 LIMIT 1)', [escrowId])
        .then(r => r.rows[0]?.phone);
      if (clientPhone) {
        await twilioClient.messages.create({
          body: msg,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: clientPhone
        });
      }
    }
    // Notify title or lender via email if configured
    // Example: notify title company
    await emailService.send({
      to: process.env.TITLE_COMPANY_EMAIL,
      subject: `Escrow ${escrowId} Task Reminder`,
      text: msg
    });
    // Mark checklist item as reminded
    await Escrow.updateChecklist(escrowId, item, false, 'Reminder sent');
    logger.info(`Sent reminder for "${item}" on escrow ${escrowId}`);
  }

  isEnabled() {
    return this.enabled;
  }

  setEnabled(enabled) {
    this.enabled = enabled;
    logger.info(`${this.name} ${enabled ? 'enabled' : 'disabled'}`);
  }
}

module.exports = new TransactionCoordinatorAgent();