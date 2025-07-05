

// backend/src/services/ai/buyerManager.service.js

const Lead = require('../../models/Lead');
const buyerLeadQualifier = require('./agents/buyerLeadQualifier');
const buyerNurtureSpecialist = require('./agents/buyerNurtureSpecialist');

class BuyerManagerService {
  /**
   * Entry point for new leads.
   * Runs qualification and then schedules follow‑up nurture.
   * @param {Object} leadData - a lead record from the database
   */
  static async handleNewLead(leadData) {
    if (!buyerLeadQualifier.isEnabled()) {
      return { skipped: true, reason: 'Lead qualifier disabled' };
    }

    // 1. Qualify the lead
    const qualificationResult = await buyerLeadQualifier.processNewLead(leadData);

    // 2. After qualification, schedule the first nurture step immediately
    if (buyerNurtureSpecialist.isEnabled()) {
      try {
        await buyerNurtureSpecialist.nurtureLead(leadData);
      } catch (err) {
        // Log but do not fail qualification
        console.error(`Error scheduling nurture for lead ${leadData.id}:`, err);
      }
    }

    return qualificationResult;
  }

  /**
   * Periodic job to process nurture queue.
   * Fetches all leads marked 'Contacted' and invokes the Buyer Nurture Specialist.
   */
  static async runNurtureCycle() {
    if (!buyerNurtureSpecialist.isEnabled()) {
      return { skipped: true, reason: 'Nurture specialist disabled' };
    }

    // Get all leads that have been contacted but are not yet converted
    const { leads } = await Lead.findAll({ status: 'Contacted', page: 1, limit: 100 });
    const results = [];

    for (const lead of leads) {
      try {
        await buyerNurtureSpecialist.nurtureLead(lead);
        results.push({ leadId: lead.id, nurtured: true });
      } catch (err) {
        console.error(`Error nurturing lead ${lead.id}:`, err);
        results.push({ leadId: lead.id, nurtured: false, error: err.message });
      }
    }

    return { total: leads.length, details: results };
  }
}

module.exports = BuyerManagerService;