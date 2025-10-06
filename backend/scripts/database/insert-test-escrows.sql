-- Insert test escrow data into the simplified escrows table
-- This will add data so the dashboard displays escrows

-- First, let's check if we have any data
SELECT COUNT(*) as current_count FROM escrows WHERE deleted_at IS NULL;

-- Insert test escrows only if we have less than 5
INSERT INTO escrows (
    escrow_number,
    property_address,
    escrow_status,
    transaction_type,
    purchase_price,
    net_commission,
    closing_date,
    buyer_name,
    buyer_email,
    buyer_phone,
    seller_name,
    seller_email,
    seller_phone,
    priority_level,
    created_at,
    updated_at
)
SELECT * FROM (VALUES
    ('2025-0001', '123 Main Street, Los Angeles, CA 90001', 'Active', 'Purchase', 550000, 8250, '2025-08-15', 'John Smith', 'john.smith@email.com', '(555) 123-4567', 'Jane Doe', 'jane.doe@email.com', '(555) 987-6543', 'high', NOW(), NOW()),
    ('2025-0002', '456 Oak Avenue, Beverly Hills, CA 90210', 'Active', 'Purchase', 1250000, 18750, '2025-08-20', 'Michael Johnson', 'michael.j@email.com', '(555) 234-5678', 'Sarah Williams', 'sarah.w@email.com', '(555) 876-5432', 'medium', NOW(), NOW()),
    ('2025-0003', '789 Pine Street, Santa Monica, CA 90405', 'Pending', 'Purchase', 875000, 13125, '2025-09-01', 'David Brown', 'david.b@email.com', '(555) 345-6789', 'Emily Davis', 'emily.d@email.com', '(555) 765-4321', 'high', NOW(), NOW()),
    ('2025-0004', '321 Elm Drive, Pasadena, CA 91101', 'Active', 'Purchase', 725000, 10875, '2025-08-25', 'Robert Taylor', 'robert.t@email.com', '(555) 456-7890', 'Lisa Anderson', 'lisa.a@email.com', '(555) 654-3210', 'low', NOW(), NOW()),
    ('2025-0005', '654 Maple Court, Malibu, CA 90265', 'Active', 'Purchase', 2500000, 37500, '2025-09-15', 'James Wilson', 'james.w@email.com', '(555) 567-8901', 'Patricia Moore', 'patricia.m@email.com', '(555) 543-2109', 'high', NOW(), NOW())
) AS v(escrow_number, property_address, escrow_status, transaction_type, purchase_price, net_commission, closing_date, buyer_name, buyer_email, buyer_phone, seller_name, seller_email, seller_phone, priority_level, created_at, updated_at)
WHERE (SELECT COUNT(*) FROM escrows WHERE deleted_at IS NULL) < 5;

-- Show the results
SELECT id, escrow_number, property_address, escrow_status, purchase_price, buyer_name, seller_name 
FROM escrows 
WHERE deleted_at IS NULL
ORDER BY created_at DESC
LIMIT 10;