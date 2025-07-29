-- Migration: Add company and officer fields to escrows table
-- This adds fields for escrow company, title company, lender, and officers

-- Add missing columns to escrows table
ALTER TABLE escrows 
ADD COLUMN IF NOT EXISTS escrow_company VARCHAR(255),
ADD COLUMN IF NOT EXISTS escrow_officer_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS escrow_officer_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS escrow_officer_phone VARCHAR(50),
ADD COLUMN IF NOT EXISTS title_company VARCHAR(255),
ADD COLUMN IF NOT EXISTS lender_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS loan_officer_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS loan_officer_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS loan_officer_phone VARCHAR(50),
ADD COLUMN IF NOT EXISTS property_image_url TEXT;

-- Update existing records with default values for demonstration
UPDATE escrows 
SET 
  escrow_company = CASE 
    WHEN display_id = 'ESCROW-2025-0001' THEN 'First American Title'
    WHEN display_id = 'ESCROW-2025-0002' THEN 'Chicago Title'
    WHEN display_id = 'ESCROW-2025-0003' THEN 'Stewart Title'
    ELSE 'First American Title'
  END,
  escrow_officer_name = CASE 
    WHEN display_id = 'ESCROW-2025-0001' THEN 'Jennifer Martinez'
    WHEN display_id = 'ESCROW-2025-0002' THEN 'Lisa Wilson'
    WHEN display_id = 'ESCROW-2025-0003' THEN 'Michael Chen'
    ELSE 'Lisa Wilson'
  END,
  escrow_officer_email = CASE 
    WHEN display_id = 'ESCROW-2025-0001' THEN 'jmartinez@firstamerican.com'
    WHEN display_id = 'ESCROW-2025-0002' THEN 'lisa.wilson@chicagotitle.com'
    WHEN display_id = 'ESCROW-2025-0003' THEN 'mchen@stewart.com'
    ELSE 'escrow@firstamerican.com'
  END,
  escrow_officer_phone = CASE 
    WHEN display_id = 'ESCROW-2025-0001' THEN '(619) 555-1001'
    WHEN display_id = 'ESCROW-2025-0002' THEN '(619) 555-0999'
    WHEN display_id = 'ESCROW-2025-0003' THEN '(619) 555-2003'
    ELSE '(619) 555-0999'
  END,
  title_company = CASE 
    WHEN display_id = 'ESCROW-2025-0001' THEN 'First American Title'
    WHEN display_id = 'ESCROW-2025-0002' THEN 'Chicago Title'
    WHEN display_id = 'ESCROW-2025-0003' THEN 'Stewart Title'
    ELSE 'Chicago Title'
  END,
  lender_name = CASE 
    WHEN display_id = 'ESCROW-2025-0001' THEN 'Wells Fargo Home Mortgage'
    WHEN display_id = 'ESCROW-2025-0002' THEN 'Bank of America'
    WHEN display_id = 'ESCROW-2025-0003' THEN 'Chase Home Finance'
    ELSE 'Wells Fargo Home Mortgage'
  END,
  loan_officer_name = CASE 
    WHEN display_id = 'ESCROW-2025-0001' THEN 'Robert Johnson'
    WHEN display_id = 'ESCROW-2025-0002' THEN 'Sarah Thompson'
    WHEN display_id = 'ESCROW-2025-0003' THEN 'David Lee'
    ELSE 'Sarah Thompson'
  END,
  loan_officer_email = CASE 
    WHEN display_id = 'ESCROW-2025-0001' THEN 'rjohnson@wellsfargo.com'
    WHEN display_id = 'ESCROW-2025-0002' THEN 'sthompson@bofa.com'
    WHEN display_id = 'ESCROW-2025-0003' THEN 'dlee@chase.com'
    ELSE 'loans@wellsfargo.com'
  END,
  loan_officer_phone = CASE 
    WHEN display_id = 'ESCROW-2025-0001' THEN '(858) 555-3001'
    WHEN display_id = 'ESCROW-2025-0002' THEN '(858) 555-3002'
    WHEN display_id = 'ESCROW-2025-0003' THEN '(858) 555-3003'
    ELSE '(858) 555-3000'
  END,
  property_image_url = CASE
    WHEN property_type = 'Condo' THEN 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800'
    WHEN property_type = 'Single Family' THEN 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800'
    WHEN property_type = 'Townhouse' THEN 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800'
    ELSE 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800'
  END
WHERE escrow_company IS NULL;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_escrows_escrow_company ON escrows(escrow_company);
CREATE INDEX IF NOT EXISTS idx_escrows_title_company ON escrows(title_company);
CREATE INDEX IF NOT EXISTS idx_escrows_lender_name ON escrows(lender_name);

-- Show results
SELECT 
  display_id,
  property_address,
  escrow_company,
  escrow_officer_name,
  title_company,
  lender_name,
  property_image_url
FROM escrows
WHERE display_id IN ('ESCROW-2025-0001', 'ESCROW-2025-0002', 'ESCROW-2025-0003')
ORDER BY display_id;