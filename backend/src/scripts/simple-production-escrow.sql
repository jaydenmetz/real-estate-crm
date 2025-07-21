-- Simple script to add ONE escrow to Railway PostgreSQL
-- Run this in Railway's Data Query tab

-- Delete any existing test escrow first (optional)
DELETE FROM escrow_buyers WHERE escrow_id = 'ESC-PROD-001';
DELETE FROM escrow_sellers WHERE escrow_id = 'ESC-PROD-001';
DELETE FROM escrows WHERE id = 'ESC-PROD-001';

-- Insert the escrow
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
    lead_source
)
VALUES (
    'ESC-PROD-001',
    '789 Pacific Coast Highway, Malibu, CA 90265',
    'Active',
    3250000,
    32500,
    650000,
    2600000,
    2.5,
    81250,
    40625,
    '2025-07-18',
    '2025-08-25',
    'Single Family',
    'Website Inquiry'
);

-- Check that it was added
SELECT * FROM escrows WHERE id = 'ESC-PROD-001';