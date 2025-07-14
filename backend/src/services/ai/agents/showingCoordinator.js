const axios = require('axios');
const logger = require('../../../utils/logger');
const { query } = require('../../../config/database');
const twilioClient = require('../../../config/twilio');

class ShowingCoordinatorAgent {
  constructor() {
    this.name = 'Showing Coordinator';
    this.model = 'claude-3-haiku-20240307';
    this.enabled = true;
  }

  async scheduleShowing(listingId, buyerAgent, requestedTimes) {
    try {
      logger.info(`Scheduling showing for listing ${listingId}`);
      
      // Get listing details
      const listing = await query('SELECT * FROM listings WHERE id = $1', [listingId]);
      if (!listing.rows.length) {
        throw new Error('Listing not found');
      }
      
      const listingData = listing.rows[0];
      
      // Find optimal showing time
      const optimalTime = await this.findOptimalShowingTime(listingId, requestedTimes);
      
      // Create showing appointment
      const appointmentId = await this.createShowingAppointment(listingData, buyerAgent, optimalTime);
      
      // Send confirmations
      await this.sendShowingConfirmations(appointmentId, listingData, buyerAgent, optimalTime);
      
      // Update listing showing count
      await query('UPDATE listings SET total_showings = total_showings + 1 WHERE id = $1', [listingId]);
      
      return {
        appointmentId,
        scheduledTime: optimalTime,
        listingAddress: listingData.property_address
      };
    } catch (error) {
      logger.error('Error scheduling showing:', error);
      throw error;
    }
  }

  async findOptimalShowingTime(listingId, requestedTimes) {
    // Check existing appointments to avoid conflicts
    const conflicts = await query(`
      SELECT date, start_time, end_time 
      FROM appointments 
      WHERE property_address = (SELECT property_address FROM listings WHERE id = $1)
        AND date >= CURRENT_DATE
        AND status NOT IN ('Cancelled', 'Completed')
    `, [listingId]);
    
    // Find the first available time from requested times
    for (const requestedTime of requestedTimes) {
      const hasConflict = conflicts.rows.some(conflict => {
        const conflictStart = new Date(`${conflict.date}T${conflict.start_time}`);
        const conflictEnd = new Date(`${conflict.date}T${conflict.end_time}`);
        const requestedStart = new Date(requestedTime.datetime);
        const requestedEnd = new Date(requestedStart.getTime() + 60 * 60 * 1000); // 1 hour showing
        
        return (requestedStart < conflictEnd && requestedEnd > conflictStart);
      });
      
      if (!hasConflict) {
        return requestedTime;
      }
    }
    
    // If no requested times work, suggest alternative
    return this.suggestAlternativeTime(listingId, requestedTimes[0]);
  }

  async createShowingAppointment(listing, buyerAgent, showingTime) {
    const appointmentId = `apt_${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
    
    await query(`
      INSERT INTO appointments (
        id, title, appointment_type, status, date, start_time, end_time, 
        duration, location, property_address, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    `, [
      appointmentId,
      `Property Showing - ${listing.property_address}`,
      'Property Showing',
      'Confirmed',
      showingTime.date,
      showingTime.time,
      this.addMinutes(showingTime.time, 60),
      60,
      JSON.stringify({ type: 'property', address: listing.property_address }),
      listing.property_address,
      JSON.stringify({ 
        buyerAgent: buyerAgent.name,
        listingId: listing.id,
        showingInstructions: listing.showing_instructions 
      })
    ]);
    
    return appointmentId;
  }

  async sendShowingConfirmations(appointmentId, listing, buyerAgent, showingTime) {
    // Send SMS to buyer's agent
    if (buyerAgent.phone) {
      const message = `Showing confirmed for ${listing.property_address} on ${showingTime.date} at ${showingTime.time}. ${listing.showing_instructions || 'Contact listing agent for access.'}`;
      
      if (twilioClient) {
        try {
          await twilioClient.messages.create({
            body: message,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: buyerAgent.phone
          });
        } catch (error) {
          console.error('Failed to send SMS:', error.message);
        }
      }
    }
    
    // Log the confirmation
    await query(
      'INSERT INTO communications (entity_type, entity_id, type, direction, content, created_at) VALUES ($1, $2, $3, $4, $5, NOW())',
      ['appointment', appointmentId, 'sms', 'outbound', `Showing confirmation sent to ${buyerAgent.name}`]
    );
  }

  async collectShowingFeedback(appointmentId) {
    try {
      // Get appointment details
      const appointment = await query('SELECT * FROM appointments WHERE id = $1', [appointmentId]);
      if (!appointment.rows.length) return;
      
      const appointmentData = appointment.rows[0];
      const notes = JSON.parse(appointmentData.notes || '{}');
      
      // Send feedback request
      const feedbackMessage = `Thank you for showing ${appointmentData.property_address}. Please reply with your client's feedback: 1-Interest level (1-10), 2-Comments, 3-Next steps. Reply: "5, Beautiful home but too small, Will consider other options"`;
      
      // This would typically send to the buyer's agent's phone
      // For now, we'll create a pending feedback record
      await query(
        'INSERT INTO showing_feedback (appointment_id, status, request_sent_at) VALUES ($1, $2, NOW())',
        [appointmentId, 'pending']
      );
      
      return { feedbackRequested: true };
    } catch (error) {
      logger.error('Error collecting showing feedback:', error);
      throw error;
    }
  }

  async analyzeShowingTrends(listingId) {
    const result = await query(`
      SELECT 
        COUNT(*) as total_showings,
        AVG(CASE WHEN sf.interest_level IS NOT NULL THEN sf.interest_level ELSE 5 END) as avg_interest,
        COUNT(*) FILTER (WHERE sf.interest_level >= 7) as high_interest_showings,
        array_agg(sf.comments) FILTER (WHERE sf.comments IS NOT NULL) as feedback_comments
      FROM appointments a
      LEFT JOIN showing_feedback sf ON a.id = sf.appointment_id
      WHERE a.property_address = (SELECT property_address FROM listings WHERE id = $1)
        AND a.appointment_type = 'Property Showing'
        AND a.date >= CURRENT_DATE - INTERVAL '30 days'
    `, [listingId]);
    
    const data = result.rows[0];
    
    return {
      totalShowings: parseInt(data.total_showings),
      avgInterestLevel: parseFloat(data.avg_interest || 5),
      highInterestShowings: parseInt(data.high_interest_showings),
      feedbackComments: data.feedback_comments || [],
      showingToOfferRatio: this.calculateShowingToOfferRatio(listingId)
    };
  }

  addMinutes(time, minutes) {
    const [hours, mins] = time.split(':').map(Number);
    const totalMinutes = hours * 60 + mins + minutes;
    const newHours = Math.floor(totalMinutes / 60) % 24;
    const newMins = totalMinutes % 60;
    return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`;
  }

  async suggestAlternativeTime(listingId, originalTime) {
    // Simple algorithm to suggest next available hour
    const originalDate = new Date(originalTime.datetime);
    originalDate.setHours(originalDate.getHours() + 1);
    
    return {
      date: originalDate.toISOString().split('T')[0],
      time: originalDate.toTimeString().split(' ')[0].substring(0, 5),
      datetime: originalDate.toISOString()
    };
  }

  async calculateShowingToOfferRatio(listingId) {
    // This would calculate the conversion rate from showings to offers
    // For now, return a placeholder
    return 0.15; // 15% showing to offer ratio
  }

  isEnabled() {
    return this.enabled;
  }

  setEnabled(enabled) {
    this.enabled = enabled;
    logger.info(`${this.name} ${enabled ? 'enabled' : 'disabled'}`);
  }
}

module.exports = new ShowingCoordinatorAgent();