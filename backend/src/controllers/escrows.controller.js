const Escrow = require('../models/Escrow');
const logger = require('../utils/logger');
const { validationResult } = require('express-validator');
const pdfParse = require('pdf-parse');

exports.getEscrows = async (req, res) => {
  try {
    const filters = {
      status: req.query.status,
      minPrice: req.query.minPrice,
      maxPrice: req.query.maxPrice,
      closingDateStart: req.query.closingDateStart,
      closingDateEnd: req.query.closingDateEnd,
      page: req.query.page,
      limit: req.query.limit,
      sort: req.query.sort,
      order: req.query.order
    };
    
    const result = await Escrow.findAll(filters);
    
    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching escrows:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch escrows'
      }
    });
  }
};

exports.getEscrow = async (req, res) => {
  try {
    const escrow = await Escrow.findById(req.params.id);
    
    if (!escrow) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Escrow not found'
        }
      });
    }
    
    res.json({
      success: true,
      data: escrow,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching escrow:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch escrow'
      }
    });
  }
};

exports.createEscrow = async (req, res) => {
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
    
    // Generate escrow number
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const randomId = Math.floor(Math.random() * 900) + 100;
    const escrowNumber = `ESC-${year}-${month}-${randomId}`;
    
    // Calculate commission details
    const purchasePrice = parseFloat(req.body.purchasePrice);
    const commissionRate = parseFloat(req.body.commissionPercentage) || 2.5;
    const totalCommission = purchasePrice * (commissionRate / 100);
    const agentCommission = totalCommission / 2;
    
    const escrowData = {
      ...req.body,
      escrowNumber,
      escrowStatus: 'Active',
      currentStage: 'Contract',
      grossCommission: totalCommission,
      netCommission: agentCommission * 0.9, // Assuming 10% brokerage split
      createdBy: req.user?.name || 'System',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const escrow = await Escrow.create(escrowData);
    
    // Emit real-time update
    const io = req.app.get('io');
    if (io) {
      io.to('escrows').emit('escrow:created', escrow);
    }
    
    // Log the creation for AI agents
    logger.info('New escrow created', {
      escrowId: escrow.id,
      escrowNumber: escrow.escrowNumber,
      propertyAddress: escrow.propertyAddress,
      purchasePrice: escrow.purchasePrice,
      buyers: escrow.buyers.map(b => b.name),
      sellers: escrow.sellers.map(s => s.name)
    });
    
    res.status(201).json({
      success: true,
      data: escrow,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error creating escrow:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CREATE_ERROR',
        message: 'Failed to create escrow'
      }
    });
  }
};

exports.updateEscrow = async (req, res) => {
  try {
    const escrow = await Escrow.update(req.params.id, req.body);
    
    if (!escrow) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Escrow not found'
        }
      });
    }
    
    // Emit real-time update
    const io = req.app.get('io');
    io.to('escrows').emit('escrow:updated', escrow);
    
    res.json({
      success: true,
      data: escrow,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error updating escrow:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_ERROR',
        message: 'Failed to update escrow'
      }
    });
  }
};

exports.deleteEscrow = async (req, res) => {
  try {
    const reason = req.headers['x-deletion-reason'] || 'No reason provided';
    const deletionRequest = await Escrow.delete(
      req.params.id, 
      req.user.name,
      reason
    );
    
    res.json({
      success: true,
      data: {
        deletionRequest,
        approvalUrl: `${process.env.FRONTEND_URL}/approvals/${deletionRequest.id}`
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error requesting escrow deletion:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DELETE_ERROR',
        message: 'Failed to request escrow deletion'
      }
    });
  }
};

exports.updateChecklist = async (req, res) => {
  try {
    const { item, value, note } = req.body;
    
    const checklist = await Escrow.updateChecklist(
      req.params.id,
      item,
      value,
      note
    );
    
    // Emit real-time update
    const io = req.app.get('io');
    io.to(`escrow:${req.params.id}`).emit('checklist:updated', {
      escrowId: req.params.id,
      item,
      value,
      note
    });
    
    res.json({
      success: true,
      data: checklist,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error updating checklist:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_ERROR',
        message: 'Failed to update checklist'
      }
    });
  }
};

exports.parseRPA = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NO_FILE',
          message: 'No PDF file uploaded'
        }
      });
    }

    logger.info('Processing RPA PDF upload:', {
      filename: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    });

    // Extract text from PDF
    const pdfData = await pdfParse(req.file.buffer);
    const text = pdfData.text;

    // Parse the extracted text for escrow data
    const extractedData = parseRPAText(text);

    logger.info('RPA parsing completed:', {
      textLength: text.length,
      extractedFields: Object.keys(extractedData).filter(key => extractedData[key])
    });

    res.json({
      success: true,
      data: {
        extractedData,
        textLength: text.length,
        confidence: extractedData._confidence || {}
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    logger.error('Error parsing RPA:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'PARSE_ERROR',
        message: 'Failed to parse RPA document'
      }
    });
  }
};

// Parse RPA text to extract escrow data
function parseRPAText(text) {
  const data = {
    propertyAddress: '',
    purchasePrice: '',
    acceptanceDate: null,
    closingDate: null,
    buyers: [],
    sellers: [],
    earnestMoneyDeposit: '',
    downPayment: '',
    loanAmount: '',
    escrowCompany: '',
    titleCompany: '',
    listingAgent: { name: '', email: '', phone: '', brokerage: '' },
    buyerAgent: { name: '', email: '', phone: '', brokerage: '' },
    inspectionDeadline: null,
    appraisalDeadline: null,
    loanContingencyDeadline: null,
  };

  const confidence = {};

  try {
    // Property Address - look for various patterns
    const addressPatterns = [
      /Property Address[:\s]+([^\n]+)/i,
      /Real Property[:\s]+([^\n]+)/i,
      /Subject Property[:\s]+([^\n]+)/i,
      /Property Location[:\s]+([^\n]+)/i,
    ];
    
    for (const pattern of addressPatterns) {
      const match = text.match(pattern);
      if (match) {
        data.propertyAddress = match[1].trim().replace(/\s+/g, ' ');
        confidence.propertyAddress = 'high';
        break;
      }
    }

    // Purchase Price - look for dollar amounts
    const pricePatterns = [
      /Purchase Price[:\s]+\$?([\d,]+)/i,
      /Sale Price[:\s]+\$?([\d,]+)/i,
      /Total Purchase Price[:\s]+\$?([\d,]+)/i,
      /Offer Price[:\s]+\$?([\d,]+)/i,
    ];
    
    for (const pattern of pricePatterns) {
      const match = text.match(pattern);
      if (match) {
        data.purchasePrice = match[1].replace(/,/g, '');
        confidence.purchasePrice = 'high';
        break;
      }
    }

    // Buyers - look for buyer names
    const buyerPatterns = [
      /Buyer[s]?[:\s]+([^\n]+)/i,
      /Purchaser[s]?[:\s]+([^\n]+)/i,
    ];
    
    for (const pattern of buyerPatterns) {
      const match = text.match(pattern);
      if (match) {
        const buyerText = match[1].trim();
        const buyers = buyerText.split(/\s+and\s+|\s*,\s*|\s*&\s*/)
          .filter(name => name.length > 2)
          .map(name => ({
            name: name.trim().replace(/\([^)]*\)/g, '').trim(),
            email: '',
            phone: '',
            lender: '',
            preApproved: false
          }));
        data.buyers = buyers.slice(0, 3);
        confidence.buyers = buyers.length > 0 ? 'high' : 'low';
        break;
      }
    }

    // Sellers - look for seller names
    const sellerPatterns = [
      /Seller[s]?[:\s]+([^\n]+)/i,
      /Vendor[s]?[:\s]+([^\n]+)/i,
    ];
    
    for (const pattern of sellerPatterns) {
      const match = text.match(pattern);
      if (match) {
        const sellerText = match[1].trim();
        const sellers = sellerText.split(/\s+and\s+|\s*,\s*|\s*&\s*/)
          .filter(name => name.length > 2)
          .map(name => ({
            name: name.trim().replace(/\([^)]*\)/g, '').trim(),
            email: '',
            phone: ''
          }));
        data.sellers = sellers.slice(0, 3);
        confidence.sellers = sellers.length > 0 ? 'high' : 'low';
        break;
      }
    }

    // Dates - look for various date formats
    const closingMatch = text.match(/Closing Date[:\s]+(\d{1,2}\/\d{1,2}\/\d{4})/i);
    if (closingMatch) {
      data.closingDate = new Date(closingMatch[1]);
      confidence.closingDate = 'high';
    }

    const acceptanceMatch = text.match(/Acceptance Date[:\s]+(\d{1,2}\/\d{1,2}\/\d{4})/i);
    if (acceptanceMatch) {
      data.acceptanceDate = new Date(acceptanceMatch[1]);
      confidence.acceptanceDate = 'high';
    }

    // Ensure we have at least empty buyer/seller arrays
    if (data.buyers.length === 0) {
      data.buyers = [{ name: '', email: '', phone: '', lender: '', preApproved: false }];
    }
    if (data.sellers.length === 0) {
      data.sellers = [{ name: '', email: '', phone: '' }];
    }

    // Add confidence metadata
    data._confidence = confidence;
    
    return data;
  } catch (error) {
    logger.error('Error parsing RPA text:', error);
    return data;
  }
}