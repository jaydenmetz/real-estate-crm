/**
 * Projects Service
 *
 * Manages development roadmap projects (admin-only)
 * This is separate from the checklists system - used only for tracking CRM development progress
 */

import apiInstance from './api.service';

const projectsService = {
  /**
   * Get all projects with optional filters
   * @param {Object} filters - Optional filters
   * @param {string} filters.category - Filter by category
   * @param {string} filters.status - Filter by status (not-started, in-progress, completed)
   * @param {string} filters.priority - Filter by priority (critical, high, medium, low)
   * @returns {Promise<Array>} Array of projects
   */
  async getAll(filters = {}) {
    const queryParams = new URLSearchParams();

    if (filters.category) queryParams.append('category', filters.category);
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.priority) queryParams.append('priority', filters.priority);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/projects?${queryString}` : '/projects';

    const response = await apiInstance.get(endpoint);
    return response.data;
  },

  /**
   * Get a single project by ID (includes tasks)
   * @param {string} id - Project ID
   * @returns {Promise<Object>} Project with tasks
   */
  async getById(id) {
    const response = await apiInstance.get(`/projects/${id}`);
    return response.data;
  },

  /**
   * Create a new project
   * @param {Object} project - Project data
   * @param {string} project.name - Project name (required)
   * @param {string} project.category - Category
   * @param {string} project.description - Description
   * @param {string} project.status - Status (not-started, in-progress, completed)
   * @param {string} project.priority - Priority (critical, high, medium, low)
   * @returns {Promise<Object>} Created project
   */
  async create(project) {
    const response = await apiInstance.post('/projects', project);
    return response.data;
  },

  /**
   * Update a project
   * @param {string} id - Project ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated project
   */
  async update(id, updates) {
    const response = await apiInstance.put(`/projects/${id}`, updates);
    return response.data;
  },

  /**
   * Delete a project (soft delete)
   * @param {string} id - Project ID
   * @returns {Promise<Object>} Success message
   */
  async delete(id) {
    const response = await apiInstance.delete(`/projects/${id}`);
    return response.data;
  },

  /**
   * Get projects by category
   * @param {string} category - Category name
   * @returns {Promise<Array>} Array of projects in category
   */
  async getByCategory(category) {
    return this.getAll({ category });
  },

  /**
   * Get active projects (not completed)
   * @returns {Promise<Array>} Array of active projects
   */
  async getActiveProjects() {
    const notStarted = await this.getAll({ status: 'not-started' });
    const inProgress = await this.getAll({ status: 'in-progress' });
    return [...inProgress, ...notStarted];
  },

  /**
   * Get completed projects
   * @returns {Promise<Array>} Array of completed projects
   */
  async getCompletedProjects() {
    return this.getAll({ status: 'completed' });
  },

  /**
   * Get projects grouped by category
   * @returns {Promise<Object>} Object with category keys and project arrays as values
   */
  async getGroupedByCategory() {
    const allProjects = await this.getAll();

    const grouped = {};
    allProjects.forEach(project => {
      const category = project.category || 'Uncategorized';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(project);
    });

    return grouped;
  },

  /**
   * Get roadmap statistics
   * @returns {Promise<Object>} Stats object with counts and percentages
   */
  async getStats() {
    const allProjects = await this.getAll();

    const total = allProjects.length;
    const completed = allProjects.filter(p => p.status === 'completed').length;
    const inProgress = allProjects.filter(p => p.status === 'in-progress').length;
    const notStarted = allProjects.filter(p => p.status === 'not-started').length;

    return {
      total,
      completed,
      inProgress,
      notStarted,
      completionPercentage: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  }
};

export default projectsService;
