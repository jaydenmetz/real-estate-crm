-- Insert comprehensive test escrow data matching the mock data structure
-- This ensures the dashboard displays properly with all expected fields

-- First, clear any existing test data (be careful in production!)
TRUNCATE TABLE escrows RESTART IDENTITY CASCADE;

-- Insert comprehensive escrow records with all fields the frontend expects
INSERT INTO escrows (
    escrow_number,
    property_address,
    escrow_status,
    transaction_type,
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
    buyer_name,
    buyer_email,
    buyer_phone,
    seller_name,
    seller_email,
    seller_phone,
    priority_level,
    created_at,
    updated_at
) VALUES
    -- Active Escrows
    ('2025-0001', '123 Main Street, Los Angeles, CA 90001', 'Active', 'Purchase', 550000, 5500, 110000, 440000, 3.0, 16500, 8250, '2025-07-01', '2025-08-15', 'Single Family', 'Referral', 'John Smith', 'john.smith@email.com', '(555) 123-4567', 'Jane Doe', 'jane.doe@email.com', '(555) 987-6543', 'high', NOW() - INTERVAL '15 days', NOW()),
    ('2025-0002', '456 Oak Avenue, Beverly Hills, CA 90210', 'Active', 'Purchase', 1250000, 12500, 250000, 1000000, 3.0, 37500, 18750, '2025-07-05', '2025-08-20', 'Luxury Home', 'Website', 'Michael Johnson', 'michael.j@email.com', '(555) 234-5678', 'Sarah Williams', 'sarah.w@email.com', '(555) 876-5432', 'medium', NOW() - INTERVAL '10 days', NOW()),
    ('2025-0003', '789 Pine Street, Santa Monica, CA 90405', 'Active', 'Purchase', 875000, 8750, 175000, 700000, 3.0, 26250, 13125, '2025-07-10', '2025-09-01', 'Condo', 'MLS', 'David Brown', 'david.b@email.com', '(555) 345-6789', 'Emily Davis', 'emily.d@email.com', '(555) 765-4321', 'high', NOW() - INTERVAL '5 days', NOW()),
    ('2025-0004', '321 Elm Drive, Pasadena, CA 91101', 'Active', 'Purchase', 725000, 7250, 145000, 580000, 3.0, 21750, 10875, '2025-07-12', '2025-08-25', 'Single Family', 'Open House', 'Robert Taylor', 'robert.t@email.com', '(555) 456-7890', 'Lisa Anderson', 'lisa.a@email.com', '(555) 654-3210', 'low', NOW() - INTERVAL '3 days', NOW()),
    ('2025-0005', '654 Maple Court, Malibu, CA 90265', 'Active', 'Purchase', 2500000, 25000, 500000, 2000000, 3.0, 75000, 37500, '2025-07-15', '2025-09-15', 'Luxury Home', 'Referral', 'James Wilson', 'james.w@email.com', '(555) 567-8901', 'Patricia Moore', 'patricia.m@email.com', '(555) 543-2109', 'high', NOW() - INTERVAL '1 day', NOW()),
    
    -- Pending Escrows
    ('2025-0006', '987 Sunset Boulevard, West Hollywood, CA 90069', 'Pending', 'Purchase', 950000, 9500, 190000, 760000, 3.0, 28500, 14250, '2025-06-20', '2025-08-10', 'Townhouse', 'Website', 'Christopher Lee', 'chris.lee@email.com', '(555) 678-9012', 'Jennifer Martin', 'jen.martin@email.com', '(555) 432-1098', 'medium', NOW() - INTERVAL '25 days', NOW()),
    ('2025-0007', '147 Beach View Lane, Manhattan Beach, CA 90266', 'Pending', 'Purchase', 1800000, 18000, 360000, 1440000, 3.0, 54000, 27000, '2025-06-25', '2025-08-05', 'Beach House', 'MLS', 'William Garcia', 'william.g@email.com', '(555) 789-0123', 'Mary Rodriguez', 'mary.r@email.com', '(555) 321-0987', 'high', NOW() - INTERVAL '20 days', NOW()),
    ('2025-0008', '258 Canyon Drive, Topanga, CA 90290', 'Pending', 'Purchase', 675000, 6750, 135000, 540000, 3.0, 20250, 10125, '2025-07-08', '2025-08-22', 'Single Family', 'Direct', 'Daniel Martinez', 'daniel.m@email.com', '(555) 890-1234', 'Barbara Lopez', 'barbara.l@email.com', '(555) 210-9876', 'low', NOW() - INTERVAL '7 days', NOW()),
    
    -- Closing Soon Escrows
    ('2025-0009', '369 Marina Way, Marina del Rey, CA 90292', 'Closing', 'Purchase', 1100000, 11000, 220000, 880000, 3.0, 33000, 16500, '2025-06-15', '2025-07-25', 'Waterfront Condo', 'Referral', 'Matthew Thomas', 'matt.t@email.com', '(555) 901-2345', 'Susan Jackson', 'susan.j@email.com', '(555) 109-8765', 'high', NOW() - INTERVAL '30 days', NOW()),
    ('2025-0010', '741 Highland Park Avenue, Glendale, CA 91206', 'Closing', 'Purchase', 825000, 8250, 165000, 660000, 3.0, 24750, 12375, '2025-06-10', '2025-07-22', 'Single Family', 'Website', 'Joseph White', 'joseph.w@email.com', '(555) 012-3456', 'Linda Harris', 'linda.h@email.com', '(555) 098-7654', 'medium', NOW() - INTERVAL '35 days', NOW()),
    
    -- Closed Escrows (for historical data)
    ('2025-0011', '852 Palm Drive, Venice, CA 90291', 'Closed', 'Purchase', 1350000, 13500, 270000, 1080000, 3.0, 40500, 20250, '2025-05-01', '2025-06-15', 'Modern Home', 'MLS', 'Anthony Clark', 'anthony.c@email.com', '(555) 123-4567', 'Margaret Lewis', 'margaret.l@email.com', '(555) 987-6543', 'high', NOW() - INTERVAL '60 days', NOW() - INTERVAL '30 days'),
    ('2025-0012', '963 Mountain View Road, Burbank, CA 91505', 'Closed', 'Purchase', 680000, 6800, 136000, 544000, 3.0, 20400, 10200, '2025-05-15', '2025-06-30', 'Condo', 'Open House', 'Mark Robinson', 'mark.r@email.com', '(555) 234-5678', 'Nancy Walker', 'nancy.w@email.com', '(555) 876-5432', 'medium', NOW() - INTERVAL '45 days', NOW() - INTERVAL '15 days'),
    
    -- Cancelled Escrows (for completeness)
    ('2025-0013', '159 Valley Vista, Sherman Oaks, CA 91403', 'Cancelled', 'Purchase', 920000, 9200, 184000, 736000, 3.0, 27600, 13800, '2025-06-01', '2025-07-15', 'Single Family', 'Direct', 'Steven Hall', 'steven.h@email.com', '(555) 345-6789', 'Karen Allen', 'karen.a@email.com', '(555) 765-4321', 'low', NOW() - INTERVAL '40 days', NOW() - INTERVAL '20 days'),
    
    -- More Active Escrows to show variety
    ('2025-0014', '753 Wilshire Boulevard, Los Angeles, CA 90017', 'Active', 'Purchase', 485000, 4850, 97000, 388000, 3.0, 14550, 7275, '2025-07-18', '2025-09-05', 'High-Rise Condo', 'Website', 'Kevin Young', 'kevin.y@email.com', '(555) 456-7890', 'Ruth King', 'ruth.k@email.com', '(555) 654-3210', 'medium', NOW() - INTERVAL '2 days', NOW()),
    ('2025-0015', '246 Rodeo Drive, Beverly Hills, CA 90210', 'Active', 'Purchase', 3200000, 32000, 640000, 2560000, 3.0, 96000, 48000, '2025-07-20', '2025-09-20', 'Luxury Estate', 'Referral', 'George Wright', 'george.w@email.com', '(555) 567-8901', 'Helen Scott', 'helen.s@email.com', '(555) 543-2109', 'high', NOW(), NOW()),
    
    -- Properties with different stages/timelines
    ('2025-0016', '357 Ocean Park Boulevard, Santa Monica, CA 90405', 'Active', 'Purchase', 1650000, 16500, 330000, 1320000, 3.0, 49500, 24750, '2025-07-14', '2025-08-28', 'Beach Condo', 'MLS', 'Brian Green', 'brian.g@email.com', '(555) 678-9012', 'Donna Baker', 'donna.b@email.com', '(555) 432-1098', 'high', NOW() - INTERVAL '4 days', NOW()),
    ('2025-0017', '468 Hillside Avenue, Hollywood Hills, CA 90068', 'Pending', 'Purchase', 2100000, 21000, 420000, 1680000, 3.0, 63000, 31500, '2025-06-28', '2025-08-12', 'Hillside Home', 'Direct', 'Kenneth Adams', 'kenneth.a@email.com', '(555) 789-0123', 'Sandra Nelson', 'sandra.n@email.com', '(555) 321-0987', 'medium', NOW() - INTERVAL '17 days', NOW()),
    ('2025-0018', '579 Ventura Boulevard, Encino, CA 91436', 'Active', 'Purchase', 895000, 8950, 179000, 716000, 3.0, 26850, 13425, '2025-07-22', '2025-09-10', 'Single Family', 'Website', 'Jason Carter', 'jason.c@email.com', '(555) 890-1234', 'Betty Mitchell', 'betty.m@email.com', '(555) 210-9876', 'low', NOW() - INTERVAL '1 day', NOW()),
    ('2025-0019', '680 La Cienega Boulevard, West Hollywood, CA 90069', 'Active', 'Purchase', 765000, 7650, 153000, 612000, 3.0, 22950, 11475, '2025-07-19', '2025-09-02', 'Modern Condo', 'Open House', 'Ronald Perez', 'ronald.p@email.com', '(555) 901-2345', 'Dorothy Roberts', 'dorothy.r@email.com', '(555) 109-8765', 'medium', NOW() - INTERVAL '2 days', NOW()),
    ('2025-0020', '791 Pacific Coast Highway, Malibu, CA 90265', 'Active', 'Purchase', 4500000, 45000, 900000, 3600000, 3.0, 135000, 67500, '2025-07-21', '2025-09-30', 'Oceanfront Estate', 'Referral', 'Timothy Turner', 'timothy.t@email.com', '(555) 012-3456', 'Deborah Phillips', 'deborah.p@email.com', '(555) 098-7654', 'high', NOW(), NOW());

-- Add some variety in escrow numbers to make them look more realistic
UPDATE escrows SET escrow_number = 'ESC-' || escrow_number;

-- Show summary of inserted data
SELECT 
    escrow_status, 
    COUNT(*) as count,
    AVG(purchase_price) as avg_price,
    SUM(net_commission) as total_commission
FROM escrows 
GROUP BY escrow_status
ORDER BY escrow_status;

-- Show first 5 records to verify
SELECT 
    id,
    escrow_number,
    property_address,
    escrow_status,
    purchase_price,
    buyer_name,
    seller_name,
    closing_date
FROM escrows 
ORDER BY created_at DESC 
LIMIT 5;