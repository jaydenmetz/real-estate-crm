# Backend Scripts Directory

Organized collection of operational, testing, and maintenance scripts for the Real Estate CRM backend.

## Directory Structure

### 📁 `auth/` - Authentication & User Management
Scripts for managing authentication, users, and credentials.

**Testing:**
- `test-auth-local.js` - Test authentication against local database
- `test-login.js` - Test login functionality
- `test-login-directly.js` - Direct login query testing
- `test-production-login.js` - Test production login
- `test-railway-auth.js` - Test Railway database authentication
- `test-railway-connection.js` - Test Railway database connection
- `debug-login-query.js` - Debug login SQL queries

**Admin Operations:**
- `create-admin-user.js` - Create system admin user
- `fix-admin-login.js` - Fix admin login issues
- `reset-admin-password-production.js` - Reset admin password in production
- `verify-admin-user.js` - Verify admin user exists and has correct permissions
- `verify-password.js` - Verify password hashing

**Security:**
- `generate-secure-keys.js` - Generate secure API keys and secrets

---

### 📁 `database/` - Database Operations
Scripts for database schema management, migrations, and validation.

**Schema Checks:**
- `check-clients-table.js` - Verify clients table structure
- `check-contacts-table.js` - Verify contacts table structure
- `check-data.js` - General data integrity checks
- `check-env-production.js` - Verify production environment variables
- `check-production-db.js` - Check production database health
- `check-production-schema.js` - Verify production schema matches expected structure
- `check-table-structures.js` - Compare table structures across environments
- `check-users-table.js` - Verify users table structure

**Migrations & Setup:**
- `add-unique-constraints.sql` - Add unique constraints to tables
- `ensure-timestamp-fields.sql` - Ensure all tables have created_at/updated_at
- `fix-escrow-ids.sql` - Fix escrow ID format issues
- `fix-null-dates.sql` - Fix null date values
- `setup-broker-example.sql` - Set up example broker data
- `standardize-escrow-ids.sql` - Standardize escrow ID format
- `create-profile-settings-tables.js` - Create user profile settings tables
- `create-teams-table.js` - Create teams table
- `setup-multi-tenant-users.js` - Set up multi-tenant user structure
- `setup-teams-and-escrow-ids.js` - Initialize teams and escrow ID system

**Synchronization:**
- `sync-database-structure.js` - Sync database structure between environments
- `sync-local-with-production.js` - Sync local database with production
- `sync-railway-to-local.js` - Sync Railway database to local
- `reset-databases.js` - Reset local database to clean state

---

### 📁 `data/` - Data Seeding & Population
Scripts for importing, generating, and populating test/production data.

**Escrow Data:**
- `add-basic-escrows.js` - Add basic escrow records
- `add-escrow-example.js` - Add example escrow
- `add-escrow-to-production.js` - Add escrow to production database
- `add-new-escrow.js` - Add single new escrow
- `add-new-escrows.js` - Bulk add new escrows
- `import-escrows.js` - Import escrows from external source
- `import-real-escrows.js` - Import real production escrows

**General Data:**
- `addFillerData.js` - Generate filler/demo data
- `seed-identical-data.js` - Seed identical data across environments
- `populate-checklists.js` - Populate escrow checklists
- `populate-clients.js` - Populate client records
- `populate-complete-escrow-data.js` - Populate complete escrow data with all fields
- `populate-escrow-helpers.js` - Helper functions for populating escrows

---

### 📁 `production/` - Production Operations
Scripts for production deployment, maintenance, and updates.

**Deployment:**
- `add-to-railway.sh` - Deploy to Railway
- `run-production-migrations.js` - Run migrations against production
- `setup-env.sh` - Set up environment variables
- `switch-env.sh` - Switch between environments

**Maintenance:**
- `restore-database.sh` - Restore database from backup
- `update-escrow-commissions.js` - Update escrow commission calculations
- `update-production-commissions.js` - Update production escrow commissions
- `update-zillow-images.js` - Update Zillow property images

---

### 📁 `testing/` - Testing & Debugging
Manual testing scripts and debugging utilities.

- `add-test-checklist.js` - Add test checklist items
- `create-test-escrow.js` - Create test escrow record
- `list-all-data.js` - List all data in database for inspection
- `test-stats-query.js` - Test statistics query performance
- `quick-add-railway-escrow.js` - Quickly add escrow to Railway database

---

### 📁 `archive/` - Deprecated/Obsolete Scripts
Old scripts kept for reference but no longer actively used.

**Obsolete ID System:**
- `implement-universal-id-system.js` - Old universal ID implementation (replaced)
- `implement-universal-id-system-fixed.js` - Fixed version (no longer needed)
- `setup-id-triggers.js` - Database triggers for old ID system
- `setup-local-database-clean.js` - Old local setup script
- `demonstrate-id-system.js` - Demo of old ID system
- `update-prefixes-safely.js` - Old prefix update script
- `update-to-full-prefixes.js` - Migration to full prefixes (completed)
- `add-username-column.js` - Old migration to add username column (completed)

---

## Usage Guidelines

### Running Scripts

**Local Development:**
```bash
# Run from backend/scripts directory
cd backend/scripts
node auth/test-login.js
```

**Production Operations:**
```bash
# ALWAYS verify you're targeting the correct environment
# Production scripts should be run with extreme caution
cd backend/scripts
node production/run-production-migrations.js
```

### Environment Variables

Most scripts require environment variables:
- `DATABASE_URL` or individual `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`
- See `.env.example` for required variables

### Safety Notes

⚠️ **IMPORTANT:**
- **Always backup before running production scripts**
- **Test in local environment first**
- **Verify environment variables before execution**
- **Archive folder scripts may not work with current schema**

---

## Maintenance

### Adding New Scripts

1. Place script in appropriate category folder
2. Add descriptive comment at top of file
3. Update this README with script description
4. Follow naming convention: `verb-noun.js` (e.g., `create-admin-user.js`)

### Deprecating Scripts

1. Move to `archive/` folder with `git mv`
2. Add note to this README in Archive section
3. Include reason and date deprecated

---

## Quick Reference

| Task | Script |
|------|--------|
| Test login | `auth/test-login.js` |
| Create admin | `auth/create-admin-user.js` |
| Check production DB | `database/check-production-db.js` |
| Sync to local | `database/sync-railway-to-local.js` |
| Add test data | `data/addFillerData.js` |
| Deploy to Railway | `production/add-to-railway.sh` |
| Run migrations | `production/run-production-migrations.js` |

---

**Last Updated:** October 6, 2025
**Total Scripts:** 71 (7 folders + archive)
