-- Production Migration Script for Escrows
-- This script safely migrates the escrows schema for production use

-- Step 1: Backup existing data (run this manually first!)
-- pg_dump -U postgres -d realestate_crm -t escrows -t escrow_buyers -t escrow_sellers > escrows_backup.sql

BEGIN;

-- Step 2: Add new columns if they don't exist
DO $$
BEGIN
    -- Add buyer columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'escrows' AND column_name = 'buyer_name') THEN
        ALTER TABLE escrows ADD COLUMN buyer_name VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'escrows' AND column_name = 'buyer_email') THEN
        ALTER TABLE escrows ADD COLUMN buyer_email VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'escrows' AND column_name = 'buyer_phone') THEN
        ALTER TABLE escrows ADD COLUMN buyer_phone VARCHAR(20);
    END IF;
    
    -- Add seller columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'escrows' AND column_name = 'seller_name') THEN
        ALTER TABLE escrows ADD COLUMN seller_name VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'escrows' AND column_name = 'seller_email') THEN
        ALTER TABLE escrows ADD COLUMN seller_email VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'escrows' AND column_name = 'seller_phone') THEN
        ALTER TABLE escrows ADD COLUMN seller_phone VARCHAR(20);
    END IF;
    
    -- Add additional columns
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'escrows' AND column_name = 'escrow_number') THEN
        ALTER TABLE escrows ADD COLUMN escrow_number VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'escrows' AND column_name = 'transaction_type') THEN
        ALTER TABLE escrows ADD COLUMN transaction_type VARCHAR(50) DEFAULT 'Purchase';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'escrows' AND column_name = 'priority_level') THEN
        ALTER TABLE escrows ADD COLUMN priority_level VARCHAR(20) DEFAULT 'normal';
    END IF;
END $$;

-- Step 3: Migrate data from buyer/seller tables if they exist
DO $$
BEGIN
    -- Check if escrow_buyers table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables 
               WHERE table_name = 'escrow_buyers') THEN
        -- Update buyer information
        UPDATE escrows e
        SET 
          buyer_name = b.name,
          buyer_email = b.email,
          buyer_phone = b.phone
        FROM escrow_buyers b
        WHERE e.id = b.escrow_id
        AND e.buyer_name IS NULL;  -- Only update if not already set
    END IF;
    
    -- Check if escrow_sellers table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables 
               WHERE table_name = 'escrow_sellers') THEN
        -- Update seller information
        UPDATE escrows e
        SET 
          seller_name = s.name,
          seller_email = s.email,
          seller_phone = s.phone
        FROM escrow_sellers s
        WHERE e.id = s.escrow_id
        AND e.seller_name IS NULL;  -- Only update if not already set
    END IF;
END $$;

-- Step 4: Update escrow_number from ID if needed
UPDATE escrows
SET escrow_number = SUBSTRING(id FROM '[0-9]+$')
WHERE escrow_number IS NULL;

-- Step 5: Set transaction types based on status
UPDATE escrows
SET transaction_type = CASE 
    WHEN escrow_status = 'Active' THEN 'Purchase'
    WHEN escrow_status = 'Pending' THEN 'Sale'
    WHEN escrow_status = 'Closed' THEN 'Purchase & Sale'
    ELSE 'Refinance'
END
WHERE transaction_type = 'Purchase' OR transaction_type IS NULL;

-- Step 6: Update priority levels based on closing date
UPDATE escrows
SET priority_level = CASE 
    WHEN closing_date IS NOT NULL AND DATE_PART('day', closing_date::timestamp - CURRENT_TIMESTAMP) < 7 THEN 'high'
    ELSE 'normal'
END
WHERE priority_level IS NULL;

-- Step 7: Drop the old tables (ONLY after confirming data is migrated!)
-- Uncomment these lines only after verifying the data migration was successful
-- DROP TABLE IF EXISTS escrow_buyers CASCADE;
-- DROP TABLE IF EXISTS escrow_sellers CASCADE;

COMMIT;

-- Verification queries (run these after migration)
-- SELECT COUNT(*) as total_escrows FROM escrows;
-- SELECT COUNT(*) as escrows_with_buyers FROM escrows WHERE buyer_name IS NOT NULL;
-- SELECT COUNT(*) as escrows_with_sellers FROM escrows WHERE seller_name IS NOT NULL;
-- SELECT id, property_address, buyer_name, seller_name FROM escrows LIMIT 5;