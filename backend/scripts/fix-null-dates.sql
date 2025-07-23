-- Fix any NULL date values in escrows table
-- This prevents "Invalid time value" errors in the frontend

-- Update any NULL acceptance_date to a default value (created_at or current date)
UPDATE escrows 
SET acceptance_date = COALESCE(created_at::date, CURRENT_DATE)
WHERE acceptance_date IS NULL;

-- Update any NULL closing_date to 30 days from acceptance_date
UPDATE escrows 
SET closing_date = acceptance_date + INTERVAL '30 days'
WHERE closing_date IS NULL;

-- Verify no NULL dates remain
SELECT 
  COUNT(*) as total_escrows,
  COUNT(acceptance_date) as has_acceptance_date,
  COUNT(closing_date) as has_closing_date
FROM escrows;

-- Show any escrows with NULL dates (should be empty)
SELECT id, property_address, acceptance_date, closing_date 
FROM escrows 
WHERE acceptance_date IS NULL OR closing_date IS NULL;