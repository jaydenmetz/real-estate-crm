const { pool } = require('../../config/database');

class CommissionService {
  /**
   * Calculate commission split based on YTD GCI and lead source
   * @param {number} currentYtdGci - Current year-to-date GCI before this transaction
   * @param {string} leadSource - Source of the lead (affects split rules)
   * @param {number} year - Year for commission calculation (defaults to current)
   */
  async calculateCommissionSplit(currentYtdGci, leadSource = 'default', year = new Date().getFullYear()) {
    try {
      // Get applicable split rule based on GCI threshold
      const query = `
        SELECT * FROM commission_split_rules
        WHERE 
          (lead_source = $1 OR lead_source = 'default')
          AND effective_year = $2
          AND gci_threshold_min <= $3
          AND (gci_threshold_max IS NULL OR gci_threshold_max > $3)
        ORDER BY 
          CASE WHEN lead_source = $1 THEN 0 ELSE 1 END,
          gci_threshold_min DESC
        LIMIT 1
      `;
      
      const result = await pool.query(query, [leadSource, year, currentYtdGci]);
      
      if (result.rows.length === 0) {
        // Default to 70% if no rules found
        return {
          splitPercentage: 70,
          capStatus: 'pre_cap',
          rule: 'default'
        };
      }
      
      const rule = result.rows[0];
      
      // Determine cap status
      let capStatus = 'pre_cap';
      if (currentYtdGci >= 100000) {
        capStatus = 'post_cap';
      } else if (currentYtdGci >= 50000) {
        capStatus = 'mid_tier';
      }
      
      return {
        splitPercentage: parseFloat(rule.split_percentage),
        capStatus,
        rule: rule.notes || `${rule.split_percentage}% split`,
        threshold: {
          min: parseFloat(rule.gci_threshold_min),
          max: rule.gci_threshold_max ? parseFloat(rule.gci_threshold_max) : null
        }
      };
    } catch (error) {
      console.error('Error calculating commission split:', error);
      throw error;
    }
  }

  /**
   * Calculate detailed commission breakdown for a transaction
   * @param {object} escrow - Escrow data
   * @param {number} ytdGci - YTD GCI before this transaction
   */
  async calculateCommissionBreakdown(escrow, ytdGci = null) {
    try {
      // Get current YTD GCI if not provided
      if (ytdGci === null) {
        ytdGci = await this.getCurrentYtdGci();
      }
      
      const purchasePrice = parseFloat(escrow.purchase_price) || 0;
      const commissionPercentage = parseFloat(escrow.commission_percentage) || 3;
      const grossCommission = parseFloat(escrow.gross_commission) || (purchasePrice * (commissionPercentage / 100));
      const myCommission = parseFloat(escrow.my_commission) || grossCommission;
      
      // Get split percentage based on YTD GCI
      const splitInfo = await this.calculateCommissionSplit(ytdGci, escrow.lead_source);
      
      // Calculate agent's portion
      const splitPercentage = splitInfo.splitPercentage;
      const grossAgentCommission = myCommission * (splitPercentage / 100);
      
      // Standard deductions
      const transactionFee = 285;
      const tcFee = 250;
      const franchiseFees = myCommission * 0.0257; // 2.57% franchise fee
      
      // Calculate net income
      const totalDeductions = transactionFee + tcFee + franchiseFees;
      const agent1099Income = grossAgentCommission - totalDeductions;
      
      // Company's portion
      const companyCommission = myCommission - grossAgentCommission;
      
      return {
        // Transaction details
        purchasePrice,
        commissionPercentage,
        grossCommission,
        myCommission,
        
        // Split calculation
        ytdGciBeforeTransaction: ytdGci,
        ytdGciAfterTransaction: ytdGci + myCommission,
        splitPercentage,
        capStatus: splitInfo.capStatus,
        
        // Agent breakdown
        grossAgentCommission,
        transactionFee,
        tcFee,
        franchiseFees,
        totalDeductions,
        agent1099Income,
        
        // Company breakdown
        companyCommission,
        
        // Summary
        splitRule: splitInfo.rule,
        effectiveDate: new Date()
      };
    } catch (error) {
      console.error('Error calculating commission breakdown:', error);
      throw error;
    }
  }

  /**
   * Get current year-to-date GCI
   */
  async getCurrentYtdGci(year = new Date().getFullYear()) {
    try {
      const query = `
        SELECT 
          COALESCE(SUM(my_commission), 0) as ytd_gci
        FROM escrows
        WHERE 
          EXTRACT(YEAR FROM closing_date) = $1
          AND escrow_status = 'Closed'
      `;
      
      const result = await pool.query(query, [year]);
      return parseFloat(result.rows[0].ytd_gci) || 0;
    } catch (error) {
      console.error('Error getting YTD GCI:', error);
      return 0;
    }
  }

  /**
   * Update escrow with calculated commission data
   */
  async updateEscrowCommission(escrowId) {
    try {
      // Get escrow data
      const escrowQuery = 'SELECT * FROM escrows WHERE id = $1';
      const escrowResult = await pool.query(escrowQuery, [escrowId]);
      
      if (escrowResult.rows.length === 0) {
        throw new Error('Escrow not found');
      }
      
      const escrow = escrowResult.rows[0];
      
      // Get YTD GCI at the time of this transaction
      const ytdGci = await this.getYtdGciAtDate(escrow.closing_date || escrow.acceptance_date);
      
      // Calculate commission breakdown
      const breakdown = await this.calculateCommissionBreakdown(escrow, ytdGci);
      
      // Update escrow with commission data
      const updateQuery = `
        UPDATE escrows
        SET 
          ytd_gci = $2,
          commission_split_percentage = $3,
          cap_status = $4,
          financials = jsonb_set(
            COALESCE(financials, '{}'),
            '{agentSplit}',
            $5::jsonb
          )
        WHERE id = $1
        RETURNING *
      `;
      
      const agentSplitData = {
        splitPercentage: breakdown.splitPercentage,
        grossAgentCommission: breakdown.grossAgentCommission,
        transactionFee: breakdown.transactionFee,
        tcFee: breakdown.tcFee,
        franchiseFees: breakdown.franchiseFees,
        agent1099Income: breakdown.agent1099Income,
        companyCommission: breakdown.companyCommission,
        splitRule: breakdown.splitRule
      };
      
      const updateResult = await pool.query(updateQuery, [
        escrowId,
        breakdown.ytdGciBeforeTransaction,
        breakdown.splitPercentage,
        breakdown.capStatus,
        JSON.stringify(agentSplitData)
      ]);
      
      return updateResult.rows[0];
    } catch (error) {
      console.error('Error updating escrow commission:', error);
      throw error;
    }
  }

  /**
   * Get YTD GCI at a specific date
   */
  async getYtdGciAtDate(date) {
    try {
      const year = new Date(date).getFullYear();
      const query = `
        SELECT 
          COALESCE(SUM(my_commission), 0) as ytd_gci
        FROM escrows
        WHERE 
          EXTRACT(YEAR FROM closing_date) = $1
          AND closing_date < $2
          AND escrow_status = 'Closed'
      `;
      
      const result = await pool.query(query, [year, date]);
      return parseFloat(result.rows[0].ytd_gci) || 0;
    } catch (error) {
      console.error('Error getting YTD GCI at date:', error);
      return 0;
    }
  }

  /**
   * Add custom split rule for specific lead sources
   */
  async addCustomSplitRule(leadSource, gciMin, gciMax, splitPercentage, notes) {
    try {
      const query = `
        INSERT INTO commission_split_rules 
        (lead_source, gci_threshold_min, gci_threshold_max, split_percentage, notes)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `;
      
      const result = await pool.query(query, [
        leadSource,
        gciMin,
        gciMax,
        splitPercentage,
        notes
      ]);
      
      return result.rows[0];
    } catch (error) {
      console.error('Error adding custom split rule:', error);
      throw error;
    }
  }
}

module.exports = new CommissionService();