const { query, transaction } = require('../../../../config/database');
const logger = require('../../../../utils/logger');

// Record price change
exports.recordPriceChange = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPrice, reason } = req.body;

    if (!newPrice || newPrice <= 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Valid new price is required',
        },
      });
    }

    const result = await transaction(async (client) => {
      // Get current price
      const currentResult = await client.query(
        'SELECT list_price FROM listings WHERE id = $1 AND deleted_at IS NULL',
        [id],
      );

      if (currentResult.rows.length === 0) {
        throw new Error('Listing not found');
      }

      const oldPrice = currentResult.rows[0].list_price;

      // Update listing price
      const updateResult = await client.query(
        `UPDATE listings
         SET list_price = $1, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2
         RETURNING *`,
        [newPrice, id],
      );

      // Price history can be implemented later if needed

      return updateResult.rows[0];
    });

    // Emit real-time update
    const io = req.app.get('io');
    if (io) {
      io.to('listings').emit('listing:priceChanged', { id, newPrice });
    }

    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Error recording price change:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'PRICE_ERROR',
        message: 'Failed to record price change',
      },
    });
  }
};

// Log showing
exports.logShowing = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      date, time, agentName, agentEmail, agentPhone, feedback, interested,
    } = req.body;

    if (!date || !time) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Date and time are required',
        },
      });
    }

    // For now, just acknowledge the showing without storing in separate table
    // This can be implemented with proper showing tracking later

    // Update listing timestamp to track activity
    await query(
      'UPDATE listings SET updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [id],
    );

    res.json({
      success: true,
      data: {
        listing_id: id,
        showing_date: date,
        showing_time: time,
        agent_name: agentName,
        feedback,
        interested: interested || false,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Error logging showing:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SHOWING_ERROR',
        message: 'Failed to log showing',
      },
    });
  }
};

// Update marketing checklist
exports.updateMarketingChecklist = async (req, res) => {
  try {
    const { id } = req.params;
    const { checklistData } = req.body;

    if (!Array.isArray(checklistData)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Checklist data must be an array',
        },
      });
    }

    // Marketing checklist can be implemented later if needed
    // For now just return the submitted data
    res.json({
      success: true,
      data: checklistData,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Error updating marketing checklist:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CHECKLIST_ERROR',
        message: 'Failed to update marketing checklist',
      },
    });
  }
};
