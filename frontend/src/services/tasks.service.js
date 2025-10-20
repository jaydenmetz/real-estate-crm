/**
 * Tasks Service
 *
 * Manages tasks with support for standalone, project-based, and checklist-based tasks
 */

import apiInstance from './api.service';

const tasksService = {
  /**
   * Get all tasks with optional filters
   * @param {Object} filters - Optional filters
   * @param {string} filters.project_id - Filter by project
   * @param {string} filters.checklist_id - Filter by checklist
   * @param {string} filters.status - Filter by status (not-started, in-progress, completed)
   * @param {string} filters.priority - Filter by priority (critical, high, medium, low)
   * @param {string} filters.assigned_to - Filter by assigned user ID
   * @param {string} filters.related_entity_type - Filter by entity type
   * @param {string} filters.related_entity_id - Filter by entity ID
   * @returns {Promise<Array>} Array of tasks
   */
  async getAll(filters = {}) {
    const queryParams = new URLSearchParams();

    if (filters.project_id) queryParams.append('project_id', filters.project_id);
    if (filters.checklist_id) queryParams.append('checklist_id', filters.checklist_id);
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.priority) queryParams.append('priority', filters.priority);
    if (filters.assigned_to) queryParams.append('assigned_to', filters.assigned_to);
    if (filters.related_entity_type) queryParams.append('related_entity_type', filters.related_entity_type);
    if (filters.related_entity_id) queryParams.append('related_entity_id', filters.related_entity_id);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/tasks?${queryString}` : '/tasks';

    const response = await apiInstance.get(endpoint);
    return response.data;
  },

  /**
   * Get tasks assigned to current user
   * @param {string} status - Optional status filter
   * @returns {Promise<Array>} Array of user's tasks
   */
  async getMyTasks(status = null) {
    const endpoint = status ? `/tasks/my-tasks?status=${status}` : '/tasks/my-tasks';
    const response = await apiInstance.get(endpoint);
    return response.data;
  },

  /**
   * Get overdue tasks
   * @returns {Promise<Array>} Array of overdue tasks
   */
  async getOverdueTasks() {
    const response = await apiInstance.get('/tasks/overdue');
    return response.data;
  },

  /**
   * Get a single task by ID
   * @param {string} id - Task ID
   * @returns {Promise<Object>} Task object
   */
  async getById(id) {
    const response = await apiInstance.get(`/tasks/${id}`);
    return response.data;
  },

  /**
   * Create a new task
   * @param {Object} task - Task data
   * @param {string} task.name - Task name (required)
   * @param {string} task.description - Task description
   * @param {string} task.project_id - Project ID (optional)
   * @param {string} task.parent_task_id - Parent task ID for subtasks
   * @param {string} task.related_entity_type - Entity type (escrow, listing, client)
   * @param {string} task.related_entity_id - Entity ID
   * @param {string} task.status - Status (not-started, in-progress, completed)
   * @param {string} task.priority - Priority (critical, high, medium, low)
   * @param {string} task.due_date - Due date (ISO string)
   * @param {number} task.estimated_hours - Estimated hours
   * @param {string} task.assigned_to - User ID to assign to
   * @returns {Promise<Object>} Created task
   */
  async create(task) {
    const response = await apiInstance.post('/tasks', task);
    return response.data;
  },

  /**
   * Update a task
   * @param {string} id - Task ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated task
   */
  async update(id, updates) {
    const response = await apiInstance.put(`/tasks/${id}`, updates);
    return response.data;
  },

  /**
   * Mark a task as complete
   * @param {string} id - Task ID
   * @returns {Promise<Object>} Updated task
   */
  async complete(id) {
    const response = await apiInstance.patch(`/tasks/${id}/complete`);
    return response.data;
  },

  /**
   * Delete a task (soft delete)
   * @param {string} id - Task ID
   * @returns {Promise<Object>} Success message
   */
  async delete(id) {
    const response = await apiInstance.delete(`/tasks/${id}`);
    return response.data;
  },

  /**
   * Get tasks for a specific project
   * @param {string} projectId - Project ID
   * @returns {Promise<Array>} Array of project tasks
   */
  async getByProject(projectId) {
    return this.getAll({ project_id: projectId });
  },

  /**
   * Get tasks for a specific checklist
   * @param {string} checklistId - Checklist ID
   * @returns {Promise<Array>} Array of checklist tasks
   */
  async getByChecklist(checklistId) {
    return this.getAll({ checklist_id: checklistId });
  },

  /**
   * Get tasks for a specific entity
   * @param {string} entityType - Entity type (escrow, listing, client)
   * @param {string} entityId - Entity ID
   * @returns {Promise<Array>} Array of entity tasks
   */
  async getByEntity(entityType, entityId) {
    return this.getAll({
      related_entity_type: entityType,
      related_entity_id: entityId
    });
  },

  /**
   * Get active tasks (not completed)
   * @returns {Promise<Array>} Array of active tasks
   */
  async getActiveTasks() {
    // Get both not-started and in-progress tasks
    const notStarted = await this.getAll({ status: 'not-started' });
    const inProgress = await this.getAll({ status: 'in-progress' });
    return [...inProgress, ...notStarted];
  },

  /**
   * Get completed tasks
   * @returns {Promise<Array>} Array of completed tasks
   */
  async getCompletedTasks() {
    return this.getAll({ status: 'completed' });
  },

  /**
   * Get high priority tasks
   * @returns {Promise<Array>} Array of high/critical priority tasks
   */
  async getHighPriorityTasks() {
    const critical = await this.getAll({ priority: 'critical' });
    const high = await this.getAll({ priority: 'high' });
    return [...critical, ...high];
  },

  /**
   * Update task status
   * @param {string} id - Task ID
   * @param {string} status - New status (not-started, in-progress, completed)
   * @returns {Promise<Object>} Updated task
   */
  async updateStatus(id, status) {
    return this.update(id, { status });
  },

  /**
   * Update task priority
   * @param {string} id - Task ID
   * @param {string} priority - New priority (critical, high, medium, low)
   * @returns {Promise<Object>} Updated task
   */
  async updatePriority(id, priority) {
    return this.update(id, { priority });
  },

  /**
   * Reassign task to another user
   * @param {string} id - Task ID
   * @param {string} userId - New assignee user ID
   * @returns {Promise<Object>} Updated task
   */
  async reassign(id, userId) {
    return this.update(id, { assigned_to: userId });
  }
};

export default tasksService;
