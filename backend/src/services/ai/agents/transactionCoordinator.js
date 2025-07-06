const axios = require('axios');
const logger = require('../../../utils/logger');
const { query } = require('../../../config/database');
const twilioClient = require('../../../config/twilio');

class TransactionCoordinatorAgent {
  constructor() {
    this.name = 'Transaction Coordinator';
    this.model = 'claude-3-haiku-20240307';
    this.enabled = true;
  }

  async monitorEscrowDeadlines() {
    try {
      logger.info('Monitoring escrow deadlines...');
      
      // Get all active escrows with upcoming deadlines
      const upcomingDeadlines = await query(`
        SELECT 
          e.*,
          CASE 
            WHEN e.emd_due_date <= CURRENT_DATE + INTERVAL '1 day' AND e.emd_due_date > CURRENT_DATE THEN 'EMD_DUE'
            WHEN e.contingency_removal_date <= CURRENT_DATE + INTERVAL '2 days' AND e.contingency_removal_date > CURRENT_DATE THEN 'CONTINGENCY_REMOVAL'
            WHEN e.appraisal_deadline <= CURRENT_DATE + INTERVAL '3 days' AND e.appraisal_deadline > CURRENT_DATE THEN 'APPRAISAL_DUE'
            WHEN e.inspection_deadline <= CURRENT_DATE + INTERVAL '2 days' AND e.inspection_deadline > CURRENT_DATE THEN 'INSPECTION_DUE'
            WHEN e.closing_date <= CURRENT_DATE + INTERVAL '7 days' AND e.closing_date > CURRENT_DATE THEN 'CLOSING_APPROACHING'
          END as deadline_type,
          CASE 
            WHEN e.emd_due_date <= CURRENT_DATE + INTERVAL '1 day' AND e.emd_due_date > CURRENT_DATE THEN e.emd_due_date
            WHEN e.contingency_removal_date <= CURRENT_DATE + INTERVAL '2 days' AND e.contingency_removal_date > CURRENT_DATE THEN e.contingency_removal_date
            WHEN e.appraisal_deadline <= CURRENT_DATE + INTERVAL '3 days' AND e.appraisal_deadline > CURRENT_DATE THEN e.appraisal_deadline
            WHEN e.inspection_deadline <= CURRENT_DATE + INTERVAL '2 days' AND e.inspection_deadline > CURRENT_DATE THEN e.inspection_deadline
            WHEN e.closing_date <= CURRENT_DATE + INTERVAL '7 days' AND e.closing_date > CURRENT_DATE THEN e.closing_date
          END as deadline_date
        FROM escrows e
        WHERE e.escrow_status = 'Active'
          AND (
            (e.emd_due_date <= CURRENT_DATE + INTERVAL '1 day' AND e.emd_due_date > CURRENT_DATE) OR
            (e.contingency_removal_date <= CURRENT_DATE + INTERVAL '2 days' AND e.contingency_removal_date > CURRENT_DATE) OR
            (e.appraisal_deadline <= CURRENT_DATE + INTERVAL '3 days' AND e.appraisal_deadline > CURRENT_DATE) OR
            (e.inspection_deadline <= CURRENT_DATE + INTERVAL '2 days' AND e.inspection_deadline > CURRENT_DATE) OR
            (e.closing_date <= CURRENT_DATE + INTERVAL '7 days' AND e.closing_date > CURRENT_DATE)
          )
        ORDER BY deadline_date ASC
      `);
      
      for (const escrow of upcomingDeadlines.rows) {
        await this.processDeadlineReminder(escrow);
      }
      
      return upcomingDeadlines.rows;
    } catch (error) {
      logger.error('Error monitoring escrow deadlines:', error);
      throw error;
    }
  }

  async processDeadlineReminder(escrow) {
    try {
      // Get checklist status
      const checklist = await query('SELECT * FROM escrow_checklists WHERE escrow_id = $1', [escrow.id]);
      const checklistItems = checklist.rows[0]?.checklist_items || {};
      
      // Determine what needs to be done based on deadline type
      const actionRequired = this.getRequiredActions(escrow.deadline_type, checklistItems);
      
      if (actionRequired.length > 0) {
        // Send reminders to relevant parties
        await this.sendDeadlineReminders(escrow, actionRequired);
        
        // Log the reminder
        await this.logDeadlineReminder(escrow.id, escrow.deadline_type, actionRequired);
      }
      
      return actionRequired;
    } catch (error) {
      logger.error('Error processing deadline reminder:', error);
      throw error;
    }
  }

  getRequiredActions(deadlineType, checklistItems) {
    const actions = [];
    
    switch (deadlineType) {
      case 'EMD_DUE':
        if (!checklistItems.emdReceived) {
          actions.push('Collect earnest money deposit');
        }
        break;
        
      case 'CONTINGENCY_REMOVAL':
        if (!checklistItems.homeInspectionCompleted) {
          actions.push('Complete home inspection');
        }
        if (!checklistItems.appraisalReceived) {
          actions.push('Obtain appraisal report');
        }
        if (!checklistItems.loanContingencyRemoved) {
          actions.push('Remove loan contingency');
        }
        break;
        
      case 'APPRAISAL_DUE':
        if (!checklistItems.appraisalOrdered) {
          actions.push('Order appraisal');
        }
        break;
        
      case 'INSPECTION_DUE':
        if (!checklistItems.homeInspectionOrdered) {
          actions.push('Schedule home inspection');
        }
        break;
        
      case 'CLOSING_APPROACHING':
        if (!checklistItems.clearToClose) {
          actions.push('Obtain clear to close from lender');
        }
        if (!checklistItems.finalWalkthrough) {
          actions.push('Schedule final walkthrough');
        }
        break;
    }
    
    return actions;
  }

  async sendDeadlineReminders(escrow, actions) {
    // Get buyers and sellers contact info
    const buyers = await this.getEscrowParticipants(escrow.id, 'buyers');
    const sellers = await this.getEscrowParticipants(escrow.id, 'sellers');
    
    const message = `URGENT: ${escrow.property_address} - ${escrow.deadline_type.replace('_', ' ')} deadline approaching. Required actions: ${actions.join(', ')}. Please contact your agent immediately.`;
    
    // Send to all parties
    const allParties = [...buyers, ...sellers];
    for (const party of allParties) {
      if (party.phone) {
        await twilioClient.messages.create({
          body: message,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: party.phone
        });
      }
    }
  }

  async getEscrowParticipants(escrowId, type) {
    const result = await query(`
      SELECT c.* 
      FROM clients c
      JOIN escrow_${type} e ON c.id = e.client_id
      WHERE e.escrow_id = $1
    `, [escrowId]);
    
    return result.rows;
  }

  async updateChecklistItem(escrowId, item, completed, note = '') {
    try {
      await query(`
        INSERT INTO escrow_checklists (escrow_id, checklist_items)
        VALUES ($1, $2)
        ON CONFLICT (escrow_id) 
        DO UPDATE SET 
          checklist_items = jsonb_set(
            COALESCE(escrow_checklists.checklist_items, '{}'::jsonb),
            '{${item}}',
            jsonb_build_object(
              'completed', $3::boolean,
              'completedAt', NOW(),
              'note', $4,
              'completedBy', 'Transaction Coordinator'
            )
          )
      `, [escrowId, `{"${item}": {"completed": ${completed}, "note": "${note}"}}`, completed, note]);
      
      logger.info(`Updated checklist item ${item} for escrow ${escrowId}: ${completed}`);
      
      return true;
    } catch (error) {
      logger.error('Error updating checklist item:', error);
      throw error;
    }
  }

  async generateClosingTimeline(escrowId) {
    try {
      const escrow = await query('SELECT * FROM escrows WHERE id = $1', [escrowId]);
      if (!escrow.rows.length) return null;
      
      const escrowData = escrow.rows[0];
      const closingDate = new Date(escrowData.closing_date);
      
      // Generate timeline working backwards from closing
      const timeline = [];
      
      // 1 day before closing: Final walkthrough
      timeline.push({
        date: new Date(closingDate.getTime() - 1 * 24 * 60 * 60 * 1000),
        task: 'Final Walkthrough',
        responsible: 'Buyer\'s Agent',
        critical: true
      });
      
      // 3 days before closing: Clear to close
      timeline.push({
        date: new Date(closingDate.getTime() - 3 * 24 * 60 * 60 * 1000),
        task: 'Clear to Close from Lender',
        responsible: 'Loan Officer',
        critical: true
      });
      
      // 5 days before closing: Loan docs signed
      timeline.push({
        date: new Date(closingDate.getTime() - 5 * 24 * 60 * 60 * 1000),
        task: 'Sign Loan Documents',
        responsible: 'Buyer',
        critical: true
      });
      
      // 7 days before closing: Closing disclosure
      timeline.push({
        date: new Date(closingDate.getTime() - 7 * 24 * 60 * 60 * 1000),
        task: 'Review Closing Disclosure',
        responsible: 'Buyer',
        critical: true
      });
      
      // Add contingency deadlines if they exist
      if (escrowData.contingency_removal_date) {
        timeline.push({
          date: new Date(escrowData.contingency_removal_date),
          task: 'Remove All Contingencies',
          responsible: 'Buyer\'s Agent',
          critical: true
        });
      }
      
      // Sort by date
      timeline.sort((a, b) => a.date - b.date);
      
      return timeline;
    } catch (error) {
      logger.error('Error generating closing timeline:', error);
      throw error;
    }
  }

  async logDeadlineReminder(escrowId, deadlineType, actions) {
    await query(
      'INSERT INTO communications (entity_type, entity_id, type, direction, content, created_at) VALUES ($1, $2, $3, $4, $5, NOW())',
      ['escrow', escrowId, 'deadline_reminder', 'outbound', `${deadlineType}: ${actions.join(', ')}`]
    );
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