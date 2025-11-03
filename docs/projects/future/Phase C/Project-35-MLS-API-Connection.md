# Project-35: MLS API Connection

**Phase**: C | **Priority**: CRITICAL | **Status**: Not Started
**Est**: 15 hrs + 5 hrs = 20 hrs | **Deps**: Phase B complete, Project-19 (Listings)
**MILESTONE**: Premium feature differentiator

## 🎯 Goal
Integrate with MLS (Multiple Listing Service) API for automated property data sync.

## 📋 Current → Target
**Now**: Manual listing entry only
**Target**: Automated MLS data import, field mapping, periodic sync
**Success Metric**: Listings automatically populated from MLS; updates sync daily; data accuracy >95%

## 📖 Context
MLS integration is a premium CRM feature that automates listing data entry. Instead of manually creating listings, agents sync property data directly from their MLS feed (RETS, RESO Web API, or vendor-specific APIs). This provides accurate, up-to-date property information and saves hours of data entry.

Key features: MLS authentication, field mapping (MLS fields → CRM schema), automated sync, duplicate detection, image import, and status synchronization (active, pending, sold).

## ⚠️ Risk Assessment

### Technical Risks
- **API Complexity**: RETS/RESO APIs are complex
- **Data Quality**: Inconsistent MLS data formats
- **Rate Limiting**: MLS API throttling
- **Authentication**: MLS credentials expiring

### Business Risks
- **Vendor Lock-In**: Dependency on MLS provider
- **Cost**: MLS API fees ($50-$200/month)
- **Data Compliance**: MLS data usage restrictions
- **Incomplete Data**: Missing required fields

## 🔄 Rollback Plan

### Before Starting
```bash
git tag pre-project-35-mls-$(date +%Y%m%d)
git push origin pre-project-35-mls-$(date +%Y%m%d)

# Backup mls_sync table
pg_dump $DATABASE_URL -t mls_sync -t mls_field_mappings > backup-mls-$(date +%Y%m%d).sql
```

### If Things Break
```bash
# Disable MLS sync cron job
git checkout pre-project-35-mls-YYYYMMDD -- backend/src/services/mls.service.js
git push origin main
```

## ✅ Tasks

### Planning (3 hours)
- [ ] Research MLS providers (RETS, RESO, vendor APIs)
- [ ] Design mls_sync and mls_field_mappings tables
- [ ] Map MLS fields to CRM listings schema
- [ ] Plan authentication flow
- [ ] Define sync frequency (daily, hourly)
- [ ] Plan duplicate detection logic

### Implementation (8.5 hours)
- [ ] **Database** (1.5 hours):
  - [ ] Create mls_sync table
  - [ ] Create mls_field_mappings table
  - [ ] Add mls_id column to listings table
  - [ ] Add mls_last_synced_at timestamp
  - [ ] Create sync audit log table

- [ ] **Backend API** (5 hours):
  - [ ] Implement MLS authentication (RETS or RESO)
  - [ ] Implement GET /v1/mls/listings (fetch from MLS)
  - [ ] Implement POST /v1/mls/sync (trigger sync)
  - [ ] Implement PUT /v1/mls/field-mappings (configure mappings)
  - [ ] Add field mapping logic
  - [ ] Implement duplicate detection (by MLS ID)
  - [ ] Add image download and storage
  - [ ] Create sync cron job (daily at 2 AM)

- [ ] **Frontend UI** (2 hours):
  - [ ] Create MLS settings page
  - [ ] Add MLS credentials form
  - [ ] Add field mapping UI
  - [ ] Show sync status and history
  - [ ] Add manual sync button
  - [ ] Display MLS-synced listings indicator

### Testing (3.5 hours)
- [ ] Test MLS authentication
- [ ] Test listing import from MLS
- [ ] Test field mapping accuracy
- [ ] Test duplicate detection
- [ ] Test image import
- [ ] Test sync with 100+ listings
- [ ] Test sync performance (<5 min for 1000 listings)

### Documentation (1 hour)
- [ ] Document MLS setup process
- [ ] Document supported MLS providers
- [ ] Document field mappings
- [ ] Add MLS API to API_REFERENCE.md

## 🧪 Verification Tests

### Test 1: Authenticate with MLS
```bash
TOKEN="<JWT token>"

# Configure MLS credentials
curl -X POST https://api.jaydenmetz.com/v1/mls/configure \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "reso",
    "username": "mls_username",
    "password": "mls_password",
    "endpoint": "https://api.mlsprovider.com/reso"
  }'
# Expected: 200, credentials saved and validated
```

### Test 2: Fetch MLS Listings
```bash
# Fetch listings from MLS
curl -X GET https://api.jaydenmetz.com/v1/mls/listings?limit=10 \
  -H "Authorization: Bearer $TOKEN"
# Expected: Array of MLS listings with mapped fields
```

### Test 3: Sync MLS Data
```bash
# Trigger full sync
curl -X POST https://api.jaydenmetz.com/v1/mls/sync \
  -H "Authorization: Bearer $TOKEN"

# Check sync status
curl -X GET https://api.jaydenmetz.com/v1/mls/sync-status \
  -H "Authorization: Bearer $TOKEN"
# Expected: Sync completes, new listings created, existing updated
```

## 📝 Implementation Notes

### MLS Sync Tables Schema
```sql
CREATE TABLE mls_sync (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  provider VARCHAR(50), -- rets, reso, vendor_name
  endpoint VARCHAR(500),
  username VARCHAR(255),
  password_encrypted TEXT,
  sync_enabled BOOLEAN DEFAULT TRUE,
  last_synced_at TIMESTAMP WITH TIME ZONE,
  sync_status VARCHAR(50), -- success, failed, in_progress
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE mls_field_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mls_sync_id UUID REFERENCES mls_sync(id),
  mls_field VARCHAR(255), -- ListPrice, StreetAddress, etc.
  crm_field VARCHAR(255), -- price, address, etc.
  transformation VARCHAR(50) -- none, currency, date, etc.
);

-- Add to listings table
ALTER TABLE listings ADD COLUMN mls_id VARCHAR(255) UNIQUE;
ALTER TABLE listings ADD COLUMN mls_last_synced_at TIMESTAMP WITH TIME ZONE;
```

### Common Field Mappings
| MLS Field | CRM Field | Transformation |
|-----------|-----------|----------------|
| ListPrice | price | Currency (divide by 100) |
| StreetAddress | address | Text |
| City | city | Text |
| StateOrProvince | state | Text |
| PostalCode | zip_code | Text |
| BedroomsTotal | bedrooms | Integer |
| BathroomsTotalInteger | bathrooms | Integer |
| LivingArea | square_feet | Integer |
| StandardStatus | status | Map (Active→active, Pending→pending, Closed→sold) |
| ListingId | mls_id | Text (unique identifier) |

### MLS Providers
- **RETS (Real Estate Transaction Standard)**: Legacy, requires RETS client
- **RESO Web API**: Modern REST API, recommended
- **Vendor APIs**: MLS-specific (e.g., Trestle, Spark API, Bridge Interactive)

### Sync Strategy
1. **Full Sync**: Fetch all active listings (daily at 2 AM)
2. **Incremental Sync**: Fetch only updated listings (hourly during business hours)
3. **Duplicate Detection**: Match by `mls_id`, update if exists
4. **Status Sync**: Mark CRM listings as sold when MLS shows closed
5. **Image Sync**: Download first 5 photos, store in /uploads/listings/

### Rate Limiting Considerations
- Most MLS APIs: 10-50 requests/minute
- Batch requests when possible (100 listings per request)
- Implement exponential backoff on errors
- Cache listing data for 1 hour

## 📏 CLAUDE.md Compliance
- [ ] NO Enhanced/Optimized/V2 files
- [ ] Store MLS credentials encrypted in database
- [ ] Use apiInstance for API calls
- [ ] Follow existing service pattern

## 🧪 Test Coverage Impact
**After Project-35**:
- MLS API: Full coverage (auth, fetch, sync)
- Field mapping: Tested with sample data
- Duplicate detection: Verified

## 🔗 Dependencies

### Depends On
- Phase B complete (Projects 16-30)
- Project-19 (Listings module)
- MLS API account

### Blocks
- Project-36 (Commission Calculation - uses MLS property data)

### Parallel Work
- None (critical path dependency)

## 🎯 Project Selection Criteria

### Can Start If:
- ✅ Listings module working
- ✅ MLS API credentials obtained
- ✅ MLS data usage agreement signed

### Should Skip If:
- ❌ Not a real estate agent (no MLS access)
- ❌ MLS API costs too high
- ❌ Manual listing entry acceptable

### Optimal Timing:
- After Project-19 (Listings) complete
- Before Project-36 (Commissions)
- 2-3 days of work (20 hours)

## ✅ Success Criteria
- [ ] MLS sync tables created
- [ ] MLS authentication working
- [ ] Listings imported from MLS
- [ ] Field mapping accurate (>95%)
- [ ] Images downloaded and stored
- [ ] Duplicate detection functional
- [ ] Sync cron job running
- [ ] Sync performance acceptable (<5 min for 1000 listings)
- [ ] Documentation complete

## 🚀 Production Deployment Checkpoint

### Pre-Deployment Verification
- [ ] MLS credentials encrypted in database
- [ ] Sync cron job scheduled
- [ ] Test sync with production MLS account
- [ ] Verify field mappings with real data
- [ ] Check image storage capacity

### Post-Deployment Verification
- [ ] First sync completes successfully
- [ ] Listings appear in CRM
- [ ] Images display correctly
- [ ] Duplicate detection working
- [ ] Sync logs show no errors

### Rollback Triggers
- Sync fails >3 times consecutively
- Data corruption detected (>10% mismatched fields)
- MLS API costs exceed budget
- Performance unacceptable (>10 min sync time)

## 🏁 Completion Checklist
- [ ] All tasks complete
- [ ] MLS sync tables created
- [ ] Authentication verified
- [ ] Listings syncing automatically
- [ ] Field mappings accurate
- [ ] Images imported
- [ ] Zero console errors
- [ ] Deployed to production
- [ ] Documentation updated
- [ ] MILESTONE ACHIEVED: MLS integration complete

---
**Started**: _____ | **Completed**: _____ | **Actual**: _____ hrs
**Blocker**: _____ | **Learning**: _____
