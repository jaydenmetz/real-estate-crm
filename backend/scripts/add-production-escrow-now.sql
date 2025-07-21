-- Add escrow to Railway production database
-- This will make it appear on https://crm.jaydenmetz.com/escrows

-- First, check if any escrows exist
SELECT COUNT(*) as current_count FROM escrows;

-- Add a new escrow
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
    'ESC-PROD-2025-001',
    '1234 Ocean View Boulevard, Santa Monica, CA 90401',
    'Active',
    2750000.00,
    27500.00,
    550000.00,
    2200000.00,
    2.5,
    68750.00,
    34375.00,
    '2025-07-15',
    '2025-08-28',
    'Single Family',
    'Referral',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT (id) DO NOTHING;

-- Add buyer information
INSERT INTO escrow_buyers (escrow_id, name, email, phone)
VALUES ('ESC-PROD-2025-001', 'David Chen', 'david.chen@email.com', '(310) 555-1234')
ON CONFLICT DO NOTHING;

-- Add seller information
INSERT INTO escrow_sellers (escrow_id, name, email, phone)
VALUES ('ESC-PROD-2025-001', 'Jennifer Williams', 'jennifer.williams@email.com', '(310) 555-5678')
ON CONFLICT DO NOTHING;

-- Show all escrows
SELECT 
    e.id,
    e.property_address,
    e.escrow_status,
    e.purchase_price,
    e.closing_date,
    eb.name as buyer_name,
    es.name as seller_name
FROM escrows e
LEFT JOIN escrow_buyers eb ON e.id = eb.escrow_id
LEFT JOIN escrow_sellers es ON e.id = es.escrow_id
ORDER BY e.created_at DESC;