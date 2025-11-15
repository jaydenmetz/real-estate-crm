const express = require('express');
const { query } = require('../config/infrastructure/database');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

// SECURITY: All analytics routes require authentication
router.use(authenticate);

// Dashboard analytics
router.get('/dashboard', async (req, res) => {
  try {
    const mockDashboardData = {
      totalEscrows: 12,
      activeEscrows: 8,
      closingThisWeek: 3,
      totalListings: 15,
      activeListings: 11,
      newListings: 2,
      totalClients: 156,
      activeClients: 89,
      newClients: 5,
      totalLeads: 47,
      newLeads: 8,
      qualifiedLeads: 23,
      monthlyVolume: 2_850_000,
      avgSalePrice: 485_000,
      totalCommission: 85_500,
      avgDaysToClose: 28,
      leadConversionRate: 18.5,
      listingConversionRate: 78.2,
      avgShowingsPerListing: 12,
      todayAppointments: 3,
      thisWeekAppointments: 14,
      recentActivity: [
        {
          id: 1, type: 'listing', action: 'New listing created', details: '123 Main St - $485,000', timestamp: new Date(Date.now() - 2 * 3600 * 1000),
        },
        {
          id: 2, type: 'lead', action: 'New lead received', details: 'Sarah Chen - Website inquiry', timestamp: new Date(Date.now() - 3 * 3600 * 1000),
        },
        {
          id: 3, type: 'appointment', action: 'Appointment scheduled', details: 'Johnson Family - Buyer consultation', timestamp: new Date(Date.now() - 5 * 3600 * 1000),
        },
        {
          id: 4, type: 'closing', action: 'Closing completed', details: '789 Oak Ave - Wilson LLC', timestamp: new Date(Date.now() - 24 * 3600 * 1000),
        },
      ],
    };
    res.json(mockDashboardData);
  } catch (err) {
    console.error('Error fetching dashboard analytics:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Lead analytics
router.get('/lead/:id', async (req, res) => {
  try {
    res.json({
      engagement_trend: [],
      conversion_probability: 0.65,
      recommended_actions: [
        'Follow up within 24 hours',
        'Send property matches',
        'Schedule viewing',
      ],
      similar_leads_converted: 8,
    });
  } catch (err) {
    console.error('Error fetching lead analytics:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Escrow analytics
router.get('/escrow/:id', async (req, res) => {
  try {
    res.json({
      completion_percentage: 75,
      days_until_closing: 15,
      commission_breakdown: {
        listing_side: 15000,
        buying_side: 15000,
        adjustments: -500,
      },
      risk_factors: [],
      milestone_progress: {
        inspection: 100,
        appraisal: 100,
        loan_approval: 80,
        closing_prep: 50,
      },
    });
  } catch (err) {
    console.error('Error fetching escrow analytics:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Listing analytics
router.get('/listing/:id', async (req, res) => {
  try {
    res.json({
      estimated_value: 520000,
      days_on_market: 12,
      price_reductions: [
        { date: '2025-06-01', from: 500000, to: 485000 },
      ],
      showing_stats: {
        total: 24,
        week: 3,
      },
    });
  } catch (err) {
    console.error('Error fetching listing analytics:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Appointment analytics
router.get('/appointments/:id', async (req, res) => {
  try {
    res.json({
      attendance: { invited: 5, confirmed: 4, no_shows: 1 },
      duration_metrics: { scheduled: 60, actual: 55 },
      follow_up_tasks: ['Send thank-you note', 'Schedule next call'],
    });
  } catch (err) {
    console.error('Error fetching appointment analytics:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
