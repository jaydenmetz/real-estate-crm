// Mock Listing model for development and testing
const logger = require('../utils/logger');

// Comprehensive mock listings data
const mockListings = [
  {
    id: '1',
    propertyAddress: '123 Main Street',
    city: 'San Diego',
    state: 'CA',
    zipCode: '92101',
    fullAddress: '123 Main Street, San Diego, CA 92101',
    mlsNumber: 'SD2025001',
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
    listingDate: new Date('2025-06-15'),
    expirationDate: new Date('2025-12-15'),
    daysOnMarket: 32,
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
      'Drought-Resistant Landscaping',
    ],
    sellers: [
      {
        id: 1,
        name: 'John & Jane Smith',
        email: 'smithfamily@email.com',
        phone: '(619) 555-1234',
      },
    ],
    listingAgent: {
      id: 1,
      name: 'Jayden Metz',
      email: 'jayden@luxuryrealty.com',
      phone: '(858) 555-9999',
      licenseNumber: 'DRE#01234567',
    },
    buyerAgent: null,
    commission: {
      listing: 2.5,
      buyer: 2.5,
      total: 5.0,
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
    inquiries: 8,
    createdAt: new Date('2025-06-15'),
    updatedAt: new Date(),
  },
  {
    id: '2',
    propertyAddress: '456 Ocean View Drive',
    city: 'La Jolla',
    state: 'CA',
    zipCode: '92037',
    fullAddress: '456 Ocean View Drive, La Jolla, CA 92037',
    mlsNumber: 'LJ2025002',
    listingStatus: 'Active',
    listPrice: 1250000,
    originalListPrice: 1250000,
    pricePerSqft: 521,
    propertyType: 'Condo',
    bedrooms: 3,
    bathrooms: 2,
    halfBathrooms: 1,
    squareFootage: 2400,
    lotSize: 0,
    yearBuilt: 2022,
    garage: 2,
    pool: false,
    listingDate: new Date('2025-07-01'),
    expirationDate: new Date('2025-12-31'),
    daysOnMarket: 16,
    virtualTourLink: 'https://example.com/tour/456',
    professionalPhotos: true,
    dronePhotos: false,
    videoWalkthrough: true,
    propertyDescription: 'Luxury oceanfront condo with panoramic views. This exquisite residence features floor-to-ceiling windows, designer finishes, and world-class amenities. Walking distance to beaches, dining, and shopping.',
    features: [
      'Ocean Views',
      'Floor-to-Ceiling Windows',
      'Gourmet Kitchen',
      'Private Balcony',
      'Concierge Service',
      'Fitness Center',
      'Rooftop Terrace',
      'Wine Storage',
      'Pet-Friendly',
      'EV Charging',
    ],
    sellers: [
      {
        id: 2,
        name: 'Robert Johnson',
        email: 'rjohnson@email.com',
        phone: '(858) 555-5678',
      },
    ],
    listingAgent: {
      id: 1,
      name: 'Jayden Metz',
      email: 'jayden@luxuryrealty.com',
      phone: '(858) 555-9999',
      licenseNumber: 'DRE#01234567',
    },
    buyerAgent: null,
    commission: {
      listing: 2.5,
      buyer: 2.5,
      total: 5.0,
    },
    images: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800',
    ],
    primaryImage: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400',
    showings: 8,
    views: 256,
    favorites: 42,
    shares: 18,
    inquiries: 6,
    createdAt: new Date('2025-07-01'),
    updatedAt: new Date(),
  },
  {
    id: '3',
    propertyAddress: '789 Sunset Boulevard',
    city: 'Del Mar',
    state: 'CA',
    zipCode: '92014',
    fullAddress: '789 Sunset Boulevard, Del Mar, CA 92014',
    mlsNumber: 'DM2025003',
    listingStatus: 'Pending',
    listPrice: 2850000,
    originalListPrice: 2995000,
    pricePerSqft: 713,
    propertyType: 'Single Family',
    bedrooms: 5,
    bathrooms: 4,
    halfBathrooms: 1,
    squareFootage: 4000,
    lotSize: 12000,
    yearBuilt: 2019,
    garage: 3,
    pool: true,
    listingDate: new Date('2025-05-01'),
    expirationDate: new Date('2025-11-01'),
    daysOnMarket: 77,
    virtualTourLink: 'https://example.com/tour/789',
    professionalPhotos: true,
    dronePhotos: true,
    videoWalkthrough: true,
    propertyDescription: 'Spectacular custom estate in prestigious Del Mar. This architectural masterpiece offers breathtaking ocean views, luxurious amenities, and impeccable craftsmanship throughout. Perfect for entertaining with expansive outdoor living spaces.',
    features: [
      'Ocean Views',
      'Custom Architecture',
      'Chef\'s Kitchen',
      'Home Theater',
      'Wine Cellar',
      'Guest House',
      'Infinity Pool',
      'Smart Home',
      'Security System',
      'Solar Power',
    ],
    sellers: [
      {
        id: 3,
        name: 'William & Elizabeth Thompson',
        email: 'thompson@email.com',
        phone: '(760) 555-3456',
      },
    ],
    listingAgent: {
      id: 1,
      name: 'Jayden Metz',
      email: 'jayden@luxuryrealty.com',
      phone: '(858) 555-9999',
      licenseNumber: 'DRE#01234567',
    },
    buyerAgent: {
      id: 2,
      name: 'Sarah Johnson',
      email: 'sarah@coastalrealty.com',
      phone: '(858) 555-7777',
      licenseNumber: 'DRE#02345678',
    },
    commission: {
      listing: 2.5,
      buyer: 2.5,
      total: 5.0,
    },
    images: [
      'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800',
      'https://images.unsplash.com/photo-1613977257592-4871e5fcd7c4?w=800',
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800',
    ],
    primaryImage: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=400',
    showings: 24,
    views: 892,
    favorites: 76,
    shares: 45,
    inquiries: 15,
    createdAt: new Date('2025-05-01'),
    updatedAt: new Date(),
  },
];

class ListingMock {
  // Alias for compatibility with Mongoose-style queries
  static async find(filters = {}) {
    return this.findAll(filters);
  }

  static async findAll(filters = {}) {
    try {
      let filtered = [...mockListings];

      // Apply status filter
      if (filters.status && filters.status !== 'all') {
        filtered = filtered.filter((l) => l.listingStatus === filters.status);
      }

      // Apply property type filter
      if (filters.propertyType) {
        filtered = filtered.filter((l) => l.propertyType === filters.propertyType);
      }

      // Apply price filters
      if (filters.minPrice) {
        filtered = filtered.filter((l) => l.listPrice >= parseFloat(filters.minPrice));
      }
      if (filters.maxPrice) {
        filtered = filtered.filter((l) => l.listPrice <= parseFloat(filters.maxPrice));
      }

      // Apply bedroom filter
      if (filters.minBedrooms) {
        filtered = filtered.filter((l) => l.bedrooms >= parseInt(filters.minBedrooms));
      }

      // Apply bathroom filter
      if (filters.minBathrooms) {
        filtered = filtered.filter((l) => l.bathrooms >= parseInt(filters.minBathrooms));
      }

      // Apply sorting
      const sortField = filters.sort || 'listingDate';
      const sortOrder = filters.order === 'desc' ? -1 : 1;

      filtered.sort((a, b) => {
        if (a[sortField] < b[sortField]) return -sortOrder;
        if (a[sortField] > b[sortField]) return sortOrder;
        return 0;
      });

      // Apply pagination
      const page = parseInt(filters.page) || 1;
      const limit = parseInt(filters.limit) || 20;
      const offset = (page - 1) * limit;
      const paginated = filtered.slice(offset, offset + limit);

      // Return minimal data for list view
      const minimalListings = paginated.map((listing) => ({
        id: listing.id,
        mlsNumber: listing.mlsNumber,
        propertyAddress: listing.propertyAddress,
        city: listing.city,
        state: listing.state,
        zipCode: listing.zipCode,
        fullAddress: listing.fullAddress,
        listingStatus: listing.listingStatus,
        listPrice: listing.listPrice,
        pricePerSqft: listing.pricePerSqft,
        propertyType: listing.propertyType,
        bedrooms: listing.bedrooms,
        bathrooms: listing.bathrooms,
        squareFootage: listing.squareFootage,
        primaryImage: listing.primaryImage,
        daysOnMarket: listing.daysOnMarket,
        listingAgent: {
          name: listing.listingAgent.name,
        },
        createdAt: listing.createdAt,
        updatedAt: listing.updatedAt,
      }));

      return {
        listings: minimalListings,
        pagination: {
          total: filtered.length,
          page,
          pages: Math.ceil(filtered.length / limit),
          limit,
        },
      };
    } catch (error) {
      logger.error('Mock Listing.findAll error:', error);
      throw error;
    }
  }

  static async findById(id) {
    const listing = mockListings.find((l) => l.id === id);
    if (!listing) return null;

    // Return comprehensive listing data for detail view
    return {
      ...listing,

      // Financial details
      taxes: Math.round(listing.listPrice * 0.0125), // 1.25% property tax estimate
      hoaDues: listing.propertyType === 'Condo' ? 450 : 0,
      insurance: Math.round(listing.listPrice * 0.004), // 0.4% insurance estimate
      utilities: 350,

      // Features breakdown
      features: {
        interior: listing.features.filter((f) => ['Kitchen', 'Appliances', 'Floors', 'Master', 'Built-ins', 'Theater', 'Wine'].some((keyword) => f.includes(keyword))),
        exterior: listing.features.filter((f) => ['Pool', 'Landscaping', 'Views', 'Architecture', 'Guest House', 'Solar'].some((keyword) => f.includes(keyword))),
        community: listing.features.filter((f) => ['Concierge', 'Fitness', 'Rooftop', 'Security', 'Smart Home', 'EV'].some((keyword) => f.includes(keyword))),
      },

      // Room details
      rooms: [
        { name: 'Master Bedroom', dimensions: '18x20', level: 2 },
        { name: 'Living Room', dimensions: '22x25', level: 1 },
        { name: 'Kitchen', dimensions: '15x18', level: 1 },
        { name: 'Family Room', dimensions: '20x22', level: 1 },
        { name: 'Office', dimensions: '12x14', level: 1 },
        ...(listing.bedrooms > 1 ? [
          { name: 'Bedroom 2', dimensions: '14x16', level: 2 },
          { name: 'Bedroom 3', dimensions: '12x14', level: 2 },
        ] : []),
        ...(listing.bedrooms > 3 ? [
          { name: 'Bedroom 4', dimensions: '12x13', level: 2 },
        ] : []),
        ...(listing.bedrooms > 4 ? [
          { name: 'Bedroom 5', dimensions: '11x12', level: 1 },
        ] : []),
      ],

      // Extended photos
      photos: [
        ...listing.images,
        'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800',
        'https://images.unsplash.com/photo-1600566753151-384129cf4e3e?w=800',
        'https://images.unsplash.com/photo-1600607688969-a5bfcd646154?w=800',
      ],
      virtualTourUrl: listing.virtualTourLink,
      videoUrl: listing.videoWalkthrough ? `https://example.com/video/${listing.id}` : null,

      // Marketing
      marketingRemarks: `Don't miss this incredible opportunity! ${listing.propertyDescription}`,
      specialFeatures: listing.features.slice(0, 5),
      showingInstructions: 'Call listing agent for appointment. 24-hour notice preferred.',

      // Schools (mock data based on area)
      schools: [
        { name: 'La Jolla Elementary', rating: 9, distance: '0.5 mi' },
        { name: 'Muirlands Middle School', rating: 8, distance: '1.2 mi' },
        { name: 'La Jolla High School', rating: 9, distance: '1.8 mi' },
      ],

      // Activity log
      activityLog: [
        {
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          type: 'showing',
          agent: 'Sarah Johnson - Coastal Realty',
          feedback: 'Buyers loved the property. Considering making an offer.',
        },
        {
          date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          type: 'price_change',
          oldPrice: listing.originalListPrice,
          newPrice: listing.listPrice,
          reason: 'Competitive market adjustment',
        },
        {
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          type: 'inquiry',
          source: 'Zillow',
          message: 'Is the property still available? Would like to schedule a showing.',
        },
      ],

      // Showings detail
      showingsList: Array.from({ length: listing.showings }, (_, i) => ({
        id: i + 1,
        date: new Date(Date.now() - (i + 1) * 2 * 24 * 60 * 60 * 1000),
        time: '2:00 PM',
        agent: ['Sarah Johnson', 'Mike Wilson', 'Jennifer Lee'][i % 3],
        feedback: i % 2 === 0 ? 'Positive - clients interested' : 'Not a fit - looking for larger lot',
      })),

      // Analytics
      analytics: {
        views: listing.views,
        favorites: listing.favorites,
        shares: listing.shares,
        inquiries: listing.inquiries,
        viewsThisWeek: Math.floor(listing.views * 0.15),
        viewsLastWeek: Math.floor(listing.views * 0.12),
        viewsTrend: 'up',
        avgTimeOnPage: '3:45',
        viewsBySource: [
          { source: 'MLS', views: Math.floor(listing.views * 0.4) },
          { source: 'Zillow', views: Math.floor(listing.views * 0.3) },
          { source: 'Realtor.com', views: Math.floor(listing.views * 0.2) },
          { source: 'Direct', views: Math.floor(listing.views * 0.1) },
        ],
        dailyViews: Array.from({ length: 7 }, (_, i) => ({
          date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
          views: Math.floor(Math.random() * 20) + 10,
        })),
      },

      // Marketing checklist
      marketingChecklist: {
        photography: listing.professionalPhotos,
        virtualTour: !!listing.virtualTourLink,
        droneVideo: listing.dronePhotos,
        floorPlan: true,
        brochures: true,
        mlsListing: true,
        zillowListing: true,
        realtorListing: true,
        socialMedia: listing.views > 200,
        emailCampaign: listing.daysOnMarket > 14,
        openHouse: listing.daysOnMarket > 7,
        neighborhoodMailers: listing.daysOnMarket > 21,
      },

      // Price history
      priceHistory: [
        {
          date: listing.listingDate,
          price: listing.originalListPrice,
          event: 'Listed',
        },
        ...(listing.listPrice !== listing.originalListPrice ? [{
          date: new Date(listing.listingDate.getTime() + 30 * 24 * 60 * 60 * 1000),
          price: listing.listPrice,
          event: 'Price Reduced',
        }] : []),
      ],

      // Comparable properties
      comparableProperties: [
        {
          address: '321 Maple Street',
          soldPrice: listing.listPrice * 0.98,
          soldDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
          sqft: listing.squareFootage - 200,
          pricePerSqft: Math.round((listing.listPrice * 0.98) / (listing.squareFootage - 200)),
        },
        {
          address: '654 Pine Avenue',
          soldPrice: listing.listPrice * 1.05,
          soldDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          sqft: listing.squareFootage + 150,
          pricePerSqft: Math.round((listing.listPrice * 1.05) / (listing.squareFootage + 150)),
        },
        {
          address: '987 Cedar Lane',
          soldPrice: listing.listPrice * 0.95,
          soldDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          sqft: listing.squareFootage,
          pricePerSqft: Math.round((listing.listPrice * 0.95) / listing.squareFootage),
        },
      ],

      // Notes
      notes: [
        {
          id: 1,
          content: 'Sellers are motivated - relocating for work',
          createdAt: new Date(listing.listingDate),
          createdBy: 'Jayden Metz',
        },
        {
          id: 2,
          content: 'Price reduction authorized if no offers by month end',
          createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
          createdBy: 'Jayden Metz',
        },
      ],

      // Documents
      documents: [
        {
          id: 1,
          name: 'Property Disclosure',
          type: 'disclosure',
          size: '2.4 MB',
          uploadedDate: listing.listingDate.toISOString(),
        },
        {
          id: 2,
          name: 'HOA Documents',
          type: 'hoa',
          size: '5.1 MB',
          uploadedDate: new Date(listing.listingDate.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 3,
          name: 'Floor Plans',
          type: 'floorplan',
          size: '1.8 MB',
          uploadedDate: new Date(listing.listingDate.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ],
    };
  }

  static async create(data) {
    try {
      const id = String(Math.max(...mockListings.map((l) => parseInt(l.id) || 0)) + 1);
      const mlsPrefix = data.city ? data.city.substring(0, 2).toUpperCase() : 'CA';
      const mlsNumber = `${mlsPrefix}2025${String(mockListings.length + 1).padStart(3, '0')}`;

      const newListing = {
        id,
        propertyAddress: data.propertyAddress,
        city: data.city || '',
        state: data.state || 'CA',
        zipCode: data.zipCode || '',
        fullAddress: `${data.propertyAddress}, ${data.city}, ${data.state} ${data.zipCode}`,
        mlsNumber,
        listingStatus: data.listingStatus || 'Coming Soon',
        listPrice: parseFloat(data.listPrice) || 0,
        originalListPrice: parseFloat(data.listPrice) || 0,
        pricePerSqft: Math.round((parseFloat(data.listPrice) || 0) / (parseFloat(data.squareFootage) || 1)),
        propertyType: data.propertyType || 'Single Family',
        bedrooms: parseInt(data.bedrooms) || 0,
        bathrooms: parseInt(data.bathrooms) || 0,
        halfBathrooms: parseInt(data.halfBathrooms) || 0,
        squareFootage: parseInt(data.squareFootage) || 0,
        lotSize: parseInt(data.lotSize) || 0,
        yearBuilt: parseInt(data.yearBuilt) || new Date().getFullYear(),
        garage: parseInt(data.garage) || 0,
        pool: data.pool || false,
        listingDate: new Date(data.listingDate || Date.now()),
        expirationDate: new Date(data.expirationDate || Date.now() + 180 * 24 * 60 * 60 * 1000),
        daysOnMarket: 0,
        virtualTourLink: data.virtualTourLink || null,
        professionalPhotos: data.professionalPhotos || false,
        dronePhotos: data.dronePhotos || false,
        videoWalkthrough: data.videoWalkthrough || false,
        propertyDescription: data.propertyDescription || '',
        features: data.features || [],
        sellers: data.sellers || [],
        listingAgent: data.listingAgent || {
          id: 1,
          name: 'Jayden Metz',
          email: 'jayden@luxuryrealty.com',
          phone: '(858) 555-9999',
          licenseNumber: 'DRE#01234567',
        },
        buyerAgent: null,
        commission: data.commission || {
          listing: 2.5,
          buyer: 2.5,
          total: 5.0,
        },
        images: data.images || ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800'],
        primaryImage: data.primaryImage || data.images?.[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400',
        showings: 0,
        views: 0,
        favorites: 0,
        shares: 0,
        inquiries: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockListings.push(newListing);

      logger.info('Mock listing created:', {
        id: newListing.id,
        mlsNumber: newListing.mlsNumber,
        propertyAddress: newListing.propertyAddress,
        listPrice: newListing.listPrice,
      });

      return newListing;
    } catch (error) {
      logger.error('Mock Listing.create error:', error);
      throw error;
    }
  }

  static async update(id, data) {
    try {
      const index = mockListings.findIndex((l) => l.id === id);
      if (index === -1) {
        return null;
      }

      const currentListing = mockListings[index];

      // Track price changes
      const priceChanged = data.listPrice && parseFloat(data.listPrice) !== currentListing.listPrice;

      // Update the listing
      mockListings[index] = {
        ...currentListing,
        ...data,
        updatedAt: new Date(),
      };

      // Recalculate price per sqft if needed
      if (data.listPrice || data.squareFootage) {
        const listPrice = parseFloat(data.listPrice) || currentListing.listPrice;
        const squareFootage = parseInt(data.squareFootage) || currentListing.squareFootage;
        mockListings[index].pricePerSqft = Math.round(listPrice / squareFootage);
      }

      // Recalculate days on market
      const { listingDate } = mockListings[index];
      const today = new Date();
      mockListings[index].daysOnMarket = Math.ceil((today - listingDate) / (1000 * 60 * 60 * 24));

      logger.info('Mock listing updated:', {
        id,
        changes: Object.keys(data),
        priceChanged,
      });

      return mockListings[index];
    } catch (error) {
      logger.error('Mock Listing.update error:', error);
      throw error;
    }
  }

  static async updateStatus(id, status, note) {
    try {
      const listing = await this.update(id, { listingStatus: status });
      if (listing && note) {
        // In a real implementation, this would add to activity log
        logger.info('Listing status updated with note:', { id, status, note });
      }
      return listing;
    } catch (error) {
      logger.error('Mock Listing.updateStatus error:', error);
      throw error;
    }
  }

  static async recordPriceReduction(id, newPrice, reason) {
    try {
      const listing = mockListings.find((l) => l.id === id);
      if (!listing) return null;

      const oldPrice = listing.listPrice;
      await this.update(id, { listPrice: newPrice });

      logger.info('Price reduction recorded:', {
        id,
        oldPrice,
        newPrice,
        reduction: oldPrice - newPrice,
        reason,
      });

      return { oldPrice, newPrice, reason };
    } catch (error) {
      logger.error('Mock Listing.recordPriceReduction error:', error);
      throw error;
    }
  }

  static async logShowing(id, showingData) {
    try {
      const listing = mockListings.find((l) => l.id === id);
      if (!listing) return null;

      // Increment showing count
      await this.update(id, { showings: listing.showings + 1 });

      logger.info('Showing logged:', {
        listingId: id,
        date: showingData.date,
        agent: showingData.buyerAgent,
        feedback: showingData.feedback,
      });

      return {
        id: Date.now(),
        listingId: id,
        ...showingData,
        createdAt: new Date(),
      };
    } catch (error) {
      logger.error('Mock Listing.logShowing error:', error);
      throw error;
    }
  }

  static async delete(id) {
    try {
      const index = mockListings.findIndex((l) => l.id === id);
      if (index === -1) {
        throw new Error('Listing not found');
      }

      const deletedListing = mockListings[index];
      mockListings.splice(index, 1);

      logger.info('Mock listing deleted:', {
        id,
        mlsNumber: deletedListing.mlsNumber,
        propertyAddress: deletedListing.propertyAddress,
      });

      return deletedListing;
    } catch (error) {
      logger.error('Mock Listing.delete error:', error);
      throw error;
    }
  }

  static async getPriceHistory(id) {
    const listing = mockListings.find((l) => l.id === id);
    if (!listing) return [];

    const history = [
      {
        date: listing.listingDate,
        price: listing.originalListPrice,
        event: 'Listed',
      },
    ];

    if (listing.listPrice !== listing.originalListPrice) {
      history.push({
        date: new Date(listing.listingDate.getTime() + 30 * 24 * 60 * 60 * 1000),
        price: listing.listPrice,
        event: 'Price Reduced',
      });
    }

    return history;
  }

  static async updateChecklist(id, checklist) {
    try {
      const listing = await this.update(id, { marketingChecklist: checklist });

      logger.info('Marketing checklist updated:', {
        listingId: id,
        completedItems: Object.values(checklist).filter(Boolean).length,
      });

      return listing;
    } catch (error) {
      logger.error('Mock Listing.updateChecklist error:', error);
      throw error;
    }
  }
}

module.exports = ListingMock;
