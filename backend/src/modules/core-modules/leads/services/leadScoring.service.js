const logger = require('../../../../utils/logger');

class LeadScoringService {
  constructor() {
    // Scoring weights for different factors
    this.scoringWeights = {
      // Source quality scores
      source: {
        Website: 10,
        Referral: 25,
        'Social Media': 15,
        'Email Campaign': 12,
        Phone: 20,
        'Walk-in': 30,
        Partner: 22,
        Advertisement: 8,
        Other: 5,
      },

      // Budget range scores (higher budget = higher score)
      budget: {
        under_100k: 5,
        '100k_250k': 10,
        '250k_500k': 20,
        '500k_750k': 25,
        '750k_1m': 30,
        over_1m: 35,
      },

      // Timeline urgency scores
      timeline: {
        immediate: 30,
        within_1_month: 25,
        '1_3_months': 20,
        '3_6_months': 15,
        '6_12_months': 10,
        over_1_year: 5,
        just_looking: 2,
      },

      // Contact information completeness
      contactInfo: {
        hasEmail: 5,
        hasPhone: 10,
        hasAddress: 3,
        hasPreferredContact: 2,
      },

      // Engagement activities
      activities: {
        property_view: 5,
        contact_form: 10,
        phone_call: 15,
        email_open: 2,
        email_click: 5,
        meeting_scheduled: 20,
        meeting_attended: 25,
        documentation_provided: 15,
        pre_approval_started: 20,
        pre_approval_completed: 30,
      },

      // Activity recency modifiers
      recencyModifiers: {
        today: 1.5,
        last_3_days: 1.3,
        last_week: 1.1,
        last_2_weeks: 1.0,
        last_month: 0.8,
        over_month: 0.5,
      },
    };

    // Score decay configuration
    this.decayConfig = {
      startAfterDays: 7,
      dailyDecayRate: 0.02, // 2% per day
      minimumScore: 10,
    };

    // Temperature thresholds
    this.temperatureThresholds = {
      hot: 70,
      warm: 40,
      cold: 0,
    };
  }

  calculateInitialScore(leadData) {
    try {
      let score = 0;

      // Source score
      if (leadData.source && this.scoringWeights.source[leadData.source]) {
        score += this.scoringWeights.source[leadData.source];
      }

      // Budget score
      const budgetScore = this.calculateBudgetScore(leadData.budget);
      score += budgetScore;

      // Timeline score
      const timelineScore = this.calculateTimelineScore(leadData.timeline);
      score += timelineScore;

      // Contact information completeness
      if (leadData.hasEmail) score += this.scoringWeights.contactInfo.hasEmail;
      if (leadData.hasPhone) score += this.scoringWeights.contactInfo.hasPhone;
      if (leadData.hasAddress) score += this.scoringWeights.contactInfo.hasAddress;
      if (leadData.preferredContact) score += this.scoringWeights.contactInfo.hasPreferredContact;

      // Property interest bonus
      if (leadData.propertyInterest && leadData.propertyInterest.length > 0) {
        score += 5 * Math.min(leadData.propertyInterest.length, 3); // Max 15 points
      }

      // Cap the initial score at 100
      score = Math.min(score, 100);

      logger.info('Calculated initial lead score:', {
        leadId: leadData._id,
        score,
        factors: {
          source: leadData.source,
          budget: leadData.budget,
          timeline: leadData.timeline,
          hasContactInfo: !!(leadData.hasEmail || leadData.hasPhone),
        },
      });

      return Math.round(score);
    } catch (error) {
      logger.error('Error calculating initial score:', error);
      return 25; // Default score
    }
  }

  calculateBudgetScore(budget) {
    if (!budget) return 0;

    if (budget < 100000) return this.scoringWeights.budget.under_100k;
    if (budget < 250000) return this.scoringWeights.budget['100k_250k'];
    if (budget < 500000) return this.scoringWeights.budget['250k_500k'];
    if (budget < 750000) return this.scoringWeights.budget['500k_750k'];
    if (budget < 1000000) return this.scoringWeights.budget['750k_1m'];
    return this.scoringWeights.budget.over_1m;
  }

  calculateTimelineScore(timeline) {
    if (!timeline) return this.scoringWeights.timeline.just_looking;

    const timelineMap = {
      Immediate: this.scoringWeights.timeline.immediate,
      'Within 1 month': this.scoringWeights.timeline.within_1_month,
      '1-3 months': this.scoringWeights.timeline['1_3_months'],
      '3-6 months': this.scoringWeights.timeline['3_6_months'],
      '6-12 months': this.scoringWeights.timeline['6_12_months'],
      'Over 1 year': this.scoringWeights.timeline.over_1_year,
      'Just looking': this.scoringWeights.timeline.just_looking,
    };

    return timelineMap[timeline] || this.scoringWeights.timeline.just_looking;
  }

  getActivityScoreChange(activityType) {
    const baseScore = this.scoringWeights.activities[activityType] || 0;

    // Apply recency modifier (assuming activity is recent)
    const recencyModifier = this.scoringWeights.recencyModifiers.today;

    return Math.round(baseScore * recencyModifier);
  }

  getStatusScoreChange(fromStatus, toStatus) {
    const statusScores = {
      New: 0,
      Contacted: 10,
      Qualified: 20,
      Interested: 25,
      Negotiating: 35,
      Converted: 50,
      Lost: -20,
      'On Hold': -10,
    };

    const fromScore = statusScores[fromStatus] || 0;
    const toScore = statusScores[toStatus] || 0;

    return toScore - fromScore;
  }

  calculateDecayedScore(currentScore, lastActivityDate) {
    try {
      const daysSinceActivity = Math.floor(
        (new Date() - new Date(lastActivityDate)) / (1000 * 60 * 60 * 24),
      );

      if (daysSinceActivity <= this.decayConfig.startAfterDays) {
        return currentScore;
      }

      const daysToDecay = daysSinceActivity - this.decayConfig.startAfterDays;
      const decayMultiplier = (1 - this.decayConfig.dailyDecayRate) ** daysToDecay;
      const decayedScore = currentScore * decayMultiplier;

      return Math.max(Math.round(decayedScore), this.decayConfig.minimumScore);
    } catch (error) {
      logger.error('Error calculating decayed score:', error);
      return currentScore;
    }
  }

  getTemperature(score) {
    if (score >= this.temperatureThresholds.hot) return 'Hot';
    if (score >= this.temperatureThresholds.warm) return 'Warm';
    return 'Cold';
  }

  calculateEngagementScore(activities) {
    try {
      if (!activities || activities.length === 0) return 0;

      let engagementScore = 0;
      const now = new Date();

      activities.forEach((activity) => {
        const activityDate = new Date(activity.timestamp);
        const daysSinceActivity = Math.floor((now - activityDate) / (1000 * 60 * 60 * 24));

        // Get recency modifier
        let recencyModifier = this.scoringWeights.recencyModifiers.over_month;
        if (daysSinceActivity === 0) {
          recencyModifier = this.scoringWeights.recencyModifiers.today;
        } else if (daysSinceActivity <= 3) {
          recencyModifier = this.scoringWeights.recencyModifiers.last_3_days;
        } else if (daysSinceActivity <= 7) {
          recencyModifier = this.scoringWeights.recencyModifiers.last_week;
        } else if (daysSinceActivity <= 14) {
          recencyModifier = this.scoringWeights.recencyModifiers.last_2_weeks;
        } else if (daysSinceActivity <= 30) {
          recencyModifier = this.scoringWeights.recencyModifiers.last_month;
        }

        const activityScore = this.scoringWeights.activities[activity.type] || 0;
        engagementScore += activityScore * recencyModifier;
      });

      // Normalize to 0-100 scale
      return Math.min(Math.round(engagementScore), 100);
    } catch (error) {
      logger.error('Error calculating engagement score:', error);
      return 0;
    }
  }

  async analyzeLeadQuality(lead) {
    try {
      const analysis = {
        currentScore: lead.score || 0,
        temperature: this.getTemperature(lead.score || 0),
        strengths: [],
        weaknesses: [],
        recommendations: [],
      };

      // Analyze strengths
      if (lead.source === 'Referral' || lead.source === 'Walk-in') {
        analysis.strengths.push('High-quality lead source');
      }

      if (lead.budget && lead.budget > 500000) {
        analysis.strengths.push('High budget range');
      }

      if (lead.timeline === 'Immediate' || lead.timeline === 'Within 1 month') {
        analysis.strengths.push('Urgent timeline');
      }

      if (lead.email && lead.phone) {
        analysis.strengths.push('Complete contact information');
      }

      // Analyze weaknesses
      if (!lead.phone) {
        analysis.weaknesses.push('Missing phone number');
        analysis.recommendations.push('Try to obtain phone number for better engagement');
      }

      if (lead.timeline === 'Just looking' || lead.timeline === 'Over 1 year') {
        analysis.weaknesses.push('Long timeline');
        analysis.recommendations.push('Add to long-term nurture campaign');
      }

      if (!lead.propertyInterests || lead.propertyInterests.length === 0) {
        analysis.weaknesses.push('No specific property interests');
        analysis.recommendations.push('Gather property preferences and requirements');
      }

      // Activity-based recommendations
      const daysSinceLastActivity = lead.lastActivityDate
        ? Math.floor((new Date() - new Date(lead.lastActivityDate)) / (1000 * 60 * 60 * 24)) : 999;

      if (daysSinceLastActivity > 7) {
        analysis.recommendations.push('Re-engage lead - no recent activity');
      }

      if (analysis.temperature === 'Hot' && lead.status !== 'Negotiating') {
        analysis.recommendations.push('High-scoring lead - prioritize immediate follow-up');
      }

      return analysis;
    } catch (error) {
      logger.error('Error analyzing lead quality:', error);
      throw error;
    }
  }

  async bulkUpdateScores(leads) {
    try {
      const updates = [];

      for (const lead of leads) {
        const decayedScore = this.calculateDecayedScore(
          lead.score || 0,
          lead.lastActivityDate || lead.createdAt,
        );

        if (decayedScore !== lead.score) {
          updates.push({
            leadId: lead._id,
            oldScore: lead.score,
            newScore: decayedScore,
            temperature: this.getTemperature(decayedScore),
          });
        }
      }

      logger.info('Bulk score update completed:', {
        totalLeads: leads.length,
        updatedCount: updates.length,
      });

      return updates;
    } catch (error) {
      logger.error('Error in bulk score update:', error);
      throw error;
    }
  }
}

module.exports = new LeadScoringService();
