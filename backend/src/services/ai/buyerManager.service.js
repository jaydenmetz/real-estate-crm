
const axios = require('axios');
const logger = require('../../utils/logger');
const { query } = require('../../config/database');

class BuyerManagerService {
  constructor() {
    this.name = 'Buyer Manager';
    this.model = 'claude-3-sonnet-20240229';
    this.enabled = true;
    this.department = 'buyer';
  }

  async performStatusCheck() {
    try {
      logger.info('Buyer Manager performing status check...');
      
      // Check lead response times
      const responseTimeCheck = await this.checkLeadResponseTimes();
      
      // Review buyer pipeline
      const pipelineCheck = await this.reviewBuyerPipeline();
      
      // Check appointment scheduling efficiency
      const schedulingCheck = await this.checkSchedulingEfficiency();
      
      const status = {
        responseTimeCheck,
        pipelineCheck,
        schedulingCheck,
        timestamp: new Date()
      };
      
      // Report to Alex if issues found
      if (this.hasIssues(status)) {
        await this.escalateToAlex(status);
      }
      
      return status;
    } catch (error) {
      logger.error('Buyer Manager status check failed:', error);
      throw error;
    }
  }

  async checkLeadResponseTimes() {
    const result = await query(`
      SELECT 
        COUNT(*) as total_leads,
        COUNT(*) FILTER (WHERE first_contact_date <= date_created + INTERVAL '5 minutes') as within_target,
        AVG(EXTRACT(EPOCH FROM (first_contact_date - date_created))/60) as avg_response_minutes
      FROM leads 
      WHERE date_created >= NOW() - INTERVAL '24 hours'
        AND lead_type IN ('Buyer', 'Both')
    `);
    
    const data = result.rows[0];
    const responseRate = data.total_leads > 0 ? (data.within_target / data.total_leads) * 100 : 100;
    
    return {
      totalLeads: parseInt(data.total_leads),
      withinTarget: parseInt(data.within_target),
      responseRate: parseFloat(responseRate.toFixed(2)),
      avgResponseMinutes: parseFloat(data.avg_response_minutes || 0),
      target: 98,
      status: responseRate >= 98 ? 'good' : 'needs_attention'
    };
  }

  async reviewBuyerPipeline() {
    const result = await query(`
      SELECT 
        lead_status,
        COUNT(*) as count,
        AVG(lead_score) as avg_score
      FROM leads 
      WHERE lead_type IN ('Buyer', 'Both')
        AND lead_status != 'Converted'
      GROUP BY lead_status
    `);
    
    const pipeline = result.rows.reduce((acc, row) => {
      acc[row.lead_status] = {
        count: parseInt(row.count),
        avgScore: parseFloat(row.avg_score || 0)
      };
      return acc;
    }, {});
    
    // Check for pipeline health
    const totalLeads = Object.values(pipeline).reduce((sum, stage) => sum + stage.count, 0);
    const qualifiedLeads = (pipeline['Qualified']?.count || 0) + (pipeline['Appointment Set']?.count || 0);
    const conversionRate = totalLeads > 0 ? (qualifiedLeads / totalLeads) * 100 : 0;
    
    return {
      pipeline,
      totalLeads,
      qualifiedLeads,
      conversionRate: parseFloat(conversionRate.toFixed(2)),
      target: 25,
      status: conversionRate >= 25 ? 'good' : 'needs_attention'
    };
  }

  async checkSchedulingEfficiency() {
    const result = await query(`
      SELECT 
        COUNT(*) as total_appointments,
        COUNT(*) FILTER (WHERE status = 'Completed') as completed,
        COUNT(*) FILTER (WHERE status = 'Cancelled') as cancelled,
        COUNT(*) FILTER (WHERE status = 'No Show') as no_shows
      FROM appointments 
      WHERE appointment_type IN ('Buyer Consultation', 'Property Showing')
        AND date >= CURRENT_DATE - INTERVAL '7 days'
    `);
    
    const data = result.rows[0];
    const completionRate = data.total_appointments > 0 ? 
      (data.completed / data.total_appointments) * 100 : 100;
    const noShowRate = data.total_appointments > 0 ? 
      (data.no_shows / data.total_appointments) * 100 : 0;
    
    return {
      totalAppointments: parseInt(data.total_appointments),
      completed: parseInt(data.completed),
      cancelled: parseInt(data.cancelled),
      noShows: parseInt(data.no_shows),
      completionRate: parseFloat(completionRate.toFixed(2)),
      noShowRate: parseFloat(noShowRate.toFixed(2)),
      status: completionRate >= 80 && noShowRate <= 10 ? 'good' : 'needs_attention'
    };
  }

  hasIssues(status) {
    return status.responseTimeCheck.status === 'needs_attention' ||
           status.pipelineCheck.status === 'needs_attention' ||
           status.schedulingCheck.status === 'needs_attention';
  }

  async escalateToAlex(status) {
    const alexService = require('./alex.service');
    
    if (alexService.isEnabled()) {
      const issues = [];
      
      if (status.responseTimeCheck.status === 'needs_attention') {
        issues.push(`Lead response time below target: ${status.responseTimeCheck.responseRate}% (target: 98%)`);
      }
      
      if (status.pipelineCheck.status === 'needs_attention') {
        issues.push(`Buyer conversion rate low: ${status.pipelineCheck.conversionRate}% (target: 25%)`);
      }
      
      if (status.schedulingCheck.status === 'needs_attention') {
        issues.push(`Appointment completion rate: ${status.schedulingCheck.completionRate}% or no-show rate: ${status.schedulingCheck.noShowRate}%`);
      }
      
      await alexService.handleManagerRequest({
        from: 'Buyer Manager',
        priority: 'high',
        type: 'escalation',
        context: {
          department: 'buyer',
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

module.exports = new BuyerManagerService();