// In-memory database with persistent mock data
class DatabaseService {
  constructor() {
    this.collections = {
      escrows: new Map(),
      listings: new Map(),
      clients: new Map(),
      appointments: new Map(),
      leads: new Map(),
      analytics: new Map(),
    };

    // Initialize with mock data on startup
    this.initializeMockData();
  }

  // Initialize mock data for all collections
  initializeMockData() {
    // Generate comprehensive mock escrows
    for (let i = 1; i <= 25; i++) {
      const escrow = this.generateMockEscrow(i);
      this.collections.escrows.set(escrow.id, escrow);
    }

    // Generate mock listings
    for (let i = 1; i <= 50; i++) {
      const listing = this.generateMockListing(i);
      this.collections.listings.set(listing.id, listing);
    }

    // Generate mock clients
    for (let i = 1; i <= 100; i++) {
      const client = this.generateMockClient(i);
      this.collections.clients.set(client.id, client);
    }

    // Generate mock appointments
    for (let i = 1; i <= 30; i++) {
      const appointment = this.generateMockAppointment(i);
      this.collections.appointments.set(appointment.id, appointment);
    }

    // Generate mock leads
    for (let i = 1; i <= 75; i++) {
      const lead = this.generateMockLead(i);
      this.collections.leads.set(lead.id, lead);
    }

    // Generate analytics data
    this.generateAnalyticsData();
  }

  generateMockEscrow(id) {
    const statuses = ['active', 'pending', 'closed', 'cancelled'];
    const transactionTypes = ['Purchase', 'Sale', 'Purchase & Sale', 'Refinance'];
    const propertyTypes = ['Single Family', 'Condo', 'Townhouse', 'Multi-Family', 'Land'];
    const addresses = [
      '456 Ocean View Dr, Malibu, CA 90265',
      '789 Sunset Blvd, Beverly Hills, CA 90210',
      '321 Beach Way, Santa Monica, CA 90405',
      '654 Mountain View Rd, Pasadena, CA 91101',
      '987 Valley Vista, Sherman Oaks, CA 91403',
      '147 Hillside Ave, Hollywood Hills, CA 90068',
      '258 Canyon Dr, Topanga, CA 90290',
      '369 Marina Way, Marina del Rey, CA 90292',
      '741 Palm Dr, Venice, CA 90291',
      '852 Highland Park, Glendale, CA 91206',
    ];

    const randomAddress = addresses[id % addresses.length];
    const status = statuses[id % statuses.length];
    const basePrice = 500000 + (id * 50000);
    const openDate = new Date(Date.now() - (30 + id) * 24 * 60 * 60 * 1000);
    const closeDate = new Date(openDate.getTime() + 45 * 24 * 60 * 60 * 1000);

    return {
      id: String(id),

      // Core Information
      escrowNumber: `${new Date().getFullYear()}-${String(id).padStart(4, '0')}`,
      propertyAddress: randomAddress,
      escrowStatus: status,
      transactionType: transactionTypes[id % transactionTypes.length],
      escrowOpenDate: openDate.toISOString(),
      scheduledCoeDate: closeDate.toISOString(),
      actualCoeDate: status === 'closed' ? closeDate.toISOString() : null,
      mlsNumber: `ML${String(id * 1000 + 23456).padStart(7, '0')}`,
      propertyType: propertyTypes[id % propertyTypes.length],

      // Property Details
      propertyImages: [
        'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800',
        'https://images.unsplash.com/photo-1565953522043-baea26b83b7e?w=800',
        'https://images.unsplash.com/photo-1560184897-ae75f418493e?w=800',
        'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800',
        'https://images.unsplash.com/photo-1556912173-3bb406ef7e77?w=800',
      ],
      bedrooms: 2 + (id % 4),
      bathrooms: 2 + (id % 3),
      squareFootage: 1500 + (id * 100),
      // Realistic lot sizes based on property type and area
      lotSize: (() => {
        const propertyType = propertyTypes[id % propertyTypes.length];
        const baseSize = {
          'Single Family': 6500,
          Condo: 0, // Condos typically don't have lot sizes
          Townhouse: 2200,
          'Multi-Family': 8500,
          Land: 43560, // 1 acre
        }[propertyType] || 6500;

        // Add variation based on location and id
        if (propertyType === 'Condo') return 0;
        if (propertyType === 'Land') return baseSize * (1 + (id % 5)); // 1-5 acres

        // For houses, vary between 80% and 150% of base size
        const variation = 0.8 + (id % 8) * 0.1;
        return Math.round(baseSize * variation);
      })(),
      yearBuilt: 1990 + (id % 30),
      propertyDescription: `Beautiful ${propertyTypes[id % propertyTypes.length]} featuring modern amenities, stunning views, and prime location. Recently renovated with high-end finishes throughout.`,
      propertyFeatures: [
        'Hardwood Floors',
        'Granite Countertops',
        'Stainless Steel Appliances',
        'Central AC/Heat',
        'Attached Garage',
        'Pool/Spa',
        'Ocean View',
        'Walk-in Closets',
      ],

      // Financial Details
      purchasePrice: basePrice,
      listPrice: basePrice * 0.98,
      loanAmount: basePrice * 0.8,
      downPaymentAmount: basePrice * 0.2,
      downPaymentPercentage: 20,
      earnestMoneyDeposit: basePrice * 0.03,
      commissionPercentageBuySide: 2.5,
      commissionPercentageListSide: 2.5,
      grossCommission: basePrice * 0.05,
      myCommission: basePrice * 0.025,
      commissionSplit: 50,
      commissionAdjustments: 0,
      commissionAdjustmentNotes: '',
      referralFee: id % 3 === 0 ? basePrice * 0.0025 : 0,
      transactionCoordinatorFee: 495,
      homeWarrantyCost: 450,
      expenseAdjustments: 0,
      totalExpenses: 945,
      netCommission: (basePrice * 0.025) - 945,
      cashToClose: basePrice * 0.22,

      // Relations
      clients: [{
        id: String(id),
        name: `John Buyer ${id}`,
        role: 'Buyer',
        email: `buyer${id}@email.com`,
        phone: `(310) 555-${String(1000 + id).padStart(4, '0')}`,
        avatar: `https://i.pravatar.cc/150?u=buyer${id}`,
      }, {
        id: `CLT-${String(id + 100).padStart(6, '0')}`,
        name: `Jane Seller ${id}`,
        role: 'Seller',
        email: `seller${id}@email.com`,
        phone: `(310) 555-${String(2000 + id).padStart(4, '0')}`,
        avatar: `https://i.pravatar.cc/150?u=seller${id}`,
      }],

      buyerAgent: {
        name: 'Jayden Metz',
        email: 'realtor@jaydenmetz.com',
        phone: '(661) 747-0853',
        licenseNumber: '02203217',
        brokerageName: 'Metz Realty Group',
      },

      listingAgent: {
        name: `Sarah Agent ${id}`,
        email: `agent${id}@realty.com`,
        phone: `(310) 555-${String(3000 + id).padStart(4, '0')}`,
        licenseNumber: `0${1234567 + id}`,
        brokerageName: 'Luxury Realty Partners',
      },

      loanOfficer: {
        name: `Mike Lender ${id}`,
        company: 'Premier Mortgage',
        email: `lender${id}@mortgage.com`,
        phone: `(310) 555-${String(4000 + id).padStart(4, '0')}`,
        nmls: `${123456 + id}`,
      },

      escrowOfficer: {
        name: `Lisa Escrow ${id}`,
        company: 'Secure Escrow Services',
        email: `escrow${id}@escrow.com`,
        phone: `(310) 555-${String(5000 + id).padStart(4, '0')}`,
      },

      // Important Dates
      acceptanceDate: openDate.toISOString(),
      emdDueDate: new Date(openDate.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      emdReceivedDate: new Date(openDate.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      inspectionPeriodEndDate: new Date(openDate.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      contingencyRemovalDate: new Date(openDate.getTime() + 17 * 24 * 60 * 60 * 1000).toISOString(),
      loanApprovalDate: new Date(openDate.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      clearToCloseDate: new Date(openDate.getTime() + 40 * 24 * 60 * 60 * 1000).toISOString(),
      signingDate: new Date(openDate.getTime() + 43 * 24 * 60 * 60 * 1000).toISOString(),
      fundingDate: new Date(openDate.getTime() + 44 * 24 * 60 * 60 * 1000).toISOString(),
      recordingDate: closeDate.toISOString(),
      possessionDate: closeDate.toISOString(),

      // Checklist Progress
      checklistProgress: {
        phase1: { completed: 8, total: 10, percentage: 80 },
        phase2: { completed: 5, total: 8, percentage: 62.5 },
        phase3: { completed: 3, total: 7, percentage: 42.8 },
        overall: { completed: 16, total: 25, percentage: 64 },
      },

      // Timeline Events
      timeline: [
        {
          date: openDate.toISOString(),
          event: 'Escrow Opened',
          type: 'milestone',
          icon: 'start',
          description: 'Purchase agreement executed and escrow opened',
        },
        {
          date: new Date(openDate.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          event: 'EMD Received',
          type: 'financial',
          icon: 'payment',
          description: `Earnest money deposit of $${(basePrice * 0.03).toLocaleString()} received`,
        },
        {
          date: new Date(openDate.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          event: 'Home Inspection Completed',
          type: 'inspection',
          icon: 'inspection',
          description: 'Property inspection completed, report pending',
        },
        {
          date: new Date(openDate.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          event: 'Appraisal Ordered',
          type: 'financial',
          icon: 'assessment',
          description: 'Lender ordered property appraisal',
        },
      ],

      // Activity Stats
      activityStats: {
        daysInEscrow: Math.floor((Date.now() - openDate.getTime()) / (24 * 60 * 60 * 1000)),
        daysToClose: Math.floor((closeDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000)),
        tasksCompletedToday: id % 5,
        upcomingDeadlines: 3 + (id % 4),
        documentsUploaded: 12 + (id % 10),
        communicationScore: 85 + (id % 15),
      },

      // Market Comparison
      marketComparison: {
        avgDaysOnMarket: 35,
        avgSalePrice: basePrice * 1.02,
        pricePerSqft: Math.round(basePrice / (1500 + (id * 100))),
        neighborhoodTrend: '+5.2%',
        similarProperties: [
          { address: '123 Nearby St', price: basePrice * 0.95, sqft: 1600 },
          { address: '456 Adjacent Ave', price: basePrice * 1.05, sqft: 1700 },
          { address: '789 Local Ln', price: basePrice * 0.98, sqft: 1550 },
        ],
      },

      // AI Insights
      aiInsights: {
        riskScore: 15 + (id % 20),
        riskFactors: [
          'Loan approval pending',
          'Appraisal not yet received',
          'HOA documents review needed',
        ],
        recommendations: [
          'Follow up with lender on appraisal status',
          'Schedule final walkthrough for next week',
          'Confirm wire instructions with escrow',
        ],
        predictedCloseDate: closeDate.toISOString(),
        confidenceLevel: 85 + (id % 10),
      },

      // System Fields
      createdDate: openDate.toISOString(),
      lastModifiedDate: new Date().toISOString(),
      createdBy: 'jaydenmetz',
      assignedTo: 'jaydenmetz',
      tags: ['priority', 'first-time-buyer', 'fha-loan'],
      priorityLevel: id % 3 === 0 ? 'high' : 'normal',
      archivedStatus: false,
    };
  }

  generateMockListing(id) {
    const statuses = ['Active', 'Pending', 'Sold', 'Expired', 'Coming Soon'];
    const propertyTypes = ['Single Family', 'Condo', 'Townhouse', 'Multi-Family', 'Land'];
    const listingTypes = ['Exclusive', 'Open', 'Pocket', 'MLS'];

    const basePrice = 400000 + (id * 25000);
    const listDate = new Date(Date.now() - (id * 2) * 24 * 60 * 60 * 1000);

    return {
      id: String(id),
      mlsNumber: `ML${String(id * 1000 + 12345).padStart(7, '0')}`,

      // Basic Info
      propertyAddress: `${100 + id * 10} ${['Oak', 'Pine', 'Elm', 'Maple', 'Cedar'][id % 5]} Street, ${['Beverly Hills', 'Santa Monica', 'Malibu', 'Pasadena', 'Glendale'][id % 5]}, CA ${90210 + id % 100}`,
      listingStatus: statuses[id % statuses.length],
      listingType: listingTypes[id % listingTypes.length],
      propertyType: propertyTypes[id % propertyTypes.length],

      // Pricing
      listPrice: basePrice,
      originalListPrice: basePrice * 1.05,
      pricePerSqft: Math.round(basePrice / (1200 + id * 50)),

      // Property Details
      bedrooms: 2 + (id % 4),
      bathrooms: 1.5 + (id % 3) * 0.5,
      squareFootage: 1200 + (id * 50),
      // Realistic lot sizes based on property type
      lotSize: (() => {
        const type = propertyTypes[id % propertyTypes.length];
        const baseSizes = {
          'Single Family': 7200,
          Condo: 0,
          Townhouse: 2500,
          'Multi-Family': 10000,
          Land: 43560, // 1 acre
        };
        const base = baseSizes[type] || 7200;
        if (type === 'Condo') return 0;
        if (type === 'Land') return base * (1 + (id % 10)); // 1-10 acres
        // Vary lot size by +/- 30%
        return Math.round(base * (0.7 + (id % 7) * 0.1));
      })(),
      yearBuilt: 1985 + (id % 35),

      // Listing Details
      listDate: listDate.toISOString(),
      expirationDate: new Date(listDate.getTime() + 180 * 24 * 60 * 60 * 1000).toISOString(),
      daysOnMarket: Math.floor((Date.now() - listDate.getTime()) / (24 * 60 * 60 * 1000)),

      // Media
      photos: [
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
        'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800',
        'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800',
      ],
      virtualTourUrl: `https://my.matterport.com/show/?m=listing${id}`,

      // Marketing
      marketingRemarks: `Stunning ${propertyTypes[id % propertyTypes.length]} in prime location. Features include updated kitchen, hardwood floors, and beautiful landscaping.`,
      showingInstructions: 'Call listing agent for appointment. 24hr notice required.',

      // Commission
      commissionPercentage: 5,
      buyerAgentCommission: 2.5,

      // Seller Info
      seller: {
        id: `CLT-${String(id + 200).padStart(6, '0')}`,
        name: `Owner ${id}`,
        phone: `(310) 555-${String(6000 + id).padStart(4, '0')}`,
        email: `owner${id}@email.com`,
      },

      // Activity
      showings: 15 + (id % 20),
      inquiries: 25 + (id % 30),
      saves: 45 + (id % 50),

      createdDate: listDate.toISOString(),
      lastModifiedDate: new Date().toISOString(),
    };
  }

  generateMockClient(id) {
    const types = ['Buyer', 'Seller', 'Buyer & Seller', 'Past Client', 'Prospect'];
    const sources = ['Referral', 'Website', 'Open House', 'Social Media', 'Cold Call', 'Zillow'];
    const stages = ['New', 'Qualified', 'Showing', 'Offer', 'Contract', 'Closed'];

    return {
      id: String(id),

      // Personal Info
      firstName: ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Lisa'][id % 6],
      lastName: `Client${id}`,
      email: `client${id}@email.com`,
      phone: `(310) 555-${String(7000 + id).padStart(4, '0')}`,
      avatar: `https://i.pravatar.cc/150?u=client${id}`,

      // Client Details
      clientType: types[id % types.length],
      stage: stages[id % stages.length],
      source: sources[id % sources.length],

      // Preferences
      priceRangeMin: 300000 + (id * 10000),
      priceRangeMax: 500000 + (id * 15000),
      preferredLocations: ['Beverly Hills', 'Santa Monica', 'Manhattan Beach'],
      propertyTypes: ['Single Family', 'Condo'],
      bedrooms: 2 + (id % 3),
      bathrooms: 2,

      // Activity
      lastContactDate: new Date(Date.now() - (id % 30) * 24 * 60 * 60 * 1000).toISOString(),
      nextFollowUpDate: new Date(Date.now() + (id % 7) * 24 * 60 * 60 * 1000).toISOString(),
      notes: `Interested in ${['modern', 'traditional', 'contemporary'][id % 3]} style homes. ${['First-time buyer', 'Investor', 'Upgrading'][id % 3]}.`,

      // Transactions
      activeEscrows: id % 3,
      closedTransactions: id % 5,
      totalVolume: (id % 5) * 500000,

      // Communication Preferences
      preferredContact: ['Email', 'Phone', 'Text'][id % 3],
      communicationFrequency: ['Daily', 'Weekly', 'Bi-weekly'][id % 3],

      // Important Dates
      birthday: `${1970 + (id % 30)}-${String(1 + (id % 12)).padStart(2, '0')}-${String(1 + (id % 28)).padStart(2, '0')}`,
      anniversaryDate: id % 2 === 0 ? `${2010 + (id % 10)}-06-15` : null,

      // Tags
      tags: ['VIP', 'Referral Source', 'Cash Buyer', 'Investor'][id % 4],

      createdDate: new Date(Date.now() - (90 + id) * 24 * 60 * 60 * 1000).toISOString(),
      lastModifiedDate: new Date().toISOString(),
    };
  }

  generateMockAppointment(id) {
    const types = ['Showing', 'Listing Presentation', 'Open House', 'Inspection', 'Closing', 'Consultation'];
    const statuses = ['Scheduled', 'Confirmed', 'Completed', 'Cancelled', 'Rescheduled'];

    const appointmentDate = new Date(Date.now() + (id % 14 - 7) * 24 * 60 * 60 * 1000);

    return {
      id: String(id),

      // Basic Info
      title: `${types[id % types.length]} - ${id % 2 === 0 ? 'Buyer' : 'Seller'} Meeting`,
      type: types[id % types.length],
      status: statuses[id % statuses.length],

      // Timing
      startDate: appointmentDate.toISOString(),
      endDate: new Date(appointmentDate.getTime() + (60 + (id % 4) * 30) * 60 * 1000).toISOString(),
      duration: 60 + (id % 4) * 30,

      // Location
      location: id % 2 === 0
        ? `${100 + id * 10} Property Street, Los Angeles, CA`
        : 'Metz Realty Group Office',
      propertyId: id % 2 === 0 ? `LST-${String(id).padStart(6, '0')}` : null,

      // Participants
      clientId: `CLT-${String(id).padStart(6, '0')}`,
      clientName: `Client ${id}`,
      clientPhone: `(310) 555-${String(8000 + id).padStart(4, '0')}`,

      // Details
      notes: `${types[id % types.length]} appointment. ${id % 2 === 0 ? 'First time viewing' : 'Follow-up meeting'}.`,
      reminders: ['1 hour before', '1 day before'],

      // Outcome
      outcome: statuses[id % statuses.length] === 'Completed'
        ? ['Interested', 'Not Interested', 'Needs Time', 'Made Offer'][id % 4]
        : null,
      followUpRequired: id % 2 === 0,

      createdDate: new Date(appointmentDate.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      lastModifiedDate: new Date().toISOString(),
    };
  }

  generateMockLead(id) {
    const sources = ['Zillow', 'Realtor.com', 'Website', 'Facebook', 'Instagram', 'Referral', 'Open House'];
    const statuses = ['New', 'Contacted', 'Qualified', 'Nurturing', 'Converted', 'Lost'];
    const interests = ['Buying', 'Selling', 'Both', 'Renting', 'Investing'];

    return {
      id: String(id),

      // Contact Info
      firstName: ['Mike', 'Emily', 'Robert', 'Jennifer', 'William', 'Amanda'][id % 6],
      lastName: `Lead${id}`,
      email: `lead${id}@email.com`,
      phone: `(310) 555-${String(9000 + id).padStart(4, '0')}`,

      // Lead Details
      source: sources[id % sources.length],
      status: statuses[id % statuses.length],
      interest: interests[id % interests.length],

      // Qualification
      budget: id % 2 === 0 ? `$${300 + id * 10}k - $${500 + id * 15}k` : 'Not specified',
      timeframe: ['Immediate', '1-3 months', '3-6 months', '6+ months'][id % 4],
      preApproved: id % 3 === 0,

      // Property Interest
      propertyAddress: id % 2 === 0 ? `${100 + id * 10} Interest Ave, CA` : null,
      propertyId: id % 2 === 0 ? `LST-${String(id % 50 + 1).padStart(6, '0')}` : null,

      // Activity
      firstContactDate: new Date(Date.now() - (id % 60) * 24 * 60 * 60 * 1000).toISOString(),
      lastContactDate: new Date(Date.now() - (id % 7) * 24 * 60 * 60 * 1000).toISOString(),
      contactAttempts: 1 + (id % 5),

      // Notes
      notes: `${interests[id % interests.length]} lead from ${sources[id % sources.length]}. ${id % 2 === 0 ? 'Very motivated' : 'Needs nurturing'}.`,

      // Lead Score
      leadScore: 60 + (id % 40),

      // Tags
      tags: ['Hot Lead', 'First Time Buyer', 'Investor', 'Cash Buyer'][id % 4],

      createdDate: new Date(Date.now() - (id % 90) * 24 * 60 * 60 * 1000).toISOString(),
      lastModifiedDate: new Date().toISOString(),
    };
  }

  generateAnalyticsData() {
    const now = new Date();
    const thisYear = now.getFullYear();
    const thisMonth = now.getMonth();

    // Generate monthly data for the past 12 months
    const monthlyData = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date(thisYear, thisMonth - i, 1);
      monthlyData.push({
        month: date.toISOString().slice(0, 7),
        closedDeals: 2 + Math.floor(Math.random() * 3),
        volume: 1500000 + Math.floor(Math.random() * 1000000),
        commission: 45000 + Math.floor(Math.random() * 30000),
        newLeads: 15 + Math.floor(Math.random() * 20),
        listings: 3 + Math.floor(Math.random() * 4),
      });
    }

    this.collections.analytics.set('monthly', monthlyData);

    // Generate YTD summary
    const ytdSummary = {
      totalClosedDeals: monthlyData.reduce((sum, m) => sum + m.closedDeals, 0),
      totalVolume: monthlyData.reduce((sum, m) => sum + m.volume, 0),
      totalCommission: monthlyData.reduce((sum, m) => sum + m.commission, 0),
      totalNewLeads: monthlyData.reduce((sum, m) => sum + m.newLeads, 0),
      totalListings: monthlyData.reduce((sum, m) => sum + m.listings, 0),
      avgDaysToClose: 42,
      clientSatisfaction: 4.8,
      marketShare: 3.2,
    };

    this.collections.analytics.set('ytd', ytdSummary);

    // Generate goals
    const goals = {
      annual: {
        closedDeals: { target: 36, current: ytdSummary.totalClosedDeals },
        volume: { target: 25000000, current: ytdSummary.totalVolume },
        commission: { target: 750000, current: ytdSummary.totalCommission },
        listings: { target: 48, current: ytdSummary.totalListings },
      },
      quarterly: {
        closedDeals: { target: 9, current: 7 },
        volume: { target: 6250000, current: 5200000 },
        commission: { target: 187500, current: 156000 },
      },
    };

    this.collections.analytics.set('goals', goals);
  }

  // CRUD Operations
  getAll(collection) {
    return Array.from(this.collections[collection]?.values() || []);
  }

  getById(collection, id) {
    return this.collections[collection]?.get(id) || null;
  }

  create(collection, data) {
    let id;
    if (data.id) {
      id = data.id;
    } else if (collection === 'escrows') {
      // For escrows, use simple numeric IDs
      const existingIds = Array.from(this.collections[collection]?.keys() || [])
        .map((id) => parseInt(id))
        .filter((id) => !isNaN(id));
      const maxId = existingIds.length > 0 ? Math.max(...existingIds) : 0;
      id = String(maxId + 1);
    } else {
      // For other collections, use the old format
      id = `${collection.slice(0, 3).toUpperCase()}-${Date.now()}`;
    }

    const item = {
      ...data,
      id,
      createdDate: new Date().toISOString(),
      lastModifiedDate: new Date().toISOString(),
    };
    this.collections[collection]?.set(id, item);
    return item;
  }

  update(collection, id, data) {
    const existing = this.collections[collection]?.get(id);
    if (!existing) return null;

    const updated = {
      ...existing,
      ...data,
      id, // Preserve original ID
      lastModifiedDate: new Date().toISOString(),
    };
    this.collections[collection].set(id, updated);
    return updated;
  }

  delete(collection, id) {
    return this.collections[collection]?.delete(id) || false;
  }

  // Search functionality
  search(collection, query) {
    const items = this.getAll(collection);
    const searchTerm = query.toLowerCase();

    return items.filter((item) => Object.values(item).some((value) => {
      if (typeof value === 'string') {
        return value.toLowerCase().includes(searchTerm);
      }
      return false;
    }));
  }

  // Get stats for dashboards
  getStats(collection) {
    const items = this.getAll(collection);

    switch (collection) {
      case 'escrows':
        return {
          total: items.length,
          active: items.filter((e) => e.escrowStatus === 'active').length,
          pending: items.filter((e) => e.escrowStatus === 'pending').length,
          closed: items.filter((e) => e.escrowStatus === 'closed').length,
          totalVolume: items.reduce((sum, e) => sum + (e.purchasePrice || 0), 0),
          totalCommission: items.reduce((sum, e) => sum + (e.myCommission || 0), 0),
        };

      case 'listings':
        return {
          total: items.length,
          active: items.filter((l) => l.listingStatus === 'Active').length,
          pending: items.filter((l) => l.listingStatus === 'Pending').length,
          sold: items.filter((l) => l.listingStatus === 'Sold').length,
          totalValue: items.reduce((sum, l) => sum + (l.listPrice || 0), 0),
          avgDaysOnMarket: Math.round(items.reduce((sum, l) => sum + (l.daysOnMarket || 0), 0) / items.length),
        };

      case 'clients':
        return {
          total: items.length,
          buyers: items.filter((c) => c.clientType.includes('Buyer')).length,
          sellers: items.filter((c) => c.clientType.includes('Seller')).length,
          active: items.filter((c) => c.activeEscrows > 0).length,
          totalVolume: items.reduce((sum, c) => sum + (c.totalVolume || 0), 0),
        };

      case 'leads':
        return {
          total: items.length,
          new: items.filter((l) => l.status === 'New').length,
          contacted: items.filter((l) => l.status === 'Contacted').length,
          qualified: items.filter((l) => l.status === 'Qualified').length,
          converted: items.filter((l) => l.status === 'Converted').length,
          conversionRate: Math.round((items.filter((l) => l.status === 'Converted').length / items.length) * 100),
        };

      default:
        return { total: items.length };
    }
  }
}

// Create singleton instance
const databaseService = new DatabaseService();

module.exports = databaseService;
