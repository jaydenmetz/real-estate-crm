const BaseDomainService = require('../../../shared/services/BaseDomainService');
const { pool } = require('../../../config/database');
const websocketService = require('../../../services/websocket.service');
const NotificationService = require('../../../services/notification.service');

/**
 * AppointmentsService
 * Enhanced appointments service extending BaseDomainService
 * Handles appointment scheduling with domain architecture
 */
class AppointmentsService extends BaseDomainService {
  constructor() {
    super('appointments', 'AppointmentsService');
  }

  /**
   * Override buildQuery to add appointment-specific filters
   */
  buildQuery(filters) {
    const query = super.buildQuery(filters);

    // Add appointment-specific filters
    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.appointmentType) {
      query.appointment_type = filters.appointmentType;
    }

    if (filters.startDate || filters.endDate) {
      query.dateRange = {
        start: filters.startDate,
        end: filters.endDate
      };
    }

    if (filters.clientId) {
      query.client_id = filters.clientId;
    }

    if (filters.listingId) {
      query.listing_id = filters.listingId;
    }

    return query;
  }

  /**
   * Override buildWhereClause to handle appointment-specific fields
   */
  buildWhereClause(query) {
    const conditions = [];
    const values = [];
    let paramIndex = 1;

    // Soft delete filter
    conditions.push('a.deleted_at IS NULL');

    // Process each query parameter
    Object.keys(query).forEach(key => {
      if (key === 'dateRange' && query[key]) {
        if (query[key].start) {
          conditions.push(`a.appointment_date >= $${paramIndex++}`);
          values.push(query[key].start);
        }
        if (query[key].end) {
          conditions.push(`a.appointment_date <= $${paramIndex++}`);
          values.push(query[key].end);
        }
      } else if (key === 'search' && query[key]) {
        // Search across title and location
        conditions.push(`(
          a.title ILIKE $${paramIndex}
          OR a.location ILIKE $${paramIndex}
          OR a.description ILIKE $${paramIndex}
        )`);
        values.push(`%${query[key]}%`);
        paramIndex++;
      } else if (query[key] !== undefined && key !== 'dateRange') {
        conditions.push(`a.${key} = $${paramIndex++}`);
        values.push(query[key]);
      }
    });

    const whereClause = conditions.length > 0
      ? `WHERE ${conditions.join(' AND ')}`
      : '';

    return { whereClause, values };
  }

  /**
   * Override findAll to include client JOIN
   */
  async findAll(filters = {}, options = {}) {
    try {
      const query = this.buildQuery(filters);
      const { whereClause, values } = this.buildWhereClause(query);

      const limit = options.limit || 20;
      const offset = options.skip || 0;
      const sortBy = options.sortBy || 'appointment_date';
      const sortOrder = options.sortOrder || 'DESC';

      // Count query with JOIN
      const countQuery = `
        SELECT COUNT(*) as total
        FROM appointments a
        ${whereClause}
      `;

      // Data query with JOIN to get client name
      const dataQuery = `
        SELECT
          a.*,
          COALESCE(c.full_name, c.first_name || ' ' || c.last_name) AS client_name,
          c.email AS client_email,
          c.phone AS client_phone
        FROM appointments a
        LEFT JOIN clients cl ON a.client_id = cl.id
        LEFT JOIN contacts c ON cl.contact_id = c.id
        ${whereClause}
        ORDER BY a.${sortBy} ${sortOrder}, a.start_time ${sortOrder}
        LIMIT $${values.length + 1} OFFSET $${values.length + 2}
      `;

      const [countResult, dataResult] = await Promise.all([
        this.db.query(countQuery, values),
        this.db.query(dataQuery, [...values, limit, offset])
      ]);

      const totalItems = parseInt(countResult.rows[0]?.total || 0);
      const items = dataResult.rows.map(item => this.transform(item));

      const stats = await this.calculateStats(filters);

      return {
        items,
        stats,
        pagination: {
          page: options.page || 1,
          limit,
          totalItems,
          totalPages: Math.ceil(totalItems / limit)
        }
      };
    } catch (error) {
      this.logger.error(`Error in findAll for ${this.serviceName}:`, error);
      throw error;
    }
  }

  /**
   * Override findById to include client JOIN
   */
  async findById(id) {
    try {
      const query = `
        SELECT
          a.*,
          COALESCE(c.full_name, c.first_name || ' ' || c.last_name) AS client_name,
          c.email AS client_email,
          c.phone AS client_phone
        FROM appointments a
        LEFT JOIN clients cl ON a.client_id = cl.id
        LEFT JOIN contacts c ON cl.contact_id = c.id
        WHERE a.id = $1
        AND a.deleted_at IS NULL
      `;

      const result = await this.db.query(query, [id]);

      if (result.rows.length === 0) {
        return null;
      }

      return this.transform(result.rows[0]);
    } catch (error) {
      this.logger.error(`Error finding appointment by ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Enhanced statistics calculation for appointments
   */
  async calculateStats(filters) {
    try {
      const query = this.buildQuery(filters);
      const { whereClause, values } = this.buildWhereClause(query);

      const statsQuery = `
        SELECT
          COUNT(*) as total,
          COUNT(CASE WHEN a.status = 'Scheduled' THEN 1 END) as scheduled,
          COUNT(CASE WHEN a.status = 'Confirmed' THEN 1 END) as confirmed,
          COUNT(CASE WHEN a.status = 'Completed' THEN 1 END) as completed,
          COUNT(CASE WHEN a.status = 'Cancelled' THEN 1 END) as cancelled,
          COUNT(CASE WHEN a.status = 'No Show' THEN 1 END) as no_show,
          COUNT(CASE WHEN a.appointment_type = 'Property Showing' THEN 1 END) as property_showings,
          COUNT(CASE WHEN a.appointment_type = 'Consultation' THEN 1 END) as consultations,
          COUNT(CASE WHEN a.appointment_type = 'Open House' THEN 1 END) as open_houses,
          COUNT(CASE WHEN a.appointment_type = 'Inspection' THEN 1 END) as inspections,
          COUNT(CASE WHEN a.appointment_date >= CURRENT_DATE THEN 1 END) as upcoming,
          COUNT(CASE WHEN a.appointment_date < CURRENT_DATE THEN 1 END) as past
        FROM appointments a
        ${whereClause}
      `;

      const result = await this.db.query(statsQuery, values);
      const stats = result.rows[0];

      return {
        total: parseInt(stats.total) || 0,
        scheduled: parseInt(stats.scheduled) || 0,
        confirmed: parseInt(stats.confirmed) || 0,
        completed: parseInt(stats.completed) || 0,
        cancelled: parseInt(stats.cancelled) || 0,
        noShow: parseInt(stats.no_show) || 0,
        propertyShowings: parseInt(stats.property_showings) || 0,
        consultations: parseInt(stats.consultations) || 0,
        openHouses: parseInt(stats.open_houses) || 0,
        inspections: parseInt(stats.inspections) || 0,
        upcoming: parseInt(stats.upcoming) || 0,
        past: parseInt(stats.past) || 0,
        completionRate: (stats.total > 0 && stats.completed > 0)
          ? Math.round((stats.completed / stats.total) * 100)
          : 0
      };
    } catch (error) {
      this.logger.error('Error calculating appointment stats:', error);
      return {
        total: 0,
        scheduled: 0,
        confirmed: 0,
        completed: 0,
        cancelled: 0,
        noShow: 0,
        propertyShowings: 0,
        consultations: 0,
        openHouses: 0,
        inspections: 0,
        upcoming: 0,
        past: 0,
        completionRate: 0
      };
    }
  }

  /**
   * Create new appointment
   */
  async create(data, user) {
    try {
      // Validate required fields
      if (!data.title) {
        throw new Error('title is required');
      }

      if (!data.appointmentDate && !data.appointment_date) {
        throw new Error('appointment_date is required');
      }

      if (!data.startTime && !data.start_time) {
        throw new Error('start_time is required');
      }

      const insertQuery = `
        INSERT INTO appointments (
          title,
          appointment_date,
          start_time,
          end_time,
          location,
          appointment_type,
          description,
          status,
          client_id,
          listing_id,
          agent_id,
          team_id,
          broker_id,
          created_by,
          created_at,
          updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING *
      `;

      const values = [
        data.title,
        data.appointmentDate || data.appointment_date,
        data.startTime || data.start_time,
        data.endTime || data.end_time || null,
        data.location || null,
        data.appointmentType || data.appointment_type || 'Property Showing',
        data.description || null,
        data.status || 'Scheduled',
        data.clientId || data.client_id || null,
        data.listingId || data.listing_id || null,
        user.id,
        user.team_id,
        user.broker_id,
        user.id,
      ];

      const result = await this.db.query(insertQuery, values);
      const newAppointment = result.rows[0];

      // Fetch full appointment with client data
      const fullAppointment = await this.findById(newAppointment.id);

      // Emit WebSocket event
      const eventData = {
        entityType: 'appointment',
        entityId: newAppointment.id,
        action: 'created',
        data: fullAppointment
      };

      if (user.broker_id) {
        websocketService.sendToBroker(user.broker_id, 'data:update', eventData);
      }
      if (user.team_id) {
        websocketService.sendToTeam(user.team_id, 'data:update', eventData);
      }
      if (user.id) {
        websocketService.sendToUser(user.id, 'data:update', eventData);
      }

      return fullAppointment;
    } catch (error) {
      this.logger.error('Error creating appointment:', error);
      throw error;
    }
  }

  /**
   * Update appointment
   */
  async update(id, data, user) {
    try {
      // Build update query dynamically
      const updateFields = [];
      const values = [];
      let paramIndex = 1;

      const allowedFields = {
        title: data.title,
        appointment_date: data.appointmentDate || data.appointment_date,
        start_time: data.startTime || data.start_time,
        end_time: data.endTime || data.end_time,
        location: data.location,
        appointment_type: data.appointmentType || data.appointment_type,
        description: data.description,
        status: data.status,
        client_id: data.clientId || data.client_id,
        listing_id: data.listingId || data.listing_id
      };

      for (const [field, value] of Object.entries(allowedFields)) {
        if (value !== undefined && value !== null) {
          updateFields.push(`${field} = $${paramIndex++}`);
          values.push(value);
        }
      }

      updateFields.push(`updated_at = CURRENT_TIMESTAMP`);

      // Add ID as last parameter
      values.push(id);

      const updateQuery = `
        UPDATE appointments
        SET ${updateFields.join(', ')}
        WHERE id = $${paramIndex}
        AND deleted_at IS NULL
        RETURNING *
      `;

      const result = await this.db.query(updateQuery, values);

      if (result.rows.length === 0) {
        throw new Error('Appointment not found or has been deleted');
      }

      // Fetch full appointment with client data
      const updated = await this.findById(id);

      // Emit WebSocket event
      const eventData = {
        entityType: 'appointment',
        entityId: id,
        action: 'updated',
        data: updated
      };

      if (user.broker_id) {
        websocketService.sendToBroker(user.broker_id, 'data:update', eventData);
      }
      if (user.team_id) {
        websocketService.sendToTeam(user.team_id, 'data:update', eventData);
      }
      if (user.id) {
        websocketService.sendToUser(user.id, 'data:update', eventData);
      }

      return updated;
    } catch (error) {
      this.logger.error('Error updating appointment:', error);
      throw error;
    }
  }

  /**
   * Archive appointment (soft delete)
   */
  async archive(id, user) {
    try {
      const query = `
        UPDATE appointments
        SET deleted_at = CURRENT_TIMESTAMP
        WHERE id = $1
        AND deleted_at IS NULL
        RETURNING *
      `;

      const result = await this.db.query(query, [id]);

      if (result.rows.length === 0) {
        throw new Error('Appointment not found or already archived');
      }

      // Emit WebSocket event
      const eventData = {
        entityType: 'appointment',
        entityId: id,
        action: 'archived',
        data: { id }
      };

      if (user.broker_id) {
        websocketService.sendToBroker(user.broker_id, 'data:update', eventData);
      }
      if (user.team_id) {
        websocketService.sendToTeam(user.team_id, 'data:update', eventData);
      }

      return { success: true, id };
    } catch (error) {
      this.logger.error('Error archiving appointment:', error);
      throw error;
    }
  }

  /**
   * Restore archived appointment
   */
  async restore(id, user) {
    try {
      const query = `
        UPDATE appointments
        SET deleted_at = NULL
        WHERE id = $1
        AND deleted_at IS NOT NULL
        RETURNING *
      `;

      const result = await this.db.query(query, [id]);

      if (result.rows.length === 0) {
        throw new Error('Appointment not found or not archived');
      }

      const restored = await this.findById(id);

      // Emit WebSocket event
      const eventData = {
        entityType: 'appointment',
        entityId: id,
        action: 'restored',
        data: restored
      };

      if (user.broker_id) {
        websocketService.sendToBroker(user.broker_id, 'data:update', eventData);
      }
      if (user.team_id) {
        websocketService.sendToTeam(user.team_id, 'data:update', eventData);
      }

      return restored;
    } catch (error) {
      this.logger.error('Error restoring appointment:', error);
      throw error;
    }
  }

  /**
   * Transform appointment data (camelCase conversion)
   */
  transform(appointment) {
    if (!appointment) return null;

    return {
      id: appointment.id,
      title: appointment.title,
      appointmentDate: appointment.appointment_date,
      startTime: appointment.start_time,
      endTime: appointment.end_time,
      location: appointment.location,
      appointmentType: appointment.appointment_type,
      description: appointment.description,
      status: appointment.status,
      clientId: appointment.client_id,
      clientName: appointment.client_name,
      clientEmail: appointment.client_email,
      clientPhone: appointment.client_phone,
      listingId: appointment.listing_id,
      agentId: appointment.agent_id,
      teamId: appointment.team_id,
      createdAt: appointment.created_at,
      updatedAt: appointment.updated_at,
      deletedAt: appointment.deleted_at
    };
  }
}

module.exports = new AppointmentsService();
