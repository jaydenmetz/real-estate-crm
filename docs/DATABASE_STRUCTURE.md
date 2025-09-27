# Real Estate CRM Database Structure

## Overview

This document outlines the complete database structure for the Real Estate CRM system, including all tables, relationships, and key architectural decisions.

## Core Database Tables

### 1. Teams & Users (Multi-tenancy)

#### teams
- **Purpose**: Multi-tenant support for different real estate teams
- **Key Fields**: 
  - `team_id` (UUID, PK)
  - `name`, `subdomain` (unique)
  - `settings` (JSONB)
- **Relationships**: Referenced by all other tables for data isolation

#### users
- **Purpose**: System users (agents, admins, etc.)
- **Key Fields**:
  - `id` (UUID, PK)
  - `email` (unique), `first_name`, `last_name`
  - `role`, `team_id` (FK → teams)
  - `password_hash`, `is_active`
- **Relationships**: 
  - Belongs to teams
  - Referenced by many tables for created_by/assigned_to

### 2. Contacts System (Central Person Management)

#### contacts
- **Purpose**: Central repository for ALL people in the system
- **Key Fields**:
  - `id` (UUID, PK)
  - Personal: `first_name`, `last_name`, `full_name` (generated)
  - Contact: `email`, `phone_primary`, `phone_secondary`, `phone_work`
  - Address: `street_address`, `city`, `state`, `zip_code`, `country`
  - Professional: `company`, `job_title`, `website`, `linkedin_url`
  - Relationships: `spouse_id` (FK → contacts), `referral_source_id` (FK → contacts)
  - `type` (person, company, trust, estate)
  - `source_type`, `source_details` (JSONB)
  - `tags` (text[])
- **Relationships**: Central hub for agents, clients, buyers, sellers

#### agents
- **Purpose**: Real estate professionals (extends contacts)
- **Key Fields**:
  - `id` (UUID, PK)
  - `contact_id` (FK → contacts)
  - License: `license_number`, `license_state`, `license_expires_at`
  - Brokerage: `brokerage_name`, `brokerage_phone`, `brokerage_address`
  - `specialties` (text[])
  - Performance: `total_sales_volume`, `total_transactions`, `avg_sale_price`
  - `commission_percentage_default`
- **Relationships**: Links to contacts via contact_id

#### clients (redefined)
- **Purpose**: Active clients (extends contacts)
- **Key Fields**:
  - `id` (UUID, PK)
  - `contact_id` (FK → contacts)
  - `client_type` (buyer, seller, both)
  - `status` (active, inactive, past)
  - Property preferences: `property_types`, `preferred_locations`, `price_range_min/max`
  - `pre_qualified`, `pre_approval_amount`
  - Activity: `property_views_count`, `offers_made_count`, `last_activity_date`
- **Relationships**: Links to contacts via contact_id

### 3. Real Estate Transactions

#### escrows
- **Purpose**: Track real estate transactions
- **Key Fields**:
  - `id` (VARCHAR(50), PK) - Custom ID format
  - Property: `property_address`, `property_type`
  - Financial: `purchase_price`, `earnest_money_deposit`, `down_payment`, `loan_amount`
  - Commission: `commission_percentage`, `gross_commission`, `net_commission`
  - Dates: `acceptance_date`, `closing_date`
  - `escrow_status` (Active, Pending, Closed)
  - `lead_source`
  - `created_by` (FK → users), `team_id` (FK → teams)
  - `deleted_at` (soft delete)
- **Relationships**:
  - Belongs to team and user
  - Has many contacts through contact_escrows

#### contact_escrows
- **Purpose**: Junction table replacing escrow_buyers/sellers
- **Key Fields**:
  - `id` (SERIAL, PK)
  - `contact_id` (FK → contacts)
  - `escrow_id` (FK → escrows)
  - `role` (buyer, seller, buyer_agent, seller_agent, etc.)
  - `is_primary` (boolean)
- **Relationships**: Links contacts to escrows with specific roles

#### escrow_checklist
- **Purpose**: Task management for escrows
- **Key Fields**:
  - `id` (UUID, PK)
  - `escrow_id` (FK → escrows)
  - `task_name`, `description`
  - `priority` (low, medium, high, urgent)
  - `due_date`, `completed_at`
  - `completed_by` (FK → users)
- **Relationships**: Belongs to escrow

#### escrow_timeline
- **Purpose**: Event history for escrows
- **Key Fields**:
  - `id` (UUID, PK)
  - `escrow_id` (FK → escrows)
  - `event_type`, `event_date`
  - `description`, `metadata` (JSONB)
  - `created_by` (FK → users)
- **Relationships**: Belongs to escrow

### 4. Property Listings

#### listings
- **Purpose**: Property inventory management
- **Key Fields**:
  - `id` (UUID, PK)
  - Property: `property_address`, `property_type`
  - Pricing: `list_price`, `original_list_price`
  - Details: `bedrooms`, `bathrooms`, `square_feet`, `lot_size`, `year_built`
  - Marketing: `description`, `features` (JSONB), `photos` (JSONB)
  - Commission: `listing_commission`, `buyer_commission`, `total_commission` (generated)
  - Marketing assets: `virtual_tour_link`, `professional_photos`, `drone_photos`
  - `listing_status`, `mls_number` (unique)
  - Dates: `listing_date`, `expiration_date`
  - `days_on_market`, `listing_agent_id` (FK → users)
  - `deleted_at` (soft delete)
- **Relationships**:
  - Belongs to team and agent
  - Has many price changes, showings, analytics events

#### listing_price_history
- **Purpose**: Track price changes
- **Key Fields**:
  - `listing_id` (FK → listings)
  - `old_price`, `new_price`
  - `change_date`, `reason`
  - `changed_by` (FK → users)

#### listing_showings
- **Purpose**: Track property showings
- **Key Fields**:
  - `listing_id` (FK → listings)
  - `showing_date`, `showing_time`
  - `agent_name`, `agent_email`, `agent_phone`
  - `client_interest_level` (1-10)
  - `feedback`, `follow_up_required`

#### listing_analytics
- **Purpose**: Track listing engagement
- **Key Fields**:
  - `listing_id` (FK → listings)
  - `event_type` (view, favorite, share, inquiry)
  - `event_date`, `event_data` (JSONB)

### 5. Lead Management

#### leads
- **Purpose**: Track potential clients
- **Key Fields**:
  - `id` (UUID, PK)
  - Contact: `first_name`, `last_name`, `email`, `phone`
  - Qualification: `lead_source`, `lead_status`, `lead_score`, `lead_temperature`
  - Interest: `property_interest`, `budget_range`, `timeline`
  - Follow-up: `last_contact_date`, `next_follow_up`
  - `assigned_agent_id` (FK → users)
  - `converted_to_client_id` (FK → clients)
  - `deleted_at` (soft delete)
- **Relationships**:
  - Can be converted to client
  - Assigned to agent

### 6. Calendar & Scheduling

#### appointments
- **Purpose**: Manage showings, meetings, events
- **Key Fields**:
  - `id` (UUID, PK)
  - `title`, `appointment_type`
  - Schedule: `appointment_date`, `start_time`, `end_time`
  - `location`, `description`
  - `status`, `reminder_sent`
  - Related: `client_id` (FK → clients), `listing_id` (FK → listings)
  - `agent_id` (FK → users)
  - `deleted_at` (soft delete)
- **Relationships**: Links to clients, listings, and agents

### 7. Document Management

#### documents
- **Purpose**: File storage and management
- **Key Fields**:
  - `id` (UUID, PK)
  - Association: `entity_type`, `entity_id` (polymorphic)
  - File: `file_name`, `file_path`, `file_size`, `mime_type`
  - `storage_location` (local, s3, etc.)
  - `category` (general, property, contract, identification, financial, marketing)
  - Access: `visibility` (private, team, public), `shared_with` (JSONB)
  - Tracking: `download_count`, `view_count`, `last_accessed_at`
  - `expires_at`, `status` (active, archived, deleted)
  - `metadata` (JSONB), `variants` (JSONB)
  - `uploaded_by` (FK → users)
  - `deleted_at` (soft delete)
- **Relationships**: Can belong to any entity via entity_type/entity_id

### 8. Notes System

#### notes
- **Purpose**: Comments and notes on any entity
- **Key Fields**:
  - `id` (UUID, PK)
  - Association: `entity_type`, `entity_id` (polymorphic)
  - `content`, `is_private`
  - `created_by` (FK → users)
  - `deleted_at` (soft delete)
- **Relationships**: Can belong to any entity via entity_type/entity_id

### 9. AI System

#### ai_agents
- **Purpose**: Configure and track AI agents
- **Key Fields**:
  - `id` (UUID, PK)
  - `name`, `role`, `description`
  - `model`, `enabled`
  - `settings` (JSONB), `capabilities` (JSONB)
  - `last_activity`, `total_tasks_completed`
- **Relationships**: Belongs to team

### 10. System Tables

#### migrations
- **Purpose**: Track database migrations
- **Key Fields**:
  - `id` (SERIAL, PK)
  - `filename` (unique)
  - `executed_at`

## Junction Tables Summary

1. **contact_agents**: Links contacts ↔ agents (many-to-many)
2. **contact_clients**: Links contacts ↔ clients (many-to-many)
3. **contact_escrows**: Links contacts ↔ escrows with roles
4. **escrow_buyers_old**: Deprecated (use contact_escrows)
5. **escrow_sellers_old**: Deprecated (use contact_escrows)

## Key Database Patterns

### 1. Soft Deletes
Most tables include `deleted_at` timestamp for soft deletion with partial indexes for performance.

### 2. Multi-tenancy
All business tables include `team_id` for data isolation between teams.

### 3. Audit Fields
All tables have:
- `created_at` (timestamp with timezone)
- `updated_at` (timestamp with timezone, auto-updated via trigger)

### 4. Polymorphic Associations
Documents and Notes use `entity_type` + `entity_id` pattern to attach to any entity.

### 5. JSONB Usage
Flexible data storage for:
- Settings and configurations
- Metadata and extended attributes
- Lists (features, photos, tags)
- Tracking data (source_details, event_data)

### 6. Generated Columns
- `contacts.full_name`: Concatenated from first/last name
- `listings.total_commission`: Sum of listing + buyer commission

### 7. Check Constraints
Enforced enumerations for:
- Status fields (escrow_status, listing_status, etc.)
- Type fields (client_type, appointment_type, etc.)
- Categories (document category, lead temperature, etc.)

## Index Strategy

1. **Primary Keys**: All tables have indexes on PK
2. **Foreign Keys**: Indexes on all FK relationships
3. **Status/Type Fields**: Indexes on frequently filtered columns
4. **Date Fields**: Indexes on date columns used for sorting/filtering
5. **Soft Delete**: Partial indexes WHERE deleted_at IS NULL
6. **Entity Lookups**: Composite indexes on (entity_type, entity_id)

## Database Evolution

1. **Initial Design**: Basic CRM with separate buyer/seller tables
2. **Contacts Centralization**: Unified all person data into contacts table
3. **Enhanced Features**: Added price history, showings, analytics
4. **Document System**: Rebuilt with advanced metadata and sharing
5. **Operational Support**: Added checklists and timelines for escrows

This architecture supports a sophisticated real estate CRM with strong contact management, flexible relationships, comprehensive tracking, and multi-tenant isolation.