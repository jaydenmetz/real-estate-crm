/**
 * Service Layer Template
 *
 * Services contain business logic and orchestration.
 * They should NOT handle HTTP concerns (that's for controllers).
 * They should NOT directly query the database (use models/repositories).
 *
 * Responsibilities:
 * - Business rule validation
 * - Orchestrating multiple operations
 * - Data transformation
 * - External service integration
 */

class TemplateService {
  /**
   * Example: Get all resources with business logic
   */
  async findAll(filters = {}) {
    // Business logic here
    // Call model/repository methods
    // Transform data
    // Return processed result
  }

  /**
   * Example: Create resource with validation
   */
  async create(data) {
    // Validate business rules
    // Transform input data
    // Call model to save
    // Send notifications if needed
    // Return created resource
  }
}

module.exports = new TemplateService();
