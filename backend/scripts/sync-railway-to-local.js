#!/usr/bin/env node

const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

// Railway production database
const railwayPool = new Pool({
  connectionString: 'postgresql://postgres:ueLIWnvALZWVbRdnOmpLGsrrukeGLGQQ@ballast.proxy.rlwy.net:20017/railway'
});

async function syncToLocal() {
  const client = await railwayPool.connect();
  
  try {
    console.log('Syncing Railway database to match local...\n');
    
    await client.query('BEGIN');
    
    // 1. Delete test users that don't exist in local
    console.log('1. Removing test users...');
    const deleteResult = await client.query(`
      DELETE FROM users 
      WHERE email IN ('agent@test.com', 'broker@test.com', 'assistant@test.com')
      RETURNING email;
    `);
    console.log(`   Deleted ${deleteResult.rowCount} test users`);
    
    // 2. Delete all listings to match local (0 listings)
    console.log('\n2. Removing listings to match local...');
    const listingsResult = await client.query('DELETE FROM listings RETURNING id;');
    console.log(`   Deleted ${listingsResult.rowCount} listings`);
    
    // 3. Update users to ensure they match local
    console.log('\n3. Verifying user accounts...');
    
    // Check admin user
    const adminResult = await client.query(
      `SELECT username, email, role FROM users WHERE username = 'admin'`
    );
    if (adminResult.rows.length > 0) {
      console.log(`   ✓ Admin user exists: ${adminResult.rows[0].email}`);
    }
    
    // Check jaydenmetz user
    const jaydenResult = await client.query(
      `SELECT username, email, role, team_id FROM users WHERE username = 'jaydenmetz'`
    );
    if (jaydenResult.rows.length > 0) {
      console.log(`   ✓ Jaydenmetz user exists: ${jaydenResult.rows[0].email}`);
      
      // Get the team ID for Jayden Metz Real Estate
      const teamResult = await client.query(
        `SELECT team_id FROM teams WHERE name = 'Jayden Metz Real Estate'`
      );
      
      if (teamResult.rows.length > 0 && !jaydenResult.rows[0].team_id) {
        // Assign jaydenmetz to the team
        await client.query(
          `UPDATE users SET team_id = $1 WHERE username = 'jaydenmetz'`,
          [teamResult.rows[0].team_id]
        );
        console.log(`   ✓ Assigned jaydenmetz to Jayden Metz Real Estate team`);
      }
    }
    
    // 4. Delete Demo Team if it exists
    console.log('\n4. Checking for Demo Team...');
    const demoTeamResult = await client.query(
      `DELETE FROM teams WHERE name = 'Demo Team' RETURNING name;`
    );
    if (demoTeamResult.rowCount > 0) {
      console.log(`   Deleted Demo Team`);
    } else {
      console.log(`   Demo Team not found (already removed)`);
    }
    
    // 5. Show final state
    console.log('\n5. Final database state:');
    
    const finalUsers = await client.query('SELECT COUNT(*) as count FROM users');
    const finalTeams = await client.query('SELECT COUNT(*) as count FROM teams');
    const finalEscrows = await client.query('SELECT COUNT(*) as count FROM escrows');
    const finalListings = await client.query('SELECT COUNT(*) as count FROM listings');
    
    console.log(`   Users: ${finalUsers.rows[0].count} (should be 2)`);
    console.log(`   Teams: ${finalTeams.rows[0].count} (should be 1)`);
    console.log(`   Escrows: ${finalEscrows.rows[0].count} (should be 3)`);
    console.log(`   Listings: ${finalListings.rows[0].count} (should be 0)`);
    
    await client.query('COMMIT');
    console.log('\n✅ Railway database synced to match local!');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error syncing database:', error);
    throw error;
  } finally {
    client.release();
    await railwayPool.end();
  }
}

syncToLocal().catch(console.error);