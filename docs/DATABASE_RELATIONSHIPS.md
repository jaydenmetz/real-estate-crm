# Database Relationships Diagram

## Core Entity Relationships

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   TEAMS     │     │    USERS    │     │  CONTACTS   │
├─────────────┤     ├─────────────┤     ├─────────────┤
│ team_id (PK)│◄────┤ team_id (FK)│     │ id (PK)     │
│ name        │     │ id (PK)     │     │ first_name  │
│ subdomain   │     │ email       │     │ last_name   │
└─────────────┘     │ role        │     │ email       │
                    └─────────────┘     │ phone       │
                           ▲            │ type        │
                           │            └─────────────┘
                           │                   ▲
                           │                   │
┌─────────────────────────┴───────────────────┴─────────────────┐
│                          Referenced By                         │
└────────────────────────────────────────────────────────────────┘
```

## Contacts System (Hub-and-Spoke Model)

```
                         ┌─────────────┐
                         │  CONTACTS   │
                         │   (Hub)     │
                         └──────┬──────┘
                                │
        ┌───────────┬───────────┼───────────┬───────────┐
        ▼           ▼           ▼           ▼           ▼
┌─────────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────────┐
│   AGENTS    │ │ CLIENTS │ │ ESCROWS │ │  LEADS  │ │ APPOINTMENTS│
├─────────────┤ ├─────────┤ ├─────────┤ ├─────────┤ ├─────────────┤
│ contact_id  │ │contact_id│ │    ↓    │ │ (direct │ │ client_id   │
│ license_#   │ │ type     │ │ junction│ │ fields) │ │ (→ clients) │
│ brokerage   │ │ status   │ │  table  │ └─────────┘ └─────────────┘
└─────────────┘ └─────────┘ └─────────┘

Junction Tables:
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ CONTACT_AGENTS  │ │ CONTACT_CLIENTS │ │ CONTACT_ESCROWS │
├─────────────────┤ ├─────────────────┤ ├─────────────────┤
│ contact_id (FK) │ │ contact_id (FK) │ │ contact_id (FK) │
│ agent_id (FK)   │ │ client_id (FK)  │ │ escrow_id (FK)  │
│ relationship    │ │ relationship    │ │ role (buyer/    │
└─────────────────┘ └─────────────────┘ │  seller/agent)  │
                                        └─────────────────┘
```

## Escrow Transaction Flow

```
┌─────────────┐     ┌─────────────────┐     ┌─────────────┐
│   ESCROWS   │────►│ CONTACT_ESCROWS │◄────│  CONTACTS   │
├─────────────┤     ├─────────────────┤     ├─────────────┤
│ id (PK)     │     │ escrow_id (FK)  │     │ id (PK)     │
│ property    │     │ contact_id (FK) │     │ name        │
│ price       │     │ role            │     │ email       │
│ status      │     └─────────────────┘     └─────────────┘
└─────┬───────┘
      │
      ├────────────────┬────────────────┐
      ▼                ▼                ▼
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│  CHECKLIST  │  │  TIMELINE   │  │ DOCUMENTS   │
├─────────────┤  ├─────────────┤  ├─────────────┤
│ escrow_id   │  │ escrow_id   │  │ entity_type │
│ task_name   │  │ event_type  │  │ entity_id   │
│ due_date    │  │ event_date  │  │ file_path   │
└─────────────┘  └─────────────┘  └─────────────┘
```

## Listing Management System

```
┌─────────────┐
│  LISTINGS   │
├─────────────┤
│ id (PK)     │
│ address     │
│ price       │
│ agent_id────┼────► USERS
└─────┬───────┘
      │
      ├─────────────┬──────────────┬────────────────┐
      ▼             ▼              ▼                ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│PRICE_HISTORY│ │  SHOWINGS   │ │ ANALYTICS   │ │ MARKETING   │
├─────────────┤ ├─────────────┤ ├─────────────┤ │ CHECKLIST   │
│ listing_id  │ │ listing_id  │ │ listing_id  │ ├─────────────┤
│ old_price   │ │ showing_date│ │ event_type  │ │ listing_id  │
│ new_price   │ │ feedback    │ │ event_data  │ │ task_name   │
└─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘
```

## Polymorphic Relationships (Documents & Notes)

```
┌─────────────┐                    ┌─────────────┐
│ DOCUMENTS   │                    │    NOTES    │
├─────────────┤                    ├─────────────┤
│ entity_type │◄───┐          ┌───►│ entity_type │
│ entity_id   │    │          │    │ entity_id   │
│ file_path   │    │          │    │ content     │
└─────────────┘    │          │    └─────────────┘
                   │          │
    Can attach to: │          │ Can attach to:
    ┌──────────────┴──────────┴──────────────┐
    │                                        │
    ▼                ▼              ▼        ▼
ESCROWS          LISTINGS       CLIENTS   LEADS
APPOINTMENTS     CONTACTS       AGENTS    (any entity)
```

## Multi-Tenant Data Isolation

```
All Business Tables Include:
┌─────────────┐
│ ANY TABLE   │
├─────────────┤
│ ...         │
│ team_id (FK)├────► TEAMS (for data isolation)
│ ...         │
└─────────────┘
```

## Key Relationship Rules

1. **One-to-Many Relationships**:
   - Team → Users, Escrows, Listings, Clients, etc.
   - User → Created/Assigned records
   - Escrow → Checklist items, Timeline events
   - Listing → Price history, Showings, Analytics

2. **Many-to-Many Relationships** (via junction tables):
   - Contacts ↔ Agents (contact_agents)
   - Contacts ↔ Clients (contact_clients)
   - Contacts ↔ Escrows (contact_escrows with role)

3. **Polymorphic Relationships**:
   - Documents → Any entity (via entity_type + entity_id)
   - Notes → Any entity (via entity_type + entity_id)

4. **Self-Referential**:
   - Contacts → Contacts (spouse_id, referral_source_id)
   - Leads → Clients (converted_to_client_id)

5. **Soft Delete Pattern**:
   - Most tables have deleted_at field
   - Queries filter WHERE deleted_at IS NULL
   - Maintains referential integrity

## Data Flow Examples

### Creating an Escrow:
1. Create/Select Contacts (buyers, sellers, agents)
2. Create Escrow record
3. Create contact_escrows entries with appropriate roles
4. System auto-creates checklist items
5. Timeline events logged automatically

### Converting Lead to Client:
1. Lead record exists with contact info
2. Create Contact record from lead data
3. Create Client record linked to contact
4. Update lead.converted_to_client_id
5. Maintain full conversion history

### Document Upload:
1. Upload file to storage
2. Create document record with entity_type='escrow' and entity_id='ESC-2025-001'
3. Set visibility and sharing permissions
4. Track downloads and access