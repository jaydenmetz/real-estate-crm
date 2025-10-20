/**
 * Checklists Service
 *
 * Manages checklist instances applied to specific entities
 */

import apiInstance from './api.service';

const checklistsService = {
  /**
   * Create a new checklist from a template
   * @param {Object} data - Checklist data
   * @param {string} data.template_id - Template ID to use
   * @param {string} data.entity_type - Entity type (escrow, listing, client, etc.)
   * @param {string} data.entity_id - Entity ID (e.g., ESC-2025-0001)
   * @param {string} data.custom_name - Optional custom name (overrides template name)
   * @returns {Promise<Object>} Created checklist with tasks
   */
  async create(data) {
    const response = await apiInstance.post('/checklists', data);
    return response.data;
  },

  /**
   * Get all checklists with optional filters
   * @param {Object} filters - Optional filters
   * @param {string} filters.entity_type - Filter by entity type
   * @param {string} filters.entity_id - Filter by entity ID
   * @param {string} filters.status - Filter by status (active, completed)
   * @returns {Promise<Array>} Array of checklists
   */
  async getAll(filters = {}) {
    const queryParams = new URLSearchParams();

    if (filters.entity_type) queryParams.append('entity_type', filters.entity_type);
    if (filters.entity_id) queryParams.append('entity_id', filters.entity_id);
    if (filters.status) queryParams.append('status', filters.status);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/checklists?${queryString}` : '/checklists';

    const response = await apiInstance.get(endpoint);
    return response.data;
  },

  /**
   * Get checklists for a specific entity
   * @param {string} entityType - Entity type (escrow, listing, client)
   * @param {string} entityId - Entity ID
   * @returns {Promise<Array>} Array of checklists for the entity
   */
  async getByEntity(entityType, entityId) {
    const response = await apiInstance.get(`/checklists/entity/${entityType}/${entityId}`);
    return response.data;
  },

  /**
   * Get a single checklist by ID (includes all tasks)
   * @param {string} id - Checklist ID
   * @returns {Promise<Object>} Checklist with tasks array
   */
  async getById(id) {
    const response = await apiInstance.get(`/checklists/${id}`);
    return response.data;
  },

  /**
   * Update a checklist
   * @param {string} id - Checklist ID
   * @param {Object} updates - Fields to update
   * @param {string} updates.name - New name
   * @param {string} updates.status - New status (active, completed)
   * @returns {Promise<Object>} Updated checklist
   */
  async update(id, updates) {
    const response = await apiInstance.put(`/checklists/${id}`, updates);
    return response.data;
  },

  /**
   * Delete a checklist (soft delete, also deletes associated tasks)
   * @param {string} id - Checklist ID
   * @returns {Promise<Object>} Success message
   */
  async delete(id) {
    const response = await apiInstance.delete(`/checklists/${id}`);
    return response.data;
  },

  /**
   * Get all checklists for escrows
   * @param {string} escrowId - Optional escrow ID to filter
   * @returns {Promise<Array>} Array of escrow checklists
   */
  async getEscrowChecklists(escrowId = null) {
    if (escrowId) {
      return this.getByEntity('escrow', escrowId);
    }
    return this.getAll({ entity_type: 'escrow' });
  },

  /**
   * Get all checklists for listings
   * @param {string} listingId - Optional listing ID to filter
   * @returns {Promise<Array>} Array of listing checklists
   */
  async getListingChecklists(listingId = null) {
    if (listingId) {
      return this.getByEntity('listing', listingId);
    }
    return this.getAll({ entity_type: 'listing' });
  },

  /**
   * Get all checklists for clients
   * @param {string} clientId - Optional client ID to filter
   * @returns {Promise<Array>} Array of client checklists
   */
  async getClientChecklists(clientId = null) {
    if (clientId) {
      return this.getByEntity('client', clientId);
    }
    return this.getAll({ entity_type: 'client' });
  },

  /**
   * Apply a template to an entity (create checklist from template)
   * @param {string} templateId - Template ID
   * @param {string} entityType - Entity type
   * @param {string} entityId - Entity ID
   * @param {string} customName - Optional custom name
   * @returns {Promise<Object>} Created checklist with tasks
   */
  async applyTemplate(templateId, entityType, entityId, customName = null) {
    return this.create({
      template_id: templateId,
      entity_type: entityType,
      entity_id: entityId,
      custom_name: customName
    });
  }
};

export default checklistsService;
