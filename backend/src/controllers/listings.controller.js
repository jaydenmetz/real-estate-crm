// backend/src/controllers/listings.controller.js

const Listing = require('../models/Listing.mock');
const logger = require('../utils/logger');
const { validationResult } = require('express-validator');

// DEPRECATED: Mock data moved to Listing.mock.js model
// This controller now uses the comprehensive Listing.mock.js model
const mockListings = [
  {
    id: '1',
    propertyAddress: '123 Main Street',
    city: 'San Diego',
    state: 'CA',
    zipCode: '92101',
    fullAddress: '123 Main Street, San Diego, CA 92101',
    mlsNumber: 'SD2024001',
    listingStatus: 'Active',
    listPrice: 850000,
    originalListPrice: 875000,
    pricePerSqft: 354,
    propertyType: 'Single Family',
    bedrooms: 4,
    bathrooms: 3,
    halfBathrooms: 0,
    squareFootage: 2400,
    lotSize: 7200,
    yearBuilt: 2018,
    garage: 2,
    pool: true,
    listingDate: '2024-01-05',
    expirationDate: '2024-07-05',
    daysOnMarket: 15,
    virtualTourLink: 'https://example.com/tour/123',
    professionalPhotos: true,
    dronePhotos: true,
    videoWalkthrough: true,
    propertyDescription: 'Beautiful modern home in prime location. This stunning 4-bedroom, 3-bathroom residence offers contemporary luxury living with an open floor plan, gourmet kitchen, and resort-style backyard. High ceilings, natural light, and premium finishes throughout.',
    features: [
      'Gourmet Kitchen with Quartz Countertops',
      'Stainless Steel Appliances',
      'Hardwood Floors Throughout',
      'Master Suite with Walk-in Closet',
      'Resort-Style Pool and Spa',
      'Smart Home Technology',
      'Solar Panels',
      'EV Charging Station',
      'Custom Built-ins',
      'Drought-Resistant Landscaping'
    ],
    sellers: [
      { id: 1, name: 'John Smith', email: 'john.smith@email.com', phone: '(555) 123-4567' },
      { id: 2, name: 'Jane Smith', email: 'jane.smith@email.com', phone: '(555) 123-4568' }
    ],
    listingAgent: {
      id: 1,
      name: 'You',
      email: 'agent@realestate.com',
      phone: '(555) 999-8888'
    },
    commission: {
      listing: 3.0,
      buyer: 2.5,
      total: 5.5
    },
    images: [
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
      'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800',
      'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800',
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800',
    ],
    primaryImage: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400',
    showings: 12,
    views: 342,
    favorites: 28,
    shares: 15,
    inquiries: 8
  },
  {
    id: '2',
    propertyAddress: '456 Oak Avenue',
    city: 'La Jolla',
    state: 'CA',
    zipCode: '92037',
    fullAddress: '456 Oak Avenue, La Jolla, CA 92037',
    mlsNumber: 'LJ2024002',
    listingStatus: 'Active',
    listPrice: 1250000,
    originalListPrice: 1250000,
    pricePerSqft: 694,
    propertyType: 'Condo',
    bedrooms: 3,
    bathrooms: 2,
    halfBathrooms: 1,
    squareFootage: 1800,
    lotSize: 0,
    yearBuilt: 2020,
    garage: 2,
    pool: false,
    listingDate: '2024-01-10',
    expirationDate: '2024-07-10',
    daysOnMarket: 10,
    virtualTourLink: 'https://example.com/tour/456',
    professionalPhotos: true,
    dronePhotos: false,
    videoWalkthrough: false,
    propertyDescription: 'Luxury oceanview condo in the heart of La Jolla. Modern finishes, open concept living, and spectacular sunset views. Walking distance to beaches, shopping, and fine dining.',
    features: [
      'Ocean Views',
      'Balcony',
      'In-Unit Laundry',
      'Central AC/Heat',
      'Secure Building',
      'Guest Parking',
      'Storage Unit',
      'Pet Friendly'
    ],
    sellers: [
      { id: 3, name: 'Michael Johnson', email: 'mjohnson@email.com', phone: '(555) 234-5678' }
    ],
    listingAgent: {
      id: 1,
      name: 'You',
      email: 'agent@realestate.com',
      phone: '(555) 999-8888'
    },
    commission: {
      listing: 3.0,
      buyer: 2.5,
      total: 5.5
    },
    images: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800'
    ],
    primaryImage: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400',
    showings: 8,
    views: 256,
    favorites: 18,
    shares: 10,
    inquiries: 5
  },
  {
    id: '3',
    propertyAddress: '789 Beach Drive',
    city: 'Carlsbad',
    state: 'CA',
    zipCode: '92008',
    fullAddress: '789 Beach Drive, Carlsbad, CA 92008',
    mlsNumber: 'CB2024003',
    listingStatus: 'Pending',
    listPrice: 2100000,
    originalListPrice: 2250000,
    pricePerSqft: 553,
    propertyType: 'Single Family',
    bedrooms: 5,
    bathrooms: 4,
    halfBathrooms: 1,
    squareFootage: 3800,
    lotSize: 12000,
    yearBuilt: 2016,
    garage: 3,
    pool: true,
    listingDate: '2023-12-15',
    expirationDate: '2024-06-15',
    daysOnMarket: 35,
    virtualTourLink: 'https://example.com/tour/789',
    professionalPhotos: true,
    dronePhotos: true,
    videoWalkthrough: true,
    propertyDescription: 'Stunning beachside estate with panoramic ocean views. This exceptional property features a gourmet kitchen, home theater, wine cellar, and infinity pool. Just steps from the beach.',
    features: [
      'Ocean Views',
      'Infinity Pool',
      'Home Theater',
      'Wine Cellar',
      'Gourmet Kitchen',
      'Master Suite with Ocean Views',
      'Guest House',
      'Solar Panels',
      'Smart Home',
      'Private Beach Access'
    ],
    sellers: [
      { id: 4, name: 'Robert Williams', email: 'rwilliams@email.com', phone: '(555) 345-6789' },
      { id: 5, name: 'Susan Williams', email: 'swilliams@email.com', phone: '(555) 345-6790' }
    ],
    listingAgent: {
      id: 1,
      name: 'You',
      email: 'agent@realestate.com',
      phone: '(555) 999-8888'
    },
    buyerAgent: {
      id: 2,
      name: 'Sarah Chen',
      email: 'schen@realestate.com',
      phone: '(555) 888-7777'
    },
    commission: {
      listing: 3.0,
      buyer: 2.5,
      total: 5.5
    },
    images: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
      'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800'
    ],
    primaryImage: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400',
    showings: 22,
    views: 567,
    favorites: 45,
    shares: 25,
    inquiries: 12
  },
  {
    id: '4',
    propertyAddress: '321 Sunset Boulevard',
    city: 'Del Mar',
    state: 'CA',
    zipCode: '92014',
    fullAddress: '321 Sunset Boulevard, Del Mar, CA 92014',
    mlsNumber: 'DM2024004',
    listingStatus: 'Coming Soon',
    listPrice: 3500000,
    originalListPrice: 3500000,
    pricePerSqft: 778,
    propertyType: 'Single Family',
    bedrooms: 6,
    bathrooms: 5,
    halfBathrooms: 0,
    squareFootage: 4500,
    lotSize: 15000,
    yearBuilt: 2022,
    garage: 3,
    pool: true,
    listingDate: '2024-01-25',
    expirationDate: '2024-07-25',
    daysOnMarket: 0,
    virtualTourLink: null,
    professionalPhotos: false,
    dronePhotos: false,
    videoWalkthrough: false,
    propertyDescription: 'Brand new construction in prestigious Del Mar. This modern masterpiece features breathtaking architecture, the finest finishes, and spectacular views. Coming to market soon.',
    features: [
      'New Construction',
      'Ocean Views',
      'Chef\'s Kitchen',
      'Home Office',
      'Gym',
      'Game Room',
      'Outdoor Kitchen',
      'Fire Pit',
      'Security System',
      'Electric Car Charging'
    ],
    sellers: [
      { id: 6, name: 'The Thompson Trust', email: 'trust@email.com', phone: '(555) 456-7890' }
    ],
    listingAgent: {
      id: 1,
      name: 'You',
      email: 'agent@realestate.com',
      phone: '(555) 999-8888'
    },
    commission: {
      listing: 3.0,
      buyer: 2.5,
      total: 5.5
    },
    images: [
      'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800'
    ],
    primaryImage: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=400',
    showings: 0,
    views: 0,
    favorites: 0,
    shares: 0,
    inquiries: 0
  }
];

// DEPRECATED: Helper function moved to Listing.mock.js model
// The mock model now returns comprehensive data directly

// GET /listings
exports.getListings = async (req, res) => {
  try {
    const filters = {
      status: req.query.status,
      minPrice: req.query.minPrice,
      maxPrice: req.query.maxPrice,
      propertyType: req.query.propertyType,
      page: req.query.page || 1,
      limit: req.query.limit || 20,
      sort: req.query.sort
    };

    // Try to get from database first
    try {
      const result = await Listing.findAll(filters);
      res.json({
        success: true,
        data: result,
        timestamp: new Date().toISOString()
      });
    } catch (dbError) {
      // If database fails, use mock data
      logger.warn('Database unavailable, using mock data');
      
      const result = await Listing.findAll(filters);
      res.json({
        success: true,
        data: result,
        timestamp: new Date().toISOString()
      });
    }
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
};

// GET /listings/:id
exports.getListing = async (req, res) => {
  try {
    // Try to get from database first
    try {
      const listing = await Listing.findById(req.params.id);

      if (!listing) {
        throw new Error('Not found');
      }

      res.json({
        success: true,
        data: listing,
        timestamp: new Date().toISOString()
      });
    } catch (dbError) {
      // If database fails, use mock data
      logger.warn('Database unavailable, using mock data');
      
      const listing = await Listing.findById(req.params.id);

      if (!listing) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Listing not found'
          }
        });
      }

      res.json({
        success: true,
        data: listing,
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    logger.error('Error fetching listing:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch listing'
      }
    });
  }
};

// POST /listings
exports.createListing = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          details: errors.array()
        }
      });
    }

    const listing = await Listing.create(req.body);

    // Emit real-time update
    const io = req.app.get('io');
    io.to('listings').emit('listing:created', listing);

    res.status(201).json({
      success: true,
      data: listing,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error creating listing:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CREATE_ERROR',
        message: 'Failed to create listing'
      }
    });
  }
};

// PUT /listings/:id
exports.updateListing = async (req, res) => {
  try {
    const listing = await Listing.update(req.params.id, req.body);

    if (!listing) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Listing not found'
        }
      });
    }

    // Emit real-time update
    const io = req.app.get('io');
    io.to('listings').emit('listing:updated', listing);

    res.json({
      success: true,
      data: listing,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error updating listing:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_ERROR',
        message: 'Failed to update listing'
      }
    });
  }
};

// POST /listings/:id/price-reduction
exports.priceReduction = async (req, res) => {
  try {
    const { newPrice, reason, effectiveDate } = req.body;

    const result = await Listing.recordPriceReduction(req.params.id, {
      newPrice,
      reason,
      effectiveDate: effectiveDate || new Date()
    });

    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error recording price reduction:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'PRICE_ERROR',
        message: 'Failed to record price reduction'
      }
    });
  }
};

// POST /listings/:id/showings
exports.logShowing = async (req, res) => {
  try {
    const { date, time, agent, feedback, interested } = req.body;

    const showing = await Listing.logShowing(req.params.id, {
      date,
      time,
      agent,
      feedback,
      interested
    });

    res.json({
      success: true,
      data: showing,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error logging showing:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SHOWING_ERROR',
        message: 'Failed to log showing'
      }
    });
  }
};

// PATCH /listings/:id/status
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    const listing = await Listing.updateStatus(req.params.id, status);

    if (!listing) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Listing not found'
        }
      });
    }

    // Emit real-time update
    const io = req.app.get('io');
    io.to('listings').emit('listing:statusChanged', { id: req.params.id, status });

    res.json({
      success: true,
      data: listing,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error updating listing status:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'STATUS_ERROR',
        message: 'Failed to update listing status'
      }
    });
  }
};

// PUT /listings/:id/checklist
exports.updateChecklist = async (req, res) => {
  try {
    const { checklist } = req.body;
    
    const listing = await Listing.updateChecklist(req.params.id, checklist);

    if (!listing) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Listing not found'
        }
      });
    }

    res.json({
      success: true,
      data: listing,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error updating checklist:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CHECKLIST_ERROR',
        message: 'Failed to update checklist'
      }
    });
  }
};

// GET /listings/:id/price-history
exports.getPriceHistory = async (req, res) => {
  try {
    const priceHistory = await Listing.getPriceHistory(req.params.id);

    res.json({
      success: true,
      data: priceHistory,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching price history:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch price history'
      }
    });
  }
};

// GET /analytics/listing/:id
exports.getAnalytics = async (req, res) => {
  try {
    const analytics = await Listing.getAnalytics(req.params.id);

    res.json({
      success: true,
      data: analytics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching listing analytics:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'ANALYTICS_ERROR',
        message: 'Failed to fetch listing analytics'
      }
    });
  }
};