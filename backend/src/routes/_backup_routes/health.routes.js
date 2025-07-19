const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'realestate_crm',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
});

/**
 * Health check endpoint for escrow system
 * GET /api/v1/health/escrow-system
 */
router.get('/health/escrow-system', async (req, res) => {
  const startTime = Date.now();
  const healthReport = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    checks: {
      database: { status: 'unknown', message: '' },
      tables: { status: 'unknown', required: [], missing: [] },
      relationships: { status: 'unknown', valid: [] },
      testData: { status: 'unknown', escrowId: 'ESC-TEST-001', found: false }
    },
    warnings: [],
    errors: [],
    responseTime: 0
  };

  const client = await pool.connect();

  try {
    // 1. Check database connection
    try {
      const dbResult = await client.query('SELECT NOW() as time, version() as version');
      healthReport.checks.database = {
        status: 'healthy',
        message: 'Database connection successful',
        version: dbResult.rows[0].version,
        currentTime: dbResult.rows[0].time
      };
    } catch (error) {
      healthReport.checks.database = {
        status: 'unhealthy',
        message: 'Database connection failed',
        error: error.message
      };
      healthReport.status = 'unhealthy';
      healthReport.errors.push('Database connection failed');
    }

    // 2. Check required tables exist
    const requiredTables = [
      'contacts', 'agents', 'clients', 'escrows',
      'contact_agents', 'contact_clients', 'contact_escrows',
      'escrow_checklist', 'escrow_timeline'
    ];

    try {
      const tableQuery = `
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
          AND tablename = ANY($1)
      `;
      const tableResult = await client.query(tableQuery, [requiredTables]);
      const existingTables = tableResult.rows.map(r => r.tablename);
      const missingTables = requiredTables.filter(t => !existingTables.includes(t));

      healthReport.checks.tables = {
        status: missingTables.length === 0 ? 'healthy' : 'unhealthy',
        required: requiredTables,
        existing: existingTables,
        missing: missingTables
      };

      if (missingTables.length > 0) {
        healthReport.status = 'unhealthy';
        healthReport.errors.push(`Missing tables: ${missingTables.join(', ')}`);
      }
    } catch (error) {
      healthReport.checks.tables.status = 'error';
      healthReport.checks.tables.error = error.message;
      healthReport.warnings.push('Could not check table existence');
    }

    // 3. Check foreign key relationships
    try {
      const fkQuery = `
        SELECT 
          tc.table_name,
          kcu.column_name,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY'
          AND tc.table_name IN ('contact_escrows', 'agents', 'clients')
      `;
      const fkResult = await client.query(fkQuery);
      
      healthReport.checks.relationships = {
        status: 'healthy',
        valid: fkResult.rows.map(r => 
          `${r.table_name}.${r.column_name} -> ${r.foreign_table_name}.${r.foreign_column_name}`
        ),
        count: fkResult.rows.length
      };
    } catch (error) {
      healthReport.checks.relationships.status = 'error';
      healthReport.checks.relationships.error = error.message;
      healthReport.warnings.push('Could not check foreign key relationships');
    }

    // 4. Check test data availability
    try {
      // Check test escrow
      const escrowResult = await client.query(
        'SELECT id, property_address FROM escrows WHERE id = $1',
        ['ESC-TEST-001']
      );

      if (escrowResult.rows.length > 0) {
        // Check participants
        const participantResult = await client.query(`
          SELECT COUNT(*) as count, 
                 COUNT(DISTINCT role) as roles
          FROM contact_escrows 
          WHERE escrow_id = $1
        `, ['ESC-TEST-001']);

        healthReport.checks.testData = {
          status: 'healthy',
          escrowId: 'ESC-TEST-001',
          found: true,
          propertyAddress: escrowResult.rows[0].property_address,
          participantCount: parseInt(participantResult.rows[0].count),
          roleCount: parseInt(participantResult.rows[0].roles)
        };
      } else {
        healthReport.checks.testData = {
          status: 'warning',
          escrowId: 'ESC-TEST-001',
          found: false,
          message: 'Test escrow not found. Run create-test-escrow.js to create test data.'
        };
        healthReport.warnings.push('Test data not available');
      }
    } catch (error) {
      healthReport.checks.testData.status = 'error';
      healthReport.checks.testData.error = error.message;
      healthReport.warnings.push('Could not check test data');
    }

    // Calculate response time
    healthReport.responseTime = Date.now() - startTime;

    // Determine overall status
    const hasErrors = healthReport.errors.length > 0;
    const hasWarnings = healthReport.warnings.length > 0;
    
    if (hasErrors) {
      healthReport.status = 'unhealthy';
      res.status(503);
    } else if (hasWarnings) {
      healthReport.status = 'degraded';
      res.status(200);
    } else {
      healthReport.status = 'healthy';
      res.status(200);
    }

    res.json(healthReport);

  } catch (error) {
    healthReport.status = 'unhealthy';
    healthReport.errors.push(`Unexpected error: ${error.message}`);
    healthReport.responseTime = Date.now() - startTime;
    
    res.status(503).json(healthReport);
  } finally {
    client.release();
  }
});

module.exports = router;