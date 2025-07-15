const express = require('express');
const router = express.Router();
const { authenticateToken } = require('./auth');
const databaseService = require('../services/database.service');

// Apply authentication to all routes
router.use(authenticateToken);

// GET /v1/analytics/overview - Get comprehensive business overview
router.get('/overview', (req, res) => {
  try {
    // Get all data
    const escrows = databaseService.getAll('escrows');
    const listings = databaseService.getAll('listings');
    const clients = databaseService.getAll('clients');
    const appointments = databaseService.getAll('appointments');
    const leads = databaseService.getAll('leads');
    const analytics = databaseService.getAll('analytics');

    // Get YTD data
    const ytd = databaseService.getById('analytics', 'ytd');
    const monthlyData = databaseService.getById('analytics', 'monthly');
    const goals = databaseService.getById('analytics', 'goals');

    // Calculate current month metrics
    const now = new Date();
    const thisMonth = now.toISOString().slice(0, 7);
    const thisMonthEscrows = escrows.filter(e => 
      e.escrowOpenDate?.slice(0, 7) === thisMonth
    );
    
    // Real-time metrics
    const activeEscrows = escrows.filter(e => e.escrowStatus === 'active');
    const pendingClosings = escrows.filter(e => {
      const closeDate = new Date(e.scheduledCoeDate);
      const daysToClose = Math.floor((closeDate - now) / (24 * 60 * 60 * 1000));
      return e.escrowStatus === 'active' && daysToClose <= 7 && daysToClose >= 0;
    });

    // Performance metrics
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const recentClosings = escrows.filter(e => 
      e.escrowStatus === 'closed' && 
      new Date(e.actualCoeDate) >= last30Days
    );

    // Lead conversion funnel
    const leadFunnel = {
      totalLeads: leads.length,
      contacted: leads.filter(l => l.status === 'Contacted').length,
      qualified: leads.filter(l => l.status === 'Qualified').length,
      converted: leads.filter(l => l.status === 'Converted').length,
      conversionRate: leads.length > 0 
        ? Math.round((leads.filter(l => l.status === 'Converted').length / leads.length) * 100)
        : 0
    };

    // Activity metrics
    const todayAppointments = appointments.filter(a => {
      const aptDate = new Date(a.startDate);
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return aptDate >= today && aptDate < new Date(today.getTime() + 24 * 60 * 60 * 1000);
    });

    const upcomingAppointments = appointments.filter(a => 
      new Date(a.startDate) > now && 
      ['Scheduled', 'Confirmed'].includes(a.status)
    ).slice(0, 5);

    // Financial performance
    const currentQuarter = Math.floor(now.getMonth() / 3);
    const quarterStart = new Date(now.getFullYear(), currentQuarter * 3, 1);
    const quarterEscrows = escrows.filter(e => 
      e.escrowStatus === 'closed' && 
      new Date(e.actualCoeDate) >= quarterStart
    );

    const quarterMetrics = {
      deals: quarterEscrows.length,
      volume: quarterEscrows.reduce((sum, e) => sum + (e.purchasePrice || 0), 0),
      commission: quarterEscrows.reduce((sum, e) => sum + (e.myCommission || 0), 0)
    };

    // Top performers
    const topListings = listings
      .filter(l => l.listingStatus === 'Active')
      .sort((a, b) => (b.showings + b.inquiries) - (a.showings + a.inquiries))
      .slice(0, 5)
      .map(l => ({
        id: l.id,
        address: l.propertyAddress,
        price: l.listPrice,
        showings: l.showings,
        inquiries: l.inquiries,
        daysOnMarket: l.daysOnMarket
      }));

    const hotLeads = leads
      .filter(l => l.leadScore >= 80)
      .sort((a, b) => b.leadScore - a.leadScore)
      .slice(0, 5)
      .map(l => ({
        id: l.id,
        name: `${l.firstName} ${l.lastName}`,
        score: l.leadScore,
        source: l.source,
        interest: l.interest,
        timeframe: l.timeframe
      }));

    res.json({
      success: true,
      data: {
        // Key Metrics
        keyMetrics: {
          activeEscrows: activeEscrows.length,
          pendingClosings: pendingClosings.length,
          activeListings: listings.filter(l => l.listingStatus === 'Active').length,
          totalClients: clients.length,
          monthlyVolume: thisMonthEscrows.reduce((sum, e) => sum + (e.purchasePrice || 0), 0),
          monthlyCommission: thisMonthEscrows.reduce((sum, e) => sum + (e.myCommission || 0), 0)
        },

        // Year to Date
        yearToDate: ytd || {
          totalClosedDeals: recentClosings.length,
          totalVolume: recentClosings.reduce((sum, e) => sum + (e.purchasePrice || 0), 0),
          totalCommission: recentClosings.reduce((sum, e) => sum + (e.myCommission || 0), 0),
          avgDaysToClose: 42,
          clientSatisfaction: 4.8
        },

        // Goals Progress
        goalsProgress: goals || {
          annual: {
            closedDeals: { target: 36, current: ytd?.totalClosedDeals || 0 },
            volume: { target: 25000000, current: ytd?.totalVolume || 0 },
            commission: { target: 750000, current: ytd?.totalCommission || 0 }
          }
        },

        // Current Quarter
        currentQuarter: {
          quarter: `Q${currentQuarter + 1} ${now.getFullYear()}`,
          ...quarterMetrics,
          target: goals?.quarterly || {
            deals: 9,
            volume: 6250000,
            commission: 187500
          }
        },

        // Lead Funnel
        leadFunnel,

        // Activity Summary
        activitySummary: {
          todayAppointments: todayAppointments.length,
          upcomingAppointments: upcomingAppointments.length,
          recentContacts: clients.filter(c => {
            const contact = new Date(c.lastContactDate);
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return contact >= weekAgo;
          }).length,
          pendingFollowUps: clients.filter(c => {
            const followUp = new Date(c.nextFollowUpDate);
            return followUp <= now;
          }).length
        },

        // Top Performers
        topPerformers: {
          listings: topListings,
          leads: hotLeads
        },

        // Recent Activity
        recentActivity: {
          newLeads: leads.filter(l => {
            const created = new Date(l.createdDate);
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return created >= weekAgo;
          }).length,
          newListings: listings.filter(l => {
            const listed = new Date(l.listDate);
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return listed >= weekAgo;
          }).length,
          completedAppointments: appointments.filter(a => {
            const completed = new Date(a.endDate);
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return a.status === 'Completed' && completed >= weekAgo;
          }).length
        },

        // Monthly Trend
        monthlyTrend: monthlyData || []
      }
    });
  } catch (error) {
    console.error('Error fetching analytics overview:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to fetch analytics overview'
      }
    });
  }
});

// GET /v1/analytics/performance - Get detailed performance metrics
router.get('/performance', (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    // Calculate date range
    const now = new Date();
    let startDate;
    
    switch(period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'ytd':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const escrows = databaseService.getAll('escrows');
    const listings = databaseService.getAll('listings');
    const appointments = databaseService.getAll('appointments');
    
    // Filter by period
    const periodEscrows = escrows.filter(e => 
      new Date(e.escrowOpenDate) >= startDate
    );
    
    const periodListings = listings.filter(l => 
      new Date(l.listDate) >= startDate
    );
    
    const periodAppointments = appointments.filter(a => 
      new Date(a.startDate) >= startDate
    );

    // Calculate metrics
    const performance = {
      period,
      startDate: startDate.toISOString(),
      endDate: now.toISOString(),
      
      escrows: {
        opened: periodEscrows.length,
        closed: periodEscrows.filter(e => e.escrowStatus === 'closed').length,
        cancelled: periodEscrows.filter(e => e.escrowStatus === 'cancelled').length,
        totalVolume: periodEscrows.reduce((sum, e) => sum + (e.purchasePrice || 0), 0),
        totalCommission: periodEscrows.reduce((sum, e) => sum + (e.myCommission || 0), 0),
        avgPrice: periodEscrows.length > 0 
          ? Math.round(periodEscrows.reduce((sum, e) => sum + (e.purchasePrice || 0), 0) / periodEscrows.length)
          : 0
      },
      
      listings: {
        new: periodListings.length,
        sold: periodListings.filter(l => l.listingStatus === 'Sold').length,
        expired: periodListings.filter(l => l.listingStatus === 'Expired').length,
        avgDaysOnMarket: periodListings.length > 0
          ? Math.round(periodListings.reduce((sum, l) => sum + (l.daysOnMarket || 0), 0) / periodListings.length)
          : 0,
        totalShowings: periodListings.reduce((sum, l) => sum + (l.showings || 0), 0),
        totalInquiries: periodListings.reduce((sum, l) => sum + (l.inquiries || 0), 0)
      },
      
      appointments: {
        total: periodAppointments.length,
        completed: periodAppointments.filter(a => a.status === 'Completed').length,
        cancelled: periodAppointments.filter(a => a.status === 'Cancelled').length,
        showings: periodAppointments.filter(a => a.type === 'Showing').length,
        listingPresentations: periodAppointments.filter(a => a.type === 'Listing Presentation').length,
        conversionRate: periodAppointments.filter(a => a.type === 'Showing').length > 0
          ? Math.round(
              (periodAppointments.filter(a => a.type === 'Showing' && a.outcome === 'Made Offer').length / 
               periodAppointments.filter(a => a.type === 'Showing').length) * 100
            )
          : 0
      }
    };

    res.json({
      success: true,
      data: performance
    });
  } catch (error) {
    console.error('Error fetching performance metrics:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to fetch performance metrics'
      }
    });
  }
});

// GET /v1/analytics/forecast - Get business forecast
router.get('/forecast', (req, res) => {
  try {
    const escrows = databaseService.getAll('escrows');
    const listings = databaseService.getAll('listings');
    const monthlyData = databaseService.getById('analytics', 'monthly');
    
    // Calculate trends
    const last3Months = monthlyData?.slice(-3) || [];
    const avgMonthlyDeals = last3Months.length > 0
      ? Math.round(last3Months.reduce((sum, m) => sum + m.closedDeals, 0) / last3Months.length)
      : 3;
    
    const avgMonthlyVolume = last3Months.length > 0
      ? Math.round(last3Months.reduce((sum, m) => sum + m.volume, 0) / last3Months.length)
      : 2000000;

    // Pipeline analysis
    const activeEscrows = escrows.filter(e => e.escrowStatus === 'active');
    const next30Days = activeEscrows.filter(e => {
      const closeDate = new Date(e.scheduledCoeDate);
      const daysToClose = Math.floor((closeDate - new Date()) / (24 * 60 * 60 * 1000));
      return daysToClose <= 30 && daysToClose >= 0;
    });
    
    const next60Days = activeEscrows.filter(e => {
      const closeDate = new Date(e.scheduledCoeDate);
      const daysToClose = Math.floor((closeDate - new Date()) / (24 * 60 * 60 * 1000));
      return daysToClose <= 60 && daysToClose > 30;
    });

    // Forecast next 3 months
    const forecast = [];
    const now = new Date();
    
    for (let i = 1; i <= 3; i++) {
      const forecastDate = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const monthName = forecastDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      
      forecast.push({
        month: monthName,
        predictedDeals: avgMonthlyDeals + Math.floor(Math.random() * 2 - 1),
        predictedVolume: avgMonthlyVolume + Math.floor(Math.random() * 500000 - 250000),
        predictedCommission: (avgMonthlyVolume * 0.025) + Math.floor(Math.random() * 10000 - 5000),
        confidence: 75 + Math.floor(Math.random() * 15)
      });
    }

    res.json({
      success: true,
      data: {
        pipeline: {
          next30Days: {
            count: next30Days.length,
            volume: next30Days.reduce((sum, e) => sum + (e.purchasePrice || 0), 0),
            commission: next30Days.reduce((sum, e) => sum + (e.myCommission || 0), 0)
          },
          next60Days: {
            count: next60Days.length,
            volume: next60Days.reduce((sum, e) => sum + (e.purchasePrice || 0), 0),
            commission: next60Days.reduce((sum, e) => sum + (e.myCommission || 0), 0)
          },
          totalPipeline: {
            count: activeEscrows.length,
            volume: activeEscrows.reduce((sum, e) => sum + (e.purchasePrice || 0), 0),
            commission: activeEscrows.reduce((sum, e) => sum + (e.myCommission || 0), 0)
          }
        },
        
        forecast,
        
        opportunities: {
          hotListings: listings.filter(l => 
            l.listingStatus === 'Active' && 
            (l.showings > 20 || l.inquiries > 30)
          ).length,
          
          expiringListings: listings.filter(l => {
            const expDate = new Date(l.expirationDate);
            const daysToExpire = Math.floor((expDate - new Date()) / (24 * 60 * 60 * 1000));
            return l.listingStatus === 'Active' && daysToExpire <= 30 && daysToExpire >= 0;
          }).length,
          
          qualifiedLeads: databaseService.getAll('leads').filter(l => 
            l.status === 'Qualified' && l.leadScore >= 70
          ).length
        },
        
        riskFactors: [
          {
            type: 'Stale Listings',
            count: listings.filter(l => l.listingStatus === 'Active' && l.daysOnMarket > 60).length,
            impact: 'Medium'
          },
          {
            type: 'Delayed Closings',
            count: activeEscrows.filter(e => {
              const closeDate = new Date(e.scheduledCoeDate);
              return closeDate < new Date();
            }).length,
            impact: 'High'
          },
          {
            type: 'Cold Leads',
            count: databaseService.getAll('leads').filter(l => 
              l.status === 'New' && 
              (new Date() - new Date(l.createdDate)) > 7 * 24 * 60 * 60 * 1000
            ).length,
            impact: 'Low'
          }
        ]
      }
    });
  } catch (error) {
    console.error('Error fetching forecast:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to fetch forecast'
      }
    });
  }
});

module.exports = router;