// File: backend/src/routes/detailRoutes.js

const express = require('express');
const router = express.Router();
const { query } = require('../config/database');

// ========== ESCROW DETAIL ROUTES ==========

// Get escrow with all related data
router.get('/escrows/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get escrow with buyers and sellers
    const escrowQuery = `
      SELECT 
        e.*,
        COALESCE(
          (SELECT jsonb_agg(jsonb_build_object(
            'id', c.id,
            'name', c.first_name || ' ' || c.last_name,
            'email', c.email,
            'phone', c.phone
          ))
          FROM escrow_buyers eb
          JOIN clients c ON eb.client_id = c.id
          WHERE eb.escrow_id = e.id
          ), '[]'::jsonb) AS buyers,
        COALESCE(
          (SELECT jsonb_agg(jsonb_build_object(
            'id', c.id,
            'name', c.first_name || ' ' || c.last_name,
            'email', c.email,
            'phone', c.phone
          ))
          FROM escrow_sellers es
          JOIN clients c ON es.client_id = c.id
          WHERE es.escrow_id = e.id
          ), '[]'::jsonb) AS sellers
      FROM escrows e
      WHERE e.id = $1
    `;
    
    const escrowResult = await query(escrowQuery, [id]);
    
    if (escrowResult.rows.length === 0) {
      return res.status(404).json({ error: 'Escrow not found' });
    }
    
    const escrow = escrowResult.rows[0];
    
    // Get checklist items
    const checklistResult = await query(
      'SELECT checklist_items FROM escrow_checklists WHERE escrow_id = $1',
      [id]
    );
    
    if (checklistResult.rows.length > 0) {
      escrow.checklist = checklistResult.rows[0].checklist_items;
    }
    
    res.json(escrow);
  } catch (error) {
    console.error('Error fetching escrow details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update escrow checklist
router.put('/escrows/:id/checklist', async (req, res) => {
  try {
    const { id } = req.params;
    const { checklist } = req.body;
    
    const result = await query(
      `INSERT INTO escrow_checklists (escrow_id, checklist_items, updated_at)
       VALUES ($1, $2, CURRENT_TIMESTAMP)
       ON CONFLICT (escrow_id) 
       DO UPDATE SET checklist_items = $2, updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [id, JSON.stringify(checklist)]
    );
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating escrow checklist:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get escrow analytics
router.get('/analytics/escrow/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Simulated analytics data - replace with actual calculations
    const analytics = {
      completion_percentage: 75,
      days_until_closing: 15,
      commission_breakdown: {
        listing_side: 15000,
        buying_side: 15000,
        adjustments: -500
      },
      risk_factors: [],
      milestone_progress: {
        inspection: 100,
        appraisal: 100,
        loan_approval: 80,
        closing_prep: 50
      }
    };
    
    res.json(analytics);
  } catch (error) {
    console.error('Error fetching escrow analytics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ========== LISTING DETAIL ROUTES ==========

// Get listing with all related data
router.get('/listings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const listingQuery = `
      SELECT 
        l.*,
        COALESCE(
          (SELECT jsonb_agg(jsonb_build_object(
            'id', c.id,
            'name', c.first_name || ' ' || c.last_name,
            'email', c.email,
            'phone', c.phone
          ))
          FROM listing_sellers ls
          JOIN clients c ON ls.client_id = c.id
          WHERE ls.listing_id = l.id
          ), '[]'::jsonb) AS sellers
      FROM listings l
      WHERE l.id = $1
    `;
    
    const result = await query(listingQuery, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Listing not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching listing details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get listing price history
router.get('/listings/:id/price-history', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await query(
      `SELECT price, date, reason 
       FROM listing_price_history 
       WHERE listing_id = $1 
       ORDER BY date DESC`,
      [id]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching price history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update listing checklist
router.put('/listings/:id/checklist', async (req, res) => {
  try {
    const { id } = req.params;
    const { checklist } = req.body;
    
    // Store checklist in a JSON column on listings table
    const result = await query(
      `UPDATE listings 
       SET checklist = $2, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $1 
       RETURNING *`,
      [id, JSON.stringify(checklist)]
    );
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating listing checklist:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get listing analytics
router.get('/analytics/listing/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Generate showing and views trend data
    const showingTrend = [];
    const viewsTrend = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      showingTrend.push({
        date: date.toISOString(),
        showings: Math.floor(Math.random() * 5) + 1
      });
      
      viewsTrend.push({
        date: date.toISOString(),
        views: Math.floor(Math.random() * 50) + 20
      });
    }
    
    res.json({
      showing_trend: showingTrend,
      views_trend: viewsTrend,
      average_showings_per_week: 12,
      view_to_showing_ratio: 0.15
    });
  } catch (error) {
    console.error('Error fetching listing analytics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ========== CLIENT DETAIL ROUTES ==========

// Get client with all related data
router.get('/clients/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const clientQuery = `
      SELECT 
        c.*,
        COALESCE(
          (SELECT COUNT(*) 
           FROM escrow_buyers eb 
           JOIN escrows e ON eb.escrow_id = e.id 
           WHERE eb.client_id = c.id AND e.escrow_status = 'Closed'
          ), 0) +
        COALESCE(
          (SELECT COUNT(*) 
           FROM escrow_sellers es 
           JOIN escrows e ON es.escrow_id = e.id 
           WHERE es.client_id = c.id AND e.escrow_status = 'Closed'
          ), 0) AS transaction_count,
        COALESCE(referrals_made, 0) AS referrals_made
      FROM clients c
      WHERE c.id = $1
    `;
    
    const result = await query(clientQuery, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching client details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get client transactions
router.get('/clients/:id/transactions', async (req, res) => {
  try {
    const { id } = req.params;
    
    const transactionsQuery = `
      SELECT 
        e.id,
        e.property_address,
        e.purchase_price,
        e.closing_date,
        e.gross_commission,
        CASE 
          WHEN eb.client_id IS NOT NULL THEN 'Buyer'
          WHEN es.client_id IS NOT NULL THEN 'Seller'
        END AS transaction_type,
        CASE 
          WHEN eb.client_id IS NOT NULL THEN e.gross_commission * 0.5 * 0.7
          WHEN es.client_id IS NOT NULL THEN e.gross_commission * 0.5 * 0.7
        END AS commission_earned
      FROM escrows e
      LEFT JOIN escrow_buyers eb ON e.id = eb.escrow_id AND eb.client_id = $1
      LEFT JOIN escrow_sellers es ON e.id = es.escrow_id AND es.client_id = $1
      WHERE (eb.client_id = $1 OR es.client_id = $1)
        AND e.escrow_status = 'Closed'
      ORDER BY e.closing_date DESC
    `;
    
    const result = await query(transactionsQuery, [id]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching client transactions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get client communications
router.get('/clients/:id/communications', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await query(
      `SELECT * FROM communications 
       WHERE entity_type = 'client' AND entity_id = $1 
       ORDER BY created_at DESC 
       LIMIT 50`,
      [id]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching client communications:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get client notes
router.get('/clients/:id/notes', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await query(
      `SELECT * FROM notes 
       WHERE entity_type = 'client' AND entity_id = $1 
       ORDER BY created_at DESC`,
      [id]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching client notes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update client checklist
router.put('/clients/:id/checklist', async (req, res) => {
  try {
    const { id } = req.params;
    const { checklist } = req.body;
    
    const result = await query(
      `UPDATE clients 
       SET checklist = $2, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $1 
       RETURNING *`,
      [id, JSON.stringify(checklist)]
    );
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating client checklist:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ========== APPOINTMENT DETAIL ROUTES ==========

// Get appointment with all related data
router.get('/appointments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const appointmentQuery = `
      SELECT 
        a.*,
        COALESCE(
          (SELECT jsonb_agg(jsonb_build_object(
            'id', c.id,
            'name', c.first_name || ' ' || c.last_name,
            'email', c.email,
            'phone', c.phone,
            'confirmed', aa.confirmed
          ))
          FROM appointment_attendees aa
          JOIN clients c ON aa.client_id = c.id
          WHERE aa.appointment_id = a.id
          ), '[]'::jsonb) AS attendees
      FROM appointments a
      WHERE a.id = $1
    `;
    
    const result = await query(appointmentQuery, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching appointment details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update appointment checklist
router.put('/appointments/:id/checklist', async (req, res) => {
  try {
    const { id } = req.params;
    const { checklist } = req.body;
    
    const result = await query(
      `UPDATE appointments 
       SET checklist = $2, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $1 
       RETURNING *`,
      [id, JSON.stringify(checklist)]
    );
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating appointment checklist:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get appointment analytics
router.get('/analytics/appointments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get related appointments (same property or same clients)
    const relatedQuery = `
      SELECT DISTINCT a2.id, a2.title, a2.date, a2.status
      FROM appointments a1
      JOIN appointment_attendees aa1 ON a1.id = aa1.appointment_id
      JOIN appointment_attendees aa2 ON aa1.client_id = aa2.client_id
      JOIN appointments a2 ON aa2.appointment_id = a2.id
      WHERE a1.id = $1 AND a2.id != $1
      ORDER BY a2.date DESC
      LIMIT 5
    `;
    
    const relatedResult = await query(relatedQuery, [id]);
    
    res.json({
      related_appointments: relatedResult.rows,
      average_duration: 60,
      typical_outcome: 'Positive',
      conversion_rate: 0.75
    });
  } catch (error) {
    console.error('Error fetching appointment analytics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Search properties by address
router.get('/properties/search', async (req, res) => {
  try {
    const { address } = req.query;
    
    const result = await query(
      `SELECT * FROM listings 
       WHERE property_address ILIKE $1 
       LIMIT 5`,
      [`%${address}%`]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error searching properties:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ========== LEAD DETAIL ROUTES ==========

// Get lead with all related data
router.get('/leads/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await query(
      'SELECT * FROM leads WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching lead details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get lead activities
router.get('/leads/:id/activities', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Simulated activities - replace with actual data
    const activities = [
      {
        id: 1,
        type: 'email',
        description: 'Welcome email sent',
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        engagement_points: 5
      },
      {
        id: 2,
        type: 'call',
        description: 'Initial consultation call',
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        engagement_points: 10
      }
    ];
    
    res.json(activities);
  } catch (error) {
    console.error('Error fetching lead activities:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get lead communications
router.get('/leads/:id/communications', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await query(
      `SELECT * FROM communications 
       WHERE entity_type = 'lead' AND entity_id = $1 
       ORDER BY created_at DESC`,
      [id]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching lead communications:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update lead checklist
router.put('/leads/:id/checklist', async (req, res) => {
  try {
    const { id } = req.params;
    const { checklist } = req.body;
    
    const result = await query(
      `UPDATE leads 
       SET checklist = $2, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $1 
       RETURNING *`,
      [id, JSON.stringify(checklist)]
    );
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating lead checklist:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get lead analytics
router.get('/analytics/lead/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    res.json({
      engagement_trend: [],
      conversion_probability: 0.65,
      recommended_actions: [
        'Follow up within 24 hours',
        'Send property matches',
        'Schedule viewing'
      ],
      similar_leads_converted: 8
    });
  } catch (error) {
    console.error('Error fetching lead analytics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;