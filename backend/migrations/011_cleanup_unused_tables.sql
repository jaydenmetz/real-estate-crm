-- Cleanup unused tables from the database
-- These tables are no longer needed in the application

-- Drop AI/Agent related tables
DROP TABLE IF EXISTS ai_agents CASCADE;
DROP TABLE IF EXISTS contact_agents CASCADE;

-- Drop checklist related tables
DROP TABLE IF EXISTS checklist_templates CASCADE;
DROP TABLE IF EXISTS escrow_checklist CASCADE;
DROP TABLE IF EXISTS escrow_checklists CASCADE;
DROP TABLE IF EXISTS listing_marketing_checklist CASCADE;

-- Drop old client/contact tables
DROP TABLE IF EXISTS clients_old CASCADE;
DROP TABLE IF EXISTS contact_clients CASCADE;
DROP TABLE IF EXISTS contact_escrows CASCADE;

-- Drop old escrow related tables
DROP TABLE IF EXISTS escrow_buyers_old CASCADE;
DROP TABLE IF EXISTS escrow_documents CASCADE;
DROP TABLE IF EXISTS escrow_financials CASCADE;
DROP TABLE IF EXISTS escrow_participants CASCADE;
DROP TABLE IF EXISTS escrow_people CASCADE;
DROP TABLE IF EXISTS escrow_sellers_old CASCADE;
DROP TABLE IF EXISTS escrow_timeline CASCADE;

-- Drop listing analytics table
DROP TABLE IF EXISTS listing_analytics CASCADE;

-- Drop notes table
DROP TABLE IF EXISTS notes CASCADE;

-- Drop profile related tables
DROP TABLE IF EXISTS profile_statistics CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS user_settings CASCADE;

-- Log the cleanup
DO $$
BEGIN
    RAISE NOTICE 'Cleanup completed: Removed unused tables from the database';
END $$;