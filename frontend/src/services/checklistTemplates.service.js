/**
 * Checklist Templates Service
 *
 * Manages reusable checklist templates for best-practice workflows
 */

import apiInstance from './api.service';

const checklistTemplatesService = {
  /**
   * Get all checklist templates
   * @param {Object} filters - Optional filters
   * @param {string} filters.entity_type - Filter by entity type (escrow, listing, client, custom)
   * @param {string} filters.category - Filter by category
   * @param {boolean} filters.is_default - Filter by auto-apply flag
   * @param {boolean} filters.is_system - Filter by system templates
   * @returns {Promise<Array>} Array of checklist templates
   */
  async getAll(filters = {}) {
    const queryParams = new URLSearchParams();

    if (filters.entity_type) queryParams.append('entity_type', filters.entity_type);
    if (filters.category) queryParams.append('category', filters.category);
    if (filters.is_default !== undefined) queryParams.append('is_default', filters.is_default);
    if (filters.is_system !== undefined) queryParams.append('is_system', filters.is_system);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/checklist-templates?${queryString}` : '/checklist-templates';

    const response = await apiInstance.get(endpoint);
    return response.data;
  },

  /**
   * Get a single checklist template by ID
   * @param {string} id - Template ID
   * @returns {Promise<Object>} Checklist template
   */
  async getById(id) {
    const response = await apiInstance.get(`/checklist-templates/${id}`);
    return response.data;
  },

  /**
   * Create a new checklist template
   * @param {Object} template - Template data
   * @param {string} template.name - Template name
   * @param {string} template.description - Template description
   * @param {string} template.entity_type - Entity type (escrow, listing, client, custom)
   * @param {string} template.category - Category
   * @param {Array} template.items - Array of checklist items
   * @param {boolean} template.is_default - Auto-apply to new entities
   * @returns {Promise<Object>} Created template
   */
  async create(template) {
    const response = await apiInstance.post('/checklist-templates', template);
    return response.data;
  },

  /**
   * Update a checklist template
   * @param {string} id - Template ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated template
   */
  async update(id, updates) {
    const response = await apiInstance.put(`/checklist-templates/${id}`, updates);
    return response.data;
  },

  /**
   * Delete a checklist template (soft delete)
   * @param {string} id - Template ID
   * @returns {Promise<Object>} Success message
   */
  async delete(id) {
    const response = await apiInstance.delete(`/checklist-templates/${id}`);
    return response.data;
  },

  /**
   * Get system templates (built-in best practices)
   * @returns {Promise<Array>} Array of system templates
   */
  async getSystemTemplates() {
    return this.getAll({ is_system: true });
  },

  /**
   * Get custom templates (created by team)
   * @returns {Promise<Array>} Array of custom templates
   */
  async getCustomTemplates() {
    return this.getAll({ is_system: false });
  },

  /**
   * Get templates by entity type
   * @param {string} entityType - Entity type (escrow, listing, client, custom)
   * @returns {Promise<Array>} Array of templates for entity type
   */
  async getByEntityType(entityType) {
    return this.getAll({ entity_type: entityType });
  },

  /**
   * Get auto-apply templates for entity type
   * @param {string} entityType - Entity type
   * @returns {Promise<Array>} Templates that auto-apply to new entities
   */
  async getAutoApplyTemplates(entityType) {
    return this.getAll({ entity_type: entityType, is_default: true });
  }
};

export default checklistTemplatesService;
