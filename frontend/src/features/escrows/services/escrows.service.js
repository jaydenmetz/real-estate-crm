import { escrowsAPI } from '../../../services/api.service';

/**
 * Escrows Service - Isolates all escrow-related API interactions
 * Provides a clean interface for escrow operations
 */
class EscrowsService {
  /**
   * Fetch all escrows with optional filters
   * @param {Object} params - Query parameters (page, limit, status, search, etc.)
   * @returns {Promise<Object>} { items, stats, totalPages, totalItems }
   */
  async getAll(params = {}) {
    try {
      const response = await escrowsAPI.getAll(params);

      // Backend returns: { data: { escrows, stats, pagination } }
      const escrows = response.data?.escrows || response.escrows || [];
      const backendStats = response.data?.stats || response.stats;
      const pagination = response.data?.pagination || response.pagination || {};

      // Transform API response to match dashboard data structure
      return {
        items: escrows,
        stats: backendStats || this.calculateStats(escrows),
        totalPages: pagination.totalPages || 1,
        totalItems: pagination.totalItems || pagination.total || 0,
        currentPage: pagination.currentPage || pagination.page || 1
      };
    } catch (error) {
      console.error('Error fetching escrows:', error);
      throw error;
    }
  }

  /**
   * Fetch archived escrows
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Archived escrows data
   */
  async getArchived(params = {}) {
    try {
      const response = await escrowsAPI.getArchived(params);
      const escrows = response.data?.escrows || response.escrows || [];
      const pagination = response.data?.pagination || response.pagination || {};

      return {
        items: escrows,
        totalItems: pagination.totalItems || pagination.total || response.total || 0
      };
    } catch (error) {
      console.error('Error fetching archived escrows:', error);
      throw error;
    }
  }

  /**
   * Get a single escrow by ID
   * @param {string} id - Escrow ID
   * @returns {Promise<Object>} Escrow data
   */
  async getById(id) {
    try {
      const response = await escrowsAPI.getById(id);
      return response.data || response.escrow;
    } catch (error) {
      console.error(`Error fetching escrow ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create a new escrow
   * @param {Object} escrowData - Escrow data
   * @returns {Promise<Object>} Created escrow
   */
  async create(escrowData) {
    try {
      const response = await escrowsAPI.create(escrowData);
      return response.data || response.escrow;
    } catch (error) {
      console.error('Error creating escrow:', error);
      throw error;
    }
  }

  /**
   * Update an existing escrow
   * @param {string} id - Escrow ID
   * @param {Object} updates - Updated data
   * @returns {Promise<Object>} Updated escrow
   */
  async update(id, updates) {
    try {
      const response = await escrowsAPI.update(id, updates);
      return response.data || response.escrow;
    } catch (error) {
      console.error(`Error updating escrow ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete an escrow
   * @param {string} id - Escrow ID
   * @returns {Promise<void>}
   */
  async delete(id) {
    try {
      await escrowsAPI.delete(id);
    } catch (error) {
      console.error(`Error deleting escrow ${id}:`, error);
      throw error;
    }
  }

  /**
   * Archive an escrow
   * @param {string} id - Escrow ID
   * @returns {Promise<Object>} Archived escrow
   */
  async archive(id) {
    try {
      const response = await escrowsAPI.archive(id);
      return response.data || response.escrow;
    } catch (error) {
      console.error(`Error archiving escrow ${id}:`, error);
      throw error;
    }
  }

  /**
   * Restore an archived escrow
   * @param {string} id - Escrow ID
   * @returns {Promise<Object>} Restored escrow
   */
  async restore(id) {
    try {
      const response = await escrowsAPI.restore(id);
      return response.data || response.escrow;
    } catch (error) {
      console.error(`Error restoring escrow ${id}:`, error);
      throw error;
    }
  }

  /**
   * Bulk delete archived escrows
   * @param {Array<string>} ids - Array of escrow IDs
   * @returns {Promise<void>}
   */
  async bulkDelete(ids) {
    try {
      await escrowsAPI.bulkDeleteArchived(ids);
    } catch (error) {
      console.error('Error bulk deleting escrows:', error);
      throw error;
    }
  }

  /**
   * Calculate dashboard statistics from escrows data
   * @param {Array} escrows - Array of escrows
   * @returns {Array} Stats array for dashboard
   */
  calculateStats(escrows) {
    const stats = {
      total: escrows.length,
      active: escrows.filter(e => e.escrow_status === 'Active' || e.escrow_status === 'Pending').length,
      pending: escrows.filter(e => e.escrow_status === 'Pending').length,
      closed: escrows.filter(e => e.escrow_status === 'Closed').length,
      totalVolume: escrows.reduce((sum, e) => sum + (parseFloat(e.purchase_price) || 0), 0),
      activeVolume: escrows
        .filter(e => e.escrow_status === 'Active' || e.escrow_status === 'Pending')
        .reduce((sum, e) => sum + (parseFloat(e.purchase_price) || 0), 0),
      avgDaysToClose: this.calculateAvgDaysToClose(escrows),
      closingThisWeek: this.getClosingThisWeek(escrows).length,
      closingThisMonth: this.getClosingThisMonth(escrows).length
    };

    return [
      {
        id: 'total',
        label: 'Total Escrows',
        value: stats.total,
        format: 'number',
        icon: 'Home',
        color: 'primary.main'
      },
      {
        id: 'active',
        label: 'Active Escrows',
        value: stats.active,
        format: 'number',
        icon: 'Schedule',
        color: 'success.main'
      },
      {
        id: 'volume',
        label: 'Total Volume',
        value: stats.totalVolume,
        format: 'currency',
        icon: 'AttachMoney',
        color: 'info.main'
      },
      {
        id: 'closingThisWeek',
        label: 'Closing This Week',
        value: stats.closingThisWeek,
        format: 'number',
        icon: 'CalendarToday',
        color: 'warning.main'
      }
    ];
  }

  /**
   * Calculate average days to close
   * @param {Array} escrows - Array of escrows
   * @returns {number} Average days to close
   */
  calculateAvgDaysToClose(escrows) {
    const closedEscrows = escrows.filter(e =>
      e.escrow_status === 'Closed' && e.opened_date && e.closing_date
    );

    if (closedEscrows.length === 0) return 0;

    const totalDays = closedEscrows.reduce((sum, e) => {
      const opened = new Date(e.opened_date);
      const closed = new Date(e.closing_date);
      const days = Math.floor((closed - opened) / (1000 * 60 * 60 * 24));
      return sum + days;
    }, 0);

    return Math.round(totalDays / closedEscrows.length);
  }

  /**
   * Get escrows closing this week
   * @param {Array} escrows - Array of escrows
   * @returns {Array} Escrows closing this week
   */
  getClosingThisWeek(escrows) {
    const now = new Date();
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    return escrows.filter(e => {
      if (!e.closing_date) return false;
      const closingDate = new Date(e.closing_date);
      return closingDate >= now && closingDate <= weekFromNow;
    });
  }

  /**
   * Get escrows closing this month
   * @param {Array} escrows - Array of escrows
   * @returns {Array} Escrows closing this month
   */
  getClosingThisMonth(escrows) {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return escrows.filter(e => {
      if (!e.closing_date) return false;
      const closingDate = new Date(e.closing_date);
      return closingDate.getMonth() === currentMonth && closingDate.getFullYear() === currentYear;
    });
  }
}

// Export singleton instance
export const escrowsService = new EscrowsService();
export default escrowsService;
