-- Populate real_estate_crm database with test escrows data

-- Clear existing data
DELETE FROM escrows;

-- Insert test escrows (matching the real_estate_crm schema)
INSERT INTO escrows (
    id,
    property_address,
    escrow_status,
    escrow_number,
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
VALUES
    ('ESC-2025-0001', '123 Main Street, Los Angeles, CA 90001', 'Active', 'ESC-2025-0001', 550000, 5500, 110000, 440000, 3.0, 16500, 8250, '2025-07-01', '2025-08-15', 'Single Family', 'Zillow', NOW(), NOW()),
    ('ESC-2025-0002', '456 Oak Avenue, Beverly Hills, CA 90210', 'Active', 'ESC-2025-0002', 1250000, 12500, 250000, 1000000, 3.0, 37500, 18750, '2025-07-05', '2025-08-20', 'Single Family', 'Referral', NOW(), NOW()),
    ('ESC-2025-0003', '789 Pine Street, Santa Monica, CA 90405', 'Pending', 'ESC-2025-0003', 875000, 8750, 175000, 700000, 3.0, 26250, 13125, '2025-07-10', '2025-09-01', 'Condo', 'Open House', NOW(), NOW()),
    ('ESC-2025-0004', '321 Elm Drive, Pasadena, CA 91101', 'Active', 'ESC-2025-0004', 725000, 7250, 145000, 580000, 3.0, 21750, 10875, '2025-07-12', '2025-08-25', 'Single Family', 'MLS', NOW(), NOW()),
    ('ESC-2025-0005', '654 Maple Court, Malibu, CA 90265', 'Active', 'ESC-2025-0005', 2500000, 25000, 500000, 2000000, 3.0, 75000, 37500, '2025-07-15', '2025-09-15', 'Single Family', 'Past Client', NOW(), NOW()),
    ('ESC-2025-0006', '987 Beach Road, Venice, CA 90291', 'Pending', 'ESC-2025-0006', 920000, 9200, 184000, 736000, 2.5, 23000, 11500, '2025-07-18', '2025-08-30', 'Townhouse', 'Website', NOW(), NOW()),
    ('ESC-2025-0007', '111 Sunset Blvd, West Hollywood, CA 90069', 'Active', 'ESC-2025-0007', 1100000, 11000, 220000, 880000, 3.0, 33000, 16500, '2025-07-20', '2025-09-05', 'Condo', 'Realtor.com', NOW(), NOW()),
    ('ESC-2025-0008', '222 Valley View, Sherman Oaks, CA 91403', 'Closed', 'ESC-2025-0008', 680000, 6800, 136000, 544000, 2.5, 17000, 8500, '2025-06-01', '2025-07-15', 'Single Family', 'Sign Call', NOW(), NOW()),
    ('ESC-2025-0009', '333 Hillside Dr, Glendale, CA 91206', 'Active', 'ESC-2025-0009', 825000, 8250, 165000, 660000, 3.0, 24750, 12375, '2025-07-22', '2025-09-10', 'Single Family', 'Facebook Ad', NOW(), NOW()),
    ('ESC-2025-0010', '444 Ocean Park, Manhattan Beach, CA 90266', 'Active', 'ESC-2025-0010', 1950000, 19500, 390000, 1560000, 2.5, 48750, 24375, '2025-07-25', '2025-09-20', 'Single Family', 'Agent Referral', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Show the results
SELECT id, escrow_number, property_address, escrow_status, purchase_price, net_commission, closing_date
FROM escrows 
ORDER BY created_at DESC;