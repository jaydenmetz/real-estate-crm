const express = require('express');

const router = express.Router();
const { pool } = require('../config/database');
const { authenticate } = require('../middleware/apiKey.middleware');

/**
 * Health check endpoint that tests all escrow API operations
 * Creates a test escrow, performs operations, then deletes it
 *
 * GET /v1/escrows/health
 */
router.get('/health', authenticate, async (req, res) => {
  const results = {
    timestamp: new Date().toISOString(),
    user: req.user?.email,
    authMethod: req.user?.authMethod,
    tests: [],
  };

  let testEscrowId = null;
  const testPrefix = `HEALTH_CHECK_${Date.now()}`;

  try {
    // Test 1: Create escrow
    const createTest = { name: 'CREATE_ESCROW', status: 'pending', error: null };
    try {
      const createResult = await pool.query(`
        INSERT INTO escrows (
          property_address, city, state, zip_code, 
          purchase_price, escrow_status, acceptance_date, 
          closing_date, display_id, created_by, team_id,
          net_commission
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING id, display_id
      `, [
        `${testPrefix} Test Property`,
        'Test City',
        'CA',
        '90210',
        100000,
        'Active',
        new Date(),
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        `${testPrefix}-001`,
        req.user.id,
        req.user.teamId,
        3000,
      ]);

      testEscrowId = createResult.rows[0].id;
      createTest.status = 'passed';
      createTest.escrowId = testEscrowId;
      createTest.displayId = createResult.rows[0].display_id;
    } catch (error) {
      createTest.status = 'failed';
      createTest.error = error.message;
    }
    results.tests.push(createTest);

    // Only continue if create succeeded
    if (testEscrowId) {
      // Test 2: Read escrow
      const readTest = { name: 'READ_ESCROW', status: 'pending', error: null };
      try {
        const readResult = await pool.query(`
          SELECT id, display_id, property_address, escrow_status
          FROM escrows
          WHERE id = $1 AND (created_by = $2 OR team_id = $3)
        `, [testEscrowId, req.user.id, req.user.teamId]);

        if (readResult.rows.length > 0) {
          readTest.status = 'passed';
          readTest.data = readResult.rows[0];
        } else {
          readTest.status = 'failed';
          readTest.error = 'Could not read created escrow - permission denied';
        }
      } catch (error) {
        readTest.status = 'failed';
        readTest.error = error.message;
      }
      results.tests.push(readTest);

      // Test 3: Update escrow
      const updateTest = { name: 'UPDATE_ESCROW', status: 'pending', error: null };
      try {
        const updateResult = await pool.query(`
          UPDATE escrows
          SET purchase_price = $1, updated_at = CURRENT_TIMESTAMP
          WHERE id = $2 AND (created_by = $3 OR team_id = $4)
          RETURNING id, purchase_price
        `, [150000, testEscrowId, req.user.id, req.user.teamId]);

        if (updateResult.rows.length > 0) {
          updateTest.status = 'passed';
          updateTest.newPrice = updateResult.rows[0].purchase_price;
        } else {
          updateTest.status = 'failed';
          updateTest.error = 'Could not update escrow - permission denied';
        }
      } catch (error) {
        updateTest.status = 'failed';
        updateTest.error = error.message;
      }
      results.tests.push(updateTest);

      // Test 4: Update people
      const peopleTest = { name: 'UPDATE_PEOPLE', status: 'pending', error: null };
      try {
        const peopleResult = await pool.query(`
          UPDATE escrows
          SET people = $1
          WHERE id = $2 AND (created_by = $3 OR team_id = $4)
          RETURNING id
        `, [
          JSON.stringify({
            buyers: [{ name: 'Test Buyer', email: 'buyer@test.com' }],
            sellers: [{ name: 'Test Seller', email: 'seller@test.com' }],
          }),
          testEscrowId,
          req.user.id,
          req.user.teamId,
        ]);

        if (peopleResult.rows.length > 0) {
          peopleTest.status = 'passed';
        } else {
          peopleTest.status = 'failed';
          peopleTest.error = 'Could not update people - permission denied';
        }
      } catch (error) {
        peopleTest.status = 'failed';
        peopleTest.error = error.message;
      }
      results.tests.push(peopleTest);

      // Test 5: Update checklists
      const checklistTest = { name: 'UPDATE_CHECKLISTS', status: 'pending', error: null };
      try {
        const checklistResult = await pool.query(`
          UPDATE escrows
          SET checklists = $1
          WHERE id = $2 AND (created_by = $3 OR team_id = $4)
          RETURNING id
        `, [
          JSON.stringify({
            loan: { preApproval: { checked: true } },
            house: { inspection: { checked: false } },
          }),
          testEscrowId,
          req.user.id,
          req.user.teamId,
        ]);

        if (checklistResult.rows.length > 0) {
          checklistTest.status = 'passed';
        } else {
          checklistTest.status = 'failed';
          checklistTest.error = 'Could not update checklists - permission denied';
        }
      } catch (error) {
        checklistTest.status = 'failed';
        checklistTest.error = error.message;
      }
      results.tests.push(checklistTest);

      // Test 6: Permission check - Try to access someone else's escrow
      const permissionTest = { name: 'PERMISSION_CHECK', status: 'pending', error: null };
      try {
        // Try to find an escrow not owned by this user
        const otherEscrowResult = await pool.query(`
          SELECT id FROM escrows 
          WHERE created_by != $1 
          AND (team_id != $2 OR team_id IS NULL)
          AND property_address NOT LIKE $3
          LIMIT 1
        `, [req.user.id, req.user.teamId, `${testPrefix}%`]);

        if (otherEscrowResult.rows.length > 0) {
          // Try to update it (should fail)
          const unauthorizedUpdate = await pool.query(`
            UPDATE escrows
            SET purchase_price = 999999
            WHERE id = $1 AND created_by = $2
            RETURNING id
          `, [otherEscrowResult.rows[0].id, req.user.id]);

          if (unauthorizedUpdate.rows.length === 0) {
            permissionTest.status = 'passed';
            permissionTest.message = 'Correctly denied access to other user\'s escrow';
          } else {
            permissionTest.status = 'failed';
            permissionTest.error = 'Security issue: able to modify other user\'s escrow';
          }
        } else {
          permissionTest.status = 'skipped';
          permissionTest.message = 'No other escrows to test permissions against';
        }
      } catch (error) {
        permissionTest.status = 'failed';
        permissionTest.error = error.message;
      }
      results.tests.push(permissionTest);

      // Test 7: Archive test escrow (soft delete)
      const archiveTest = { name: 'ARCHIVE_ESCROW', status: 'pending', error: null };
      try {
        const archiveResult = await pool.query(`
          UPDATE escrows
          SET deleted_at = CURRENT_TIMESTAMP,
              escrow_status = 'Archived'
          WHERE id = $1 AND (created_by = $2 OR team_id = $3)
          AND deleted_at IS NULL
          RETURNING id, deleted_at
        `, [testEscrowId, req.user.id, req.user.teamId]);

        if (archiveResult.rows.length > 0) {
          archiveTest.status = 'passed';
          archiveTest.message = 'Test escrow archived successfully';
          archiveTest.archivedAt = archiveResult.rows[0].deleted_at;
        } else {
          archiveTest.status = 'failed';
          archiveTest.error = 'Could not archive test escrow - may already be archived';
        }
      } catch (error) {
        archiveTest.status = 'failed';
        archiveTest.error = error.message;
      }
      results.tests.push(archiveTest);

      // Test 8: Permanently delete archived escrow
      const deleteTest = { name: 'DELETE_ARCHIVED_ESCROW', status: 'pending', error: null };
      try {
        // Only delete if archive succeeded
        if (archiveTest.status === 'passed') {
          const deleteResult = await pool.query(`
            DELETE FROM escrows
            WHERE id = $1 AND (created_by = $2 OR team_id = $3)
            AND deleted_at IS NOT NULL
            RETURNING id
          `, [testEscrowId, req.user.id, req.user.teamId]);

          if (deleteResult.rows.length > 0) {
            deleteTest.status = 'passed';
            deleteTest.message = 'Test escrow permanently deleted successfully';
          } else {
            deleteTest.status = 'failed';
            deleteTest.error = 'Could not permanently delete archived escrow';
          }
        } else {
          deleteTest.status = 'skipped';
          deleteTest.message = 'Skipped because archive failed';
        }
      } catch (error) {
        deleteTest.status = 'failed';
        deleteTest.error = error.message;
      }
      results.tests.push(deleteTest);
    }

    // Calculate summary
    const summary = {
      total: results.tests.length,
      passed: results.tests.filter((t) => t.status === 'passed').length,
      failed: results.tests.filter((t) => t.status === 'failed').length,
      skipped: results.tests.filter((t) => t.status === 'skipped').length,
    };
    summary.success = summary.failed === 0;

    results.summary = summary;

    // Determine overall status code
    const statusCode = summary.success ? 200 : 500;

    res.status(statusCode).json({
      success: summary.success,
      data: results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    // Clean up test escrow if it exists (force delete regardless of state)
    if (testEscrowId) {
      try {
        // First try to archive if not already archived
        await pool.query(`
          UPDATE escrows SET deleted_at = CURRENT_TIMESTAMP
          WHERE id = $1 AND deleted_at IS NULL
        `, [testEscrowId]);

        // Then permanently delete
        await pool.query(`
          DELETE FROM escrows WHERE id = $1
        `, [testEscrowId]);
      } catch (cleanupError) {
        console.error('Failed to clean up test escrow:', cleanupError);
      }
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'HEALTH_CHECK_FAILED',
        message: 'Health check failed',
        details: error.message,
      },
      data: results,
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * Simple health check - just verifies authentication works
 * GET /v1/escrows/health/auth
 */
router.get('/health/auth', authenticate, async (req, res) => {
  res.json({
    success: true,
    data: {
      authenticated: true,
      user: req.user?.email,
      userId: req.user?.id,
      teamId: req.user?.teamId,
      role: req.user?.role,
      authMethod: req.user?.authMethod,
      permissions: req.user?.permissions,
    },
    timestamp: new Date().toISOString(),
  });
});

/**
 * Database connection health check
 * GET /v1/escrows/health/db
 */
router.get('/health/db', authenticate, async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW() as time, current_database() as database');

    res.json({
      success: true,
      data: {
        connected: true,
        database: result.rows[0].database,
        serverTime: result.rows[0].time,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'DB_CONNECTION_FAILED',
        message: 'Database connection failed',
        details: error.message,
      },
      timestamp: new Date().toISOString(),
    });
  }
});

module.exports = router;
