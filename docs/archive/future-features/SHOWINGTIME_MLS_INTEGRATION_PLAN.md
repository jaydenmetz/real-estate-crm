# ShowingTime vs Your CRM: Complete Analysis & Implementation Plan

**Created:** December 8, 2025
**Status:** Future Feature - Not Currently Prioritized
**Reference:** ShowingTime API Analysis from network traffic inspection

---

## Executive Summary

Your database structure is **solid** but missing key MLS integration fields. ShowingTime uses **RETS (Real Estate Transaction Standard)** feeds from MLS providers - not traditional IDX. The key differences are:

1. **MLS Integration** - ShowingTime pulls directly from MLS databases via RETS
2. **Activity/Showing Workflow** - Specialized status tracking for showing approval flow
3. **Multi-MLS Support** - Tracks multiple MLS memberships per listing/agent

---

## 1. LISTINGS TABLE COMPARISON

### ShowingTime Fields You're MISSING:

| Field | ShowingTime | Purpose | Priority |
|-------|-------------|---------|----------|
| `mls_code` | `"BAK"` | MLS provider identifier | **HIGH** |
| `mls_name` | `"Bakersfield Association..."` | Full MLS name | Medium |
| `mls_display_code` | `"BAK"` | Display abbreviation | Low |
| `office_mls_id` | `"13087"` | Agent's office ID in MLS | **HIGH** |
| `office_mls_code` | `"BAK"` | Office MLS association | Medium |
| `street_number` | `"1917"` | Parsed address component | Medium |
| `street_direction` | `""` | N/S/E/W | Low |
| `street_name` | `"Pacific"` | Street only | Medium |
| `street_suffix` | `"Street"` | St/Ave/Blvd | Low |
| `unit` | `null` | Unit/apt number | Medium |
| `is_showable` | `true` | Can showings be scheduled? | **HIGH** |
| `is_internal` | `false` | Internal listing (not on MLS) | Medium |
| `future_showings_prevented` | `false` | Block future showings | **HIGH** |
| `has_listing_contract` | `true` | Has signed listing agreement | Medium |
| `has_sales_contract` | `false` | Under contract status | **HIGH** |
| `is_pending` | `false` | Pending sale | **HIGH** |
| `is_pending_backup_contract` | `false` | Accepting backups | Medium |
| `wizardized` | `false` | Showing setup complete | Medium |
| `in_house_status` | `null` | Internal status override | Low |
| `latitude` | `35.37941` | Geo coordinates | **HIGH** |
| `longitude` | `-118.97118` | Geo coordinates | **HIGH** |
| `appt_type` | `1` | Appointment type enum | **HIGH** |
| `mls_area` | `"31"` | MLS area code | Medium |
| `directions` | `null` | Driving directions | Medium |
| `taxes` | `null` | Annual taxes | Medium |
| `comments` | `"..."` | MLS public remarks | Medium |
| `zoning` | `"High Density..."` | Zoning info | Low |
| `style` | `"3 Units"` | Property style | Medium |
| `fireplaces` | `null` | Fireplace count | Low |
| `full_baths` | `null` | Full bath count | Medium |
| `half_baths` | `null` | Half bath count | Medium |
| `middle_school` | `"Compton"` | School district | Low |
| `elementary_school` | `"Mann, Horace"` | Elementary school | Low |
| `high_school` | `"East"` | High school | Low |
| `commission_rate` | `null` | Buyer agent commission | **HIGH** |
| `commission_info` | `null` | Commission details | Medium |
| `listing_office_name` | `"MRM and Associates"` | Office name | Medium |
| `was_imported_from_rets` | `true` | RETS sync flag | Medium |
| `normalized_listing_type` | `0` | Standard type enum | Medium |
| `mls_listing_url` | `null` | Link to MLS detail | Medium |
| `can_edit` | `false` | Edit permission | Medium |
| `record_status` | `1` | Active/inactive flag | Medium |
| `has_parent_listing` | `false` | Merged listing flag | Low |
| `merged_listing_ids` | `[]` | IDs of merged listings | Low |
| `merged_parent_listing_id` | `null` | Parent if merged | Low |

### Fields You HAVE That ShowingTime DOESN'T:

| Your Field | Keep? | Notes |
|------------|-------|-------|
| `display_id` | ✅ | Useful for internal reference |
| `global_id` | ✅ | Good for API |
| `team_sequence_id` | ✅ | Team-specific numbering |
| `professional_photos` | ✅ | Marketing feature |
| `drone_photos` | ✅ | Marketing feature |
| `video_walkthrough` | ✅ | Marketing feature |
| `virtual_tour_link` | ✅ | ShowingTime has separately |
| `hoa_fees` | ✅ | ShowingTime likely has in RETS |
| `hoa_frequency` | ✅ | Good addition |
| `property_history_notes` | ✅ | CRM-specific |
| `features` (jsonb) | ✅ | Flexible structure |
| `photos` (jsonb) | ✅ | Photo management |
| `is_sample` | ❓ | Dev/testing only |
| `sample_group_id` | ❓ | Dev/testing only |
| `show_commission` | ✅ | Privacy toggle |
| `commission_type` | ✅ | Flexibility |

---

## 2. SHOWINGS/ACTIVITIES COMPARISON

### ShowingTime's Activity Structure:

```json
{
  "activityId": 847061544,
  "activitySubTypeId": 8,           // Type of showing
  "startTime": "2025-12-08T15:15:00Z",
  "endTime": "2025-12-08T16:15:00Z",
  "status": 2,                      // Enum: Requested/Confirmed/Cancelled/etc.
  "agentClientId": null,            // Buyer linked to showing
  "externalBuyerId": null,          // External buyer ID
  "cameraPerson": null,             // For video showings
  "useLiveVideo": null,             // Virtual tour flag
  "noteForListingAgent": "",
  "shareClientWithLA": false,       // Share buyer info
  "agentInquiryStatus": 0,
  "agentHasLockboxAlternativeAccess": null
}
```

### Your Current `showings` Table - Missing:

| Field | ShowingTime | Purpose | Add? |
|-------|-------------|---------|------|
| `activity_id` | `847061544` | External activity reference | **YES** |
| `activity_sub_type_id` | `8` | Showing sub-type | **YES** |
| `start_time` | ISO timestamp | UTC start time | Have (via appointment) |
| `end_time` | ISO timestamp | UTC end time | Have (via appointment) |
| `status_code` | `2` | Numeric status enum | **YES** |
| `external_buyer_id` | `null` | External buyer reference | Medium |
| `camera_person` | `null` | Video showing contact | Low |
| `use_live_video` | `null` | Virtual showing flag | **YES** |
| `note_for_listing_agent` | `""` | Message to LA | **YES** |
| `share_client_with_la` | `false` | Privacy flag | **YES** |
| `agent_inquiry_status` | `0` | Follow-up status | Medium |
| `has_lockbox_alternative` | `null` | Access method | Medium |

### Your `showings` Fields - Analysis:

| Your Field | ShowingTime Equivalent | Keep? |
|------------|------------------------|-------|
| `appointment_id` | Parent activity | ✅ |
| `stop_id` | Multi-stop support | ✅ Better than ST |
| `listing_id` | listing.listingId | ✅ |
| `showing_order` | Multi-listing tour order | ✅ Better than ST |
| `showing_status` | status (enum) | ✅ Enhance |
| `showing_type` | activitySubTypeId | ✅ Map to enum |
| `requested_at` | N/A | ✅ Keep |
| `confirmed_at` | N/A | ✅ Keep |
| `confirmation_number` | N/A | ✅ Keep |
| `access_type` | Related to lockbox | ✅ Keep |
| `lockbox_code` | Separate in ST | ✅ Keep |
| `access_notes` | showingInstructions | ✅ Keep |
| `client_interest_level` | N/A | ✅ Better than ST |
| `agent_notes` | noteForListingAgent | ✅ Keep |
| `client_feedback` | N/A | ✅ Better than ST |

---

## 3. AGENTS/MLS MEMBERSHIP - NEW TABLE NEEDED

ShowingTime tracks agents with **multiple MLS memberships**:

```json
"agents": [
  {
    "agentMlsId": "AR41668",
    "mlsCode": "MRMLS",
    "role": 3,
    "firstName": "Steven",
    "lastName": "Rangel",
    "email": "steve@steverangel.com",
    "agentUserId": 32231322,
    "phones": [{"number": "8184216668", "type": 0, "canText": false}]
  },
  {
    "agentMlsId": "14839",
    "mlsCode": "BAK",
    "role": 1,
    ...
  }
]
```

### New Table: `agent_mls_memberships`

```sql
CREATE TABLE agent_mls_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  mls_code VARCHAR(20) NOT NULL,        -- "BAK", "MRMLS"
  mls_name VARCHAR(200),                -- "Bakersfield Association of Realtors"
  agent_mls_id VARCHAR(50) NOT NULL,    -- "14839", "AR41668"
  office_mls_id VARCHAR(50),            -- Office ID in this MLS
  office_name VARCHAR(200),
  role INTEGER DEFAULT 0,               -- 0=listing, 1=selling, 3=both
  is_primary BOOLEAN DEFAULT false,
  can_text BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, mls_code),
  UNIQUE(contact_id, mls_code)
);
```

---

## 4. MLS PROVIDERS TABLE - NEW

```sql
CREATE TABLE mls_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mls_code VARCHAR(20) UNIQUE NOT NULL,  -- "BAK"
  mls_name VARCHAR(200) NOT NULL,        -- "Bakersfield Association of Realtors"
  mls_display_code VARCHAR(20),          -- Display abbreviation
  rets_url VARCHAR(500),                 -- RETS server URL
  rets_version VARCHAR(20),              -- RETS version
  timezone VARCHAR(50),                  -- "America/Los_Angeles"
  coverage_area JSONB,                   -- Geographic coverage
  is_active BOOLEAN DEFAULT true,
  api_credentials_encrypted TEXT,        -- Encrypted API creds
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 5. LISTING AGENTS JUNCTION TABLE - NEW

ShowingTime stores multiple agents per listing:

```sql
CREATE TABLE listing_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  contact_id UUID REFERENCES contacts(id),
  mls_membership_id UUID REFERENCES agent_mls_memberships(id),
  role INTEGER NOT NULL DEFAULT 0,       -- 0=listing, 1=selling, 3=cooperating
  is_primary BOOLEAN DEFAULT false,
  commission_split DECIMAL(5,2),         -- Agent's split
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(listing_id, user_id, role),
  UNIQUE(listing_id, contact_id, role)
);
```

---

## 6. SHOWING AVAILABILITY/RESTRICTIONS - NEW

ShowingTime has complex availability rules:

```sql
CREATE TABLE listing_showing_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE UNIQUE,

  -- Showability
  is_showable BOOLEAN DEFAULT true,
  future_showings_prevented BOOLEAN DEFAULT false,
  prevent_until TIMESTAMPTZ,

  -- Appointment type
  appt_type INTEGER DEFAULT 1,           -- 1=Go direct, 2=Call first, etc.
  appt_type_label VARCHAR(100),

  -- Access
  lockbox_type VARCHAR(50),              -- "Supra", "SentriLock", "Combo"
  lockbox_code VARCHAR(100),
  access_instructions TEXT,

  -- Restrictions
  min_notice_hours INTEGER DEFAULT 1,
  max_daily_showings INTEGER,
  blackout_times JSONB,                  -- Recurring unavailable times

  -- Notifications
  notify_listing_agent BOOLEAN DEFAULT true,
  notify_seller BOOLEAN DEFAULT false,
  require_confirmation BOOLEAN DEFAULT false,
  auto_confirm BOOLEAN DEFAULT false,

  -- Notes
  showing_instructions TEXT,             -- Public to showing agents
  notes_to_staff TEXT,                   -- Internal notes
  temp_note TEXT,
  temp_note_expiry TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 7. REGISTERED OFFERS - NEW

ShowingTime tracks offers:

```sql
CREATE TABLE listing_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,

  -- Offer status
  status VARCHAR(50) DEFAULT 'pending',  -- pending, active, accepted, rejected
  offer_amount DECIMAL(12,2),
  offer_date TIMESTAMPTZ,
  expiration_date TIMESTAMPTZ,

  -- Buyer info
  buyer_agent_id UUID REFERENCES contacts(id),
  buyer_name VARCHAR(200),
  buyer_email VARCHAR(255),
  buyer_phone VARCHAR(50),

  -- Terms
  financing_type VARCHAR(50),            -- Cash, Conventional, FHA, VA
  contingencies JSONB,
  earnest_money DECIMAL(12,2),
  close_by_date DATE,

  -- Documents
  offer_document_url TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 8. IMPLEMENTATION PRIORITY PLAN

### Phase 1: MLS Integration Foundation (Critical)

**Database Changes:**
1. Add to `listings`:
   ```sql
   ALTER TABLE listings ADD COLUMN IF NOT EXISTS mls_code VARCHAR(20);
   ALTER TABLE listings ADD COLUMN IF NOT EXISTS office_mls_id VARCHAR(50);
   ALTER TABLE listings ADD COLUMN IF NOT EXISTS latitude DECIMAL(10,8);
   ALTER TABLE listings ADD COLUMN IF NOT EXISTS longitude DECIMAL(11,8);
   ALTER TABLE listings ADD COLUMN IF NOT EXISTS is_showable BOOLEAN DEFAULT true;
   ALTER TABLE listings ADD COLUMN IF NOT EXISTS has_sales_contract BOOLEAN DEFAULT false;
   ALTER TABLE listings ADD COLUMN IF NOT EXISTS is_pending BOOLEAN DEFAULT false;
   ALTER TABLE listings ADD COLUMN IF NOT EXISTS appt_type INTEGER DEFAULT 1;
   ALTER TABLE listings ADD COLUMN IF NOT EXISTS commission_rate VARCHAR(50);
   ALTER TABLE listings ADD COLUMN IF NOT EXISTS was_imported_from_mls BOOLEAN DEFAULT false;
   ALTER TABLE listings ADD COLUMN IF NOT EXISTS mls_last_sync TIMESTAMPTZ;
   ```

2. Create `mls_providers` table
3. Create `agent_mls_memberships` table

### Phase 2: Showing Workflow Enhancement

**Database Changes:**
1. Create `listing_showing_settings` table
2. Add to `showings`:
   ```sql
   ALTER TABLE showings ADD COLUMN IF NOT EXISTS activity_external_id BIGINT;
   ALTER TABLE showings ADD COLUMN IF NOT EXISTS showing_sub_type INTEGER;
   ALTER TABLE showings ADD COLUMN IF NOT EXISTS status_code INTEGER;
   ALTER TABLE showings ADD COLUMN IF NOT EXISTS use_live_video BOOLEAN;
   ALTER TABLE showings ADD COLUMN IF NOT EXISTS note_for_listing_agent TEXT;
   ALTER TABLE showings ADD COLUMN IF NOT EXISTS share_client_with_la BOOLEAN DEFAULT false;
   ```

### Phase 3: Multi-Agent Support

1. Create `listing_agents` junction table
2. Update APIs to support multiple agents per listing

### Phase 4: Offers & Advanced Features

1. Create `listing_offers` table
2. Add address parsing fields to listings

---

## 9. API ENDPOINTS NEEDED

### Listings Search (like ShowingTime)
```
POST /api/v1/listings/search
{
  "mlsNumber": "202506662",
  "mlsCode": "BAK"
}
```

### Get Listing with Agents
```
GET /api/v1/listings/:id?include=agents,showingSettings
```

### Schedule Multi-Property Showing
```
POST /api/v1/showings/multi
{
  "listings": [
    {"listingId": "uuid1", "startTime": "...", "endTime": "..."},
    {"listingId": "uuid2", "startTime": "...", "endTime": "..."}
  ],
  "buyerInfo": {...}
}
```

---

## 10. DATA YOU CAN TRIM (Low Value)

| Table/Field | Recommendation |
|-------------|----------------|
| `listing_showings` table | **MERGE** into `showings` - redundant |
| `is_sample`, `sample_group_id` | Move to feature flag system |
| `display_address` | Calculate from components |

---

## Summary: Your CRM vs ShowingTime

| Feature | Your CRM | ShowingTime | Gap |
|---------|----------|-------------|-----|
| Basic Listings | ✅ | ✅ | None |
| MLS Integration | ❌ | ✅ | **CRITICAL** |
| Multi-Agent Listings | ❌ | ✅ | High |
| Showing Scheduling | ✅ | ✅ | Minor enhancements |
| Multi-Stop Tours | ✅ | ❌ | You're better! |
| Client Feedback | ✅ | ❌ | You're better! |
| Showing Settings | ❌ | ✅ | Medium |
| Offer Management | ❌ | ✅ | Medium |
| Geo Coordinates | ❌ | ✅ | High |
| Commission Tracking | ✅ | ✅ | None |

**Bottom Line:** You need MLS integration infrastructure more than any other feature. Once you have that, you can pull listings like ShowingTime does. The showing workflow you have is actually MORE flexible than theirs (multi-stop tours, feedback tracking).

---

## ShowingTime API Examples (Reference)

### Listings Search Request
```
POST https://listingsapi.showingtime.com/api/v1/ListingsSearch/asShowingAgent
{
  "mlsNumber": "202506662",
  "mlsCode": "BAK"
}
```

### Get Listings Request
```
POST https://listingsapi.showingtime.com/api/v1/Listings/GetListings
{
  "listingIds": [156432378]
}
```

### Schedule Showing Request
```
POST https://activitiesapi.showingtime.com/api/v1/Activities/multiScheduling
{
  "activities": [{
    "listing": {"listingId": 156432378, "mlsCode": "BAK"},
    "startTime": "2025-12-08T15:15:00Z",
    "endTime": "2025-12-08T16:15:00Z",
    "activitySubTypeId": 8
  }]
}
```
