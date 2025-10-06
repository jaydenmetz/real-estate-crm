-- Insert mock escrow data for development
-- This matches the structure used in the frontend mock data

-- Clear existing test data (except the manually created ESC-001)
DELETE FROM escrow_buyers WHERE escrow_id != 'ESC-001';
DELETE FROM escrow_sellers WHERE escrow_id != 'ESC-001';
DELETE FROM escrows WHERE id != 'ESC-001';

-- Insert mock escrows
INSERT INTO escrows (
    id, property_address, escrow_status, purchase_price, 
    earnest_money_deposit, down_payment, loan_amount,
    commission_percentage, gross_commission, net_commission,
    acceptance_date, closing_date, property_type, lead_source
) VALUES
    ('ESC-2025-0001', '789 Sunset Blvd, Beverly Hills, CA 90210', 'Pending', 550000.00, 5500.00, 110000.00, 440000.00, 2.5, 13750.00, 13750.00, '2025-07-01', '2025-08-02', 'Single Family', 'Referral'),
    ('ESC-2025-0002', '321 Beach Way, Santa Monica, CA 90405', 'Closed', 600000.00, 6000.00, 120000.00, 480000.00, 2.5, 15000.00, 15000.00, '2025-06-15', '2025-08-01', 'Condo', 'Website'),
    ('ESC-2025-0003', '654 Mountain View Rd, Pasadena, CA 91101', 'Cancelled', 650000.00, 6500.00, 130000.00, 520000.00, 2.5, 16250.00, 16250.00, '2025-06-01', '2025-07-31', 'Single Family', 'Direct'),
    ('ESC-2025-0004', '987 Valley Vista, Sherman Oaks, CA 91403', 'Active', 700000.00, 7000.00, 140000.00, 560000.00, 2.5, 17500.00, 17500.00, '2025-07-10', '2025-07-30', 'Single Family', 'Referral'),
    ('ESC-2025-0005', '147 Hillside Ave, Hollywood Hills, CA 90068', 'Pending', 750000.00, 7500.00, 150000.00, 600000.00, 2.5, 18750.00, 18750.00, '2025-07-05', '2025-07-29', 'Single Family', 'MLS'),
    ('ESC-2025-0006', '258 Canyon Dr, Topanga, CA 90290', 'Closed', 800000.00, 8000.00, 160000.00, 640000.00, 2.5, 20000.00, 20000.00, '2025-06-20', '2025-07-28', 'Single Family', 'Website'),
    ('ESC-2025-0007', '369 Marina Way, Marina del Rey, CA 90292', 'Cancelled', 850000.00, 8500.00, 170000.00, 680000.00, 2.5, 21250.00, 21250.00, '2025-06-10', '2025-07-27', 'Condo', 'Direct'),
    ('ESC-2025-0008', '741 Palm Dr, Venice, CA 90291', 'Active', 900000.00, 9000.00, 180000.00, 720000.00, 2.5, 22500.00, 22500.00, '2025-07-12', '2025-07-26', 'Single Family', 'Referral'),
    ('ESC-2025-0009', '852 Highland Park, Glendale, CA 91206', 'Pending', 950000.00, 9500.00, 190000.00, 760000.00, 2.5, 23750.00, 23750.00, '2025-07-08', '2025-07-25', 'Single Family', 'MLS'),
    ('ESC-2025-0010', '456 Ocean View Dr, Malibu, CA 90265', 'Closed', 1000000.00, 10000.00, 200000.00, 800000.00, 2.5, 25000.00, 25000.00, '2025-06-25', '2025-07-24', 'Single Family', 'Website'),
    ('ESC-2025-0011', '789 Sunset Blvd, Beverly Hills, CA 90210', 'Cancelled', 1050000.00, 10500.00, 210000.00, 840000.00, 2.5, 26250.00, 26250.00, '2025-06-05', '2025-07-23', 'Single Family', 'Direct'),
    ('ESC-2025-0012', '321 Beach Way, Santa Monica, CA 90405', 'Active', 1100000.00, 11000.00, 220000.00, 880000.00, 2.5, 27500.00, 27500.00, '2025-07-15', '2025-07-22', 'Condo', 'Referral'),
    ('ESC-2025-0013', '654 Mountain View Rd, Pasadena, CA 91101', 'Pending', 1150000.00, 11500.00, 230000.00, 920000.00, 2.5, 28750.00, 28750.00, '2025-07-18', '2025-07-21', 'Single Family', 'MLS'),
    ('ESC-2025-0014', '987 Valley Vista, Sherman Oaks, CA 91403', 'Closed', 1200000.00, 12000.00, 240000.00, 960000.00, 2.5, 30000.00, 30000.00, '2025-06-30', '2025-07-20', 'Single Family', 'Website'),
    ('ESC-2025-0015', '147 Hillside Ave, Hollywood Hills, CA 90068', 'Cancelled', 1250000.00, 12500.00, 250000.00, 1000000.00, 2.5, 31250.00, 31250.00, '2025-06-12', '2025-07-19', 'Single Family', 'Direct'),
    ('ESC-2025-0016', '258 Canyon Dr, Topanga, CA 90290', 'Active', 1300000.00, 13000.00, 260000.00, 1040000.00, 2.5, 32500.00, 32500.00, '2025-07-16', '2025-08-18', 'Single Family', 'Referral'),
    ('ESC-2025-0017', '369 Marina Way, Marina del Rey, CA 90292', 'Pending', 1350000.00, 13500.00, 270000.00, 1080000.00, 2.5, 33750.00, 33750.00, '2025-07-14', '2025-08-17', 'Condo', 'MLS'),
    ('ESC-2025-0018', '741 Palm Dr, Venice, CA 90291', 'Closed', 1400000.00, 14000.00, 280000.00, 1120000.00, 2.5, 35000.00, 35000.00, '2025-06-28', '2025-08-16', 'Single Family', 'Website'),
    ('ESC-2025-0019', '852 Highland Park, Glendale, CA 91206', 'Cancelled', 1450000.00, 14500.00, 290000.00, 1160000.00, 2.5, 36250.00, 36250.00, '2025-06-08', '2025-08-15', 'Single Family', 'Direct'),
    ('ESC-2025-0020', '456 Ocean View Dr, Malibu, CA 90265', 'Active', 1500000.00, 15000.00, 300000.00, 1200000.00, 2.5, 37500.00, 37500.00, '2025-07-17', '2025-08-14', 'Single Family', 'Referral');

-- Insert buyers for each escrow
INSERT INTO escrow_buyers (escrow_id, name, email, phone) VALUES
    ('ESC-2025-0001', 'John Buyer', 'john.buyer1@email.com', '(310) 555-0101'),
    ('ESC-2025-0002', 'Michael Chen', 'michael.chen@email.com', '(310) 555-0102'),
    ('ESC-2025-0003', 'Sarah Johnson', 'sarah.j@email.com', '(818) 555-0103'),
    ('ESC-2025-0004', 'David Kim', 'david.kim@email.com', '(818) 555-0104'),
    ('ESC-2025-0005', 'Emily Brown', 'emily.brown@email.com', '(323) 555-0105'),
    ('ESC-2025-0006', 'Robert Taylor', 'robert.t@email.com', '(310) 555-0106'),
    ('ESC-2025-0007', 'Lisa Anderson', 'lisa.anderson@email.com', '(310) 555-0107'),
    ('ESC-2025-0008', 'James Wilson', 'james.w@email.com', '(310) 555-0108'),
    ('ESC-2025-0009', 'Maria Garcia', 'maria.g@email.com', '(818) 555-0109'),
    ('ESC-2025-0010', 'William Davis', 'william.d@email.com', '(310) 555-0110'),
    ('ESC-2025-0011', 'Jennifer Martinez', 'jennifer.m@email.com', '(310) 555-0111'),
    ('ESC-2025-0012', 'Christopher Lee', 'chris.lee@email.com', '(310) 555-0112'),
    ('ESC-2025-0013', 'Amanda White', 'amanda.w@email.com', '(626) 555-0113'),
    ('ESC-2025-0014', 'Daniel Thompson', 'daniel.t@email.com', '(818) 555-0114'),
    ('ESC-2025-0015', 'Michelle Rodriguez', 'michelle.r@email.com', '(323) 555-0115'),
    ('ESC-2025-0016', 'Kevin Harris', 'kevin.h@email.com', '(310) 555-0116'),
    ('ESC-2025-0017', 'Jessica Clark', 'jessica.c@email.com', '(310) 555-0117'),
    ('ESC-2025-0018', 'Brian Lewis', 'brian.l@email.com', '(310) 555-0118'),
    ('ESC-2025-0019', 'Nancy Walker', 'nancy.w@email.com', '(818) 555-0119'),
    ('ESC-2025-0020', 'Steven Hall', 'steven.h@email.com', '(310) 555-0120');

-- Insert sellers for each escrow
INSERT INTO escrow_sellers (escrow_id, name, email, phone) VALUES
    ('ESC-2025-0001', 'Jane Seller', 'jane.seller1@email.com', '(310) 555-0201'),
    ('ESC-2025-0002', 'Patricia Wong', 'patricia.w@email.com', '(310) 555-0202'),
    ('ESC-2025-0003', 'Thomas Moore', 'thomas.m@email.com', '(626) 555-0203'),
    ('ESC-2025-0004', 'Linda Jackson', 'linda.j@email.com', '(818) 555-0204'),
    ('ESC-2025-0005', 'Richard Martin', 'richard.m@email.com', '(323) 555-0205'),
    ('ESC-2025-0006', 'Barbara Thomas', 'barbara.t@email.com', '(310) 555-0206'),
    ('ESC-2025-0007', 'Charles Robinson', 'charles.r@email.com', '(310) 555-0207'),
    ('ESC-2025-0008', 'Susan Clark', 'susan.c@email.com', '(310) 555-0208'),
    ('ESC-2025-0009', 'Joseph Rodriguez', 'joseph.r@email.com', '(818) 555-0209'),
    ('ESC-2025-0010', 'Karen Lewis', 'karen.l@email.com', '(310) 555-0210'),
    ('ESC-2025-0011', 'Donald Walker', 'donald.w@email.com', '(310) 555-0211'),
    ('ESC-2025-0012', 'Betty Hall', 'betty.h@email.com', '(310) 555-0212'),
    ('ESC-2025-0013', 'Mark Allen', 'mark.a@email.com', '(626) 555-0213'),
    ('ESC-2025-0014', 'Dorothy Young', 'dorothy.y@email.com', '(818) 555-0214'),
    ('ESC-2025-0015', 'Paul King', 'paul.k@email.com', '(323) 555-0215'),
    ('ESC-2025-0016', 'Helen Wright', 'helen.w@email.com', '(310) 555-0216'),
    ('ESC-2025-0017', 'George Lopez', 'george.l@email.com', '(310) 555-0217'),
    ('ESC-2025-0018', 'Ruth Hill', 'ruth.h@email.com', '(310) 555-0218'),
    ('ESC-2025-0019', 'Kenneth Green', 'kenneth.g@email.com', '(818) 555-0219'),
    ('ESC-2025-0020', 'Carol Adams', 'carol.a@email.com', '(310) 555-0220');

-- Update the existing ESC-001 record to match the pattern
UPDATE escrows 
SET escrow_status = 'Active',
    earnest_money_deposit = 8500.00,
    down_payment = 170000.00,
    loan_amount = 680000.00,
    commission_percentage = 2.5,
    gross_commission = 21250.00,
    net_commission = 21250.00,
    acceptance_date = '2025-07-01',
    property_type = 'Single Family',
    lead_source = 'Direct'
WHERE id = 'ESC-001';

-- Add buyer and seller for ESC-001 if they don't exist
INSERT INTO escrow_buyers (escrow_id, name, email, phone) 
SELECT 'ESC-001', 'Test Buyer', 'test.buyer@email.com', '(415) 555-0001'
WHERE NOT EXISTS (SELECT 1 FROM escrow_buyers WHERE escrow_id = 'ESC-001');

INSERT INTO escrow_sellers (escrow_id, name, email, phone)
SELECT 'ESC-001', 'Test Seller', 'test.seller@email.com', '(415) 555-0002'
WHERE NOT EXISTS (SELECT 1 FROM escrow_sellers WHERE escrow_id = 'ESC-001');