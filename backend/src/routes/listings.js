const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const databaseService = require('../services/database.service');

// Apply authentication to all routes
router.use(authenticateToken);

// Transform listing for list view
const transformListingForList = (listing) => ({
  id: listing.id,
  mlsNumber: listing.mlsNumber,
  propertyAddress: listing.propertyAddress,
  propertyImage: listing.photos?.[0] || 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400',
  listingStatus: listing.listingStatus,
  propertyType: listing.propertyType,
  listPrice: listing.listPrice,
  pricePerSqft: listing.pricePerSqft,
  bedrooms: listing.bedrooms,
  bathrooms: listing.bathrooms,
  squareFootage: listing.squareFootage,
  daysOnMarket: listing.daysOnMarket,
  listDate: listing.listDate,
  showings: listing.showings || 0,
  inquiries: listing.inquiries || 0,
  saves: listing.saves || 0
});

// GET /v1/listings - List all listings with pagination and filters
router.get('/', (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      propertyType,
      minPrice,
      maxPrice,
      sort = 'listDate',
      order = 'desc',
      search
    } = req.query;

    let listings = databaseService.getAll('listings');

    // Apply filters
    if (status) {
      listings = listings.filter(l => l.listingStatus === status);
    }
    if (propertyType) {
      listings = listings.filter(l => l.propertyType === propertyType);
    }
    if (minPrice) {
      listings = listings.filter(l => l.listPrice >= parseFloat(minPrice));
    }
    if (maxPrice) {
      listings = listings.filter(l => l.listPrice <= parseFloat(maxPrice));
    }
    if (search) {
      const searchLower = search.toLowerCase();
      listings = listings.filter(l => 
        l.propertyAddress?.toLowerCase().includes(searchLower) ||
        l.mlsNumber?.toLowerCase().includes(searchLower) ||
        l.marketingRemarks?.toLowerCase().includes(searchLower)
      );
    }

    // Sort listings
    listings.sort((a, b) => {
      let aVal = a[sort];
      let bVal = b[sort];
      
      // Handle date sorting
      if (sort.includes('Date')) {
        aVal = new Date(aVal || 0).getTime();
        bVal = new Date(bVal || 0).getTime();
      }
      
      // Handle numeric sorting
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return order === 'asc' ? aVal - bVal : bVal - aVal;
      }
      
      // Handle string sorting
      const aStr = String(aVal || '');
      const bStr = String(bVal || '');
      return order === 'asc' 
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr);
    });

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedListings = listings.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        listings: paginatedListings.map(transformListingForList),
        pagination: {
          total: listings.length,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(listings.length / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching listings:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to fetch listings'
      }
    });
  }
});

// GET /v1/listings/stats - Get listing statistics
router.get('/stats', (req, res) => {
  try {
    const stats = databaseService.getStats('listings');
    const listings = databaseService.getAll('listings');
    
    // Calculate additional stats
    const thisMonth = new Date().toISOString().slice(0, 7);
    const lastMonth = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 7);
    
    const newThisMonth = listings.filter(l => 
      l.listDate?.slice(0, 7) === thisMonth
    ).length;
    
    const soldThisMonth = listings.filter(l => 
      l.listingStatus === 'Sold' && 
      l.lastModifiedDate?.slice(0, 7) === thisMonth
    ).length;

    res.json({
      success: true,
      data: {
        overview: {
          ...stats,
          newThisMonth,
          soldThisMonth,
          avgListPrice: Math.round(stats.totalValue / (stats.total || 1)),
          hotListings: listings.filter(l => 
            l.showings > 20 || l.inquiries > 30
          ).length
        },
        byType: {
          'Single Family': listings.filter(l => l.propertyType === 'Single Family').length,
          'Condo': listings.filter(l => l.propertyType === 'Condo').length,
          'Townhouse': listings.filter(l => l.propertyType === 'Townhouse').length,
          'Multi-Family': listings.filter(l => l.propertyType === 'Multi-Family').length,
          'Land': listings.filter(l => l.propertyType === 'Land').length
        },
        priceRanges: {
          'Under $500k': listings.filter(l => l.listPrice < 500000).length,
          '$500k-$1M': listings.filter(l => l.listPrice >= 500000 && l.listPrice < 1000000).length,
          '$1M-$2M': listings.filter(l => l.listPrice >= 1000000 && l.listPrice < 2000000).length,
          'Over $2M': listings.filter(l => l.listPrice >= 2000000).length
        }
      }
    });
  } catch (error) {
    console.error('Error fetching listing stats:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to fetch listing statistics'
      }
    });
  }
});

// GET /v1/listings/:id - Get single listing details
router.get('/:id', (req, res) => {
  try {
    const listing = databaseService.getById('listings', req.params.id);
    
    if (!listing) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Listing not found'
        }
      });
    }

    // Add calculated fields
    listing.marketStats = {
      viewsPerDay: Math.round((listing.showings || 0) / (listing.daysOnMarket || 1)),
      inquiryRate: Math.round(((listing.inquiries || 0) / (listing.showings || 1)) * 100) || 0,
      saveRate: Math.round(((listing.saves || 0) / (listing.inquiries || 1)) * 100) || 0,
      priceReduction: listing.originalListPrice ? 
        Math.round(((listing.originalListPrice - listing.listPrice) / listing.originalListPrice) * 100) : 0
    };

    res.json({
      success: true,
      data: listing
    });
  } catch (error) {
    console.error('Error fetching listing:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to fetch listing details'
      }
    });
  }
});

// POST /v1/listings - Create new listing
router.post('/', (req, res) => {
  try {
    const newListing = databaseService.create('listings', {
      ...req.body,
      listingStatus: req.body.listingStatus || 'Coming Soon',
      listDate: new Date().toISOString(),
      daysOnMarket: 0,
      showings: 0,
      inquiries: 0,
      saves: 0,
      createdBy: req.user.username
    });

    res.status(201).json({
      success: true,
      data: newListing
    });
  } catch (error) {
    console.error('Error creating listing:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to create listing'
      }
    });
  }
});

// PUT /v1/listings/:id - Update listing
router.put('/:id', (req, res) => {
  try {
    const updated = databaseService.update('listings', req.params.id, req.body);
    
    if (!updated) {
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
      data: updated
    });
  } catch (error) {
    console.error('Error updating listing:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to update listing'
      }
    });
  }
});

// POST /v1/listings/:id/photos - Add photos to listing
router.post('/:id/photos', (req, res) => {
  try {
    const listing = databaseService.getById('listings', req.params.id);
    
    if (!listing) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Listing not found'
        }
      });
    }

    const { urls } = req.body;
    const updatedPhotos = [...(listing.photos || []), ...urls];
    
    const updated = databaseService.update('listings', req.params.id, {
      photos: updatedPhotos
    });

    res.json({
      success: true,
      data: {
        message: `${urls.length} photos added successfully`,
        totalPhotos: updatedPhotos.length
      }
    });
  } catch (error) {
    console.error('Error adding photos:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to add photos'
      }
    });
  }
});

// POST /v1/listings/:id/activity - Log activity (showing, inquiry, save)
router.post('/:id/activity', (req, res) => {
  try {
    const listing = databaseService.getById('listings', req.params.id);
    
    if (!listing) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Listing not found'
        }
      });
    }

    const { type, details } = req.body;
    const updates = {};
    
    switch(type) {
      case 'showing':
        updates.showings = (listing.showings || 0) + 1;
        break;
      case 'inquiry':
        updates.inquiries = (listing.inquiries || 0) + 1;
        break;
      case 'save':
        updates.saves = (listing.saves || 0) + 1;
        break;
    }

    const updated = databaseService.update('listings', req.params.id, updates);

    res.json({
      success: true,
      data: {
        message: `${type} activity logged`,
        newCount: updates[type + 's'] || updated[type + 's']
      }
    });
  } catch (error) {
    console.error('Error logging activity:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to log activity'
      }
    });
  }
});

// DELETE /v1/listings/:id - Delete listing
router.delete('/:id', (req, res) => {
  try {
    const deleted = databaseService.delete('listings', req.params.id);
    
    if (!deleted) {
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
      data: {
        message: 'Listing deleted successfully'
      }
    });
  } catch (error) {
    console.error('Error deleting listing:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to delete listing'
      }
    });
  }
});

module.exports = router;