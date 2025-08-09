-- Example: Setting up brokers with your existing teams and users
-- This shows how brokers work WITH your existing data, not replacing it

-- Step 1: Create a sample broker (e.g., Century 21)
INSERT INTO brokers (
    name,
    company_name,
    email,
    phone,
    city,
    state,
    commission_split_default,
    monthly_fee,
    transaction_fee
) VALUES (
    'Century 21 Phoenix',
    'Century 21',
    'broker@century21phoenix.com',
    '555-0100',
    'Phoenix',
    'AZ',
    70.00,  -- 70% to agent, 30% to broker
    500.00, -- $500/month per team
    295.00  -- $295 per transaction
) RETURNING id as broker_id;

-- Let's say this returns broker_id = 'abc-123'

-- Step 2: Link YOUR EXISTING teams to this broker
-- (Assuming you have teams with these IDs - replace with actual IDs)

-- Link Jayden's existing team to the broker
INSERT INTO broker_teams (broker_id, team_id, commission_split)
SELECT 
    (SELECT id FROM brokers WHERE company_name = 'Century 21' LIMIT 1),
    team_id,
    75.00  -- Jayden negotiated 75% split
FROM teams 
WHERE name LIKE '%Metz%' OR subdomain LIKE '%metz%'
LIMIT 1;

-- Link Josh's existing team to the same broker  
INSERT INTO broker_teams (broker_id, team_id, commission_split)
SELECT 
    (SELECT id FROM brokers WHERE company_name = 'Century 21' LIMIT 1),
    team_id,
    70.00  -- Josh has standard 70% split
FROM teams 
WHERE name LIKE '%Riley%' OR subdomain LIKE '%riley%'
LIMIT 1;

-- Step 3: Give broker admin permissions to specific users
-- Make Jayden a broker admin (can manage all teams under this broker)
INSERT INTO broker_users (broker_id, user_id, role)
SELECT 
    (SELECT id FROM brokers WHERE company_name = 'Century 21' LIMIT 1),
    id,
    'admin'
FROM users 
WHERE email = 'admin@jaydenmetz.com'
LIMIT 1;

-- Now you can query to see:
-- 1. All teams under a broker
SELECT 
    t.name as team_name,
    t.subdomain,
    bt.commission_split,
    bt.monthly_fee,
    bt.joined_at
FROM teams t
JOIN broker_teams bt ON t.team_id = bt.team_id
JOIN brokers b ON bt.broker_id = b.id
WHERE b.company_name = 'Century 21';

-- 2. All users in teams under a broker
SELECT 
    u.first_name,
    u.last_name,
    u.email,
    t.name as team_name,
    CASE 
        WHEN bu.role IS NOT NULL THEN bu.role 
        ELSE 'agent'
    END as broker_role
FROM users u
JOIN teams t ON u.team_id = t.team_id
JOIN broker_teams bt ON t.team_id = bt.team_id
JOIN brokers b ON bt.broker_id = b.id
LEFT JOIN broker_users bu ON bu.user_id = u.id AND bu.broker_id = b.id
WHERE b.company_name = 'Century 21';

-- The beauty is:
-- - Your teams table is unchanged
-- - Your users table is unchanged  
-- - You just ADD broker relationships on top
-- - Teams can leave a broker without losing any data
-- - Users keep their team roles separate from broker roles