import apiInstance from '../../../services/api.service';

/**
 * MODULE_TITLE Service
 *
 * Service layer for MODULE_PLURAL API operations including:
 * - CRUD operations
 * - Data transformation
 * - Error handling
 * - Export functionality
 * - Statistics calculation
 */
class MODULE_NAMEService {
  /**
   * Get all MODULE_PLURAL with optional filtering and pagination
   * @param {Object} params - Query parameters
   * @param {string} params.search - Search term
   * @param {number} params.page - Page number
   * @param {number} params.limit - Items per page
   * @param {string} params.sortBy - Sort field
   * @param {string} params.sortOrder - Sort direction ('asc' or 'desc')
   * @returns {Promise<Object>} Response with items, stats, and pagination
   */
  async getAll(params = {}) {
    try {
      const response = await apiInstance.get('/v1/MODULE_PLURAL', { params });

      const items = response.data || [];

      return {
        items: items.map(this.transformItem),
        stats: this.calculateStats(items),
        totalPages: response.pagination?.totalPages || 1,
        totalItems: response.pagination?.total || 0
      };
    } catch (error) {
      console.error('Error fetching MODULE_PLURAL:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get a single MODULE_SINGULAR by ID
   * @param {string} id - MODULE_SINGULAR ID
   * @returns {Promise<Object>} MODULE_SINGULAR object
   */
  async getById(id) {
    try {
      const response = await apiInstance.get(`/v1/MODULE_PLURAL/${id}`);
      return this.transformItem(response.data);
    } catch (error) {
      console.error(`Error fetching MODULE_SINGULAR ${id}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Create a new MODULE_SINGULAR
   * @param {Object} data - MODULE_SINGULAR data
   * @returns {Promise<Object>} Created MODULE_SINGULAR
   */
  async create(data) {
    try {
      const payload = this.preparePayload(data);
      const response = await apiInstance.post('/v1/MODULE_PLURAL', payload);
      return this.transformItem(response.data);
    } catch (error) {
      console.error('Error creating MODULE_SINGULAR:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Update an existing MODULE_SINGULAR
   * @param {string} id - MODULE_SINGULAR ID
   * @param {Object} data - Updated MODULE_SINGULAR data
   * @returns {Promise<Object>} Updated MODULE_SINGULAR
   */
  async update(id, data) {
    try {
      const payload = this.preparePayload(data);
      const response = await apiInstance.put(`/v1/MODULE_PLURAL/${id}`, payload);
      return this.transformItem(response.data);
    } catch (error) {
      console.error(`Error updating MODULE_SINGULAR ${id}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Delete a MODULE_SINGULAR
   * @param {string} id - MODULE_SINGULAR ID
   * @returns {Promise<void>}
   */
  async delete(id) {
    try {
      await apiInstance.delete(`/v1/MODULE_PLURAL/${id}`);
    } catch (error) {
      console.error(`Error deleting MODULE_SINGULAR ${id}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Export MODULE_PLURAL to CSV
   * @param {Object} params - Export parameters (filters, search, etc.)
   * @returns {Promise<Blob>} CSV file blob
   */
  async export(params = {}) {
    try {
      const response = await apiInstance.get('/v1/MODULE_PLURAL/export', {
        params,
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting MODULE_PLURAL:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Transform MODULE_SINGULAR data from API format to application format
   * @param {Object} item - Raw MODULE_SINGULAR from API
   * @returns {Object} Transformed MODULE_SINGULAR
   */
  transformItem(item) {
    if (!item) return null;

    return {
      id: item.id,
      // Add your fields here - example:
      // name: item.name || '',
      // description: item.description || '',
      // status: item.status || 'active',
      // createdAt: item.created_at ? new Date(item.created_at) : null,
      // updatedAt: item.updated_at ? new Date(item.updated_at) : null,

      // Include all original fields for flexibility
      ...item
    };
  }

  /**
   * Prepare payload for create/update operations
   * @param {Object} data - Form data
   * @returns {Object} API payload
   */
  preparePayload(data) {
    // Transform application format to API format
    const payload = {
      // Add your field mappings here - example:
      // name: data.name,
      // description: data.description,
      // status: data.status
    };

    // Remove undefined/null values
    return Object.fromEntries(
      Object.entries(payload).filter(([_, v]) => v !== undefined && v !== null)
    );
  }

  /**
   * Calculate statistics from MODULE_PLURAL data
   * @param {Array} items - Array of MODULE_PLURAL
   * @returns {Object} Statistics object
   */
  calculateStats(items = []) {
    const totalCount = items.length;
    const activeCount = items.filter(item => item.status === 'active').length;
    const inactiveCount = items.filter(item => item.status === 'inactive').length;

    return {
      totalCount,
      activeCount,
      inactiveCount,
      // Add more stats as needed
    };
  }

  /**
   * Handle API errors and transform to user-friendly messages
   * @param {Error} error - API error
   * @returns {Error} Transformed error
   */
  handleError(error) {
    if (error.response) {
      // Server responded with error
      const message = error.response.data?.error?.message || error.response.data?.message || 'An error occurred';
      const err = new Error(message);
      err.status = error.response.status;
      err.code = error.response.data?.error?.code;
      return err;
    } else if (error.request) {
      // Request made but no response
      return new Error('No response from server. Please check your connection.');
    } else {
      // Something else happened
      return new Error(error.message || 'An unexpected error occurred');
    }
  }
}

// Export singleton instance
export const MODULE_SINGULARService = new MODULE_NAMEService();

// Export class for testing
export default MODULE_NAMEService;
