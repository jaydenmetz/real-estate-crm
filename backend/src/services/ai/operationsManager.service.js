const axios = require('axios');
const logger = require('../../utils/logger');
const { query } = require('../../config/database');

class OperationsManagerService {
  constructor() {
    this.name = 'Operations Manager';
    this.model = 'claude-3-sonnet-20240229';
    this.enabled = true;
    this.department = 'operations';
  }

  async performStatusCheck() {
    try {
      logger.info('Operations Manager performing status check...');
      
      // Check transaction deadlines
      const deadlineCheck = await this.checkTransactionDeadlines();
      
      // Review compliance status
      const complianceCheck = await this.reviewComplianceStatus();
      
      // Monitor financial tracking
      const financialCheck = await this.checkFinancialTracking();
      
      const status = {
        deadlineCheck,
        complianceCheck,
        financialCheck,
        timestamp: new Date()
      };
      
      // Report to Alex if issues found
      if (this.hasIssues(status)) {
        await this.escalateToAlex(status);
      }
      
      return status;
    } catch (error) {
      logger.error('Operations Manager status check failed:', error);
      throw error;
    }
  }

  async checkTransactionDeadlines() {
    const result = await query(`
      SELECT 
        COUNT(*) as total_active,
        COUNT(*) FILTER (WHERE emd_due_date <= CURRENT_DATE + INTERVAL '2 days' AND emd_due_date > CURRENT_DATE) as emd_upcoming,
        COUNT(*) FILTER (WHERE contingency_removal_date <= CURRENT_DATE + INTERVAL '3 days' AND contingency_removal_date > CURRENT_DATE) as contingency_upcoming,
        COUNT(*) FILTER (WHERE closing_date <= CURRENT_DATE + INTERVAL '7 days' AND closing_date > CURRENT_DATE) as closing_upcoming,
        COUNT(*) FILTER (WHERE emd_due_date < CURRENT_DATE) as emd_overdue,
        COUNT(*) FILTER (WHERE contingency_removal_date < CURRENT_DATE) as contingency_overdue
      FROM escrows 
      WHERE escrow_status = 'Active'
    `);
    
    const data = result.rows[0];
    const overdueCount = parseInt(data.emd_overdue) + parseInt(data.contingency_overdue);
    
    return {
      totalActive: parseInt(data.total_active),
      emdUpcoming: parseInt(data.emd_upcoming),
      contingencyUpcoming: parseInt(data.contingency_upcoming),
      closingUpcoming: parseInt(data.closing_upcoming),
      overdueCount,
      status: overdueCount === 0 ? 'good' : 'critical'
    };
  }

  async reviewComplianceStatus() {
    // Check for missing required documents and forms
    const result = await query(`
      SELECT 
        e.id,
        e.property_address,
        e.escrow_status,
        cl.checklist_items,
        CASE 
          WHEN cl.checklist_items->>'purchaseAgreementSigned' != 'true' THEN true
          ELSE false
        END as missing_purchase_agreement,
        CASE 
          WHEN cl.checklist_items->>'allContingenciesRemoved' != 'true' 
            AND e.contingency_removal_date < CURRENT_DATE THEN true
          ELSE false
        END as missing_contingency_removal
      FROM escrows e
      LEFT JOIN escrow_checklists cl ON e.id = cl.escrow_id
      WHERE e.escrow_status = 'Active'
    `);
    
    const complianceIssues = result.rows.filter(row => 
      row.missing_purchase_agreement || row.missing_contingency_removal
    );
    
    return {
      totalChecked: result.rows.length,
      complianceIssues: complianceIssues.map(issue => ({
        escrowId: issue.id,
        address: issue.property_address,
        issues: [
          ...(issue.missing_purchase_agreement ? ['Missing Purchase Agreement'] : []),
          ...(issue.missing_contingency_removal ? ['Missing Contingency Removal'] : [])
        ]
      })),
      issueCount: complianceIssues.length,
      status: complianceIssues.length === 0 ? 'good' : 'needs_attention'
    };
  }

  async checkFinancialTracking() {
    const result = await query(`
      SELECT 
        COUNT(*) as total_escrows,
        COUNT(*) FILTER (WHERE gross_commission IS NULL OR gross_commission = 0) as missing_commission,
        SUM(gross_commission) as total_gross_commission,
        SUM(net_commission) as total_net_commission,
        AVG(commission_percentage) as avg_commission_rate
      FROM escrows 
      WHERE escrow_status IN ('Active', 'Closed')
        AND DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)
    `);
    
    const data = result.rows[0];
    const missingCommissionPercentage = data.total_escrows > 0 ? 
      (data.missing_commission / data.total_escrows) * 100 : 0;
    
    return {
      totalEscrows: parseInt(data.total_escrows),
      missingCommission: parseInt(data.missing_commission),
      missingCommissionPercentage: parseFloat(missingCommissionPercentage.toFixed(2)),
      totalGrossCommission: parseFloat(data.total_gross_commission || 0),
      totalNetCommission: parseFloat(data.total_net_commission || 0),
      avgCommissionRate: parseFloat(data.avg_commission_rate || 0),
      status: missingCommissionPercentage <= 5 ? 'good' : 'needs_attention'
    };
  }

  async checkDeadlines() {
    // Called by cron job to check for upcoming deadlines
    const urgentDeadlines = await query(`
      SELECT 
        e.id,
        e.property_address,
        CASE 
          WHEN e.emd_due_date <= CURRENT_DATE + INTERVAL '24 hours' AND e.emd_due_date > CURRENT_DATE THEN 'EMD Due'
          WHEN e.contingency_removal_date <= CURRENT_DATE + INTERVAL '48 hours' AND e.contingency_removal_date > CURRENT_DATE THEN 'Contingency Removal'
          WHEN e.closing_date <= CURRENT_DATE + INTERVAL '72 hours' AND e.closing_date > CURRENT_DATE THEN 'Closing'
        END as deadline_type,
        CASE 
          WHEN e.emd_due_date <= CURRENT_DATE + INTERVAL '24 hours' AND e.emd_due_date > CURRENT_DATE THEN e.emd_due_date
          WHEN e.contingency_removal_date <= CURRENT_DATE + INTERVAL '48 hours' AND e.contingency_removal_date > CURRENT_DATE THEN e.contingency_removal_date
          WHEN e.closing_date <= CURRENT_DATE + INTERVAL '72 hours' AND e.closing_date > CURRENT_DATE THEN e.closing_date
        END as deadline_date
      FROM escrows e
      WHERE e.escrow_status = 'Active'
        AND (
          (e.emd_due_date <= CURRENT_DATE + INTERVAL '24 hours' AND e.emd_due_date > CURRENT_DATE) OR
          (e.contingency_removal_date <= CURRENT_DATE + INTERVAL '48 hours' AND e.contingency_removal_date > CURRENT_DATE) OR
          (e.closing_date <= CURRENT_DATE + INTERVAL '72 hours' AND e.closing_date > CURRENT_DATE)
        )
      ORDER BY deadline_date
    `);
    
    if (urgentDeadlines.rows.length > 0) {
      // Notify Alex of urgent deadlines
      const alexService = require('./alex.service');
      
      if (alexService.isEnabled()) {
        await alexService.handleManagerRequest({
          from: 'Operations Manager',
          priority: 'urgent',
          type: 'deadline_alert',
          context: {
            urgentDeadlines: urgentDeadlines.rows
          }
        });
      }
    }
    
    return urgentDeadlines.rows;
  }

  hasIssues(status) {
    return status.deadlineCheck.status === 'critical' ||
           status.complianceCheck.status === 'needs_attention' ||
           status.financialCheck.status === 'needs_attention';
  }

  async escalateToAlex(status) {
    const alexService = require('./alex.service');
    
    if (alexService.isEnabled()) {
      const issues = [];
      
      if (status.deadlineCheck.status === 'critical') {
        issues.push(`${status.deadlineCheck.overdueCount} overdue deadlines found`);
      }
      
      if (status.complianceCheck.status === 'needs_attention') {
        issues.push(`${status.complianceCheck.issueCount} compliance issues found`);
      }
      
      if (status.financialCheck.status === 'needs_attention') {
        issues.push(`${status.financialCheck.missingCommissionPercentage}% escrows missing commission data`);
      }
      
      await alexService.handleManagerRequest({
        from: 'Operations Manager',
        priority: 'high',
        type: 'escalation',
        context: {
          department: 'operations',
          issues,
          status
        }
      });
    }
  }

  isEnabled() {
    return this.enabled;
  }

  setEnabled(enabled) {
    this.enabled = enabled;
    logger.info(`${this.name} ${enabled ? 'enabled' : 'disabled'}`);
  }
}

module.exports = new OperationsManagerService();