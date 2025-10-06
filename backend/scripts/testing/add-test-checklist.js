const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'realestate_crm',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
});

async function addTestChecklist() {
  const client = await pool.connect();
  
  try {
    const escrowId = 'ESC-TEST-001';
    
    // Add checklist items
    const checklistItems = [
      { task: 'Open Escrow', completed: true, completed_date: '2025-01-10' },
      { task: 'Order Title Report', completed: true, completed_date: '2025-01-11' },
      { task: 'Schedule Home Inspection', completed: true, completed_date: '2025-01-12' },
      { task: 'Review Inspection Report', completed: false },
      { task: 'Loan Approval', completed: false },
      { task: 'Final Walkthrough', completed: false }
    ];

    for (const item of checklistItems) {
      await client.query(
        `INSERT INTO escrow_checklist (escrow_id, task, completed, completed_date)
         VALUES ($1, $2, $3, $4)`,
        [escrowId, item.task, item.completed, item.completed_date || null]
      );
    }

    console.log('✓ Checklist items added successfully');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

addTestChecklist();