-- Simplify escrows schema - merge buyer/seller data into main table

-- First, add columns for buyer and seller information to escrows table
ALTER TABLE escrows 
ADD COLUMN IF NOT EXISTS buyer_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS buyer_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS buyer_phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS seller_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS seller_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS seller_phone VARCHAR(20);

-- Copy buyer/seller data into the escrows table
UPDATE escrows e
SET 
  buyer_name = b.name,
  buyer_email = b.email,
  buyer_phone = b.phone
FROM escrow_buyers b
WHERE e.id = b.escrow_id;

UPDATE escrows e
SET 
  seller_name = s.name,
  seller_email = s.email,
  seller_phone = s.phone
FROM escrow_sellers s
WHERE e.id = s.escrow_id;

-- Drop foreign key constraints
ALTER TABLE escrow_buyers DROP CONSTRAINT IF EXISTS escrow_buyers_escrow_id_fkey;
ALTER TABLE escrow_sellers DROP CONSTRAINT IF EXISTS escrow_sellers_escrow_id_fkey;

-- Drop the buyer and seller tables
DROP TABLE IF EXISTS escrow_buyers;
DROP TABLE IF EXISTS escrow_sellers;

-- Add some additional useful columns
ALTER TABLE escrows
ADD COLUMN IF NOT EXISTS escrow_number VARCHAR(50),
ADD COLUMN IF NOT EXISTS transaction_type VARCHAR(50) DEFAULT 'Purchase',
ADD COLUMN IF NOT EXISTS priority_level VARCHAR(20) DEFAULT 'normal';

-- Update escrow_number from ID
UPDATE escrows
SET escrow_number = SUBSTRING(id FROM '[0-9]+$')
WHERE escrow_number IS NULL;

-- Update transaction types based on status
UPDATE escrows
SET transaction_type = CASE 
    WHEN escrow_status = 'Active' THEN 'Purchase'
    WHEN escrow_status = 'Pending' THEN 'Sale'
    WHEN escrow_status = 'Closed' THEN 'Purchase & Sale'
    ELSE 'Refinance'
END
WHERE transaction_type = 'Purchase';

-- Update priority levels based on closing date
UPDATE escrows
SET priority_level = CASE 
    WHEN closing_date IS NOT NULL AND DATE_PART('day', closing_date::timestamp - CURRENT_TIMESTAMP) < 7 THEN 'high'
    ELSE 'normal'
END;