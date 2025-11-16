const crypto = require('crypto');
const axios = require('axios');

class SkySlopeService {
  constructor() {
    this.baseURL = 'https://api.skyslope.com';
    this.clientId = process.env.SKYSLOPE_CLIENT_ID;
    this.clientSecret = process.env.SKYSLOPE_CLIENT_SECRET;
    this.accessKey = process.env.SKYSLOPE_ACCESS_KEY;
    this.secret = process.env.SKYSLOPE_SECRET;
    this.sessionToken = null;
    this.tokenExpiry = null;
  }

  /**
   * Generate HMAC for authentication
   */
  generateHMAC(timestamp) {
    const message = `${this.accessKey}:${timestamp}`;
    const hmac = crypto.createHmac('sha256', this.secret);
    hmac.update(message);
    return hmac.digest('base64');
  }

  /**
   * Authenticate with SkySlope
   */
  async authenticate() {
    // Check if we have a valid token
    if (this.sessionToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return this.sessionToken;
    }

    const timestamp = new Date().toISOString();
    const hmac = this.generateHMAC(timestamp);

    try {
      const response = await axios.post(
        `${this.baseURL}/auth/login`,
        {
          clientId: this.clientId,
          clientSecret: this.clientSecret,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `SS ${this.accessKey}:${hmac}`,
            Timestamp: timestamp,
          },
        },
      );

      this.sessionToken = response.data.sessionToken;
      // Token expires in 2 hours, but we'll refresh after 1.5 hours to be safe
      this.tokenExpiry = new Date(Date.now() + 90 * 60 * 1000);

      return this.sessionToken;
    } catch (error) {
      console.error('SkySlope authentication failed:', error.response?.data || error.message);
      throw new Error('Failed to authenticate with SkySlope');
    }
  }

  /**
   * Make authenticated request to SkySlope API
   */
  async makeRequest(method, endpoint, data = null) {
    const token = await this.authenticate();

    try {
      const config = {
        method,
        url: `${this.baseURL}${endpoint}`,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      };

      if (data) {
        config.data = data;
      }

      const response = await axios(config);
      return response.data;
    } catch (error) {
      console.error(`SkySlope API error on ${endpoint}:`, error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Get checklist types available for transactions
   */
  async getChecklistTypes() {
    return this.makeRequest('GET', '/api/checklistTypes');
  }

  /**
   * Create a new listing or sale in SkySlope
   */
  async createTransaction(transactionData) {
    const endpoint = transactionData.transactionType === 'listing'
      ? '/api/listings'
      : '/api/sales';

    return this.makeRequest('POST', endpoint, transactionData);
  }

  /**
   * Get transaction documents using SkySlope ID
   */
  async getTransactionDocuments(skyslopeId, transactionType = 'sale') {
    const endpoint = transactionType === 'listing'
      ? `/api/listings/${skyslopeId}/documents`
      : `/api/sales/${skyslopeId}/documents`;

    return this.makeRequest('GET', endpoint);
  }

  /**
   * Get documents for escrow by pulling from SkySlope
   */
  async getEscrowDocuments(escrow) {
    if (!escrow.skyslope_id) {
      throw new Error('Escrow not linked to SkySlope');
    }

    const transactionType = escrow.skyslope_type || 'sale';
    return this.getTransactionDocuments(escrow.skyslope_id, transactionType);
  }

  /**
   * Upload document to transaction
   */
  async uploadDocument(transactionId, transactionType, documentData) {
    const endpoint = transactionType === 'listing'
      ? `/api/listings/${transactionId}/documents`
      : `/api/sales/${transactionId}/documents`;

    // For file uploads, we need to use FormData
    const formData = new FormData();
    Object.keys(documentData).forEach((key) => {
      formData.append(key, documentData[key]);
    });

    const token = await this.authenticate();

    return axios.post(`${this.baseURL}${endpoint}`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  /**
   * Get document templates based on transaction type
   */
  async getDocumentTemplates(transactionType, state = 'CA') {
    // This would typically return templates from SkySlope
    // For now, we'll define standard California templates
    const templates = {
      purchase: [
        { name: 'RPA - Residential Purchase Agreement', code: 'RPA', required: true },
        { name: 'Disclosure Package', code: 'DISCLOSURE', required: true },
        { name: 'Escrow Instructions', code: 'ESCROW', required: true },
        { name: 'Financing Addendum', code: 'FINANCE', required: false },
        { name: 'Inspection Reports', code: 'INSPECTION', required: false },
        { name: 'Title Report', code: 'TITLE', required: true },
        { name: 'HOA Documents', code: 'HOA', required: false },
        { name: 'Counter Offers', code: 'COUNTER', required: false },
        { name: 'Addendums', code: 'ADDENDUM', required: false },
        { name: 'Closing Statement', code: 'CLOSING', required: true },
      ],
      listing: [
        { name: 'Listing Agreement', code: 'LISTING', required: true },
        { name: 'Seller Disclosures', code: 'SELLER_DISC', required: true },
        { name: 'Marketing Materials', code: 'MARKETING', required: false },
        { name: 'Property Photos', code: 'PHOTOS', required: false },
        { name: 'MLS Documents', code: 'MLS', required: true },
        { name: 'Seller Net Sheet', code: 'NET_SHEET', required: false },
        { name: 'CMA - Comparative Market Analysis', code: 'CMA', required: false },
        { name: 'Pre-Listing Inspection', code: 'PRE_INSPECTION', required: false },
      ],
    };

    return templates[transactionType] || [];
  }

  /**
   * Sync escrow with SkySlope transaction
   */
  async syncEscrowWithSkySlope(escrow) {
    const transactionData = {
      transactionType: this.determineTransactionType(escrow),
      propertyAddress: escrow.property_address,
      price: escrow.purchase_price,
      closeDate: escrow.closing_date,
      status: this.mapEscrowStatusToSkySlope(escrow.escrow_status),
      // Add more fields as needed based on SkySlope requirements
    };

    try {
      const result = await this.createTransaction(transactionData);
      return {
        success: true,
        skyslopeId: result.id,
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  determineTransactionType(escrow) {
    // Logic to determine if this is a listing or sale
    // Could be based on escrow data or lead source
    return escrow.transaction_side === 'listing' ? 'listing' : 'sale';
  }

  mapEscrowStatusToSkySlope(status) {
    const statusMap = {
      Active: 'active',
      Pending: 'pending',
      Closed: 'closed',
      Cancelled: 'cancelled',
    };
    return statusMap[status] || 'active';
  }
}

module.exports = new SkySlopeService();
