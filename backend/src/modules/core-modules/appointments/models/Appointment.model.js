const { v4: uuidv4 } = require('uuid');
const { query } = require('../../../../config/infrastructure/database');
const twilioClient = require('../../../../config/integrations/twilio');

class Appointment {
  static async create(data) {
    const id = `apt_${uuidv4().replace(/-/g, '').substring(0, 12)}`;

    const text = `
      INSERT INTO appointments (
        id, title, appointment_type, status, date, start_time,
        end_time, duration, location, virtual_meeting_link,
        property_address, preparation_checklist, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `;

    const values = [
      id,
      data.title,
      data.appointmentType,
      data.status || 'Scheduled',
      data.date,
      data.startTime,
      data.endTime,
      data.duration,
      JSON.stringify(data.location || {}),
      data.virtualMeetingLink,
      data.propertyAddress,
      JSON.stringify(data.preparationChecklist || []),
      JSON.stringify(data.notes || {}),
    ];

    const result = await query(text, values);

    // Add attendees
    if (data.clients && data.clients.length > 0) {
      await this.addAttendees(id, data.clients);
    }

    return this.findById(id);
  }

  static async findAll(filters = {}) {
    let text = `
      SELECT a.*, 
        array_agg(DISTINCT jsonb_build_object(
          'id', aa.client_id, 
          'name', c.first_name || ' ' || c.last_name,
          'confirmed', aa.confirmed
        )) FILTER (WHERE aa.client_id IS NOT NULL) as attendees
      FROM appointments a
      LEFT JOIN appointment_attendees aa ON a.id = aa.appointment_id
      LEFT JOIN clients c ON aa.client_id = c.id
      WHERE 1=1
    `;

    const values = [];
    let paramCount = 0;

    if (filters.date) {
      paramCount++;
      text += ` AND a.date = $${paramCount}`;
      values.push(filters.date);
    }

    if (filters.startDate && filters.endDate) {
      paramCount++;
      text += ` AND a.date BETWEEN $${paramCount}`;
      values.push(filters.startDate);
      paramCount++;
      text += ` AND $${paramCount}`;
      values.push(filters.endDate);
    }

    if (filters.type) {
      paramCount++;
      text += ` AND a.appointment_type = $${paramCount}`;
      values.push(filters.type);
    }

    if (filters.status) {
      paramCount++;
      text += ` AND a.status = $${paramCount}`;
      values.push(filters.status);
    }

    text += ' GROUP BY a.id ORDER BY a.date, a.start_time';

    const result = await query(text, values);
    return {
      appointments: result.rows,
      total: result.rows.length,
    };
  }

  static async findById(id) {
    const text = `
      SELECT a.*, 
        array_agg(DISTINCT jsonb_build_object(
          'id', aa.client_id, 
          'name', c.first_name || ' ' || c.last_name,
          'email', c.email,
          'phone', c.phone,
          'confirmed', aa.confirmed
        )) FILTER (WHERE aa.client_id IS NOT NULL) as attendees
      FROM appointments a
      LEFT JOIN appointment_attendees aa ON a.id = aa.appointment_id
      LEFT JOIN clients c ON aa.client_id = c.id
      WHERE a.id = $1
      GROUP BY a.id
    `;

    const result = await query(text, [id]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  static async update(id, data) {
    const fields = [];
    const values = [id];
    let paramCount = 1;

    Object.keys(data).forEach((key) => {
      if (key !== 'id' && key !== 'created_at' && key !== 'attendees') {
        paramCount++;
        if (typeof data[key] === 'object' && data[key] !== null) {
          fields.push(`${key} = $${paramCount}`);
          values.push(JSON.stringify(data[key]));
        } else {
          fields.push(`${key} = $${paramCount}`);
          values.push(data[key]);
        }
      }
    });

    const text = `
      UPDATE appointments 
      SET ${fields.join(', ')}, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;

    await query(text, values);
    return this.findById(id);
  }

  static async cancel(id, reason) {
    const text = `
      UPDATE appointments 
      SET status = 'Cancelled', notes = jsonb_set(
        COALESCE(notes, '{}'::jsonb),
        '{cancellation_reason}',
        $2::jsonb
      ), updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;

    const result = await query(text, [id, JSON.stringify(reason)]);
    return result.rows.length > 0 ? this.findById(id) : null;
  }

  static async complete(id, completionData) {
    const text = `
      UPDATE appointments 
      SET 
        status = 'Completed',
        outcome = $2,
        follow_up_actions = $3,
        notes = jsonb_set(
          COALESCE(notes, '{}'::jsonb),
          '{completion_notes}',
          $4::jsonb
        ),
        updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;

    const values = [
      id,
      completionData.outcome,
      JSON.stringify(completionData.followUpActions || {}),
      JSON.stringify(completionData.notes || {}),
    ];

    const result = await query(text, values);
    return result.rows.length > 0 ? this.findById(id) : null;
  }

  static async addAttendees(appointmentId, clientIds) {
    const values = clientIds.map((clientId) => `('${appointmentId}', '${clientId}', false)`).join(',');
    const text = `INSERT INTO appointment_attendees (appointment_id, client_id, confirmed) VALUES ${values} ON CONFLICT DO NOTHING`;
    await query(text);
  }

  static async sendNotifications(appointmentId, type, additionalData = null) {
    const appointment = await this.findById(appointmentId);
    if (!appointment || !appointment.attendees) return;

    for (const attendee of appointment.attendees) {
      if (attendee.phone) {
        let message = '';

        switch (type) {
          case 'created':
            message = `Hi ${attendee.name.split(' ')[0]}, your appointment "${appointment.title}" is scheduled for ${appointment.date} at ${appointment.start_time}. Reply CONFIRM to confirm.`;
            break;
          case 'cancelled':
            message = `Hi ${attendee.name.split(' ')[0]}, your appointment "${appointment.title}" on ${appointment.date} has been cancelled. ${additionalData ? `Reason: ${additionalData}` : ''}`;
            break;
          case 'reminder':
            message = `Reminder: You have "${appointment.title}" tomorrow at ${appointment.start_time}. Location: ${appointment.location?.address || 'TBD'}`;
            break;
        }

        if (twilioClient) {
          try {
            await twilioClient.messages.create({
              body: message,
              from: process.env.TWILIO_PHONE_NUMBER,
              to: attendee.phone,
            });
          } catch (error) {
            console.error(`Failed to send SMS to ${attendee.phone}:`, error);
          }
        } else {
          console.warn('Twilio client not initialized. SMS reminders disabled.');
        }
      }
    }
  }
}

module.exports = Appointment;
