-- Add commission_type column to escrows table
ALTER TABLE escrows 
ADD COLUMN commission_type VARCHAR(20) DEFAULT 'percentage' CHECK (commission_type IN ('percentage', 'flat'));

-- Set existing rows based on current data
-- If commission_percentage is set and > 0, mark as percentage
-- Otherwise if my_commission is set and > 0, mark as flat
-- Otherwise default to percentage
UPDATE escrows 
SET commission_type = CASE 
  WHEN commission_percentage IS NOT NULL AND commission_percentage > 0 THEN 'percentage'
  WHEN my_commission IS NOT NULL AND my_commission > 0 THEN 'flat'
  ELSE 'percentage'
END;
