# Zillow-Style Listing Page Integration - Phase 2: Design Integration Plan

**Created:** October 13, 2025
**Purpose:** Map Zillow template to existing database schema and design component architecture
**Status:** Active Design Document

---

## 1. Field Mapping: Zillow Template → Database Schema

### Database Schema (listings table - 37 fields)
Based on Phase 1 analysis, here's the complete field mapping:

| Zillow Template Field | Database Field | Type | Notes |
|----------------------|----------------|------|-------|
| **Property Address** | `property_address` | TEXT | Full address string |
| **City, State, ZIP** | `property_address` | TEXT | Parse from address or add separate fields |
| **List Price** | `list_price` | NUMERIC(12,2) | Primary display price |
| **Bedrooms** | `bedrooms` | INTEGER | Bedroom count |
| **Bathrooms** | `bathrooms` | NUMERIC(3,1) | Supports 2.5 format |
| **Square Feet** | `square_feet` | INTEGER | Living space |
| **Price per Sq Ft** | Calculated | - | `list_price / square_feet` |
| **Property Type** | `property_type` | VARCHAR(50) | Single Family, Condo, etc. |
| **Year Built** | `year_built` | INTEGER | Construction year |
| **Lot Size** | `lot_size_sqft` | INTEGER | Land area |
| **Lot Size Acres** | Calculated | - | `lot_size_sqft / 43560` |
| **Days on Market** | `days_on_market` | INTEGER | Auto-calculated field |
| **Listing Status** | `listing_status` | VARCHAR(50) | Active, Pending, Sold |
| **Photo Gallery** | `photos` | JSONB | Array of photo URLs |
| **Main Photo** | `photos[0]` | - | First photo is hero |
| **Description** | `property_description` | TEXT | Full listing description |
| **Property Features** | `features` | JSONB | Array of feature strings |
| **HOA Fees** | ❌ Missing | - | **Need to add** |
| **Parking Spaces** | `features` | JSONB | Extract from features array |
| **Heating** | `features` | JSONB | Extract from features array |
| **Cooling** | `features` | JSONB | Extract from features array |
| **MLS Number** | `mls_number` | VARCHAR(50) | Multiple listing service ID |
| **Property History** | `listing_price_history` | Related Table | Price change timeline |
| **Last Modified** | `updated_at` | TIMESTAMP | Last edit timestamp |
| **Listing Agent** | `listing_agent_id` | UUID → users.id | Agent relationship |
| **Agent Name** | `users.first_name` + `users.last_name` | - | Via JOIN |
| **Agent Photo** | `users.profile_picture` | TEXT | Via JOIN |
| **Agent Phone** | `users.phone` | VARCHAR(20) | Via JOIN |
| **Agent Email** | `users.email` | VARCHAR(255) | Via JOIN |
| **Virtual Tour URL** | `virtual_tour_url` | TEXT | 360° tour link |

### Missing Fields (Add to Database)
```sql
-- Migration needed:
ALTER TABLE listings ADD COLUMN hoa_fees NUMERIC(10,2);
ALTER TABLE listings ADD COLUMN hoa_frequency VARCHAR(20); -- 'monthly', 'annually', 'none'
ALTER TABLE listings ADD COLUMN city VARCHAR(100); -- Parse or add separate
ALTER TABLE listings ADD COLUMN state VARCHAR(2); -- Parse or add separate
ALTER TABLE listings ADD COLUMN zip_code VARCHAR(10); -- Parse or add separate
```

### Features JSONB Structure (Standardize)
Current `features` field is flexible JSONB array. Recommend standardizing:

```json
{
  "amenities": ["Granite Countertops", "Hardwood Floors", "Walk-in Closet"],
  "appliances": ["Refrigerator", "Dishwasher", "Microwave", "Gas Range"],
  "heating": "Forced Air, Natural Gas",
  "cooling": "Central A/C",
  "parking": {
    "type": "Attached Garage",
    "spaces": 2
  },
  "exterior": ["Patio", "Deck", "Sprinkler System"],
  "community": ["Pool", "Tennis Courts", "Clubhouse"]
}
```

---

## 2. Component Architecture

### Component Hierarchy
```
ListingDetailZillow.jsx (Main Container - ~800 lines)
├── ListingHero.jsx (~150 lines)
│   ├── ImageGallery.jsx (~200 lines)
│   ├── PriceHeader.jsx (~50 lines)
│   └── ActionButtons.jsx (~80 lines)
├── ListingOverview.jsx (~100 lines)
│   ├── KeyFacts.jsx (~60 lines)
│   └── PropertyFeatures.jsx (~100 lines)
├── ListingDescription.jsx (~80 lines)
├── PropertyDetails.jsx (~150 lines)
│   ├── InteriorFeatures.jsx (~80 lines)
│   ├── ExteriorFeatures.jsx (~80 lines)
│   └── CommunityFeatures.jsx (~80 lines)
├── PropertyHistory.jsx (~120 lines)
│   └── PriceHistoryChart.jsx (~150 lines - Recharts)
├── ListingAgent.jsx (~100 lines)
│   ├── AgentCard.jsx (~80 lines)
│   └── ContactAgentForm.jsx (~120 lines)
└── EditModeOverlay.jsx (~200 lines)
    ├── EditableTextField.jsx (~60 lines)
    ├── EditablePrice.jsx (~80 lines)
    ├── EditableFeatures.jsx (~120 lines)
    └── PhotoUploader.jsx (~150 lines)
```

**Total Estimated Lines:** ~2,480 lines (split across 20 components vs 2,245-line monolith)

### Component Responsibilities

#### ListingDetailZillow.jsx (Main)
- Fetch listing data from API (`listingsAPI.getById(id)`)
- WebSocket connection and real-time updates
- Edit mode state management (`isEditMode`, `setIsEditMode`)
- Permission checks (can user edit?)
- Loading and error states
- Pass data down to child components

#### ListingHero.jsx
- Hero section with main photo and gallery trigger
- Price display (large, prominent)
- Address and basic stats (beds, baths, sqft)
- Action buttons (Save, Share, Contact Agent, Request Tour)

#### ImageGallery.jsx
- Full-screen image viewer with thumbnails
- Arrow navigation (prev/next)
- Zoom functionality
- Photo upload interface (edit mode only)
- Delete photo capability (edit mode only)

#### ListingOverview.jsx
- Key facts grid (beds, baths, sqft, lot size, year built)
- Property type, status, days on market
- Price per sq ft calculation
- MLS number display

#### ListingDescription.jsx
- Full property description text
- Editable textarea in edit mode
- Character count (limit 5000)

#### PropertyDetails.jsx
- Tabbed or sectioned layout:
  - **Interior Features:** Rooms, flooring, appliances, heating/cooling
  - **Exterior Features:** Parking, lot details, outdoor spaces
  - **Community Features:** HOA, amenities, schools nearby (future)
- Editable chip inputs in edit mode

#### PropertyHistory.jsx
- Price change timeline (from `listing_price_history` table)
- Line chart showing price over time (Recharts)
- Event list (price changes, status changes)

#### ListingAgent.jsx
- Agent card with photo, name, contact info
- Bio/description (if available)
- Contact form (email, phone, tour request)
- Click-to-call, click-to-email buttons

#### EditModeOverlay.jsx
- Floating "Edit" toggle button (top-right corner)
- Permission check before showing (listing agent, team_owner, system_admin)
- "Save" and "Cancel" buttons when editing
- Dirty state tracking (warn before leaving unsaved)
- Optimistic updates with rollback on error

---

## 3. Edit Mode Design

### Toggle UI (Top-Right Corner)
```jsx
{canEdit && (
  <Box sx={{ position: 'fixed', top: 80, right: 24, zIndex: 1100 }}>
    <ToggleButtonGroup value={isEditMode} exclusive onChange={handleToggleEdit}>
      <ToggleButton value={false}>
        <Visibility /> View
      </ToggleButton>
      <ToggleButton value={true}>
        <Edit /> Edit
      </ToggleButton>
    </ToggleButtonGroup>
  </Box>
)}
```

### Edit Permissions
```javascript
const canEdit = (
  user.role === 'system_admin' ||
  user.role === 'team_owner' ||
  listing.listing_agent_id === user.id
);
```

### Inline Editing Pattern
- **View Mode:** Static text, non-editable
- **Edit Mode:** Fields become editable (TextField, Autocomplete, Chip inputs)
- **Visual Indicator:** Light border, hover effect on editable fields
- **Auto-save:** Debounced save after 2 seconds of inactivity (configurable)
- **Manual Save:** "Save Changes" button always available

### Editable Fields
| Field | View Component | Edit Component | Validation |
|-------|---------------|----------------|------------|
| Price | `<Typography variant="h3">` | `<TextField type="number">` | > 0, max 99,999,999 |
| Address | `<Typography>` | `<TextField>` | Required, max 200 chars |
| Bedrooms | `<Chip>` | `<TextField type="number">` | 0-20 |
| Bathrooms | `<Chip>` | `<TextField type="number">` | 0-20, step 0.5 |
| Square Feet | `<Chip>` | `<TextField type="number">` | > 0, max 50,000 |
| Description | `<Typography>` | `<TextField multiline rows={8}>` | Max 5000 chars |
| Features | `<Chip>` list | `<Autocomplete freeSolo multiple>` | Max 50 features |
| Photos | `<ImageList>` | `<PhotoUploader drag-drop>` | Max 50 photos, 10MB each |
| Status | `<Chip color>` | `<Select>` | Enum validation |

### Save Strategy (Reasonable Default)
**Option A: Auto-save (Recommended)**
- Debounce 2 seconds after last keystroke
- Show saving indicator (circular progress, "Saving...")
- Toast notification on success ("Changes saved")
- Error alert on failure with retry button

**Option B: Manual Save**
- "Save Changes" button (sticky at bottom when dirty)
- Warn before leaving with unsaved changes
- Batch all changes into single API call

**Decision:** Use **Auto-save** with manual save button as fallback. Best UX for real estate agents.

---

## 4. WebSocket Real-Time Updates

### Event Subscription
```javascript
useEffect(() => {
  // Subscribe to data:update events for this listing
  const handleDataUpdate = (event) => {
    if (
      event.entityType === 'listing' &&
      event.data?.id === listingId
    ) {
      // Check action type
      if (event.action === 'update') {
        // Another user edited this listing
        setListing(event.data);

        // Show notification if not current user's edit
        if (event.userId !== user.id) {
          toast.info(`Listing updated by ${event.data.listing_agent_name}`);
        }
      } else if (event.action === 'delete') {
        // Listing was deleted
        toast.error('This listing has been deleted');
        navigate('/listings');
      }
    }
  };

  websocketService.on('data:update', handleDataUpdate);

  return () => {
    websocketService.off('data:update', handleDataUpdate);
  };
}, [listingId, user.id, navigate]);
```

### Conflict Resolution (Optimistic Updates)
```javascript
const handleFieldUpdate = async (field, newValue) => {
  // Optimistic update (immediate UI change)
  const previousValue = listing[field];
  setListing(prev => ({ ...prev, [field]: newValue }));

  try {
    // Send to backend
    await listingsAPI.update(listingId, { [field]: newValue });
    // Backend broadcasts WebSocket event to other users
  } catch (error) {
    // Rollback on error
    setListing(prev => ({ ...prev, [field]: previousValue }));
    toast.error(`Failed to save ${field}: ${error.message}`);
  }
};
```

### Real-Time Features
1. **Live Price Updates:** Price changes from other agents appear instantly
2. **Status Changes:** Status badge updates (Active → Pending → Sold)
3. **Photo Additions:** New photos appear in gallery without refresh
4. **Edit Indicators:** Show "User X is editing..." when another user enters edit mode (future enhancement)

---

## 5. Image Gallery Integration

### Photo Storage Options
**Assumption:** Photos stored as URLs in JSONB `photos` field.

**Possible Configurations:**
1. **Local Storage (Railway Volumes):** `https://api.jaydenmetz.com/uploads/listings/[listing_id]/[photo_id].jpg`
2. **CDN (Cloudinary/S3):** `https://d3j2s6hdd6a7rg.cloudfront.net/listings/[listing_id]/[photo_id].jpg`
3. **External URLs:** MLS-provided photo URLs

**Recommendation:** Use CDN for production (Cloudinary has free tier with 25GB storage, image transformations).

### Photo Upload Flow (Edit Mode)
```javascript
const handlePhotoUpload = async (files) => {
  const formData = new FormData();
  files.forEach(file => formData.append('photos', file));

  try {
    // Upload to backend (backend handles CDN upload)
    const response = await fetch(`/v1/listings/${listingId}/photos`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });

    const { data } = await response.json();
    // data.photoUrls = ['https://...', 'https://...']

    // Optimistic update
    setListing(prev => ({
      ...prev,
      photos: [...prev.photos, ...data.photoUrls]
    }));

    toast.success(`${files.length} photos uploaded`);
  } catch (error) {
    toast.error('Photo upload failed');
  }
};
```

### Gallery Features
- **Lightbox View:** Click photo → full-screen overlay with navigation
- **Thumbnail Strip:** Bottom thumbnails for quick navigation (6 visible)
- **Drag to Reorder (Edit Mode):** react-beautiful-dnd for sorting
- **Set Primary Photo:** Right-click → "Set as Primary"
- **Delete Photo:** X button in edit mode (confirmation dialog)
- **Lazy Loading:** Intersection Observer for off-screen images

---

## 6. API Modifications (If Needed)

### Current API Endpoints (From Phase 1)
✅ All CRUD operations exist:
- `GET /v1/listings` - List with filters
- `GET /v1/listings/:id` - Single listing
- `POST /v1/listings` - Create
- `PUT /v1/listings/:id` - Update
- `DELETE /v1/listings/:id` - Delete

### New Endpoints Needed

#### Photo Management
```javascript
// Upload photos
POST /v1/listings/:id/photos
Content-Type: multipart/form-data
Body: { photos: [File, File, ...] }
Response: { success: true, data: { photoUrls: ['https://...'] } }

// Reorder photos
PUT /v1/listings/:id/photos/order
Body: { photoUrls: ['https://3.jpg', 'https://1.jpg', ...] }
Response: { success: true }

// Delete photo
DELETE /v1/listings/:id/photos/:photoIndex
Response: { success: true }
```

#### Property History
```javascript
// Get price history for chart
GET /v1/listings/:id/history
Response: {
  success: true,
  data: [
    { date: '2025-09-01', price: 450000, event: 'listed' },
    { date: '2025-09-15', price: 440000, event: 'price_reduced' },
    { date: '2025-10-01', price: 440000, event: 'pending' }
  ]
}
```

### Database Migration Required
```sql
-- Add missing Zillow fields
ALTER TABLE listings ADD COLUMN IF NOT EXISTS hoa_fees NUMERIC(10,2);
ALTER TABLE listings ADD COLUMN IF NOT EXISTS hoa_frequency VARCHAR(20) DEFAULT 'none';
ALTER TABLE listings ADD COLUMN IF NOT EXISTS city VARCHAR(100);
ALTER TABLE listings ADD COLUMN IF NOT EXISTS state VARCHAR(2);
ALTER TABLE listings ADD COLUMN IF NOT EXISTS zip_code VARCHAR(10);

-- Parse existing property_address into city/state/zip (optional manual update)
UPDATE listings SET
  city = split_part(property_address, ',', 2),
  state = split_part(split_part(property_address, ',', 3), ' ', 2),
  zip_code = split_part(split_part(property_address, ',', 3), ' ', 3)
WHERE city IS NULL;
```

---

## 7. Routing Integration

### Current Route (Replace)
```jsx
// App.jsx (existing)
<Route path="/listings/:id" element={
  <ProtectedRoute>
    <ListingDetail /> {/* OLD: 2,245 lines */}
  </ProtectedRoute>
} />
```

### New Route (Same Path)
```jsx
// App.jsx (updated)
<Route path="/listings/:id" element={
  <ProtectedRoute>
    <ListingDetailZillow /> {/* NEW: Zillow-style */}
  </ProtectedRoute>
} />
```

### Navigation Trigger (ListingsDashboard)
Already exists - clicking listing card navigates to `/listings/:id`:
```jsx
// ListingCard.jsx (existing behavior)
<Card onClick={() => navigate(`/listings/${listing.id}`)}>
  {/* Card content */}
</Card>
```

**No changes needed** - new component automatically loads at same route.

---

## 8. Mobile Responsive Design

### Breakpoints (Material-UI)
```javascript
const theme = {
  breakpoints: {
    xs: 0,     // Phone
    sm: 600,   // Tablet
    md: 960,   // Small laptop
    lg: 1280,  // Desktop
    xl: 1920   // Large desktop
  }
};
```

### Layout Adjustments
| Section | Desktop (lg+) | Tablet (md) | Mobile (sm-) |
|---------|--------------|-------------|--------------|
| Hero Image | Full width, 600px height | Full width, 400px | Full width, 300px |
| Price Header | Left-aligned | Centered | Centered, smaller |
| Key Facts | 4 columns | 2 columns | 1 column |
| Description | 60% width, right sidebar | Full width | Full width |
| Agent Card | Sticky sidebar | Bottom section | Bottom section |
| Property Details | 3-column grid | 2-column | 1-column stack |
| Image Gallery | 4 columns | 3 columns | 2 columns |

### Mobile-Specific Features
- **Sticky Price Header:** Price stays visible on scroll (mobile only)
- **Collapsible Sections:** Accordion for Property Details (save space)
- **Bottom Action Bar:** "Contact Agent" and "Request Tour" sticky at bottom
- **Touch Gestures:** Swipe left/right for photo gallery navigation
- **Tap-to-Call:** Phone numbers become clickable links

---

## 9. Performance Considerations

### Code Splitting
```javascript
// Lazy load gallery component (heavy dependency)
const ImageGallery = lazy(() => import('./ImageGallery'));

// Lazy load chart component (Recharts is 200KB)
const PriceHistoryChart = lazy(() => import('./PriceHistoryChart'));

// Wrap in Suspense
<Suspense fallback={<CircularProgress />}>
  <PriceHistoryChart data={priceHistory} />
</Suspense>
```

### Image Optimization
- **Cloudinary Transformations:** `?w=800&h=600&q=80&f=auto` (auto WebP)
- **Lazy Loading:** `loading="lazy"` on img tags
- **Responsive Images:** `srcset` with multiple sizes
- **Thumbnail Generation:** Backend generates 3 sizes (thumb, medium, full)

### API Optimization
- **Single Fetch:** Get listing + agent + history in one call (reduce round-trips)
- **Caching:** Cache listing data for 5 minutes (reduce DB load)
- **Pagination:** Limit property history to 50 events (prevent huge payloads)

---

## 10. Testing Plan (Phase 5)

### Unit Tests (Jest + React Testing Library)
- `ListingDetailZillow.test.jsx` - Loading, error states, permission checks
- `EditModeOverlay.test.jsx` - Toggle, save, cancel, dirty state
- `ImageGallery.test.jsx` - Upload, delete, reorder photos
- `PropertyHistory.test.jsx` - Price history rendering
- `ListingAgent.test.jsx` - Contact form submission

### Integration Tests
- **Edit Mode Flow:** Toggle edit → modify field → auto-save → verify API call
- **WebSocket Updates:** Simulate remote update → verify UI updates
- **Photo Upload:** Upload photo → verify URL added to photos array
- **Routing:** Navigate from ListingsDashboard → verify correct listing loads

### Manual Testing Checklist
- [ ] View listing as guest (no edit mode)
- [ ] View listing as non-agent user (no edit mode)
- [ ] View listing as listing agent (edit mode available)
- [ ] View listing as team_owner (edit mode available)
- [ ] View listing as system_admin (edit mode available)
- [ ] Edit price → verify auto-save → check database
- [ ] Edit description → verify auto-save
- [ ] Upload photo → verify appears in gallery
- [ ] Delete photo → verify removed
- [ ] Reorder photos → verify new order saved
- [ ] Change status (Active → Pending) → verify badge updates
- [ ] Open listing in 2 browsers → edit in one → verify other updates
- [ ] Delete listing in one browser → verify redirect in other
- [ ] Test on mobile (iPhone, Android)
- [ ] Test on tablet (iPad)
- [ ] Test on desktop (Chrome, Safari, Firefox)

---

## 11. Implementation Phases

### Phase 3: Feature Implementation Plan (Next)
1. **Database Migration** (30 min)
   - Add missing fields (hoa_fees, city, state, zip_code)
   - Run migration on Railway database

2. **API Endpoints** (2 hours)
   - Photo upload endpoint (`POST /listings/:id/photos`)
   - Photo delete endpoint (`DELETE /listings/:id/photos/:index`)
   - Property history endpoint (`GET /listings/:id/history`)

3. **Component Development** (8 hours)
   - Build component hierarchy (20 components)
   - Implement edit mode toggle
   - Add WebSocket listeners
   - Build image gallery with upload

4. **Styling & Polish** (4 hours)
   - Match Zillow aesthetic (clean, modern)
   - Mobile responsive adjustments
   - Loading states and error handling
   - Animations and transitions

5. **Testing & Deployment** (3 hours)
   - Manual testing with test listing
   - Fix bugs and edge cases
   - Commit and push to Railway
   - Production smoke test

**Total Estimated Time:** 17-20 hours

---

## 12. Open Questions (Reasonable Defaults Assumed)

| Question | Assumed Default | Adjust If Needed |
|----------|----------------|------------------|
| Photo Storage | Cloudinary CDN | Change to S3 if preferred |
| Edit Permissions | Agent + Team Owner + Admin | Lock to agent-only if needed |
| Save Strategy | Auto-save (2s debounce) | Change to manual if preferred |
| Property History Source | `listing_price_history` table | Confirm table exists |
| Tour Request Action | Creates appointment record | Confirm desired behavior |
| Mobile Responsive | High priority, fully responsive | Confirm importance |
| Gallery Max Photos | 50 photos, 10MB each | Adjust limits if needed |

---

## Next Step: Phase 3 Implementation Plan

Ready to proceed with **Phase 3: Feature Implementation Plan** where I'll:
1. Create detailed database migration SQL
2. Write new API endpoint implementations
3. Build component file structure with code stubs
4. Design edit mode state management
5. Plan WebSocket event handler implementation

**Estimated Documentation Time:** 2-3 hours
**Estimated Implementation Time:** 17-20 hours

---

**Questions? Feedback? Ready to proceed with Phase 3?**
