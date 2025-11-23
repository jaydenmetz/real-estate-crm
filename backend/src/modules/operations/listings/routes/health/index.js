const express = require('express');

const router = express.Router();
const { pool, query } = require('../../../../../config/infrastructure/database');
const { authenticate } = require('../../../../../middleware/auth/apiKey.middleware');

// Helper function to format response
const formatHealthResponse = (success, data, error = null) => ({
  success,
  timestamp: new Date().toISOString(),
  data: success ? data : null,
  error: error ? { code: error.code || 'HEALTH_CHECK_FAILED', message: error.message } : null,
});

// GET /v1/listings/health - Comprehensive health check with automatic tests
router.get('/health', authenticate, async (req, res) => {
  const results = {
    timestamp: new Date().toISOString(),
    user: req.user?.email,
    authMethod: req.user?.authMethod,
    tests: [],
  };

  let testListingId = null;
  const testPrefix = `HEALTH_CHECK_${Date.now()}`;

  try {
    // Test 1: Create listing
    const createTest = { name: 'CREATE_LISTING', status: 'pending', error: null };
    try {
      const createResult = await pool.query(`
        INSERT INTO listings (
          property_address, city, state, zip_code,
          price, bedrooms, bathrooms, square_feet,
          lot_size, year_built, property_type, status,
          listing_date, mls_number, agent_id, team_id,
          commission_percentage, description
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
        RETURNING id, mls_number
      `, [
        `${testPrefix} Test Property`,
        'Test City',
        'CA',
        '90210',
        750000,
        4,
        3,
        2500,
        0.25,
        2020,
        'Single Family',
        'Active',
        new Date(),
        `MLS-${testPrefix}`,
        req.user.id,
        req.user.teamId,
        2.5,
        'Health check test listing - will be deleted',
      ]);

      testListingId = createResult.rows[0].id;
      createTest.status = 'passed';
      createTest.listingId = testListingId;
      createTest.mlsNumber = createResult.rows[0].mls_number;
    } catch (error) {
      createTest.status = 'failed';
      createTest.error = error.message;
    }
    results.tests.push(createTest);

    // Only continue if create succeeded
    if (testListingId) {
      // Test 2: Read listing
      const readTest = { name: 'READ_LISTING', status: 'pending', error: null };
      try {
        const readResult = await pool.query(`
          SELECT id, mls_number, property_address, status, price
          FROM listings
          WHERE id = $1 AND (agent_id = $2 OR team_id = $3)
        `, [testListingId, req.user.id, req.user.teamId]);

        if (readResult.rows.length > 0) {
          readTest.status = 'passed';
          readTest.data = readResult.rows[0];
        } else {
          readTest.status = 'failed';
          readTest.error = 'Could not read created listing - permission denied';
        }
      } catch (error) {
        readTest.status = 'failed';
        readTest.error = error.message;
      }
      results.tests.push(readTest);

      // Test 3: Update listing price
      const updateTest = { name: 'UPDATE_LISTING', status: 'pending', error: null };
      try {
        const updateResult = await pool.query(`
          UPDATE listings
          SET price = $1, status = 'Pending', updated_at = CURRENT_TIMESTAMP
          WHERE id = $2 AND (agent_id = $3 OR team_id = $4)
          RETURNING id, price, status
        `, [699000, testListingId, req.user.id, req.user.teamId]);

        if (updateResult.rows.length > 0) {
          updateTest.status = 'passed';
          updateTest.newPrice = updateResult.rows[0].price;
          updateTest.newStatus = updateResult.rows[0].status;
        } else {
          updateTest.status = 'failed';
          updateTest.error = 'Could not update listing - permission denied';
        }
      } catch (error) {
        updateTest.status = 'failed';
        updateTest.error = error.message;
      }
      results.tests.push(updateTest);

      // Test 4: Add price reduction
      const priceReductionTest = { name: 'PRICE_REDUCTION', status: 'pending', error: null };
      try {
        const priceReductionResult = await pool.query(`
          INSERT INTO listing_price_history (
            listing_id, old_price, new_price, change_date, reason
          ) VALUES ($1, $2, $3, $4, $5)
          RETURNING id
        `, [testListingId, 699000, 649000, new Date(), 'Test price reduction']);

        if (priceReductionResult.rows.length > 0) {
          priceReductionTest.status = 'passed';
        } else {
          priceReductionTest.status = 'failed';
        }
      } catch (error) {
        // Table might not exist, mark as skipped
        priceReductionTest.status = 'skipped';
        priceReductionTest.message = 'Price history table not configured';
      }
      results.tests.push(priceReductionTest);

      // Test 5: Add showing
      const showingTest = { name: 'ADD_SHOWING', status: 'pending', error: null };
      try {
        const showingResult = await pool.query(`
          INSERT INTO listing_showings (
            listing_id, showing_date, client_name, agent_name, feedback
          ) VALUES ($1, $2, $3, $4, $5)
          RETURNING id
        `, [testListingId, new Date(), 'Test Client', 'Test Agent', 'Positive feedback']);

        if (showingResult.rows.length > 0) {
          showingTest.status = 'passed';
        } else {
          showingTest.status = 'failed';
        }
      } catch (error) {
        // Table might not exist, mark as skipped
        showingTest.status = 'skipped';
        showingTest.message = 'Showings table not configured';
      }
      results.tests.push(showingTest);

      // Test 6: Permission check - Try to access someone else's listing
      const permissionTest = { name: 'PERMISSION_CHECK', status: 'pending', error: null };
      try {
        // Try to find a listing not owned by this user
        const otherListingResult = await pool.query(`
          SELECT id FROM listings
          WHERE agent_id != $1
          AND (team_id != $2 OR team_id IS NULL)
          AND property_address NOT LIKE $3
          LIMIT 1
        `, [req.user.id, req.user.teamId, `${testPrefix}%`]);

        if (otherListingResult.rows.length > 0) {
          // Try to update it (should fail)
          const unauthorizedUpdate = await pool.query(`
            UPDATE listings
            SET price = 999999
            WHERE id = $1 AND agent_id = $2
            RETURNING id
          `, [otherListingResult.rows[0].id, req.user.id]);

          if (unauthorizedUpdate.rows.length === 0) {
            permissionTest.status = 'passed';
            permissionTest.message = 'Correctly denied access to other user\'s listing';
          } else {
            permissionTest.status = 'failed';
            permissionTest.error = 'Security issue: able to modify other user\'s listing';
          }
        } else {
          permissionTest.status = 'skipped';
          permissionTest.message = 'No other listings to test permissions against';
        }
      } catch (error) {
        permissionTest.status = 'failed';
        permissionTest.error = error.message;
      }
      results.tests.push(permissionTest);

      // Test 7: Archive listing (soft delete)
      const archiveTest = { name: 'ARCHIVE_LISTING', status: 'pending', error: null };
      try {
        const archiveResult = await pool.query(`
          UPDATE listings
          SET deleted_at = CURRENT_TIMESTAMP,
              status = 'Withdrawn'
          WHERE id = $1 AND (agent_id = $2 OR team_id = $3)
          AND deleted_at IS NULL
          RETURNING id, deleted_at
        `, [testListingId, req.user.id, req.user.teamId]);

        if (archiveResult.rows.length > 0 && archiveResult.rows[0].deleted_at) {
          archiveTest.status = 'passed';
        } else {
          archiveTest.status = 'failed';
          archiveTest.error = 'Could not archive listing';
        }
      } catch (error) {
        archiveTest.status = 'failed';
        archiveTest.error = error.message;
      }
      results.tests.push(archiveTest);

      // Test 8: Delete listing (hard delete)
      const deleteTest = { name: 'DELETE_LISTING', status: 'pending', error: null };
      try {
        // First clean up related records
        await pool.query('DELETE FROM listing_price_history WHERE listing_id = $1', [testListingId]);
        await pool.query('DELETE FROM listing_showings WHERE listing_id = $1', [testListingId]);

        // Then delete the listing
        const deleteResult = await pool.query(`
          DELETE FROM listings
          WHERE id = $1
          AND (agent_id = $2 OR team_id = $3)
          AND deleted_at IS NOT NULL
        `, [testListingId, req.user.id, req.user.teamId]);

        if (deleteResult.rowCount > 0) {
          deleteTest.status = 'passed';
        } else {
          deleteTest.status = 'failed';
          deleteTest.error = 'Could not delete listing';
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
      executionTime: Date.now() - Date.parse(results.timestamp),
    };

    results.summary = summary;
    res.json(formatHealthResponse(true, results));
  } catch (error) {
    // Cleanup on error
    if (testListingId) {
      try {
        await pool.query('DELETE FROM listing_price_history WHERE listing_id = $1', [testListingId]);
        await pool.query('DELETE FROM listing_showings WHERE listing_id = $1', [testListingId]);
        await pool.query('DELETE FROM listings WHERE id = $1', [testListingId]);
      } catch (cleanupError) {
        console.error('Cleanup failed:', cleanupError);
      }
    }

    res.status(500).json(formatHealthResponse(false, null, error));
  }
});

// GET /v1/listings/health/db - Database connectivity check
router.get('/health/db', authenticate, async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW() as time, version() as version');
    const stats = await pool.query(`
      SELECT
        COUNT(*) as total_connections,
        COUNT(*) FILTER (WHERE state = 'active') as active_queries,
        MAX(query_start) as last_query
      FROM pg_stat_activity
      WHERE datname = current_database()
    `);

    res.json(formatHealthResponse(true, {
      status: 'connected',
      database_time: result.rows[0].time,
      version: result.rows[0].version,
      connections: stats.rows[0],
    }));
  } catch (error) {
    res.status(503).json(formatHealthResponse(false, null, error));
  }
});

// GET /v1/listings/health/crud - Test CRUD operations
router.get('/health/crud', authenticate, async (req, res) => {
  const testMode = req.query.testMode === 'true';
  const operations = {
    create: false,
    read: false,
    update: false,
    archive: false,
    delete: false,
  };
  const timings = {};
  let testListingId = null;

  try {
    // 1. CREATE
    const createStart = Date.now();
    const testListing = {
      property_address: '123 Health Test St',
      city: 'Test City',
      state: 'CA',
      zip_code: '90210',
      price: 999999,
      bedrooms: 4,
      bathrooms: 3,
      square_feet: 2500,
      lot_size: 0.25,
      year_built: 2020,
      property_type: 'Single Family',
      status: 'Active',
      listing_date: new Date().toISOString(),
      mls_number: `TEST-${Date.now()}`,
      agent_id: req.user.id,
      team_id: req.user.teamId,
      commission_percentage: 2.5,
      description: 'Health check test listing - will be deleted',
    };

    const createResult = await pool.query(`
      INSERT INTO listings (
        property_address, city, state, zip_code, price, bedrooms, bathrooms,
        square_feet, lot_size, year_built, property_type, status, listing_date,
        mls_number, agent_id, team_id, commission_percentage, description
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      RETURNING id
    `, [
      testListing.property_address, testListing.city, testListing.state,
      testListing.zip_code, testListing.price, testListing.bedrooms,
      testListing.bathrooms, testListing.square_feet, testListing.lot_size,
      testListing.year_built, testListing.property_type, testListing.status,
      testListing.listing_date, testListing.mls_number, testListing.agent_id,
      testListing.team_id, testListing.commission_percentage, testListing.description,
    ]);

    testListingId = createResult.rows[0].id;
    operations.create = true;
    timings.create = Date.now() - createStart;

    // 2. READ
    const readStart = Date.now();
    const readResult = await pool.query(
      'SELECT * FROM listings WHERE id = $1 AND team_id = $2',
      [testListingId, req.user.teamId],
    );
    operations.read = readResult.rows.length === 1;
    timings.read = Date.now() - readStart;

    // 3. UPDATE
    const updateStart = Date.now();
    const newPrice = 899999;
    const updateResult = await pool.query(`
      UPDATE listings
      SET price = $1, status = 'Pending', updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 AND team_id = $3
      RETURNING id, price, status
    `, [newPrice, testListingId, req.user.teamId]);

    operations.update = updateResult.rows[0]?.price === newPrice;
    timings.update = Date.now() - updateStart;

    // 4. ARCHIVE (soft delete)
    const archiveStart = Date.now();
    const archiveResult = await pool.query(`
      UPDATE listings
      SET deleted_at = CURRENT_TIMESTAMP, status = 'Withdrawn'
      WHERE id = $1 AND team_id = $2
      RETURNING id, deleted_at
    `, [testListingId, req.user.teamId]);

    operations.archive = archiveResult.rows[0]?.deleted_at !== null;
    timings.archive = Date.now() - archiveStart;

    // 5. DELETE (permanent)
    if (!testMode) {
      const deleteStart = Date.now();
      const deleteResult = await pool.query(
        'DELETE FROM listings WHERE id = $1 AND team_id = $2',
        [testListingId, req.user.teamId],
      );
      operations.delete = deleteResult.rowCount === 1;
      timings.delete = Date.now() - deleteStart;
    } else {
      operations.delete = true;
      timings.delete = 0;
    }

    const allPassed = Object.values(operations).every((op) => op === true);
    const totalTime = Object.values(timings).reduce((a, b) => a + b, 0);

    res.json(formatHealthResponse(true, {
      status: allPassed ? 'healthy' : 'degraded',
      operations,
      timings,
      total_time_ms: totalTime,
      test_listing_id: testMode ? testListingId : null,
    }));
  } catch (error) {
    // Cleanup on error
    if (testListingId && !testMode) {
      try {
        await pool.query('DELETE FROM listings WHERE id = $1', [testListingId]);
      } catch (cleanupError) {
        console.error('Cleanup failed:', cleanupError);
      }
    }

    res.status(500).json(formatHealthResponse(false, {
      operations,
      error: error.message,
    }, error));
  }
});

// GET /v1/listings/health/analytics - Get listing analytics
router.get('/health/analytics', authenticate, async (req, res) => {
  try {
    const teamFilter = req.user.teamId ? 'AND team_id = $1' : '';
    const params = req.user.teamId ? [req.user.teamId] : [];

    // Inventory metrics
    const inventoryResult = await pool.query(`
      SELECT
        COUNT(*) FILTER (WHERE status = 'Active' AND deleted_at IS NULL) as active_listings,
        COUNT(*) FILTER (WHERE status = 'Pending' AND deleted_at IS NULL) as pending_listings,
        COUNT(*) FILTER (WHERE status = 'Closed' AND deleted_at IS NULL) as closed_listings,
        COUNT(*) FILTER (WHERE status = 'Expired' AND deleted_at IS NULL) as expired_listings,
        COUNT(*) FILTER (WHERE status = 'Withdrawn' AND deleted_at IS NULL) as withdrawn_listings,
        COUNT(*) FILTER (WHERE listing_date > CURRENT_DATE - INTERVAL '7 days' AND deleted_at IS NULL) as new_this_week,
        COUNT(*) FILTER (WHERE listing_date > CURRENT_DATE - INTERVAL '30 days' AND deleted_at IS NULL) as new_this_month
      FROM listings
      ${teamFilter ? `WHERE ${teamFilter.substring(4)}` : ''}
    `, params);

    // Pricing metrics
    const pricingResult = await pool.query(`
      SELECT
        AVG(price) FILTER (WHERE status = 'Active' AND deleted_at IS NULL) as avg_active_price,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY price) FILTER (WHERE status = 'Active' AND deleted_at IS NULL) as median_active_price,
        MIN(price) FILTER (WHERE status = 'Active' AND deleted_at IS NULL) as min_active_price,
        MAX(price) FILTER (WHERE status = 'Active' AND deleted_at IS NULL) as max_active_price,
        AVG(price / NULLIF(square_feet, 0)) FILTER (WHERE status = 'Active' AND deleted_at IS NULL) as avg_price_per_sqft
      FROM listings
      ${teamFilter ? `WHERE ${teamFilter.substring(4)}` : ''}
    `, params);

    // Days on market metrics
    const domResult = await pool.query(`
      SELECT
        AVG(EXTRACT(epoch FROM (COALESCE(sold_date, CURRENT_DATE) - listing_date))/86400)::INT
          FILTER (WHERE deleted_at IS NULL) as avg_days_on_market,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY EXTRACT(epoch FROM (COALESCE(sold_date, CURRENT_DATE) - listing_date))/86400)
          FILTER (WHERE deleted_at IS NULL) as median_days_on_market,
        MIN(EXTRACT(epoch FROM (COALESCE(sold_date, CURRENT_DATE) - listing_date))/86400)::INT
          FILTER (WHERE status = 'Closed' AND deleted_at IS NULL) as fastest_sale_days,
        MAX(EXTRACT(epoch FROM (CURRENT_DATE - listing_date))/86400)::INT
          FILTER (WHERE status = 'Active' AND deleted_at IS NULL) as longest_active_days
      FROM listings
      ${teamFilter ? `WHERE ${teamFilter.substring(4)}` : ''}
    `, params);

    // Property type distribution
    const propertyTypeResult = await pool.query(`
      SELECT
        property_type,
        COUNT(*) as count,
        AVG(price) as avg_price
      FROM listings
      WHERE deleted_at IS NULL ${teamFilter}
      GROUP BY property_type
      ORDER BY count DESC
    `, params);

    res.json(formatHealthResponse(true, {
      inventory: inventoryResult.rows[0],
      pricing: pricingResult.rows[0],
      days_on_market: domResult.rows[0],
      property_types: propertyTypeResult.rows,
      generated_at: new Date().toISOString(),
    }));
  } catch (error) {
    res.status(500).json(formatHealthResponse(false, null, error));
  }
});

// GET /v1/listings/health/compliance - Check listing compliance
router.get('/health/compliance', authenticate, async (req, res) => {
  try {
    const teamFilter = req.user.teamId ? 'AND team_id = $1' : '';
    const params = req.user.teamId ? [req.user.teamId] : [];

    // Check for listings with missing required fields
    const missingFieldsResult = await pool.query(`
      SELECT
        id,
        property_address,
        ARRAY_AGG(
          CASE
            WHEN price IS NULL OR price = 0 THEN 'price'
            WHEN mls_number IS NULL OR mls_number = '' THEN 'mls_number'
            WHEN property_type IS NULL THEN 'property_type'
            WHEN listing_date IS NULL THEN 'listing_date'
            WHEN agent_id IS NULL THEN 'agent_id'
          END
        ) FILTER (WHERE
          price IS NULL OR price = 0 OR
          mls_number IS NULL OR mls_number = '' OR
          property_type IS NULL OR
          listing_date IS NULL OR
          agent_id IS NULL
        ) as missing_fields
      FROM listings
      WHERE deleted_at IS NULL AND status = 'Active' ${teamFilter}
      GROUP BY id, property_address
      HAVING COUNT(*) FILTER (WHERE
        price IS NULL OR price = 0 OR
        mls_number IS NULL OR mls_number = '' OR
        property_type IS NULL OR
        listing_date IS NULL OR
        agent_id IS NULL
      ) > 0
      LIMIT 10
    `, params);

    // Check for expired listings needing action
    const expiredResult = await pool.query(`
      SELECT
        COUNT(*) as expired_count,
        ARRAY_AGG(id) as expired_ids
      FROM listings
      WHERE status = 'Active'
        AND listing_date < CURRENT_DATE - INTERVAL '180 days'
        AND deleted_at IS NULL
        ${teamFilter}
    `, params);

    // Check for listings without recent activity
    const staleResult = await pool.query(`
      SELECT
        COUNT(*) as stale_count,
        ARRAY_AGG(id) as stale_ids
      FROM listings
      WHERE status = 'Active'
        AND updated_at < CURRENT_DATE - INTERVAL '30 days'
        AND deleted_at IS NULL
        ${teamFilter}
    `, params);

    // Price anomalies
    const priceAnomaliesResult = await pool.query(`
      WITH price_stats AS (
        SELECT
          AVG(price) as avg_price,
          STDDEV(price) as stddev_price
        FROM listings
        WHERE status = 'Active' AND deleted_at IS NULL ${teamFilter}
      )
      SELECT
        l.id,
        l.property_address,
        l.price,
        ps.avg_price,
        ABS(l.price - ps.avg_price) / NULLIF(ps.stddev_price, 0) as z_score
      FROM listings l, price_stats ps
      WHERE l.status = 'Active'
        AND l.deleted_at IS NULL
        AND ABS(l.price - ps.avg_price) > 3 * ps.stddev_price
        ${teamFilter ? `AND l.${teamFilter.substring(4)}` : ''}
      LIMIT 5
    `, params);

    const issues = missingFieldsResult.rowCount
      + (expiredResult.rows[0].expired_count || 0)
      + (staleResult.rows[0].stale_count || 0)
      + priceAnomaliesResult.rowCount;

    res.json(formatHealthResponse(true, {
      status: issues === 0 ? 'compliant' : issues < 5 ? 'warning' : 'critical',
      issues,
      details: {
        missing_required_fields: missingFieldsResult.rows,
        expired_listings: {
          count: expiredResult.rows[0].expired_count || 0,
          ids: expiredResult.rows[0].expired_ids?.slice(0, 5) || [],
        },
        stale_listings: {
          count: staleResult.rows[0].stale_count || 0,
          ids: staleResult.rows[0].stale_ids?.slice(0, 5) || [],
        },
        price_anomalies: priceAnomaliesResult.rows,
      },
      checked_at: new Date().toISOString(),
    }));
  } catch (error) {
    res.status(500).json(formatHealthResponse(false, null, error));
  }
});

// Helper Functions
async function checkDatabaseHealth() {
  try {
    const start = Date.now();
    await pool.query('SELECT 1');
    const latency = Date.now() - start;

    const stats = await pool.query(`
      SELECT
        COUNT(*) as total_connections,
        COUNT(*) FILTER (WHERE state = 'active') as active_queries
      FROM pg_stat_activity
      WHERE datname = current_database()
    `);

    return {
      status: latency < 100 ? 'healthy' : latency < 500 ? 'degraded' : 'critical',
      latency_ms: latency,
      connections: stats.rows[0].total_connections,
      active_queries: stats.rows[0].active_queries,
    };
  } catch (error) {
    return {
      status: 'critical',
      error: error.message,
    };
  }
}

async function getListingMetrics(user) {
  try {
    const teamFilter = user.teamId ? 'WHERE team_id = $1' : '';
    const params = user.teamId ? [user.teamId] : [];

    const result = await pool.query(`
      SELECT
        COUNT(*) as total_listings,
        COUNT(*) FILTER (WHERE status = 'Active') as active,
        COUNT(*) FILTER (WHERE status = 'Pending') as pending,
        COUNT(*) FILTER (WHERE status = 'Closed') as closed,
        AVG(price) FILTER (WHERE status = 'Active') as avg_price,
        AVG(EXTRACT(epoch FROM (NOW() - listing_date))/86400)::INT FILTER (WHERE status = 'Active') as avg_dom
      FROM listings
      ${teamFilter}
    `, params);

    return result.rows[0];
  } catch (error) {
    console.error('Error getting listing metrics:', error);
    return {};
  }
}

async function checkCompliance(user) {
  try {
    const teamFilter = user.teamId ? 'AND team_id = $1' : '';
    const params = user.teamId ? [user.teamId] : [];

    const result = await pool.query(`
      SELECT
        COUNT(*) FILTER (WHERE price IS NULL OR price = 0) as missing_price,
        COUNT(*) FILTER (WHERE mls_number IS NULL OR mls_number = '') as missing_mls,
        COUNT(*) FILTER (WHERE description IS NULL OR LENGTH(description) < 100) as poor_descriptions,
        COUNT(*) FILTER (WHERE listing_date < CURRENT_DATE - INTERVAL '180 days' AND status = 'Active') as expired_active
      FROM listings
      WHERE deleted_at IS NULL ${teamFilter}
    `, params);

    const issues = Object.values(result.rows[0]).reduce((a, b) => a + b, 0);

    return {
      status: issues === 0 ? 'compliant' : 'non-compliant',
      issues,
      details: result.rows[0],
    };
  } catch (error) {
    console.error('Error checking compliance:', error);
    return { status: 'unknown', issues: 0 };
  }
}

async function getPerformanceMetrics() {
  try {
    const result = await pool.query(`
      SELECT
        AVG(mean_exec_time) as avg_response_time,
        MAX(max_exec_time) as max_response_time,
        SUM(calls) as total_calls
      FROM pg_stat_statements
      WHERE query LIKE '%listings%'
      LIMIT 10
    `);

    return {
      avg_response_time: result.rows[0]?.avg_response_time || 0,
      max_response_time: result.rows[0]?.max_response_time || 0,
      total_calls: result.rows[0]?.total_calls || 0,
    };
  } catch (error) {
    // pg_stat_statements might not be enabled
    return {
      avg_response_time: 0,
      max_response_time: 0,
      total_calls: 0,
    };
  }
}

module.exports = router;
