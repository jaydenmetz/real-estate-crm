-- Script to add one escrow to Railway PostgreSQL production database
-- This matches the schema defined in migrations/001_initial_schema.sql

-- First, check if the escrow already exists
SELECT COUNT(*) as existing_count FROM escrows WHERE id = 'ESC-2025-PROD-001';

-- Insert one escrow record for production
INSERT INTO escrows (
    id,
    property_address,
    escrow_status,
    purchase_price,
    earnest_money_deposit,
    down_payment,
    loan_amount,
    commission_percentage,
    gross_commission,
    net_commission,
    acceptance_date,
    closing_date,
    property_type,
    lead_source,
    created_at,
    updated_at
)
VALUES (
    'ESC-2025-PROD-001',
    '123 Ocean View Drive, Malibu, CA 90265',
    'Active',
    2850000.00,
    28500.00,
    570000.00,
    2280000.00,
    2.5,
    71250.00,
    35625.00,
    '2025-07-15',
    '2025-08-30',
    'Single Family',
    'Referral',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT (id) DO NOTHING;

-- Also add buyer and seller information
INSERT INTO escrow_buyers (escrow_id, name, email, phone)
VALUES ('ESC-2025-PROD-001', 'Michael Thompson', 'michael.thompson@email.com', '(310) 555-0123')
ON CONFLICT DO NOTHING;

INSERT INTO escrow_sellers (escrow_id, name, email, phone)
VALUES ('ESC-2025-PROD-001', 'Sarah Johnson', 'sarah.johnson@email.com', '(310) 555-0456')
ON CONFLICT DO NOTHING;

-- Verify the escrow was added
SELECT 
    e.id,
    e.property_address,
    e.escrow_status,
    e.purchase_price,
    e.net_commission,
    e.closing_date,
    eb.name as buyer_name,
    es.name as seller_name
FROM escrows e
LEFT JOIN escrow_buyers eb ON e.id = eb.escrow_id
LEFT JOIN escrow_sellers es ON e.id = es.escrow_id
WHERE e.id = 'ESC-2025-PROD-001';

-- Show total count
SELECT COUNT(*) as total_escrows FROM escrows;