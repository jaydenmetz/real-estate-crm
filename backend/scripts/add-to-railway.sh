#!/bin/bash

# Replace this with your actual Railway PostgreSQL connection URL
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@YOUR_HOST.railway.app:YOUR_PORT/railway"

# Add escrow using psql
psql "$DATABASE_URL" << EOF
-- Add escrow to production
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
    'Referral'
);

-- Show result
SELECT id, property_address, escrow_status, purchase_price 
FROM escrows 
WHERE id = 'ESC-PROD-2025-001';
EOF