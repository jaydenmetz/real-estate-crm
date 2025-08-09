-- Add Associated Real Estate brokerage and link existing users/teams

-- First, ensure we have the users and team
DO $$
DECLARE
    v_broker_id UUID;
    v_josh_user_id UUID;
    v_jayden_user_id UUID;
    v_jayden_team_id UUID;
BEGIN
    -- Insert the Associated Real Estate brokerage
    INSERT INTO brokers (
        name,
        company_name,
        license_number,
        license_state,
        email,
        phone,
        address,
        city,
        state,
        zip_code,
        website,
        commission_split_default,
        monthly_fee,
        transaction_fee,
        settings,
        is_active,
        verified_at
    ) VALUES (
        'Associated Real Estate - Berkshire Hathaway HomeServices',
        'Associated Real Estate',
        '01910265',
        'CA',
        'info@associatedrealestate.com',
        '(661) 822-3333',  -- Standard Tehachapi area code
        '122 S GREEN ST STE 5',
        'TEHACHAPI',
        'CA',
        '93561',
        'https://www.bhhsassociated.com',
        70.00,  -- Default 70/30 split
        0.00,   -- No monthly fee for now
        395.00, -- Transaction fee
        jsonb_build_object(
            'license_type', 'CORPORATION',
            'license_status', 'LICENSED',
            'license_issued', '2012-02-09',
            'license_expiration', '2028-02-08',
            'dba', 'Berkshire Hathaway HomeServices',
            'dba_active_date', '2020-01-29',
            'designated_officer', jsonb_build_object(
                'license', '01365477',
                'name', 'Riley, Joshua Luke',
                'expiration', '2028-02-08'
            ),
            'branches', jsonb_build_array(
                jsonb_build_object(
                    'address', '9700 STOCKDALE HWY SUITE 307',
                    'city', 'BAKERSFIELD',
                    'state', 'CA',
                    'zip', '93311'
                )
            ),
            'main_office', jsonb_build_object(
                'address', '122 S GREEN ST STE 5',
                'city', 'TEHACHAPI',
                'state', 'CA',
                'zip', '93561'
            )
        ),
        true,
        CURRENT_TIMESTAMP
    ) RETURNING id INTO v_broker_id;

    RAISE NOTICE 'Created broker with ID: %', v_broker_id;

    -- Get Josh Riley's user ID (try multiple possible email/username formats)
    SELECT id INTO v_josh_user_id
    FROM users
    WHERE email IN ('josh@joshriley.com', 'joshriley@example.com', 'josh.riley@associatedrealestate.com')
       OR username IN ('joshriley', 'josh', 'jriley')
       OR (first_name = 'Josh' AND last_name = 'Riley')
       OR (first_name = 'Joshua' AND last_name = 'Riley')
    LIMIT 1;

    -- If Josh doesn't exist, create him
    IF v_josh_user_id IS NULL THEN
        INSERT INTO users (
            email,
            username,
            first_name,
            last_name,
            role,
            password_hash,
            is_active
        ) VALUES (
            'josh.riley@associatedrealestate.com',
            'joshriley',
            'Joshua',
            'Riley',
            'admin',  -- Broker role
            '$2b$10$NfzQCC4u8L3ZjwNT0q9touuRLDfYxRnDoyKHXrXDHZPZaZXQxGHXW', -- Password: BrokerPass123!
            true
        ) RETURNING id INTO v_josh_user_id;
        
        RAISE NOTICE 'Created Josh Riley user with ID: %', v_josh_user_id;
    ELSE
        RAISE NOTICE 'Found existing Josh Riley with ID: %', v_josh_user_id;
    END IF;

    -- Make Josh Riley the designated officer/owner of the brokerage
    INSERT INTO broker_users (broker_id, user_id, role, permissions)
    VALUES (
        v_broker_id,
        v_josh_user_id,
        'owner',
        jsonb_build_object(
            'designated_officer', true,
            'license_number', '01365477',
            'can_manage_teams', true,
            'can_manage_agents', true,
            'can_view_financials', true,
            'can_approve_transactions', true
        )
    ) ON CONFLICT (broker_id, user_id) DO UPDATE
    SET role = 'owner',
        permissions = EXCLUDED.permissions;

    RAISE NOTICE 'Set Josh Riley as broker owner';

    -- Get Jayden Metz's user ID
    SELECT id INTO v_jayden_user_id
    FROM users
    WHERE email IN ('admin@jaydenmetz.com', 'jaydenmetz@example.com', 'jayden@jaydenmetz.com')
       OR username IN ('admin', 'jaydenmetz', 'jayden')
       OR (first_name = 'Jayden' AND last_name = 'Metz')
    LIMIT 1;

    IF v_jayden_user_id IS NULL THEN
        RAISE NOTICE 'Jayden Metz user not found - skipping';
    ELSE
        RAISE NOTICE 'Found Jayden Metz with ID: %', v_jayden_user_id;
        
        -- Add Jayden as an agent in the brokerage
        INSERT INTO broker_users (broker_id, user_id, role, permissions)
        VALUES (
            v_broker_id,
            v_jayden_user_id,
            'agent',
            jsonb_build_object(
                'can_view_own_transactions', true,
                'can_submit_transactions', true
            )
        ) ON CONFLICT (broker_id, user_id) DO UPDATE
        SET role = 'agent';

        -- Create or find Jayden's team
        SELECT team_id INTO v_jayden_team_id
        FROM users
        WHERE id = v_jayden_user_id;

        -- If Jayden doesn't have a team, create one
        IF v_jayden_team_id IS NULL THEN
            INSERT INTO teams (
                name,
                subdomain,
                settings,
                primary_broker_id
            ) VALUES (
                'Jayden Metz Realty Group',
                'jaydenmetz',
                jsonb_build_object(
                    'primary_contact', 'Jayden Metz',
                    'established', '2024'
                ),
                v_broker_id
            ) RETURNING team_id INTO v_jayden_team_id;

            -- Update Jayden's user record to link to the team
            UPDATE users
            SET team_id = v_jayden_team_id
            WHERE id = v_jayden_user_id;
            
            RAISE NOTICE 'Created Jayden Metz Realty Group with ID: %', v_jayden_team_id;
        ELSE
            -- Update existing team name if needed
            UPDATE teams
            SET name = 'Jayden Metz Realty Group',
                primary_broker_id = v_broker_id
            WHERE team_id = v_jayden_team_id;
            
            RAISE NOTICE 'Updated existing team for Jayden Metz';
        END IF;

        -- Link Jayden's team to the brokerage
        INSERT INTO broker_teams (
            broker_id,
            team_id,
            commission_split,
            monthly_fee,
            transaction_fee,
            status
        ) VALUES (
            v_broker_id,
            v_jayden_team_id,
            70.00,  -- 70% to agent, 30% to broker
            0.00,   -- No monthly fee
            395.00, -- $395 per transaction
            'active'
        ) ON CONFLICT (broker_id, team_id) DO UPDATE
        SET status = 'active',
            commission_split = 70.00;
            
        RAISE NOTICE 'Linked Jayden Metz Realty Group to Associated Real Estate';
    END IF;

    -- If Josh Riley doesn't have a team, create one for him too
    SELECT team_id INTO v_josh_user_id
    FROM users
    WHERE id = v_josh_user_id;

    IF v_josh_user_id IS NULL THEN
        DECLARE
            v_josh_team_id UUID;
        BEGIN
            INSERT INTO teams (
                name,
                subdomain,
                settings,
                primary_broker_id
            ) VALUES (
                'Riley Real Estate Team',
                'rileyteam',
                jsonb_build_object(
                    'primary_contact', 'Joshua Riley',
                    'is_broker_team', true
                ),
                v_broker_id
            ) RETURNING team_id INTO v_josh_team_id;

            UPDATE users
            SET team_id = v_josh_team_id
            WHERE id = v_josh_user_id;

            -- Link Josh's team to the brokerage
            INSERT INTO broker_teams (
                broker_id,
                team_id,
                commission_split,
                monthly_fee,
                transaction_fee,
                status
            ) VALUES (
                v_broker_id,
                v_josh_team_id,
                100.00, -- As broker/owner, keeps 100%
                0.00,   -- No fees for broker's own team
                0.00,   -- No transaction fee for broker
                'active'
            ) ON CONFLICT (broker_id, team_id) DO NOTHING;
            
            RAISE NOTICE 'Created and linked Riley Real Estate Team';
        END;
    END IF;

END $$;

-- Verify the setup
SELECT 
    b.name as broker_name,
    b.license_number,
    b.settings->>'designated_officer' as designated_officer
FROM brokers b
WHERE b.license_number = '01910265';

-- Show teams under the brokerage
SELECT 
    t.name as team_name,
    bt.commission_split,
    bt.status
FROM teams t
JOIN broker_teams bt ON t.team_id = bt.team_id
JOIN brokers b ON bt.broker_id = b.id
WHERE b.license_number = '01910265';

-- Show users in the brokerage
SELECT 
    u.first_name,
    u.last_name,
    u.email,
    bu.role as broker_role,
    t.name as team_name
FROM broker_users bu
JOIN users u ON bu.user_id = u.id
LEFT JOIN teams t ON u.team_id = t.team_id
JOIN brokers b ON bu.broker_id = b.id
WHERE b.license_number = '01910265'
ORDER BY bu.role DESC, u.last_name;