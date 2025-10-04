# Real Estate CRM - Escrow System Documentation

## Overview

This document describes the new contact-based escrow system implementation for the Real Estate CRM. The system has been restructured to use a unified Contacts table as the central repository for all people (agents, clients, buyers, sellers, etc.) with specialized tables extending contact information as needed.

## Database Structure

### Core Tables

#### 1. **contacts** - Central repository for all people
```sql
- id: UUID (Primary Key)
- contact_type: VARCHAR(50) - 'agent', 'client', 'buyer', 'seller', 'vendor', 'other'
- first_name, last_name: VARCHAR(100)
- full_name: VARCHAR(200) (Generated column)
- email: VARCHAR(255) UNIQUE
- phone, mobile_phone, work_phone: VARCHAR(20)
- address fields (street, city, state, zip)
- notes: TEXT
- tags: TEXT[]
- And many more fields for comprehensive contact management
```

#### 2. **agents** - Extension for real estate agents
```sql
- id: UUID (Primary Key)
- contact_id: UUID (Foreign Key to contacts)
- license_number, license_state: VARCHAR
- brokerage_name: VARCHAR(200)
- commission defaults and metrics
```

#### 3. **clients** - Extension for clients
```sql
- id: UUID (Primary Key)
- contact_id: UUID (Foreign Key to contacts)
- client_type: VARCHAR(50) - 'buyer', 'seller', 'both', etc.
- price range, preferences, pre-approval info
- metrics and activity tracking
```

### Junction Tables

#### 1. **contact_escrows** - Links contacts to escrows with roles
```sql
- contact_id: UUID (Foreign Key to contacts)
- escrow_id: VARCHAR(50) (Foreign Key to escrows)
- role: VARCHAR(50) - 'buyer', 'seller', 'listing_agent', 'buyer_agent', etc.
- is_primary: BOOLEAN
- commission_percentage, commission_amount (for agents)
- PRIMARY KEY (contact_id, escrow_id, role)
```

#### 2. **contact_agents** - Links contacts to their agents
```sql
- contact_id, agent_id: UUID
- relationship_type: VARCHAR(50)
- PRIMARY KEY (contact_id, agent_id, relationship_type)
```

#### 3. **contact_clients** - Links contacts to client records
```sql
- contact_id, client_id: UUID
- relationship_type: VARCHAR(50)
- is_primary: BOOLEAN
- PRIMARY KEY (contact_id, client_id, relationship_type)
```

## Setup Instructions

### 1. Run the Database Migration

```bash
cd backend
npm run migrate
```

This will create all necessary tables with proper indexes and constraints.

### 2. Create Test Data

```bash
node scripts/create-test-escrow.js
```

This creates:
- 4 test contacts (buyer, seller, listing agent, buyer agent)
- Agent records for the two agents
- Client records for buyer and seller
- One test escrow at "123 Main St, San Diego" for $850,000
- Links all participants to the escrow with appropriate roles
- Creates 6 checklist items (3 completed, 3 pending)

### 3. Run the Test Suite

```bash
node test-escrow-system.js

# For verbose output with query plans:
node test-escrow-system.js --verbose
```

The test suite includes:
- Database connection tests
- Contact creation verification
- Relationship integrity tests
- Escrow data verification
- API endpoint tests
- Null safety tests
- Error handling tests
- Performance benchmarks

Expected output: All 11 tests should pass in under 100ms total.

### 4. Test the API Endpoints

Start the test server:
```bash
node test-new-endpoint.js
```

Then access:
- GET `http://localhost:3001/api/v1/escrows/ESC-TEST-001` - Get escrow details
- GET `http://localhost:3001/api/v1/escrows` - List all escrows

### 5. Check System Health

```bash
node test-health-endpoint.js
```

Or access: GET `http://localhost:3002/api/v1/health/escrow-system`

## API Response Format

### Get Escrow Details Response
```json
{
  "success": true,
  "data": {
    "id": "ESC-TEST-001",
    "property_address": "123 Main St, San Diego, CA 92101",
    "escrow_status": "Active",
    "purchase_price": 850000,
    "commission_percentage": 3,
    "gross_commission": 25500,
    
    "buyers": [{
      "role": "buyer",
      "is_primary": true,
      "contact_id": "uuid",
      "full_name": "John Smith",
      "email": "john.smith@email.com",
      "phone": "(619) 555-0100",
      "address": { ... }
    }],
    
    "sellers": [{
      "role": "seller",
      "is_primary": true,
      "contact_id": "uuid",
      "full_name": "Jane Doe",
      "email": "jane.doe@email.com",
      "phone": "(858) 555-0200",
      "address": { ... }
    }],
    
    "listing_agent": {
      "role": "listing_agent",
      "full_name": "Sarah Johnson",
      "email": "sarah.johnson@realty.com",
      "agent_info": {
        "license_number": "CA-RE-123456",
        "brokerage_name": "Premier Realty Group",
        "commission_percentage": 1.5,
        "commission_amount": 12750
      }
    },
    
    "buyer_agent": {
      "role": "buyer_agent",
      "full_name": "Mike Davis",
      "email": "mike.davis@realty.com",
      "agent_info": {
        "license_number": "CA-RE-789012",
        "brokerage_name": "Coastal Realty",
        "commission_percentage": 1.5,
        "commission_amount": 12750
      }
    },
    
    "checklist": [
      {
        "id": "uuid",
        "task": "Open Escrow",
        "completed": true,
        "completed_date": "2025-01-10T00:00:00.000Z"
      },
      ...
    ],
    
    "documents": [],
    "timeline": []
  },
  "timestamp": "2025-01-18T00:00:00.000Z"
}
```

## Common Operations

### Add a New Participant to an Escrow
```sql
INSERT INTO contact_escrows (contact_id, escrow_id, role, is_primary)
VALUES ('contact-uuid', 'ESC-001', 'inspector', false);
```

### Find All Escrows for a Contact
```sql
SELECT e.*, ce.role, ce.commission_percentage
FROM contact_escrows ce
JOIN escrows e ON ce.escrow_id = e.id
WHERE ce.contact_id = 'contact-uuid';
```

### Get All Participants for an Escrow
```sql
SELECT c.*, ce.role, ce.commission_percentage
FROM contact_escrows ce
JOIN contacts c ON ce.contact_id = c.id
WHERE ce.escrow_id = 'ESC-001'
ORDER BY ce.role, c.full_name;
```

## Error Handling

The system includes comprehensive error handling:

1. **Database Errors**: Logged with details, generic message returned to client
2. **Not Found (404)**: When escrow doesn't exist
3. **Validation Errors (400)**: When request data is invalid
4. **Server Errors (500)**: For unexpected failures

All errors follow this format:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message"
  },
  "timestamp": "2025-01-18T00:00:00.000Z"
}
```

## Performance Considerations

1. **Indexes**: All foreign keys and commonly searched fields are indexed
2. **Query Optimization**: Uses CTEs and joins for efficient data fetching
3. **Connection Pooling**: Database connections are pooled for better performance
4. **Null Safety**: All queries handle NULL values gracefully

## Troubleshooting

### Common Issues

1. **"relation does not exist" error**
   - Solution: Run `npm run migrate` to ensure all tables are created

2. **"foreign key violation" error**
   - Solution: Ensure referenced records exist before creating relationships

3. **Test data not found**
   - Solution: Run `node scripts/create-test-escrow.js` to create test data

4. **Performance issues**
   - Check indexes with: `\di` in psql
   - Run EXPLAIN ANALYZE on slow queries
   - Ensure connection pooling is configured

### Clean Up Test Data

To remove test data:
```sql
DELETE FROM escrows WHERE id = 'ESC-TEST-001';
DELETE FROM contacts WHERE email IN (
  'john.smith@email.com', 
  'jane.doe@email.com',
  'sarah.johnson@realty.com',
  'mike.davis@realty.com'
);
```

## Security Considerations

1. **SQL Injection**: All queries use parameterized statements
2. **Input Validation**: Express-validator used for request validation
3. **Error Messages**: Database errors are logged but not exposed to clients
4. **UUID Usage**: All IDs are UUIDs for better security and uniqueness

## Future Enhancements

1. **Soft Deletes**: Already supported via deleted_at column
2. **Audit Trail**: Can be added to track all changes
3. **Document Management**: Documents table exists but needs integration
4. **Timeline Events**: Timeline table exists for tracking escrow events
5. **Notifications**: Can be added via webhooks or email integration

## Migration Rollback

If needed, the migration can be rolled back:
```sql
-- Run the DOWN migration section from 004_create_contacts_system.sql
-- This will drop all new tables and restore the old structure
```

---

For questions or issues, please refer to the test suite output or check the health endpoint for system status.