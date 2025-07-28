-- Create views that show UUIDs with entity prefixes
-- This allows us to keep UUID column types while displaying prefixed IDs

-- Create view for escrows with prefixed IDs
CREATE OR REPLACE VIEW escrows_with_prefix AS
SELECT 
  CONCAT('escrow-', id)::text as id,
  id as raw_id,
  numeric_id,
  display_id,
  property_address,
  escrow_status,
  purchase_price,
  my_commission,
  acceptance_date,
  scheduled_coe_date,
  days_to_close,
  checklist_progress,
  created_at,
  updated_at,
  -- Include all other columns
  escrow_number,
  property_type,
  transaction_type,
  list_price,
  earnest_money,
  down_payment,
  loan_amount,
  seller_concessions,
  closing_costs,
  home_warranty,
  inspection_period_end,
  appraisal_deadline,
  loan_approval_deadline,
  buyer_side_commission,
  listing_side_commission,
  total_commission,
  net_commission,
  opening_date,
  closing_date,
  escrow_company,
  escrow_officer_name,
  escrow_officer_email,
  escrow_officer_phone,
  title_company,
  lender_name,
  loan_officer_name,
  loan_officer_email,
  loan_officer_phone,
  notes,
  priority_level,
  team_id,
  team_sequence_id
FROM escrows;

-- Create similar views for other entities
CREATE OR REPLACE VIEW listings_with_prefix AS
SELECT 
  CONCAT('listing-', id)::text as id,
  id as raw_id,
  *
FROM listings;

CREATE OR REPLACE VIEW clients_with_prefix AS
SELECT 
  CONCAT('client-', id)::text as id,
  id as raw_id,
  *
FROM clients;

CREATE OR REPLACE VIEW leads_with_prefix AS
SELECT 
  CONCAT('lead-', id)::text as id,
  id as raw_id,
  *
FROM leads;

CREATE OR REPLACE VIEW appointments_with_prefix AS
SELECT 
  CONCAT('appointment-', id)::text as id,
  id as raw_id,
  *
FROM appointments;

-- Create a function to strip prefixes when needed
CREATE OR REPLACE FUNCTION strip_entity_prefix(prefixed_id TEXT)
RETURNS UUID AS $$
BEGIN
  -- Remove common prefixes
  IF prefixed_id LIKE 'escrow-%' THEN
    RETURN SUBSTRING(prefixed_id FROM 8)::UUID;
  ELSIF prefixed_id LIKE 'listing-%' THEN
    RETURN SUBSTRING(prefixed_id FROM 9)::UUID;
  ELSIF prefixed_id LIKE 'client-%' THEN
    RETURN SUBSTRING(prefixed_id FROM 8)::UUID;
  ELSIF prefixed_id LIKE 'lead-%' THEN
    RETURN SUBSTRING(prefixed_id FROM 6)::UUID;
  ELSIF prefixed_id LIKE 'appointment-%' THEN
    RETURN SUBSTRING(prefixed_id FROM 13)::UUID;
  ELSIF prefixed_id LIKE 'user-%' THEN
    RETURN SUBSTRING(prefixed_id FROM 6)::UUID;
  ELSIF prefixed_id LIKE 'agent-%' THEN
    RETURN SUBSTRING(prefixed_id FROM 7)::UUID;
  ELSIF prefixed_id LIKE 'task-%' THEN
    RETURN SUBSTRING(prefixed_id FROM 6)::UUID;
  ELSIF prefixed_id LIKE 'doc-%' THEN
    RETURN SUBSTRING(prefixed_id FROM 5)::UUID;
  ELSE
    -- If no prefix found, try to cast as-is
    RETURN prefixed_id::UUID;
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    -- If casting fails, return NULL
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Add comments
COMMENT ON VIEW escrows_with_prefix IS 'View of escrows table with entity-prefixed IDs';
COMMENT ON FUNCTION strip_entity_prefix IS 'Removes entity prefixes from IDs to get raw UUID';