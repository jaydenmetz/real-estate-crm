-- Migration: Add financial data to existing escrows
-- This adds realistic financial data to escrows that have NULL or 0 values

-- Update escrows with NULL or 0 purchase_price
UPDATE escrows
SET 
  purchase_price = CASE
    WHEN property_type = 'Condo' THEN 850000 + (RANDOM() * 500000)::integer
    WHEN property_type = 'Single Family' THEN 1200000 + (RANDOM() * 800000)::integer
    WHEN property_type = 'Townhouse' THEN 950000 + (RANDOM() * 400000)::integer
    ELSE 1000000 + (RANDOM() * 500000)::integer
  END,
  down_payment = CASE
    WHEN property_type = 'Condo' THEN 170000 + (RANDOM() * 100000)::integer
    WHEN property_type = 'Single Family' THEN 240000 + (RANDOM() * 160000)::integer
    WHEN property_type = 'Townhouse' THEN 190000 + (RANDOM() * 80000)::integer
    ELSE 200000 + (RANDOM() * 100000)::integer
  END,
  earnest_money = 25000 + (RANDOM() * 25000)::integer,
  earnest_money_deposit = 25000 + (RANDOM() * 25000)::integer,
  updated_at = NOW()
WHERE purchase_price IS NULL OR purchase_price = 0;

-- Update loan_amount based on purchase_price and down_payment
UPDATE escrows
SET 
  loan_amount = purchase_price - down_payment,
  updated_at = NOW()
WHERE loan_amount IS NULL OR loan_amount = 0;

-- Update commission fields
UPDATE escrows
SET
  commission_percentage = CASE
    WHEN commission_percentage IS NULL OR commission_percentage = 0 THEN 2.5
    ELSE commission_percentage
  END,
  buyer_side_commission = CASE
    WHEN buyer_side_commission IS NULL OR buyer_side_commission = 0 THEN 2.5
    ELSE buyer_side_commission
  END,
  listing_side_commission = CASE
    WHEN listing_side_commission IS NULL OR listing_side_commission = 0 THEN 2.5
    ELSE listing_side_commission
  END,
  updated_at = NOW()
WHERE commission_percentage IS NULL OR commission_percentage = 0
   OR buyer_side_commission IS NULL OR buyer_side_commission = 0;

-- Update commission amounts based on percentages
UPDATE escrows
SET
  gross_commission = purchase_price * (COALESCE(commission_percentage, 2.5) / 100),
  total_commission = purchase_price * (COALESCE(commission_percentage, 2.5) / 100),
  net_commission = purchase_price * (COALESCE(buyer_side_commission, 2.5) / 100),
  my_commission = purchase_price * (COALESCE(buyer_side_commission, 2.5) / 100),
  updated_at = NOW()
WHERE gross_commission IS NULL OR gross_commission = 0
   OR total_commission IS NULL OR total_commission = 0
   OR net_commission IS NULL OR net_commission = 0;

-- Add specific values for ESCROW-2025-0002 if it exists
UPDATE escrows
SET
  purchase_price = 1250000,
  down_payment = 250000,
  loan_amount = 1000000,
  earnest_money = 25000,
  earnest_money_deposit = 25000,
  commission_percentage = 2.5,
  buyer_side_commission = 2.5,
  listing_side_commission = 2.5,
  gross_commission = 31250,
  total_commission = 31250,
  net_commission = 31250,
  my_commission = 31250,
  updated_at = NOW()
WHERE display_id = 'ESCROW-2025-0002';

-- Show results
SELECT 
  display_id,
  property_address,
  purchase_price,
  down_payment,
  loan_amount,
  my_commission
FROM escrows
WHERE display_id IN ('ESCROW-2025-0001', 'ESCROW-2025-0002', 'ESCROW-2025-0003')
ORDER BY display_id;