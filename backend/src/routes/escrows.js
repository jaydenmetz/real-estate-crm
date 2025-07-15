const express = require('express');
const router = express.Router();

// Mock comprehensive escrow data
const generateComprehensiveEscrow = (id) => ({
  // Core Information
  id: `esc_${id}`,
  escrowNumber: `ESC-2025-${String(id).padStart(3, '0')}`,
  propertyAddress: '456 Ocean View Dr, La Jolla, CA 92037',
  escrowStatus: ['Active', 'Pending', 'Closed'][id % 3],
  transactionType: ['Purchase', 'Listing', 'Both Sides'][id % 3],
  escrowOpenDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  scheduledCoeDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  actualCoeDate: null,
  mlsNumber: `MLS-2025-${100000 + id}`,
  propertyType: ['SFR', 'Condo', 'Townhouse'][id % 3],
  
  // Property Details
  propertyImages: [
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
    'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800'
  ],
  bedrooms: 4,
  bathrooms: 3.5,
  squareFootage: 3200,
  lotSize: 8500,
  yearBuilt: 2018,
  propertyDescription: 'Stunning ocean view home with modern amenities',
  
  // Financial Details
  purchasePrice: 1250000 + (id * 10000),
  listPrice: 1200000 + (id * 10000),
  loanAmount: 1000000 + (id * 8000),
  downPaymentAmount: 250000 + (id * 2000),
  downPaymentPercentage: 20,
  commissionPercentageBuySide: 2.5,
  commissionPercentageListSide: 2.5,
  grossCommission: 62500 + (id * 500),
  myCommission: 31250 + (id * 250),
  commissionSplit: 70,
  commissionAdjustments: -2500,
  commissionAdjustmentNotes: 'Transaction coordinator fee',
  referralFee: 0,
  transactionCoordinatorFee: 500,
  homeWarrantyCost: 600,
  expenseAdjustments: 0,
  totalExpenses: 3600,
  netCommission: 27650 + (id * 250),
  cashToClose: 265000 + (id * 2000),
  vpExpensesPaidThroughEscrow: 0,
  
  // Relations
  clients: [
    { 
      id: `cli_${id}01`, 
      name: 'Michael Chen', 
      type: 'Buyer', 
      email: 'mchen@email.com', 
      phone: '(858) 555-1234',
      avatar: 'https://i.pravatar.cc/150?img=1'
    },
    { 
      id: `cli_${id}02`, 
      name: 'Sarah Chen', 
      type: 'Buyer', 
      email: 'schen@email.com', 
      phone: '(858) 555-1235',
      avatar: 'https://i.pravatar.cc/150?img=2'
    }
  ],
  leadSource: { id: 'lead_001', name: 'Zillow', type: 'Online' },
  listing: { id: 'list_001', mlsNumber: `MLS-2025-${100000 + id}`, address: '456 Ocean View Dr' },
  propertyInquiries: [
    { id: 'inq_001', date: '2024-12-15', source: 'Website', notes: 'Initial inquiry' }
  ],
  appointments: [
    { id: 'apt_001', date: '2024-12-20', type: 'Showing', notes: 'First showing' },
    { id: 'apt_002', date: '2025-01-03', type: 'Inspection', notes: 'Home inspection' }
  ],
  openHouse: { id: 'oh_001', date: '2024-12-10', visitors: 45 },
  transactionCoordinator: { id: 'tc_001', name: 'Jessica Martinez', company: 'Premier TC Services' },
  buyerAgent: { id: 'ba_001', name: 'You', email: 'you@realty.com', phone: '(858) 555-0001' },
  listingAgent: { id: 'la_001', name: 'You', email: 'you@realty.com', phone: '(858) 555-0001' },
  loanOfficer: { id: 'lo_001', name: 'Robert Smith', company: 'Wells Fargo', phone: '(858) 555-2001' },
  escrowOfficer: { id: 'eo_001', name: 'Linda Thompson', company: 'Pacific Escrow', phone: '(858) 555-3001' },
  titleOfficer: { id: 'to_001', name: 'James Wilson', company: 'First American Title', phone: '(858) 555-3002' },
  homeInspector: { id: 'hi_001', name: 'Mike Johnson', company: 'A+ Home Inspections', phone: '(858) 555-4001' },
  termiteInspector: { id: 'ti_001', name: 'Tom Davis', company: 'Termite Control Inc', phone: '(858) 555-4002' },
  homeWarrantyCompany: { id: 'hw_001', name: 'American Home Shield', phone: '1-800-555-0001' },
  nhdCompany: { id: 'nhd_001', name: 'Property ID', phone: '(858) 555-5001' },
  appraiser: { id: 'ap_001', name: 'Susan Lee', company: 'Accurate Appraisals', phone: '(858) 555-6001' },
  
  // Important Dates & Deadlines
  acceptanceDate: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
  emdDueDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
  emdReceivedDate: new Date(Date.now() - 26 * 24 * 60 * 60 * 1000).toISOString(),
  inspectionPeriodEndDate: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
  contingencyRemovalDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
  loanContingencyDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
  appraisalContingencyDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
  allContingenciesRemovedDate: null,
  loanApprovalDate: null,
  clearToCloseDate: null,
  signingDate: null,
  fundingDate: null,
  recordingDate: null,
  possessionDate: null,
  
  // Checklist Progress
  checklistProgress: {
    phase1: {
      completed: 10,
      total: 13,
      percentage: 77
    },
    phase2: {
      completed: 15,
      total: 29,
      percentage: 52
    },
    phase3: {
      completed: 0,
      total: 23,
      percentage: 0
    },
    overall: {
      completed: 25,
      total: 65,
      percentage: 38
    }
  },
  
  // Individual checklist states
  checklists: {
    fully_executed_pa: true,
    open_escrow: true,
    send_congrats: true,
    add_contacts_crm: true,
    add_contacts_phone: true,
    intro_email: true,
    order_nhd: true,
    confirm_emd: true,
    emd_deposited: true,
    update_mls: true,
    create_drive_folder: false,
    send_tc_glide: false,
    tc_intro_sent: false,
    // ... more checklist items
  },
  
  // Document Tracking
  purchaseAgreementStatus: 'Signed',
  counterOffers: 2,
  addendums: ['Solar Lease Transfer', 'Repair Request'],
  sellerDisclosuresStatus: 'Received',
  inspectionReportsStatus: 'Complete',
  repairRequestsStatus: 'Negotiating',
  titleReportStatus: 'In Progress',
  hoaDocumentsStatus: 'Pending',
  loanDocumentsStatus: 'Processing',
  closingDocumentsStatus: 'Not Started',
  
  // Communication Log
  lastClientContactDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  nextFollowUpDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
  importantNotes: 'Buyers are very motivated. Must close by Feb 5 for job relocation.',
  specialInstructions: 'Call before 5 PM only. Prefer text communication.',
  redFlags: 'Appraisal may come in low - comps are mixed',
  
  // Analytics Fields
  leadSourceType: 'Online',
  marketingCampaign: 'Google Ads Q4 2024',
  totalMarketingCost: 2500,
  timeFromLeadToContract: 18,
  timeFromContractToClose: null,
  clientSatisfactionScore: null,
  wouldReferScore: null,
  
  // System Fields
  createdDate: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
  lastModifiedDate: new Date().toISOString(),
  createdBy: 'Jayden Metz',
  assignedTo: 'Jayden Metz',
  tags: ['Hot Lead', 'Cash Buyer', 'Relocation'],
  priorityLevel: ['High', 'Medium', 'Low'][id % 3],
  archivedStatus: false,
  
  // Timeline Events
  timeline: [
    {
      id: 1,
      date: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
      event: 'Offer submitted',
      description: 'Initial offer of $1,200,000 submitted',
      type: 'milestone',
      icon: 'offer'
    },
    {
      id: 2,
      date: new Date(Date.now() - 27 * 24 * 60 * 60 * 1000).toISOString(),
      event: 'Offer accepted',
      description: 'Counter at $1,250,000 accepted by buyer',
      type: 'milestone',
      icon: 'accepted'
    },
    {
      id: 3,
      date: new Date(Date.now() - 26 * 24 * 60 * 60 * 1000).toISOString(),
      event: 'Escrow opened',
      description: 'Escrow opened with Pacific Escrow',
      type: 'milestone',
      icon: 'escrow'
    },
    {
      id: 4,
      date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      event: 'Inspection completed',
      description: 'Home inspection completed, minor issues found',
      type: 'inspection',
      icon: 'inspection'
    },
    {
      id: 5,
      date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      event: 'Appraisal ordered',
      description: 'Appraisal ordered by Wells Fargo',
      type: 'financial',
      icon: 'appraisal'
    }
  ],
  
  // Activity Stats for Dashboard
  activityStats: {
    daysInEscrow: 28,
    daysToClose: 30,
    tasksCompletedToday: 3,
    upcomingDeadlines: 2,
    documentsUploaded: 8,
    communicationScore: 95
  },
  
  // Market Comparison Data
  marketComparison: {
    avgDaysOnMarket: 35,
    avgSalePrice: 1180000,
    pricePerSqft: 390,
    neighborhoodTrend: '+5.2%',
    similarProperties: [
      { address: '123 Ocean View Dr', soldPrice: 1225000, soldDate: '2024-12-01' },
      { address: '789 Ocean View Dr', soldPrice: 1195000, soldDate: '2024-11-15' }
    ]
  }
});

// GET /v1/escrows - List all escrows
router.get('/', (req, res) => {
  const { 
    page = 1, 
    limit = 20, 
    status,
    sort = 'createdDate',
    order = 'desc',
    search
  } = req.query;
  
  // Generate mock escrows
  const escrows = [];
  const total = 42;
  const startId = (page - 1) * limit + 1;
  const endId = Math.min(startId + limit - 1, total);
  
  for (let i = startId; i <= endId; i++) {
    const escrow = generateComprehensiveEscrow(i);
    
    // Apply filters
    if (status && escrow.escrowStatus.toLowerCase() !== status.toLowerCase()) continue;
    if (search && !escrow.propertyAddress.toLowerCase().includes(search.toLowerCase()) &&
        !escrow.escrowNumber.toLowerCase().includes(search.toLowerCase())) continue;
    
    // Return simplified version for list view
    escrows.push({
      id: escrow.id,
      escrowNumber: escrow.escrowNumber,
      propertyAddress: escrow.propertyAddress,
      propertyImage: escrow.propertyImages[0],
      escrowStatus: escrow.escrowStatus,
      transactionType: escrow.transactionType,
      purchasePrice: escrow.purchasePrice,
      myCommission: escrow.myCommission,
      clients: escrow.clients.map(c => ({ name: c.name, type: c.type, avatar: c.avatar })),
      scheduledCoeDate: escrow.scheduledCoeDate,
      daysToClose: escrow.activityStats.daysToClose,
      checklistProgress: escrow.checklistProgress.overall.percentage,
      priorityLevel: escrow.priorityLevel,
      lastActivity: escrow.lastModifiedDate,
      upcomingDeadlines: escrow.activityStats.upcomingDeadlines
    });
  }
  
  res.json({
    success: true,
    data: {
      escrows,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    }
  });
});

// GET /v1/escrows/stats - Get dashboard statistics
router.get('/stats', (req, res) => {
  res.json({
    success: true,
    data: {
      overview: {
        activeEscrows: 15,
        pendingEscrows: 8,
        closedThisMonth: 12,
        totalVolume: 18750000,
        totalCommission: 468750,
        avgDaysToClose: 32
      },
      performance: {
        closingRate: 94,
        avgListToSaleRatio: 98.5,
        clientSatisfaction: 4.8,
        onTimeClosingRate: 89
      },
      pipeline: {
        thisWeek: 3,
        thisMonth: 12,
        nextMonth: 18,
        projectedRevenue: 325000
      },
      trends: [
        { month: 'Jan', closed: 8, volume: 9600000 },
        { month: 'Feb', closed: 10, volume: 12500000 },
        { month: 'Mar', closed: 12, volume: 15000000 },
        { month: 'Apr', closed: 11, volume: 13750000 },
        { month: 'May', closed: 14, volume: 17500000 },
        { month: 'Jun', closed: 12, volume: 15000000 }
      ]
    }
  });
});

// GET /v1/escrows/:id - Get single escrow with full details
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const numericId = parseInt(id.replace('esc_', '')) || 1;
  
  const escrow = generateComprehensiveEscrow(numericId);
  
  res.json({
    success: true,
    data: escrow
  });
});

// POST /v1/escrows - Create new escrow
router.post('/', (req, res) => {
  const newEscrow = {
    ...generateComprehensiveEscrow(Date.now() % 1000),
    ...req.body,
    id: `esc_${Date.now()}`,
    createdDate: new Date().toISOString()
  };
  
  res.status(201).json({
    success: true,
    data: newEscrow,
    message: 'Escrow created successfully'
  });
});

// PUT /v1/escrows/:id - Update escrow
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const numericId = parseInt(id.replace('esc_', '')) || 1;
  
  const escrow = {
    ...generateComprehensiveEscrow(numericId),
    ...req.body,
    lastModifiedDate: new Date().toISOString()
  };
  
  res.json({
    success: true,
    data: escrow,
    message: 'Escrow updated successfully'
  });
});

// PATCH /v1/escrows/:id/checklist - Update checklist item
router.patch('/:id/checklist', (req, res) => {
  const { itemId, checked } = req.body;
  
  res.json({
    success: true,
    data: {
      itemId,
      checked,
      completedAt: checked ? new Date().toISOString() : null,
      completedBy: 'Jayden Metz'
    },
    message: 'Checklist item updated'
  });
});

// POST /v1/escrows/:id/documents - Upload document
router.post('/:id/documents', (req, res) => {
  const { documentType, name } = req.body;
  
  res.json({
    success: true,
    data: {
      id: `doc_${Date.now()}`,
      escrowId: req.params.id,
      documentType,
      name,
      uploadedAt: new Date().toISOString(),
      uploadedBy: 'Jayden Metz',
      size: '2.4 MB',
      url: 'https://example.com/document.pdf'
    },
    message: 'Document uploaded successfully'
  });
});

// POST /v1/escrows/:id/timeline - Add timeline event
router.post('/:id/timeline', (req, res) => {
  const { event, description, type } = req.body;
  
  res.json({
    success: true,
    data: {
      id: Date.now(),
      escrowId: req.params.id,
      date: new Date().toISOString(),
      event,
      description,
      type,
      createdBy: 'Jayden Metz'
    },
    message: 'Timeline event added'
  });
});

// POST /v1/escrows/:id/notes - Add note
router.post('/:id/notes', (req, res) => {
  const { content, type = 'general' } = req.body;
  
  res.json({
    success: true,
    data: {
      id: `note_${Date.now()}`,
      escrowId: req.params.id,
      content,
      type,
      createdAt: new Date().toISOString(),
      createdBy: 'Jayden Metz'
    },
    message: 'Note added successfully'
  });
});

// POST /v1/escrows/:id/ai-assist - AI assistance endpoint
router.post('/:id/ai-assist', (req, res) => {
  const { action, context } = req.body;
  
  // This would connect to the AI team executive assistant
  res.json({
    success: true,
    data: {
      action,
      status: 'processing',
      message: 'AI assistant is working on your request',
      estimatedTime: '30 seconds',
      endpoint: '/v1/ai-team/exec-assistant/endpoint'
    }
  });
});

// DELETE /v1/escrows/:id - Delete escrow
router.delete('/:id', (req, res) => {
  res.json({
    success: true,
    message: 'Escrow deleted successfully'
  });
});

module.exports = router;