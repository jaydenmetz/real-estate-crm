require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('./middleware/rateLimit.middleware');
const logger = require('./utils/logger');
const websocketService = require('./services/websocket.service');
const { initializeDatabase } = require('./config/database');
const { initializeRedis } = require('./config/redis');
const { errorLogging, requestLogging } = require('./middleware/errorLogging');


(async () => {
  try {
    await initializeDatabase();
    console.log('✅ Database ready');
    
    // Try to initialize Redis but don't fail if it's not available
    try {
      await initializeRedis();
      console.log('✅ Redis ready');
    } catch (redisErr) {
      console.warn('⚠️  Redis not available, continuing without cache', redisErr.message);
    }
  } catch (err) {
    console.error('❌ Failed to initialize database', err);
    process.exit(1);
  }
})();

const app = express();

// Trust proxy when running in production (needed for rate limiting and getting real IPs)
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', true);
}

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", "ws:", "wss:"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'https://crm.jaydenmetz.com',
      'https://api.jaydenmetz.com',
      'http://localhost:3000',
      'http://localhost:3001'
    ];
    
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // Allow subdomains of jaydenmetz.com
    if (/^https:\/\/[a-z0-9-]+\.jaydenmetz\.com$/.test(origin)) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Team-ID', 'X-API-Key', 'API-Key'],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// IMPORTANT: Handle preflight OPTIONS requests
app.options('*', cors(corsOptions));

app.use(express.json({ 
  limit: '10mb',
  type: ['application/json', 'text/plain']
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb' 
}));

// Enhanced request logging
app.use(requestLogging);

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

app.use((req, res, next) => {
  const importantRoutes = ['/ai/', '/auth/', '/webhooks/'];
  const shouldLog = importantRoutes.some(route => req.path.includes(route)) || 
                   req.method !== 'GET';
  
  if (shouldLog) {
    logger.info(`${req.method} ${req.path}`, {
      ip: req.ip,
      userAgent: req.get('user-agent')?.substring(0, 100)
    });
  }
  next();
});

// Simple test endpoint
app.get('/test-simple', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.get('/health', (req, res) => {
  const healthData = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.API_VERSION || '1.0.1',
    websocket: {
      status: websocketService.io ? 'running' : 'not_initialized',
      connections: websocketService.getConnectionCount()
    },
    memory: process.memoryUsage(),
    uptime: process.uptime()
  };
  
  res.json(healthData);
});

// Direct test login endpoint - bypasses all middleware
app.post('/direct-login', express.json(), async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Test without database first
    if ((username === 'admin@jaydenmetz.com' || username === 'admin') && password === 'AdminPassword123!') {
      const jwt = require('jsonwebtoken');
      const token = jwt.sign(
        { id: 'test-id', email: username, role: 'admin' },
        '279fffb2e462a0f2d8b41137be7452c4746f99f2ff3dd0aeafb22f2e799c1472',
        { expiresIn: '30d' }
      );
      
      return res.json({
        success: true,
        data: {
          token,
          user: {
            id: 'test-id',
            email: username,
            firstName: 'Admin',
            lastName: 'User',
            role: 'admin'
          }
        }
      });
    }
    
    res.json({ error: 'Invalid credentials' });
    
  } catch (error) {
    res.json({ 
      error: 'Server error', 
      details: error.message
    });
  }
});

app.get('/ws/status', (req, res) => {
  res.json({
    status: websocketService.io ? 'active' : 'inactive',
    connectedClients: websocketService.getConnectionCount(),
    clientIds: websocketService.getConnectedClients()
  });
});

// Import authentication middleware
const { authenticate } = require('./middleware/apiKey.middleware');

const apiRouter = express.Router();
apiRouter.use(rateLimit);

// Public routes (no authentication required)
apiRouter.use('/auth', require('./routes/auth').router);

// API key management (requires JWT auth)
apiRouter.use('/api-keys', require('./routes/apiKeys'));

// API Routes - Using professional .routes.js files with built-in auth
// Each route file handles its own authentication and validation
apiRouter.use('/escrows', require('./routes/escrows')); // Using working escrows.js
apiRouter.use('/listings', require('./routes/listings.routes'));
apiRouter.use('/clients', require('./routes/clients.routes'));
apiRouter.use('/appointments', require('./routes/appointments.routes'));
apiRouter.use('/leads', require('./routes/leads.routes'));
apiRouter.use('/analytics', require('./routes/analytics.routes'));
apiRouter.use('/communications', require('./routes/communications.routes'));
apiRouter.use('/documents', require('./routes/documents.routes'));
apiRouter.use('/ai', require('./routes/ai.routes'));
apiRouter.use('/webhooks', require('./routes/webhooks.routes')); // Webhooks bypass auth for external services

// Debug and test routes (development only)
if (process.env.NODE_ENV === 'development') {
  apiRouter.use('/debug', authenticate, require('./routes/debug'));
  apiRouter.use('/test-connection', require('./routes/test-connection'));
  apiRouter.use('/simple-test', require('./routes/simple-test'));
}
apiRouter.use('/link-preview', authenticate, require('./routes/linkPreview.routes'));

// Financial routes
apiRouter.use('/commissions', require('./routes/commissions.routes'));
apiRouter.use('/invoices', require('./routes/invoices.routes'));
apiRouter.use('/expenses', require('./routes/expenses.routes'));

// Upload routes
apiRouter.use('/upload', require('./routes/upload.routes'));
apiRouter.use('/uploads', require('./routes/upload.routes'));

// Profile and Settings routes
apiRouter.use('/profiles', require('./routes/profiles'));
apiRouter.use('/settings', require('./routes/settings'));

apiRouter.get('/analytics/dashboard', async (req, res) => {
  try {
    // MOCK DASHBOARD DATA - Replace database queries
    const mockDashboardData = {
      // Key Performance Indicators
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
      
      // Financial Metrics
      monthlyVolume: 2850000,
      avgSalePrice: 485000,
      totalCommission: 85500,
      avgDaysToClose: 28,
      
      // Performance Metrics
      leadConversionRate: 18.5,
      listingConversionRate: 78.2,
      avgShowingsPerListing: 12,
      
      // Today's Schedule
      todayAppointments: 3,
      thisWeekAppointments: 14,
      
      // Recent Activity
      recentActivity: [
        {
          id: 1,
          type: 'listing',
          action: 'New listing created',
          details: '123 Main St - $485,000',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 2, 
          type: 'lead',
          action: 'New lead received',
          details: 'Sarah Chen - Website inquiry',
          timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 3,
          type: 'appointment',
          action: 'Appointment scheduled', 
          details: 'Johnson Family - Buyer consultation',
          timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 4,
          type: 'closing',
          action: 'Closing completed',
          details: '789 Oak Ave - Wilson LLC',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        }
      ],

      // Monthly Trend Data (for charts)
      monthlyTrend: [
        { month: 'Jan', volume: 2100000, transactions: 8, avgPrice: 425000 },
        { month: 'Feb', volume: 1950000, transactions: 7, avgPrice: 445000 },
        { month: 'Mar', volume: 2650000, transactions: 9, avgPrice: 465000 },
        { month: 'Apr', volume: 2850000, transactions: 11, avgPrice: 475000 },
        { month: 'May', volume: 2750000, transactions: 10, avgPrice: 485000 },
        { month: 'Jun', volume: 2950000, transactions: 12, avgPrice: 495000 }
      ],

      // Pipeline Data
      pipeline: {
        leads: {
          new: 8,
          contacted: 15,
          qualified: 23,
          appointment: 12,
          contract: 6
        },
        listings: {
          preparation: 3,
          active: 11,
          pending: 4,
          sold: 8
        },
        escrows: {
          opening: 2,
          active: 8,
          contingencies: 3,
          closing: 3
        }
      },

      // Market Statistics
      marketStats: {
        avgDaysOnMarket: 18,
        inventoryLevel: 2.3, // months
        priceAppreciation: 8.5, // percentage
        absorbtonRate: 0.42 // monthly
      },

      // AI Team Status
      aiTeamStatus: {
        totalAgents: 14,
        activeAgents: 12,
        tasksCompleted: 247,
        tokenUsage: 125000,
        costToday: 23.50,
        efficiency: 94.2
      },

      // Urgent Items
      urgentItems: [
        {
          type: 'deadline',
          description: 'Henderson inspection contingency expires',
          dueIn: '2 hours',
          priority: 'high'
        },
        {
          type: 'followup',
          description: 'Wilson contract negotiation response needed',
          dueIn: '4 hours', 
          priority: 'high'
        },
        {
          type: 'showing',
          description: 'Schedule additional showings for Johnson family',
          dueIn: '1 day',
          priority: 'medium'
        }
      ],

      // Goals & Targets
      monthlyTargets: {
        volume: {
          target: 3500000,
          current: 2850000,
          percentage: 81.4
        },
        transactions: {
          target: 15,
          current: 12,
          percentage: 80.0
        },
        newLeads: {
          target: 50,
          current: 47,
          percentage: 94.0
        },
        listings: {
          target: 20,
          current: 15,
          percentage: 75.0
        }
      },

      // Birthdays & Anniversaries (Client Relationship)
      upcomingEvents: [
        {
          type: 'birthday',
          client: 'Martinez Family', 
          date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          note: 'Send birthday card'
        },
        {
          type: 'anniversary', 
          client: 'Thompson Family',
          date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          note: '2-year home anniversary'
        }
      ]
    };
    
    res.json({
      success: true,
      data: mockDashboardData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Dashboard analytics error:', error);
    res.status(500).json({
      success: false,
      error: { 
        code: 'ANALYTICS_ERROR', 
        message: 'Failed to fetch analytics' 
      }
    });
  }
});

// Also add these additional endpoints that might be called:

// Clients endpoint
apiRouter.get('/clients', async (req, res) => {
  try {
    const mockClients = [
      {
        id: '1',
        firstName: 'John',
        lastName: 'Henderson', 
        email: 'john.henderson@email.com',
        phone: '(555) 123-4567',
        clientType: 'Buyer',
        clientStatus: 'Active',
        preferredContact: 'Email',
        notes: 'First-time homebuyer, budget $450k',
        tags: ['buyer', 'first-time'],
        createdAt: '2025-06-15T10:00:00Z',
        lastContact: '2025-07-05T14:30:00Z'
      },
      {
        id: '2', 
        firstName: 'Sarah',
        lastName: 'Martinez',
        email: 'sarah.martinez@email.com',
        phone: '(555) 234-5678',
        clientType: 'Seller',
        clientStatus: 'Active', 
        preferredContact: 'Phone',
        notes: 'Relocating for job, needs quick sale',
        tags: ['seller', 'relocation'],
        createdAt: '2025-06-20T09:15:00Z',
        lastContact: '2025-07-06T11:00:00Z'
      },
      {
        id: '3',
        firstName: 'Mike',
        lastName: 'Johnson',
        email: 'mike.johnson@email.com', 
        phone: '(555) 345-6789',
        clientType: 'Both',
        clientStatus: 'Active',
        preferredContact: 'Text',
        notes: 'Upgrading to larger home, sell first',
        tags: ['buyer', 'seller', 'move-up'],
        createdAt: '2025-05-10T16:45:00Z',
        lastContact: '2025-07-04T13:20:00Z'
      }
    ];

    res.json({
      success: true,
      data: {
        clients: mockClients,
        total: mockClients.length,
        page: 1,
        pages: 1
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching clients:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch clients'
      }
    });
  }
});

// Leads endpoint
apiRouter.get('/leads', async (req, res) => {
  try {
    const mockLeads = [
      {
        id: '1',
        firstName: 'Sarah',
        lastName: 'Chen',
        email: 'sarah.chen@email.com',
        phone: '(555) 456-7890',
        leadSource: 'Website',
        leadType: 'Buyer',
        leadStatus: 'New',
        score: 85,
        budget: 375000,
        timeline: '3-6 months',
        notes: 'Interested in downtown condos',
        tags: ['buyer', 'condo', 'downtown'],
        createdAt: '2025-07-06T08:30:00Z',
        lastContact: null
      },
      {
        id: '2',
        firstName: 'David',
        lastName: 'Rodriguez',
        email: 'david.rodriguez@email.com',
        phone: '(555) 567-8901', 
        leadSource: 'Referral',
        leadType: 'Seller',
        leadStatus: 'Contacted',
        score: 92,
        propertyValue: 525000,
        timeline: '1-2 months',
        notes: 'Referred by Martinez family',
        tags: ['seller', 'referral', 'high-value'],
        createdAt: '2025-07-05T14:20:00Z',
        lastContact: '2025-07-06T09:15:00Z'
      }
    ];

    res.json({
      success: true,
      data: {
        leads: mockLeads,
        total: mockLeads.length,
        page: 1,
        pages: 1
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching leads:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch leads'
      }
    });
  }
});

// Mock Escrows endpoint - DISABLED (using database route instead)
// apiRouter.get('/escrows', async (req, res) => {
//   try {
//     const mockEscrows = [
//       {
//         id: '1',
//         propertyAddress: '123 Main St, Anytown, CA 12345',
//         purchasePrice: 485000,
//         buyers: ['Henderson Family'],
//         sellers: ['Smith Family'], 
//         acceptanceDate: '2025-06-15',
//         closingDate: '2025-07-15',
//         status: 'Active',
//         escrowNumber: 'ESC-2025-001',
//         titleCompany: 'First American Title',
//         lender: 'Wells Fargo Bank',
//         agent: 'You',
//         commission: 14550
//       },
//       {
//         id: '2',
//         propertyAddress: '456 Oak Ave, Anytown, CA 12345', 
//         purchasePrice: 525000,
//         buyers: ['Wilson LLC'],
//         sellers: ['Rodriguez Family'],
//         acceptanceDate: '2025-06-20',
//         closingDate: '2025-07-20',
//         status: 'Pending',
//         escrowNumber: 'ESC-2025-002', 
//         titleCompany: 'Chicago Title',
//         lender: 'Bank of America',
//         agent: 'You',
//         commission: 15750
//       }
//     ];
// 
//     res.json({
//       success: true,
//       data: {
//         escrows: mockEscrows,
//         total: mockEscrows.length,
//         page: 1,
//         pages: 1
//       },
//       timestamp: new Date().toISOString()
//     });
//   } catch (error) {
//     logger.error('Error fetching escrows:', error);
//     res.status(500).json({
//       success: false,
//       error: {
//         code: 'FETCH_ERROR', 
//         message: 'Failed to fetch escrows'
//       }
//     });
//   }
// });

// Listings endpoint
apiRouter.get('/listings', async (req, res) => {
  try {
    const mockListings = [
      {
        id: '1',
        address: '789 Pine St, Anytown, CA 12345',
        listPrice: 565000,
        listDate: '2025-06-25',
        status: 'Active',
        daysOnMarket: 11,
        mlsNumber: 'MLS123456',
        bedrooms: 3,
        bathrooms: 2,
        squareFeet: 1850,
        yearBuilt: 2018,
        propertyType: 'Single Family',
        sellers: ['Thompson Family'],
        showings: 8,
        offers: 1
      },
      {
        id: '2',
        address: '321 Elm Dr, Anytown, CA 12345',
        listPrice: 425000,
        listDate: '2025-07-01', 
        status: 'Active',
        daysOnMarket: 5,
        mlsNumber: 'MLS234567',
        bedrooms: 2,
        bathrooms: 2,
        squareFeet: 1250,
        yearBuilt: 2020,
        propertyType: 'Condo',
        sellers: ['Garcia Family'],
        showings: 12,
        offers: 2
      }
    ];

    res.json({
      success: true,
      data: {
        listings: mockListings,
        total: mockListings.length,
        page: 1,
        pages: 1
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching listings:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch listings'
      }
    });
  }
});

app.use(`/${process.env.API_VERSION || 'v1'}`, apiRouter);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static('public'));
}

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Endpoint not found',
      suggestion: 'Check the API documentation for valid endpoints'
    },
    timestamp: new Date().toISOString()
  });
});

// Enhanced error logging middleware
app.use(errorLogging);

module.exports = app;