-- Insert comprehensive test listing data matching the mock data structure
-- This ensures the dashboard displays properly with all expected fields

-- First, clear any existing test data (be careful in production!)
TRUNCATE TABLE listings RESTART IDENTITY CASCADE;

-- Insert comprehensive listing records with all fields the frontend expects
INSERT INTO listings (
    mls_number,
    property_address,
    city,
    state,
    zip_code,
    listing_status,
    property_type,
    list_price,
    original_list_price,
    bedrooms,
    bathrooms,
    square_footage,
    lot_size,
    year_built,
    list_date,
    expiration_date,
    days_on_market,
    marketing_remarks,
    public_remarks,
    showing_instructions,
    commission_percentage,
    gross_commission,
    listing_agent_commission,
    virtual_tour_url,
    created_at,
    updated_at
) VALUES
    -- Active Listings
    ('MLS2025001', '123 Sunset Boulevard, Los Angeles, CA 90028', 'Los Angeles', 'CA', '90028', 'Active', 'Single Family', 875000, 875000, 4, 3, 2450, 6500, 1998, '2025-07-10', '2025-10-10', 8, 'Stunning Hollywood Hills home with panoramic city views. Recently renovated kitchen with high-end appliances. Open floor plan perfect for entertaining.', 'Beautiful 4BR/3BA home in prime Hollywood Hills location.', 'Call listing agent for appointment. 24hr notice preferred.', 2.5, 21875, 10937.50, 'https://tours.example.com/123-sunset', NOW() - INTERVAL '8 days', NOW()),
    
    ('MLS2025002', '456 Ocean Avenue, Santa Monica, CA 90401', 'Santa Monica', 'CA', '90401', 'Active', 'Condo', 1250000, 1295000, 2, 2, 1850, 0, 2015, '2025-06-15', '2025-09-15', 33, 'Luxury beachside condo with ocean views from every room. Modern finishes throughout. Building amenities include pool, gym, and concierge.', 'Ocean view condo in premier Santa Monica building.', 'Show anytime with 2hr notice. Use showing service.', 2.5, 31250, 15625, 'https://tours.example.com/456-ocean', NOW() - INTERVAL '33 days', NOW()),
    
    ('MLS2025003', '789 Mountain View Drive, Pasadena, CA 91103', 'Pasadena', 'CA', '91103', 'Active', 'Single Family', 1450000, 1450000, 5, 4, 3200, 12000, 1925, '2025-07-01', '2025-10-01', 17, 'Historic Craftsman home meticulously restored. Original hardwood floors, custom millwork. Chef kitchen opens to family room. Pool and spa.', 'Restored 1925 Craftsman with modern amenities.', 'By appointment only. Pre-approval required.', 2.5, 36250, 18125, 'https://tours.example.com/789-mountain', NOW() - INTERVAL '17 days', NOW()),
    
    ('MLS2025004', '321 Park Avenue, Beverly Hills, CA 90210', 'Beverly Hills', 'CA', '90210', 'Active', 'Luxury Home', 3500000, 3750000, 6, 7, 5500, 15000, 2020, '2025-05-20', '2025-11-20', 59, 'New construction smart home with every luxury amenity. Home theater, wine cellar, infinity pool. Beverly Hills schools.', 'Brand new luxury estate in Beverly Hills.', 'Shown by appointment only to pre-qualified buyers.', 2.5, 87500, 43750, 'https://tours.example.com/321-park', NOW() - INTERVAL '59 days', NOW()),
    
    ('MLS2025005', '654 Beach Walk, Venice, CA 90291', 'Venice', 'CA', '90291', 'Active', 'Townhouse', 995000, 995000, 3, 2.5, 1650, 2000, 2008, '2025-07-05', '2025-10-05', 13, 'Modern beach townhouse just steps from the sand. Rooftop deck with ocean views. Attached 2-car garage.', 'Beach close townhouse with rooftop deck.', 'Lockbox on front door. Show anytime.', 2.5, 24875, 12437.50, 'https://tours.example.com/654-beach', NOW() - INTERVAL '13 days', NOW()),
    
    -- Pending Listings
    ('MLS2025006', '987 Hillside Lane, Glendale, CA 91206', 'Glendale', 'CA', '91206', 'Pending', 'Single Family', 725000, 750000, 3, 2, 1850, 7500, 1965, '2025-06-01', '2025-09-01', 47, 'Mid-century modern with stunning valley views. Updated kitchen and baths. Hardwood floors throughout.', 'Valley view home with mid-century charm.', 'Do not disturb occupants. Pending sale.', 2.5, 18125, 9062.50, NULL, NOW() - INTERVAL '47 days', NOW()),
    
    ('MLS2025007', '147 Marina Way, Marina del Rey, CA 90292', 'Marina del Rey', 'CA', '90292', 'Pending', 'Condo', 850000, 875000, 2, 2, 1200, 0, 2012, '2025-05-15', '2025-08-15', 63, 'Waterfront condo with boat slip. Floor-to-ceiling windows. Walking distance to restaurants and shops.', 'Marina condo with deeded boat slip.', 'Pending - do not show.', 2.5, 21250, 10625, 'https://tours.example.com/147-marina', NOW() - INTERVAL '63 days', NOW()),
    
    -- Recently Sold
    ('MLS2025008', '258 Elm Street, Burbank, CA 91505', 'Burbank', 'CA', '91505', 'Sold', 'Single Family', 625000, 649000, 3, 2, 1450, 6000, 1955, '2025-04-01', '2025-07-01', 45, 'Charming ranch home in desirable neighborhood. Large backyard perfect for entertaining.', 'Move-in ready ranch home.', 'Sold - do not show.', 2.5, 15625, 7812.50, NULL, NOW() - INTERVAL '108 days', NOW() - INTERVAL '63 days'),
    
    ('MLS2025009', '369 Valley Vista, Sherman Oaks, CA 91403', 'Sherman Oaks', 'CA', '91403', 'Sold', 'Single Family', 1150000, 1195000, 4, 3, 2650, 8500, 1990, '2025-03-15', '2025-06-15', 52, 'Pool home south of Ventura Blvd. Remodeled kitchen opens to family room. Private backyard oasis.', 'South of the Boulevard pool home.', 'Sold - do not show.', 2.5, 28750, 14375, NULL, NOW() - INTERVAL '125 days', NOW() - INTERVAL '73 days'),
    
    -- Coming Soon
    ('MLS2025010', '741 Highland Avenue, Manhattan Beach, CA 90266', 'Manhattan Beach', 'CA', '90266', 'Coming Soon', 'Single Family', 2850000, 2850000, 5, 5, 3800, 7000, 2018, '2025-07-25', '2025-10-25', 0, 'Stunning modern home 3 blocks from beach. Open floor plan, high ceilings, designer finishes throughout.', 'Coming Soon - Modern beach home.', 'Do not show yet. Coming on market 7/25.', 2.5, 71250, 35625, 'https://tours.example.com/741-highland', NOW(), NOW()),
    
    -- More Active Listings for variety
    ('MLS2025011', '852 Riverside Drive, Toluca Lake, CA 91602', 'Los Angeles', 'CA', '91602', 'Active', 'Single Family', 1675000, 1675000, 4, 3.5, 2950, 9500, 2005, '2025-06-25', '2025-09-25', 23, 'Mediterranean estate in guard-gated community. Gourmet kitchen, home office, 3-car garage.', 'Gated community estate home.', 'Call listing agent for gate code.', 2.5, 41875, 20937.50, 'https://tours.example.com/852-riverside', NOW() - INTERVAL '23 days', NOW()),
    
    ('MLS2025012', '963 Canyon Road, Topanga, CA 90290', 'Topanga', 'CA', '90290', 'Active', 'Single Family', 895000, 925000, 3, 2, 1975, 22000, 1978, '2025-05-30', '2025-08-30', 48, 'Secluded canyon retreat on half acre. Vaulted ceilings, updated throughout. Artist studio.', 'Private canyon home with artist studio.', 'GPS required. Call for directions.', 2.5, 22375, 11187.50, NULL, NOW() - INTERVAL '48 days', NOW()),
    
    ('MLS2025013', '159 Broadway, Santa Monica, CA 90401', 'Santa Monica', 'CA', '90401', 'Active', 'Condo', 775000, 775000, 1, 1, 850, 0, 2019, '2025-07-12', '2025-10-12', 6, 'Modern loft in downtown Santa Monica. Walk to Third Street Promenade and beach. Rooftop deck.', 'Downtown loft with rooftop access.', 'Use call box for access.', 2.5, 19375, 9687.50, 'https://tours.example.com/159-broadway', NOW() - INTERVAL '6 days', NOW()),
    
    ('MLS2025014', '357 Pine Street, Hermosa Beach, CA 90254', 'Hermosa Beach', 'CA', '90254', 'Active', 'Townhouse', 1395000, 1425000, 3, 3, 2100, 2500, 2016, '2025-06-10', '2025-09-10', 38, 'Beach close townhome with peek-a-boo ocean views. Open concept, high-end finishes. 2-car garage.', 'Modern townhome near beach and pier.', 'Text for showing. Occupied.', 2.5, 34875, 17437.50, 'https://tours.example.com/357-pine', NOW() - INTERVAL '38 days', NOW()),
    
    ('MLS2025015', '468 Laurel Canyon, Los Angeles, CA 90046', 'Los Angeles', 'CA', '90046', 'Active', 'Single Family', 1095000, 1095000, 3, 2, 1650, 6200, 1947, '2025-07-08', '2025-10-08', 10, 'Hollywood Hills hideaway with city lights views. Updated kitchen, hardwood floors, private yard.', 'Charming Hills home with views.', 'Steep driveway. Park on street.', 2.5, 27375, 13687.50, NULL, NOW() - INTERVAL '10 days', NOW()),
    
    -- Expired/Withdrawn for realistic data
    ('MLS2025016', '579 Washington Boulevard, Venice, CA 90291', 'Venice', 'CA', '90291', 'Expired', 'Single Family', 1250000, 1350000, 3, 2, 1500, 5000, 1924, '2025-01-15', '2025-04-15', 90, 'Classic Venice bungalow on prime walk street. Original charm with modern updates.', 'Walk street bungalow in Venice.', 'Expired - do not show.', 2.5, 31250, 15625, NULL, NOW() - INTERVAL '185 days', NOW() - INTERVAL '95 days'),
    
    ('MLS2025017', '680 Pacific Avenue, Long Beach, CA 90802', 'Long Beach', 'CA', '90802', 'Withdrawn', 'Condo', 525000, 549000, 2, 2, 1100, 0, 2008, '2025-03-01', '2025-06-01', 45, 'Downtown Long Beach high-rise condo. Ocean and city views. Full amenity building.', 'High-rise condo with views.', 'Withdrawn from market.', 2.5, 13125, 6562.50, NULL, NOW() - INTERVAL '140 days', NOW() - INTERVAL '95 days'),
    
    -- Luxury Listings
    ('MLS2025018', '791 Bel Air Road, Los Angeles, CA 90077', 'Los Angeles', 'CA', '90077', 'Active', 'Luxury Home', 8500000, 8500000, 7, 9, 12000, 45000, 2022, '2025-06-20', '2025-12-20', 28, 'Contemporary estate with city and ocean views. Infinity pool, spa, tennis court. State-of-the-art home theater and gym.', 'New Bel Air estate on 1+ acre.', 'Shown only to pre-qualified buyers with proof of funds.', 2.5, 212500, 106250, 'https://tours.example.com/791-belair', NOW() - INTERVAL '28 days', NOW()),
    
    ('MLS2025019', '802 Carbon Beach, Malibu, CA 90265', 'Malibu', 'CA', '90265', 'Active', 'Luxury Home', 12500000, 13500000, 5, 6, 6500, 7800, 2019, '2025-04-10', '2025-10-10', 99, 'Beachfront architectural masterpiece. Floor-to-ceiling glass, private beach access. Smart home technology throughout.', 'Carbon Beach modern with private beach.', 'By appointment only. NDA required.', 2.5, 312500, 156250, 'https://tours.example.com/802-carbon', NOW() - INTERVAL '99 days', NOW()),
    
    ('MLS2025020', '913 Summit Drive, Beverly Hills, CA 90210', 'Beverly Hills', 'CA', '90210', 'Active', 'Luxury Home', 6750000, 6750000, 6, 8, 8500, 25000, 2021, '2025-07-15', '2025-12-15', 3, 'Brand new modern estate with jetliner views. Vanishing edge pool, outdoor kitchen, wine room. Beverly Hills schools.', 'New construction with panoramic views.', 'Brokers preview Thursday 2-5pm.', 2.5, 168750, 84375, 'https://tours.example.com/913-summit', NOW() - INTERVAL '3 days', NOW());

-- Show summary of inserted data
SELECT 
    listing_status, 
    COUNT(*) as count,
    AVG(list_price) as avg_price,
    AVG(days_on_market) as avg_dom,
    SUM(listing_agent_commission) as total_commission
FROM listings 
GROUP BY listing_status
ORDER BY listing_status;

-- Show first 5 records to verify
SELECT 
    id,
    mls_number,
    property_address,
    listing_status,
    list_price,
    bedrooms,
    bathrooms,
    square_footage,
    days_on_market
FROM listings 
ORDER BY created_at DESC 
LIMIT 5;