-- Add entity-specific prefixes to UUID IDs for better readability
-- escrow- for escrows, listing- for listings, client- for clients, etc.

-- Create functions to generate prefixed IDs for each entity type
CREATE OR REPLACE FUNCTION generate_escrow_id()
RETURNS TEXT AS $$
BEGIN
  RETURN 'escrow-' || gen_random_uuid()::text;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generate_listing_id()
RETURNS TEXT AS $$
BEGIN
  RETURN 'listing-' || gen_random_uuid()::text;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generate_client_id()
RETURNS TEXT AS $$
BEGIN
  RETURN 'client-' || gen_random_uuid()::text;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generate_lead_id()
RETURNS TEXT AS $$
BEGIN
  RETURN 'lead-' || gen_random_uuid()::text;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generate_appointment_id()
RETURNS TEXT AS $$
BEGIN
  RETURN 'appt-' || gen_random_uuid()::text;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION generate_user_id()
RETURNS TEXT AS $$
BEGIN
  RETURN 'user-' || gen_random_uuid()::text;
END;
$$ LANGUAGE plpgsql;

-- Update ESCROWS table
ALTER TABLE escrows ALTER COLUMN id TYPE TEXT USING id::text;
UPDATE escrows 
SET id = 'escrow-' || id
WHERE id NOT LIKE 'escrow-%';
ALTER TABLE escrows ALTER COLUMN id SET DEFAULT generate_escrow_id();

-- Update LISTINGS table (if it exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'listings') THEN
    ALTER TABLE listings ALTER COLUMN id TYPE TEXT USING id::text;
    UPDATE listings 
    SET id = 'listing-' || id
    WHERE id NOT LIKE 'listing-%';
    ALTER TABLE listings ALTER COLUMN id SET DEFAULT generate_listing_id();
  END IF;
END $$;

-- Update CLIENTS table (if it exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'clients') THEN
    ALTER TABLE clients ALTER COLUMN id TYPE TEXT USING id::text;
    UPDATE clients 
    SET id = 'client-' || id
    WHERE id NOT LIKE 'client-%';
    ALTER TABLE clients ALTER COLUMN id SET DEFAULT generate_client_id();
  END IF;
END $$;

-- Update LEADS table (if it exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'leads') THEN
    ALTER TABLE leads ALTER COLUMN id TYPE TEXT USING id::text;
    UPDATE leads 
    SET id = 'lead-' || id
    WHERE id NOT LIKE 'lead-%';
    ALTER TABLE leads ALTER COLUMN id SET DEFAULT generate_lead_id();
  END IF;
END $$;

-- Update APPOINTMENTS table (if it exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'appointments') THEN
    ALTER TABLE appointments ALTER COLUMN id TYPE TEXT USING id::text;
    UPDATE appointments 
    SET id = 'appt-' || id
    WHERE id NOT LIKE 'appt-%';
    ALTER TABLE appointments ALTER COLUMN id SET DEFAULT generate_appointment_id();
  END IF;
END $$;

-- Update USERS table (if it exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
    ALTER TABLE users ALTER COLUMN id TYPE TEXT USING id::text;
    UPDATE users 
    SET id = 'user-' || id
    WHERE id NOT LIKE 'user-%';
    ALTER TABLE users ALTER COLUMN id SET DEFAULT generate_user_id();
  END IF;
END $$;

-- Update foreign key references in escrow helper tables
UPDATE escrow_checklists 
SET escrow_id = 'escrow-' || escrow_id
WHERE escrow_id NOT LIKE 'escrow-%' 
AND LENGTH(escrow_id) = 36; -- Standard UUID length

UPDATE escrow_timeline 
SET escrow_id = 'escrow-' || escrow_id
WHERE escrow_id NOT LIKE 'escrow-%'
AND LENGTH(escrow_id) = 36;

UPDATE escrow_financials 
SET escrow_id = 'escrow-' || escrow_id
WHERE escrow_id NOT LIKE 'escrow-%'
AND LENGTH(escrow_id) = 36;

UPDATE escrow_documents 
SET escrow_id = 'escrow-' || escrow_id
WHERE escrow_id NOT LIKE 'escrow-%'
AND LENGTH(escrow_id) = 36;

-- Add comments explaining the prefixes
COMMENT ON COLUMN escrows.id IS 'Primary key - UUID with escrow- prefix';
COMMENT ON FUNCTION generate_escrow_id() IS 'Generates UUID with escrow- prefix';
COMMENT ON FUNCTION generate_listing_id() IS 'Generates UUID with listing- prefix';
COMMENT ON FUNCTION generate_client_id() IS 'Generates UUID with client- prefix';
COMMENT ON FUNCTION generate_lead_id() IS 'Generates UUID with lead- prefix';
COMMENT ON FUNCTION generate_appointment_id() IS 'Generates UUID with appt- prefix';
COMMENT ON FUNCTION generate_user_id() IS 'Generates UUID with user- prefix';

-- Verify the results for escrows
SELECT 
  'Entity prefixes added successfully' as status,
  COUNT(*) as total_escrows,
  COUNT(*) FILTER (WHERE id LIKE 'escrow-%') as escrows_with_prefix
FROM escrows;

-- Show sample data with new prefixed IDs
SELECT 'Escrows' as entity_type, id, numeric_id, display_id
FROM escrows
ORDER BY numeric_id
LIMIT 3;