# 🎯 REAL ESTATE CRM: STRATEGIC ROADMAP TO LAUNCH

**Created:** October 17, 2025  
**Purpose:** Guide project from 82% completion to sellable product  
**Status:** Active Strategic Plan  
**Timeline:** 8-12 weeks to MVP, 12 weeks to Beta Launch

---

## 📊 EXECUTIVE SUMMARY

### Current State
- **Completion:** 82% (525/627 files implemented)
- **Testing:** 228/228 tests passing (100%)
- **Security:** 10/10 OWASP 2024 score
- **Production:** Live at https://crm.jaydenmetz.com
- **Tech Stack:** Node.js/Express, React, PostgreSQL, Railway

### Target State
- **MVP Ready:** Week 8 (first paying customer)
- **Beta Launch:** Week 10 (10 paying customers)
- **Scale Ready:** Week 12 (infrastructure for 100+ customers)

### Philosophy
**"Ship features incrementally, validate with real users, iterate based on feedback. Perfect is the enemy of done."**

---

## 🎓 SYSTEM HEALTH REPORT CARD

### Backend Architecture: A- (92%)

| Component | Grade | Completion | Critical Issues | Priority |
|-----------|-------|------------|-----------------|----------|
| **API Layer** | B+ | 15/26 controllers | EscrowsController bloated (2,791 lines) | CRITICAL |
| **Security** | A+ | Complete | None - production ready | ✅ |
| **Database** | A- | 17/23 tables | Contacts table missing | HIGH |
| **Authentication** | A+ | Complete | Dual JWT + API keys working | ✅ |
| **Testing** | A+ | 228/228 passing | None | ✅ |
| **WebSockets** | C | 20% (escrows only) | 4 modules need real-time | CRITICAL |

**Critical Issues:**
- ❌ **EscrowsController** (2,791 lines) - Immediate refactor needed
- ❌ **Contacts table** not built - Blocks contact management
- ❌ **Schema detection** in controller layer - Should be in service
- ⚠️ **243 console.log statements** polluting production code
- ⚠️ **6 .backup files** violating project rules

---

### Frontend Architecture: B+ (88%)

| Component | Grade | Completion | Critical Issues | Priority |
|-----------|-------|------------|-----------------|----------|
| **Pages** | A- | 10/11 complete | EscrowsDashboard bloated (3,914 lines) | CRITICAL |
| **Components** | A | 46/47 built | Excellent reusability | ✅ |
| **UI/UX Consistency** | C+ | 70% | View modes inconsistent | HIGH |
| **Modals** | B+ | 10/15 complete | Good patterns established | MEDIUM |
| **Real-time Updates** | D+ | 20% | Only escrows has WebSocket | CRITICAL |
| **Payment Integration** | F | 0% | No Stripe - can't accept customers | CRITICAL |

**Critical Issues:**
- ❌ **EscrowsDashboard** (3,914 lines) - Monolithic, hard to maintain
- ❌ **No payment processing** - Blocking first customer
- ⚠️ **View mode buttons** inconsistent across dashboards
- ⚠️ **Detail pages** not using shared components
- ⚠️ **Modals** have different styling/behavior

---

### Database Structure: B+ (87%)

| Component | Grade | Status | Notes |
|-----------|-------|--------|-------|
| **Core Tables** | A | 17/23 built | Production-ready |
| **Indexes** | A+ | 91 optimized | Excellent performance |
| **Relationships** | A- | Mostly complete | Foreign keys properly defined |
| **Missing Tables** | C | 5 not built | Contacts, notifications, documents, password_reset, email_templates |

**Missing Tables (Priority Order):**
1. **contacts** - HIGH - Needed for ContactSelectionModal
2. **notifications** - MEDIUM - In-app notifications
3. **documents** - MEDIUM - File attachments
4. **password_reset_tokens** - LOW - Forgot password flow
5. **email_templates** - LOW - Email notifications

---

### UX/UI Design: C (70%)

| Component | Grade | Status | Issues |
|-----------|-------|--------|--------|
| **Visual Consistency** | C+ | Varies by module | Needs design system |
| **View Modes** | D+ | Different per dashboard | No standardization |
| **Button Patterns** | C | Inconsistent | Needs component library |
| **Modal Experience** | B | Good patterns | Could be more unified |
| **Mobile Responsive** | B- | Works but not optimized | Desktop-first design |
| **Empty States** | C | Some missing | Needs CTAs |
| **Loading States** | B | Implemented | Could be more consistent |

---

## 🚀 PHASE-BY-PHASE ROADMAP

### PHASE 1: FOUNDATION FIXES (Weeks 1-2)
**Goal:** Fix critical technical debt that blocks scalability  
**Time Investment:** 16-22 hours

---

#### 1.1 Refactor EscrowsDashboard.jsx
**⏰ Time:** 6-8 hours  
**Priority:** CRITICAL  
**Problem:** 3,914-line monolith is unmaintainable and blocks code reuse

**Why This Matters:**
- Current dashboard is impossible to debug
- Changes break unexpectedly
- Can't reuse code for other dashboards
- New developers get overwhelmed

**Action Plan:**

**Step 1: Create Shared Dashboard Components**
```
frontend/src/components/common/dashboard/
├── DashboardToolbar.jsx       # View modes, search, filters
├── DashboardStats.jsx         # Top metrics cards with icons
├── DashboardGrid.jsx          # Grid/list/table/calendar views
├── DashboardFilters.jsx       # Status, date range, agent filters
├── DashboardActions.jsx       # Bulk actions, export, archive
├── DashboardPagination.jsx    # Page controls
└── DashboardEmptyState.jsx    # No results state with CTA
```

**Step 2: DashboardToolbar.jsx Implementation**
```javascript
import { ViewMode, Search, Filter } from '@mui/icons-material';

const DashboardToolbar = ({ 
  viewMode, 
  onViewModeChange, 
  searchTerm, 
  onSearchChange,
  filters,
  onFilterClick,
  actions 
}) => {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
      {/* Left: View Mode Toggle */}
      <ToggleButtonGroup value={viewMode} exclusive onChange={onViewModeChange}>
        <ToggleButton value="grid" aria-label="grid view">
          <ViewModule />
        </ToggleButton>
        <ToggleButton value="list" aria-label="list view">
          <ViewList />
        </ToggleButton>
        <ToggleButton value="table" aria-label="table view">
          <TableChart />
        </ToggleButton>
      </ToggleButtonGroup>

      {/* Center: Search */}
      <TextField
        placeholder="Search escrows..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        InputProps={{
          startAdornment: <Search />
        }}
        sx={{ width: 400 }}
      />

      {/* Right: Actions */}
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button startIcon={<FilterList />} onClick={onFilterClick}>
          Filters
        </Button>
        {actions?.map(action => (
          <Button key={action.label} onClick={action.onClick} {...action.props}>
            {action.icon} {action.label}
          </Button>
        ))}
      </Box>
    </Box>
  );
};
```

**Step 3: DashboardStats.jsx Implementation**
```javascript
const DashboardStats = ({ stats }) => {
  return (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      {stats.map(stat => (
        <Grid item xs={12} sm={6} md={3} key={stat.label}>
          <StatsCard>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Avatar sx={{ bgcolor: stat.color, mr: 2 }}>
                {stat.icon}
              </Avatar>
              <Box>
                <Typography variant="h4">{stat.value}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {stat.label}
                </Typography>
              </Box>
            </Box>
            {stat.change && (
              <Chip 
                label={`${stat.change > 0 ? '+' : ''}${stat.change}%`}
                size="small"
                color={stat.change > 0 ? 'success' : 'error'}
                icon={stat.change > 0 ? <TrendingUp /> : <TrendingDown />}
              />
            )}
          </StatsCard>
        </Grid>
      ))}
    </Grid>
  );
};
```

**Step 4: Refactor EscrowsDashboard to Use Shared Components**
```javascript
// Before: 3,914 lines
// After: ~500 lines

const EscrowsDashboard = () => {
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({});
  
  const { data: escrows } = useEscrows(filters);
  
  const stats = [
    { label: 'Active', value: escrows.active, icon: <Home />, color: 'success.main', change: 12 },
    { label: 'Pending', value: escrows.pending, icon: <Schedule />, color: 'warning.main', change: -3 },
    { label: 'This Month', value: escrows.thisMonth, icon: <TrendingUp />, color: 'primary.main', change: 8 },
    { label: 'Total Value', value: `$${escrows.totalValue}M`, icon: <AttachMoney />, color: 'info.main', change: 15 }
  ];
  
  const actions = [
    { label: 'New Escrow', icon: <Add />, onClick: handleNewEscrow, props: { variant: 'contained' } },
    { label: 'Export', icon: <Download />, onClick: handleExport }
  ];
  
  return (
    <Container maxWidth="xl">
      <DashboardToolbar
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onFilterClick={() => setShowFilters(true)}
        actions={actions}
      />
      
      <DashboardStats stats={stats} />
      
      <DashboardGrid
        viewMode={viewMode}
        items={escrows.data}
        renderCard={(escrow) => <EscrowCard escrow={escrow} />}
        onItemClick={handleEscrowClick}
      />
      
      <DashboardPagination
        page={page}
        totalPages={escrows.totalPages}
        onPageChange={setPage}
      />
    </Container>
  );
};
```

**Step 5: Apply Same Pattern to All Dashboards**
- ListingsDashboard.jsx
- ClientsDashboard.jsx
- AppointmentsDashboard.jsx
- LeadsDashboard.jsx

**Success Criteria:**
- ✅ EscrowsDashboard reduced to < 500 lines
- ✅ 7 reusable dashboard components created
- ✅ All 5 dashboards use shared components
- ✅ Zero functionality regression
- ✅ Code duplication reduced by 80%+

**Testing Checklist:**
- [ ] View mode switching works (grid/list/table)
- [ ] Search filters results correctly
- [ ] Stats cards display correct numbers
- [ ] Actions (New, Export) work
- [ ] Pagination works
- [ ] Mobile responsive
- [ ] WebSocket updates still work

---

#### 1.2 Build Contacts Table & API
**⏰ Time:** 4-6 hours  
**Priority:** HIGH  
**Problem:** ContactSelectionModal uses mock data, blocking real contact management

**Why This Matters:**
- Current modal shows fake contacts
- Can't track buyer/seller/agent contacts
- Blocks escrow/listing associations
- Users expect contact management

**Action Plan:**

**Step 1: Create Database Migration**
```sql
-- File: backend/migrations/021_create_contacts_table.sql

CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  broker_id UUID REFERENCES brokers(id) ON DELETE CASCADE,
  
  -- Personal Info
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  phone_secondary VARCHAR(20),
  
  -- Professional Info
  contact_type VARCHAR(50) NOT NULL, -- buyer, seller, agent, lender, title_officer, inspector, appraiser, contractor
  company VARCHAR(255),
  license_number VARCHAR(50),
  
  -- Address
  street_address VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(2),
  zip_code VARCHAR(10),
  
  -- Metadata
  notes TEXT,
  tags TEXT[], -- Array of tags for categorization
  is_archived BOOLEAN DEFAULT FALSE,
  archived_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Search optimization
  search_vector tsvector GENERATED ALWAYS AS (
    to_tsvector('english', 
      coalesce(first_name, '') || ' ' || 
      coalesce(last_name, '') || ' ' || 
      coalesce(email, '') || ' ' || 
      coalesce(company, '')
    )
  ) STORED
);

-- Indexes for performance
CREATE INDEX idx_contacts_user_id ON contacts(user_id);
CREATE INDEX idx_contacts_team_id ON contacts(team_id);
CREATE INDEX idx_contacts_broker_id ON contacts(broker_id);
CREATE INDEX idx_contacts_type ON contacts(contact_type);
CREATE INDEX idx_contacts_email ON contacts(email);
CREATE INDEX idx_contacts_archived ON contacts(is_archived);
CREATE INDEX idx_contacts_search ON contacts USING GIN(search_vector);

-- Full text search index
CREATE INDEX idx_contacts_name ON contacts(last_name, first_name);

-- Updated_at trigger
CREATE TRIGGER update_contacts_updated_at
  BEFORE UPDATE ON contacts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE contacts IS 'Contact information for buyers, sellers, agents, and other real estate professionals';
COMMENT ON COLUMN contacts.contact_type IS 'Type of contact: buyer, seller, agent, lender, title_officer, inspector, appraiser, contractor';
COMMENT ON COLUMN contacts.search_vector IS 'Full text search index for name, email, company';
```

**Step 2: Create Backend Controller**
```javascript
// File: backend/src/controllers/contacts.controller.js

const pool = require('../config/database');
const { securityEventService } = require('../services/securityEvent.service');

// GET /contacts - List all contacts
exports.list = async (req, res) => {
  try {
    const { 
      type, 
      search, 
      archived = false, 
      limit = 50, 
      offset = 0 
    } = req.query;
    
    let query = `
      SELECT 
        id, user_id, team_id, broker_id,
        first_name, last_name, email, phone, phone_secondary,
        contact_type, company, license_number,
        street_address, city, state, zip_code,
        notes, tags, is_archived, created_at, updated_at
      FROM contacts
      WHERE user_id = $1 AND is_archived = $2
    `;
    
    const params = [req.user.id, archived];
    let paramCount = 2;
    
    // Filter by type
    if (type) {
      paramCount++;
      query += ` AND contact_type = $${paramCount}`;
      params.push(type);
    }
    
    // Full text search
    if (search) {
      paramCount++;
      query += ` AND search_vector @@ plainto_tsquery('english', $${paramCount})`;
      params.push(search);
    }
    
    // Ordering and pagination
    query += ` ORDER BY last_name, first_name LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);
    
    const result = await pool.query(query, params);
    
    // Get total count
    let countQuery = `SELECT COUNT(*) FROM contacts WHERE user_id = $1 AND is_archived = $2`;
    const countParams = [req.user.id, archived];
    if (type) countParams.push(type);
    const countResult = await pool.query(countQuery, countParams);
    
    res.json({
      success: true,
      data: result.rows,
      pagination: {
        total: parseInt(countResult.rows[0].count),
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + result.rows.length < parseInt(countResult.rows[0].count)
      }
    });
    
  } catch (error) {
    console.error('Error listing contacts:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list contacts' }
    });
  }
};

// GET /contacts/:id - Get single contact
exports.getById = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM contacts WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Contact not found' }
      });
    }
    
    res.json({ success: true, data: result.rows[0] });
    
  } catch (error) {
    console.error('Error getting contact:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get contact' }
    });
  }
};

// POST /contacts - Create contact
exports.create = async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      email,
      phone,
      phone_secondary,
      contact_type,
      company,
      license_number,
      street_address,
      city,
      state,
      zip_code,
      notes,
      tags
    } = req.body;
    
    // Validation
    if (!first_name || !last_name || !contact_type) {
      return res.status(400).json({
        success: false,
        error: { 
          code: 'VALIDATION_ERROR', 
          message: 'First name, last name, and contact type are required' 
        }
      });
    }
    
    const result = await pool.query(
      `INSERT INTO contacts (
        user_id, team_id, broker_id,
        first_name, last_name, email, phone, phone_secondary,
        contact_type, company, license_number,
        street_address, city, state, zip_code,
        notes, tags
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING *`,
      [
        req.user.id,
        req.user.team_id,
        req.user.broker_id,
        first_name,
        last_name,
        email,
        phone,
        phone_secondary,
        contact_type,
        company,
        license_number,
        street_address,
        city,
        state,
        zip_code,
        notes,
        tags
      ]
    );
    
    // Log security event
    await securityEventService.logEvent(req.user.id, 'contact_created', {
      contact_id: result.rows[0].id,
      contact_type
    });
    
    res.status(201).json({ success: true, data: result.rows[0] });
    
  } catch (error) {
    console.error('Error creating contact:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create contact' }
    });
  }
};

// PUT /contacts/:id - Update contact
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Build dynamic update query
    const allowedFields = [
      'first_name', 'last_name', 'email', 'phone', 'phone_secondary',
      'contact_type', 'company', 'license_number',
      'street_address', 'city', 'state', 'zip_code',
      'notes', 'tags'
    ];
    
    const setClause = [];
    const values = [];
    let paramCount = 1;
    
    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key)) {
        setClause.push(`${key} = $${paramCount}`);
        values.push(updates[key]);
        paramCount++;
      }
    });
    
    if (setClause.length === 0) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'No valid fields to update' }
      });
    }
    
    values.push(id, req.user.id);
    
    const result = await pool.query(
      `UPDATE contacts SET ${setClause.join(', ')}, updated_at = NOW()
       WHERE id = $${paramCount} AND user_id = $${paramCount + 1}
       RETURNING *`,
      values
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Contact not found' }
      });
    }
    
    res.json({ success: true, data: result.rows[0] });
    
  } catch (error) {
    console.error('Error updating contact:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update contact' }
    });
  }
};

// PATCH /contacts/:id/archive - Archive contact
exports.archive = async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE contacts 
       SET is_archived = TRUE, archived_at = NOW(), updated_at = NOW()
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [req.params.id, req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Contact not found' }
      });
    }
    
    res.json({ success: true, data: result.rows[0] });
    
  } catch (error) {
    console.error('Error archiving contact:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to archive contact' }
    });
  }
};

// DELETE /contacts/:id - Delete contact (soft delete if has references)
exports.delete = async (req, res) => {
  try {
    // Check if contact is referenced in escrows/listings
    const references = await pool.query(
      `SELECT 
        (SELECT COUNT(*) FROM escrows WHERE 
          buyer_name ILIKE $1 OR seller_name ILIKE $1 OR 
          listing_agent ILIKE $1 OR buyer_agent ILIKE $1) as escrow_count,
        (SELECT COUNT(*) FROM listings WHERE 
          listing_agent ILIKE $1) as listing_count`,
      [`%${req.params.id}%`]
    );
    
    const hasReferences = 
      parseInt(references.rows[0].escrow_count) > 0 || 
      parseInt(references.rows[0].listing_count) > 0;
    
    if (hasReferences) {
      // Soft delete - archive instead
      return exports.archive(req, res);
    }
    
    // Hard delete if no references
    const result = await pool.query(
      'DELETE FROM contacts WHERE id = $1 AND user_id = $2 RETURNING *',
      [req.params.id, req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Contact not found' }
      });
    }
    
    res.json({ success: true, data: result.rows[0] });
    
  } catch (error) {
    console.error('Error deleting contact:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to delete contact' }
    });
  }
};

module.exports = exports;
```

**Step 3: Create API Routes**
```javascript
// File: backend/src/routes/contacts.routes.js

const express = require('express');
const router = express.Router();
const contactsController = require('../controllers/contacts.controller');
const { authenticate } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(authenticate);

router.get('/', contactsController.list);
router.get('/:id', contactsController.getById);
router.post('/', contactsController.create);
router.put('/:id', contactsController.update);
router.patch('/:id/archive', contactsController.archive);
router.delete('/:id', contactsController.delete);

module.exports = router;
```

**Step 4: Wire Up to Express App**
```javascript
// File: backend/src/app.js
// Add to routes section:

const contactsRoutes = require('./routes/contacts.routes');
app.use('/v1/contacts', contactsRoutes);
```

**Step 5: Update Frontend API Service**
```javascript
// File: frontend/src/services/api.service.js
// Add contacts API:

class ApiService {
  // ... existing code ...
  
  contacts = {
    getAll: (params = {}) => 
      this.request('/contacts', { params }),
    
    getById: (id) => 
      this.request(`/contacts/${id}`),
    
    create: (data) => 
      this.request('/contacts', { method: 'POST', data }),
    
    update: (id, data) => 
      this.request(`/contacts/${id}`, { method: 'PUT', data }),
    
    archive: (id) => 
      this.request(`/contacts/${id}/archive`, { method: 'PATCH' }),
    
    delete: (id) => 
      this.request(`/contacts/${id}`, { method: 'DELETE' }),
    
    search: (searchTerm) => 
      this.request('/contacts', { params: { search: searchTerm } })
  };
}
```

**Step 6: Update ContactSelectionModal**
```javascript
// File: frontend/src/components/modals/ContactSelectionModal.jsx

import { useState, useEffect } from 'react';
import apiService from '../../services/api.service';

const ContactSelectionModal = ({ open, onClose, onSelect, contactType }) => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    if (open) {
      loadContacts();
    }
  }, [open, contactType, searchTerm]);
  
  const loadContacts = async () => {
    setLoading(true);
    try {
      const response = await apiService.contacts.getAll({
        type: contactType,
        search: searchTerm,
        limit: 100
      });
      setContacts(response.data);
    } catch (error) {
      console.error('Failed to load contacts:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleCreateNew = async (newContact) => {
    try {
      const response = await apiService.contacts.create(newContact);
      onSelect(response.data);
      onClose();
    } catch (error) {
      console.error('Failed to create contact:', error);
    }
  };
  
  // ... rest of modal UI ...
};
```

**Success Criteria:**
- ✅ Contacts table deployed to production
- ✅ ContactSelectionModal uses real database data
- ✅ Can create/edit/delete contacts
- ✅ Full text search works
- ✅ Contacts properly associated with user/team
- ✅ Archive/unarchive functionality works
- ✅ No console.log statements

**Testing Checklist:**
- [ ] Create 5 test contacts (different types)
- [ ] Search by name, email, company
- [ ] Filter by contact_type
- [ ] Edit contact details
- [ ] Archive contact
- [ ] Unarchive contact
- [ ] Delete contact (with/without references)
- [ ] Check ContactSelectionModal shows real data
- [ ] Verify data isolation (can't see other users' contacts)

---

#### 1.3 Remove Console.log Pollution
**⏰ Time:** 2-3 hours  
**Priority:** MEDIUM  
**Problem:** 243 console.log statements in production code

**Why This Matters:**
- Console logs expose sensitive data in production
- Clutters browser console
- Can't filter important vs debug logs
- Unprofessional for customers
- Performance impact (minimal but measurable)

**Action Plan:**

**Step 1: Create Logger Utility**
```javascript
// File: frontend/src/utils/logger.js

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3
};

const CURRENT_LEVEL = process.env.NODE_ENV === 'production' 
  ? LOG_LEVELS.WARN 
  : LOG_LEVELS.DEBUG;

class Logger {
  constructor(context) {
    this.context = context;
  }
  
  debug(...args) {
    if (CURRENT_LEVEL <= LOG_LEVELS.DEBUG) {
      console.log(`[DEBUG] [${this.context}]`, ...args);
    }
  }
  
  info(...args) {
    if (CURRENT_LEVEL <= LOG_LEVELS.INFO) {
      console.info(`[INFO] [${this.context}]`, ...args);
    }
  }
  
  warn(...args) {
    if (CURRENT_LEVEL <= LOG_LEVELS.WARN) {
      console.warn(`[WARN] [${this.context}]`, ...args);
    }
  }
  
  error(...args) {
    if (CURRENT_LEVEL <= LOG_LEVELS.ERROR) {
      console.error(`[ERROR] [${this.context}]`, ...args);
      
      // Send to Sentry in production
      if (process.env.NODE_ENV === 'production' && window.Sentry) {
        window.Sentry.captureException(new Error(args.join(' ')));
      }
    }
  }
}

// Factory function
export const createLogger = (context) => new Logger(context);

// Default logger
export default createLogger('App');
```

**Step 2: Create Cleanup Script**
```bash
#!/bin/bash
# File: scripts/remove-console-logs.sh

echo "🔍 Scanning for console.log statements..."

# Find all console.log in frontend
FRONTEND_LOGS=$(grep -r "console\.log" frontend/src --exclude-dir=node_modules --exclude-dir=build | wc -l)
echo "Found $FRONTEND_LOGS console.log statements in frontend"

# Find all console.log in backend
BACKEND_LOGS=$(grep -r "console\.log" backend/src --exclude-dir=node_modules | wc -l)
echo "Found $BACKEND_LOGS console.log statements in backend"

# Total
TOTAL_LOGS=$((FRONTEND_LOGS + BACKEND_LOGS))
echo "Total: $TOTAL_LOGS console.log statements"

# Ask for confirmation
read -p "Replace all with logger? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]
then
  echo "🔧 Replacing console.log with logger..."
  
  # Frontend replacement
  find frontend/src -name "*.js" -o -name "*.jsx" | xargs sed -i '' \
    -e 's/console\.log(/logger.debug(/g' \
    -e 's/console\.info(/logger.info(/g' \
    -e 's/console\.warn(/logger.warn(/g' \
    -e 's/console\.error(/logger.error(/g'
  
  # Backend replacement (already has logger)
  find backend/src -name "*.js" | xargs sed -i '' \
    -e 's/console\.log(/logger.debug(/g' \
    -e 's/console\.info(/logger.info(/g'
  
  echo "✅ Replacement complete!"
  echo "⚠️  Remember to import logger in each file:"
  echo "   import logger from '../../utils/logger';"
else
  echo "❌ Cancelled"
fi
```

**Step 3: Add Logger Imports**
```javascript
// Example file: frontend/src/components/EscrowCard.jsx

// Add at top of file:
import { createLogger } from '../../utils/logger';
const logger = createLogger('EscrowCard');

// Replace:
console.log('Escrow data:', escrow);

// With:
logger.debug('Escrow data:', escrow);
```

**Step 4: Backend Logger Already Exists**
```javascript
// Backend already has logger utility
// Just need to replace console.log with logger.debug

// File: backend/src/utils/logger.js already has:
// - logger.debug()
// - logger.info()
// - logger.warn()
// - logger.error()
```

**Step 5: ESLint Rule to Prevent Future Console.logs**
```javascript
// File: .eslintrc.js
module.exports = {
  rules: {
    'no-console': ['error', { 
      allow: ['warn', 'error'] // Only allow console.warn and console.error
    }]
  }
};
```

**Success Criteria:**
- ✅ Zero console.log in production builds
- ✅ Logger utility created and documented
- ✅ All debug logs use logger.debug()
- ✅ ESLint prevents future console.log
- ✅ Production logs only show errors/warnings
- ✅ Development shows all logs

**Testing Checklist:**
- [ ] Run `npm run build` - no console.log in bundle
- [ ] Check browser console in production - only errors/warnings
- [ ] Check browser console in development - all logs visible
- [ ] Verify logger imports in 10+ files
- [ ] ESLint shows error when adding console.log

---

### PHASE 2: UI/UX STANDARDIZATION (Weeks 2-3)
**Goal:** Create consistent, professional experience across all modules  
**Time Investment:** 22-28 hours

---

#### 2.1 Design System & Component Library
**⏰ Time:** 8-12 hours  
**Priority:** HIGH  
**Problem:** Inconsistent buttons, view modes, colors across dashboards

**Why This Matters:**
- Users get confused by different UI patterns
- Harder to learn the system
- Looks unprofessional
- Wastes development time recreating same components
- Makes updates harder (change in one place doesn't propagate)

**Action Plan:**

**Step 1: Create Design System Foundation**
```javascript
// File: frontend/src/design-system/theme.js

export const colors = {
  // Status Colors (consistent across all modules)
  status: {
    active: '#2e7d32',      // Green
    pending: '#ed6c02',     // Orange
    closed: '#757575',      // Gray
    archived: '#d32f2f',    // Red
    draft: '#0288d1'        // Blue
  },
  
  // Module Colors (for cards/badges)
  modules: {
    escrows: '#1976d2',     // Blue
    listings: '#2e7d32',    // Green
    clients: '#7b1fa2',     // Purple
    appointments: '#d32f2f', // Red
    leads: '#f57c00'        // Orange
  },
  
  // View Mode Colors
  viewModes: {
    grid: '#1976d2',
    list: '#0288d1',
    table: '#0097a7',
    calendar: '#00796b'
  },
  
  // Priority Colors
  priority: {
    low: '#757575',
    medium: '#ed6c02',
    high: '#d32f2f',
    urgent: '#c62828'
  }
};

export const spacing = {
  // Card Spacing
  cardPadding: 24,
  cardMargin: 16,
  cardGap: 16,
  
  // Modal Spacing
  modalPadding: 32,
  modalContentGap: 24,
  
  // Dashboard Spacing
  dashboardHeaderGap: 24,
  dashboardContentGap: 32,
  statsCardGap: 24
};

export const borderRadius = {
  small: 8,
  medium: 12,
  large: 16,
  xlarge: 20
};

export const shadows = {
  card: '0 2px 8px rgba(0,0,0,0.08)',
  cardHover: '0 4px 16px rgba(0,0,0,0.12)',
  modal: '0 8px 32px rgba(0,0,0,0.16)',
  dropdown: '0 4px 12px rgba(0,0,0,0.1)'
};

export const transitions = {
  fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
  normal: '250ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow: '350ms cubic-bezier(0.4, 0, 0.2, 1)'
};
```

**Step 2: Create ViewModeToggle Component**
```javascript
// File: frontend/src/design-system/ViewModeToggle.jsx

import { ToggleButtonGroup, ToggleButton } from '@mui/material';
import { ViewModule, ViewList, TableChart, CalendarToday } from '@mui/icons-material';
import { colors, transitions } from './theme';

const VIEW_MODE_ICONS = {
  grid: ViewModule,
  list: ViewList,
  table: TableChart,
  calendar: CalendarToday
};

const ViewModeToggle = ({ 
  modes = ['grid', 'list'], // Available modes
  value, 
  onChange,
  size = 'medium' 
}) => {
  return (
    <ToggleButtonGroup
      value={value}
      exclusive
      onChange={(e, newMode) => newMode && onChange(newMode)}
      size={size}
      sx={{
        '& .MuiToggleButton-root': {
          px: size === 'small' ? 1.5 : 2,
          transition: transitions.fast,
          '&.Mui-selected': {
            bgcolor: 'primary.main',
            color: 'white',
            '&:hover': {
              bgcolor: 'primary.dark'
            }
          }
        }
      }}
    >
      {modes.map(mode => {
        const Icon = VIEW_MODE_ICONS[mode];
        return (
          <ToggleButton 
            key={mode} 
            value={mode}
            aria-label={`${mode} view`}
          >
            <Icon fontSize="small" />
          </ToggleButton>
        );
      })}
    </ToggleButtonGroup>
  );
};

export default ViewModeToggle;
```

**Step 3: Create StatusChip Component**
```javascript
// File: frontend/src/design-system/StatusChip.jsx

import { Chip } from '@mui/material';
import { colors, transitions } from './theme';

const STATUS_CONFIG = {
  // Escrow statuses
  active: { label: 'Active', color: colors.status.active },
  pending: { label: 'Pending', color: colors.status.pending },
  closed: { label: 'Closed', color: colors.status.closed },
  archived: { label: 'Archived', color: colors.status.archived },
  
  // Listing statuses
  for_sale: { label: 'For Sale', color: colors.status.active },
  pending_sale: { label: 'Pending', color: colors.status.pending },
  sold: { label: 'Sold', color: colors.status.closed },
  
  // Lead statuses
  new: { label: 'New', color: colors.priority.high },
  contacted: { label: 'Contacted', color: colors.status.pending },
  qualified: { label: 'Qualified', color: colors.status.active },
  converted: { label: 'Converted', color: colors.status.closed }
};

const StatusChip = ({ 
  status, 
  variant = 'filled', // filled | outlined
  size = 'medium',
  customLabel,
  customColor
}) => {
  const config = STATUS_CONFIG[status?.toLowerCase()];
  
  if (!config && !customColor) {
    console.warn(`Unknown status: ${status}`);
    return null;
  }
  
  const label = customLabel || config?.label || status;
  const color = customColor || config?.color || colors.status.pending;
  
  return (
    <Chip
      label={label}
      size={size}
      variant={variant}
      sx={{
        bgcolor: variant === 'filled' ? color : 'transparent',
        color: variant === 'filled' ? 'white' : color,
        borderColor: color,
        fontWeight: 600,
        transition: transitions.fast,
        '&:hover': {
          opacity: 0.9
        }
      }}
    />
  );
};

export default StatusChip;
```

**Step 4: Create ActionButton Component**
```javascript
// File: frontend/src/design-system/ActionButton.jsx

import { Button } from '@mui/material';
import { transitions } from './theme';

const ActionButton = ({
  icon,
  label,
  onClick,
  variant = 'contained', // contained | outlined | text
  color = 'primary',
  size = 'medium',
  fullWidth = false,
  loading = false,
  disabled = false,
  ...props
}) => {
  return (
    <Button
      variant={variant}
      color={color}
      size={size}
      fullWidth={fullWidth}
      disabled={disabled || loading}
      onClick={onClick}
      startIcon={!loading && icon}
      sx={{
        transition: transitions.normal,
        textTransform: 'none',
        fontWeight: 600,
        px: size === 'large' ? 3 : 2,
        ...props.sx
      }}
      {...props}
    >
      {loading ? 'Loading...' : label}
    </Button>
  );
};

export default ActionButton;
```

**Step 5: Create FilterBar Component**
```javascript
// File: frontend/src/design-system/FilterBar.jsx

import { Box, Chip, Stack } from '@mui/material';
import { FilterList, Clear } from '@mui/icons-material';
import { colors, spacing } from './theme';

const FilterBar = ({
  activeFilters = {},
  quickFilters = [],
  onFilterChange,
  onClearAll
}) => {
  const activeCount = Object.keys(activeFilters).length;
  
  return (
    <Box sx={{ mb: spacing.dashboardContentGap / 16 }}>
      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
        <FilterList sx={{ color: 'text.secondary' }} />
        
        {quickFilters.map(filter => (
          <Chip
            key={filter.value}
            label={filter.label}
            onClick={() => onFilterChange(filter.key, filter.value)}
            variant={activeFilters[filter.key] === filter.value ? 'filled' : 'outlined'}
            color={activeFilters[filter.key] === filter.value ? 'primary' : 'default'}
            sx={{ fontWeight: 600 }}
          />
        ))}
        
        {activeCount > 0 && (
          <Chip
            label={`Clear All (${activeCount})`}
            onDelete={onClearAll}
            deleteIcon={<Clear />}
            color="error"
            variant="outlined"
          />
        )}
      </Stack>
    </Box>
  );
};

export default FilterBar;
```

**Step 6: Update All Dashboards to Use New Components**
```javascript
// File: frontend/src/components/dashboards/EscrowsDashboard.jsx

import ViewModeToggle from '../../design-system/ViewModeToggle';
import StatusChip from '../../design-system/StatusChip';
import ActionButton from '../../design-system/ActionButton';
import FilterBar from '../../design-system/FilterBar';

const EscrowsDashboard = () => {
  const [viewMode, setViewMode] = useState('grid');
  const [filters, setFilters] = useState({});
  
  const quickFilters = [
    { label: 'Active', key: 'status', value: 'active' },
    { label: 'Pending', key: 'status', value: 'pending' },
    { label: 'Closing Soon', key: 'closing', value: '7days' }
  ];
  
  return (
    <Container maxWidth="xl">
      {/* Toolbar */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <ViewModeToggle
          modes={['grid', 'list', 'table']}
          value={viewMode}
          onChange={setViewMode}
        />
        
        <ActionButton
          icon={<Add />}
          label="New Escrow"
          onClick={handleNewEscrow}
        />
      </Box>
      
      {/* Filters */}
      <FilterBar
        activeFilters={filters}
        quickFilters={quickFilters}
        onFilterChange={(key, value) => setFilters({...filters, [key]: value})}
        onClearAll={() => setFilters({})}
      />
      
      {/* Content with StatusChip */}
      {escrows.map(escrow => (
        <EscrowCard
          key={escrow.id}
          escrow={escrow}
          statusChip={<StatusChip status={escrow.status} />}
        />
      ))}
    </Container>
  );
};
```

**Step 7: Document Design System**
```markdown
# File: docs/DESIGN_SYSTEM.md

# Design System

## Colors

### Status Colors
- Active: `#2e7d32` (Green)
- Pending: `#ed6c02` (Orange)
- Closed: `#757575` (Gray)
- Archived: `#d32f2f` (Red)

### Module Colors
- Escrows: `#1976d2` (Blue)
- Listings: `#2e7d32` (Green)
- Clients: `#7b1fa2` (Purple)

## Components

### ViewModeToggle
Standardized view mode switcher for all dashboards.

Usage:
```jsx
<ViewModeToggle
  modes={['grid', 'list', 'table']}
  value={viewMode}
  onChange={setViewMode}
/>
```

### StatusChip
Consistent status badges across all modules.

Usage:
```jsx
<StatusChip status="active" />
<StatusChip status="pending" variant="outlined" />
```

### ActionButton
Standardized action buttons.

Usage:
```jsx
<ActionButton
  icon={<Add />}
  label="New Escrow"
  onClick={handleNew}
  variant="contained"
/>
```
```

**Success Criteria:**
- ✅ 10+ reusable design system components created
- ✅ All dashboards use ViewModeToggle
- ✅ All status displays use StatusChip
- ✅ All action buttons use ActionButton
- ✅ Consistent colors across all modules
- ✅ Design system documented
- ✅ Zero hardcoded colors in dashboards

**Testing Checklist:**
- [ ] View mode toggle looks identical on all 5 dashboards
- [ ] Status chips use same colors for same statuses
- [ ] Buttons have consistent size/style
- [ ] Colors match design system spec
- [ ] Mobile responsive
- [ ] Accessibility (color contrast > 4.5:1)

---

#### 2.2 Standardize "New Item" Modals
**⏰ Time:** 6-8 hours  
**Priority:** MEDIUM  
**Problem:** Modals feel different across modules

**Action Plan:**

**Step 1: Create BaseModal Component**
```javascript
// File: frontend/src/design-system/BaseModal.jsx

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Box,
  Divider
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { spacing, borderRadius, shadows } from './theme';
import ActionButton from './ActionButton';

const BaseModal = ({
  open,
  onClose,
  onSave,
  title,
  subtitle,
  icon,
  children,
  maxWidth = 'md',
  saveLabel = 'Save',
  cancelLabel = 'Cancel',
  loading = false,
  saveDisabled = false,
  showDividers = true
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: borderRadius.large / 8,
          boxShadow: shadows.modal
        }
      }}
    >
      {/* Header */}
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {icon && (
              <Box sx={{ 
                bgcolor: 'primary.main', 
                color: 'white', 
                p: 1.5, 
                borderRadius: borderRadius.medium / 8,
                display: 'flex'
              }}>
                {icon}
              </Box>
            )}
            <Box>
              <Typography variant="h6" fontWeight={600}>
                {title}
              </Typography>
              {subtitle && (
                <Typography variant="body2" color="text.secondary">
                  {subtitle}
                </Typography>
              )}
            </Box>
          </Box>
          
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      
      {showDividers && <Divider />}
      
      {/* Content */}
      <DialogContent sx={{ pt: spacing.modalPadding / 16 }}>
        {children}
      </DialogContent>
      
      {showDividers && <Divider />}
      
      {/* Actions */}
      <DialogActions sx={{ p: spacing.modalPadding / 16, gap: 1 }}>
        <ActionButton
          label={cancelLabel}
          onClick={onClose}
          variant="outlined"
          color="inherit"
        />
        <ActionButton
          label={saveLabel}
          onClick={onSave}
          variant="contained"
          loading={loading}
          disabled={saveDisabled}
        />
      </DialogActions>
    </Dialog>
  );
};

export default BaseModal;
```

**Step 2: Create ModalSection Component**
```javascript
// File: frontend/src/design-system/ModalSection.jsx

import { Box, Typography } from '@mui/material';
import { spacing } from './theme';

const ModalSection = ({ 
  title, 
  subtitle,
  icon,
  children,
  required = false 
}) => {
  return (
    <Box sx={{ mb: spacing.modalContentGap / 16 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        {icon && <Box sx={{ color: 'primary.main', display: 'flex' }}>{icon}</Box>}
        <Typography variant="subtitle1" fontWeight={600}>
          {title}
          {required && <Typography component="span" color="error.main"> *</Typography>}
        </Typography>
      </Box>
      
      {subtitle && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {subtitle}
        </Typography>
      )}
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {children}
      </Box>
    </Box>
  );
};

export default ModalSection;
```

**Step 3: Refactor NewEscrowModal**
```javascript
// File: frontend/src/components/modals/NewEscrowModal.jsx

import { useState } from 'react';
import { TextField, Grid } from '@mui/material';
import { Home, AttachMoney, People, CalendarToday } from '@mui/icons-material';
import BaseModal from '../../design-system/BaseModal';
import ModalSection from '../../design-system/ModalSection';
import CurrencyField from '../common/CurrencyField';
import DateField from '../common/DateField';

const NewEscrowModal = ({ open, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    propertyAddress: '',
    city: '',
    state: 'CA',
    zipCode: '',
    purchasePrice: '',
    earnestMoneyDeposit: '',
    scheduledCoeDate: null,
    buyerName: '',
    sellerName: ''
  });
  
  const [loading, setLoading] = useState(false);
  
  const handleSave = async () => {
    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Failed to create escrow:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const isValid = formData.propertyAddress && formData.purchasePrice;
  
  return (
    <BaseModal
      open={open}
      onClose={onClose}
      onSave={handleSave}
      title="New Escrow"
      subtitle="Create a new escrow transaction"
      icon={<Home />}
      maxWidth="md"
      loading={loading}
      saveDisabled={!isValid}
    >
      {/* Property Section */}
      <ModalSection 
        title="Property Details" 
        icon={<Home />}
        required
      >
        <TextField
          label="Property Address"
          value={formData.propertyAddress}
          onChange={(e) => setFormData({...formData, propertyAddress: e.target.value})}
          required
          fullWidth
          placeholder="123 Main St"
        />
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="City"
              value={formData.city}
              onChange={(e) => setFormData({...formData, city: e.target.value})}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              label="State"
              value={formData.state}
              onChange={(e) => setFormData({...formData, state: e.target.value})}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              label="Zip Code"
              value={formData.zipCode}
              onChange={(e) => setFormData({...formData, zipCode: e.target.value})}
              fullWidth
            />
          </Grid>
        </Grid>
      </ModalSection>
      
      {/* Financial Section */}
      <ModalSection 
        title="Financial Details" 
        icon={<AttachMoney />}
        required
      >
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <CurrencyField
              label="Purchase Price"
              value={formData.purchasePrice}
              onChange={(value) => setFormData({...formData, purchasePrice: value})}
              required
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <CurrencyField
              label="Earnest Money Deposit"
              value={formData.earnestMoneyDeposit}
              onChange={(value) => setFormData({...formData, earnestMoneyDeposit: value})}
              fullWidth
            />
          </Grid>
        </Grid>
      </ModalSection>
      
      {/* Parties Section */}
      <ModalSection 
        title="Parties" 
        icon={<People />}
        subtitle="Buyer and seller information"
      >
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Buyer Name"
              value={formData.buyerName}
              onChange={(e) => setFormData({...formData, buyerName: e.target.value})}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Seller Name"
              value={formData.sellerName}
              onChange={(e) => setFormData({...formData, sellerName: e.target.value})}
              fullWidth
            />
          </Grid>
        </Grid>
      </ModalSection>
      
      {/* Timeline Section */}
      <ModalSection 
        title="Timeline" 
        icon={<CalendarToday />}
      >
        <DateField
          label="Scheduled Close of Escrow"
          value={formData.scheduledCoeDate}
          onChange={(date) => setFormData({...formData, scheduledCoeDate: date})}
          fullWidth
        />
      </ModalSection>
    </BaseModal>
  );
};

export default NewEscrowModal;
```

**Step 4: Apply Same Pattern to Other Modals**
- NewListingModal.jsx
- NewClientModal.jsx
- NewAppointmentModal.jsx
- NewLeadModal.jsx

**Success Criteria:**
- ✅ BaseModal component created
- ✅ ModalSection component created
- ✅ All 5 "New Item" modals refactored
- ✅ Consistent spacing, colors, animations
- ✅ Same save/cancel button behavior
- ✅ Loading states work uniformly
- ✅ Validation feedback consistent

**Testing Checklist:**
- [ ] All modals look visually identical (header, sections, footer)
- [ ] Required field indicators (red asterisk) show correctly
- [ ] Save button disables when invalid
- [ ] Loading spinner shows during save
- [ ] Smooth open/close animations
- [ ] Keyboard shortcuts work (ESC to close)
- [ ] Mobile responsive

---

#### 2.3 Redesign Detail Pages
**⏰ Time:** 8-10 hours  
**Priority:** MEDIUM  
**Problem:** Detail pages don't use shared components, inconsistent layouts

**Action Plan:**

**Step 1: Create Detail Page Components**
```javascript
// File: frontend/src/design-system/DetailHeader.jsx

import { Box, Typography, IconButton, Chip, Stack } from '@mui/material';
import { ArrowBack, Edit, Archive, Delete, MoreVert } from '@mui/icons-material';
import { spacing, borderRadius } from './theme';
import StatusChip from './StatusChip';
import ActionButton from './ActionButton';

const DetailHeader = ({
  title,
  subtitle,
  status,
  onBack,
  actions = [],
  breadcrumbs
}) => {
  return (
    <Box sx={{ mb: spacing.dashboardContentGap / 16 }}>
      {/* Breadcrumbs */}
      {breadcrumbs && (
        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          {breadcrumbs.map((crumb, i) => (
            <React.Fragment key={i}>
              <Typography
                variant="body2"
                color={i === breadcrumbs.length - 1 ? 'text.primary' : 'text.secondary'}
                sx={{ cursor: i < breadcrumbs.length - 1 ? 'pointer' : 'default' }}
                onClick={crumb.onClick}
              >
                {crumb.label}
              </Typography>
              {i < breadcrumbs.length - 1 && <Typography color="text.secondary">/</Typography>}
            </React.Fragment>
          ))}
        </Stack>
      )}
      
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {onBack && (
            <IconButton onClick={onBack} size="large">
              <ArrowBack />
            </IconButton>
          )}
          
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 0.5 }}>
              <Typography variant="h4" fontWeight={600}>
                {title}
              </Typography>
              {status && <StatusChip status={status} />}
            </Box>
            
            {subtitle && (
              <Typography variant="body1" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>
        
        {/* Actions */}
        <Stack direction="row" spacing={1}>
          {actions.map(action => (
            <ActionButton
              key={action.label}
              icon={action.icon}
              label={action.label}
              onClick={action.onClick}
              variant={action.variant || 'outlined'}
              color={action.color || 'primary'}
            />
          ))}
        </Stack>
      </Box>
    </Box>
  );
};

export default DetailHeader;
```

**Step 2: Create DetailSection Component**
```javascript
// File: frontend/src/design-system/DetailSection.jsx

import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  Collapse,
  IconButton
} from '@mui/material';
import { ExpandMore } from '@mui/icons-material';
import { useState } from 'react';
import { spacing, borderRadius, shadows } from './theme';

const DetailSection = ({
  title,
  icon,
  children,
  collapsible = false,
  defaultExpanded = true,
  actions
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);
  
  return (
    <Card sx={{ 
      borderRadius: borderRadius.medium / 8,
      boxShadow: shadows.card,
      '&:hover': {
        boxShadow: shadows.cardHover
      }
    }}>
      <CardContent sx={{ p: spacing.cardPadding / 16 }}>
        {/* Section Header */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 2
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {icon && (
              <Box sx={{ 
                color: 'primary.main', 
                display: 'flex',
                bgcolor: 'primary.lighter',
                p: 1,
                borderRadius: 1
              }}>
                {icon}
              </Box>
            )}
            <Typography variant="h6" fontWeight={600}>
              {title}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            {actions}
            {collapsible && (
              <IconButton
                onClick={() => setExpanded(!expanded)}
                sx={{
                  transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: '0.3s'
                }}
              >
                <ExpandMore />
              </IconButton>
            )}
          </Box>
        </Box>
        
        {/* Section Content */}
        <Collapse in={expanded} timeout="auto">
          {children}
        </Collapse>
      </CardContent>
    </Card>
  );
};

export default DetailSection;
```

**Step 3: Create DetailRow Component**
```javascript
// File: frontend/src/design-system/DetailRow.jsx

import { Box, Typography, Chip } from '@mui/material';

const DetailRow = ({
  label,
  value,
  icon,
  valueColor,
  chip,
  action
}) => {
  return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      py: 1.5,
      borderBottom: '1px solid',
      borderColor: 'divider',
      '&:last-child': {
        borderBottom: 'none'
      }
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {icon && <Box sx={{ color: 'text.secondary', display: 'flex' }}>{icon}</Box>}
        <Typography variant="body2" color="text.secondary" fontWeight={500}>
          {label}
        </Typography>
      </Box>
      
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {chip ? (
          chip
        ) : (
          <Typography 
            variant="body1" 
            fontWeight={600}
            color={valueColor || 'text.primary'}
          >
            {value || '—'}
          </Typography>
        )}
        {action}
      </Box>
    </Box>
  );
};

export default DetailRow;
```

**Step 4: Create DetailTimeline Component**
```javascript
// File: frontend/src/design-system/DetailTimeline.jsx

import { 
  Timeline, 
  TimelineItem, 
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent
} from '@mui/lab';
import { Typography, Box } from '@mui/material';
import { formatDistanceToNow } from 'date-fns';

const DetailTimeline = ({ events = [] }) => {
  return (
    <Timeline position="right">
      {events.map((event, index) => (
        <TimelineItem key={index}>
          <TimelineOppositeContent color="text.secondary" sx={{ flex: 0.2 }}>
            <Typography variant="caption">
              {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
            </Typography>
          </TimelineOppositeContent>
          
          <TimelineSeparator>
            <TimelineDot color={event.color || 'primary'} variant={event.variant || 'filled'}>
              {event.icon}
            </TimelineDot>
            {index < events.length - 1 && <TimelineConnector />}
          </TimelineSeparator>
          
          <TimelineContent>
            <Typography variant="body1" fontWeight={600}>
              {event.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {event.description}
            </Typography>
          </TimelineContent>
        </TimelineItem>
      ))}
    </Timeline>
  );
};

export default DetailTimeline;
```

**Step 5: Refactor EscrowDetail.jsx**
```javascript
// File: frontend/src/pages/EscrowDetail.jsx

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Grid } from '@mui/material';
import { 
  Home, 
  AttachMoney, 
  People, 
  CalendarToday,
  Edit,
  Archive
} from '@mui/icons-material';

import DetailHeader from '../design-system/DetailHeader';
import DetailSection from '../design-system/DetailSection';
import DetailRow from '../design-system/DetailRow';
import DetailTimeline from '../design-system/DetailTimeline';
import StatusChip from '../design-system/StatusChip';

const EscrowDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [escrow, setEscrow] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadEscrow();
  }, [id]);
  
  const loadEscrow = async () => {
    // Load escrow data
  };
  
  const breadcrumbs = [
    { label: 'Escrows', onClick: () => navigate('/escrows') },
    { label: escrow?.propertyAddress || 'Loading...' }
  ];
  
  const actions = [
    { 
      icon: <Edit />, 
      label: 'Edit', 
      onClick: () => navigate(`/escrows/${id}/edit`),
      variant: 'contained'
    },
    { 
      icon: <Archive />, 
      label: 'Archive', 
      onClick: handleArchive,
      color: 'error'
    }
  ];
  
  const activities = [
    {
      timestamp: escrow?.updated_at,
      title: 'Escrow Updated',
      description: 'Property details changed',
      icon: <Edit />,
      color: 'primary'
    },
    {
      timestamp: escrow?.created_at,
      title: 'Escrow Created',
      description: 'New transaction started',
      icon: <Home />,
      color: 'success'
    }
  ];
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <DetailHeader
        title={escrow.propertyAddress}
        subtitle={`${escrow.city}, ${escrow.state} ${escrow.zipCode}`}
        status={escrow.status}
        onBack={() => navigate('/escrows')}
        actions={actions}
        breadcrumbs={breadcrumbs}
      />
      
      <Grid container spacing={3}>
        {/* Left Column */}
        <Grid item xs={12} md={8}>
          {/* Property Details */}
          <DetailSection 
            title="Property Details" 
            icon={<Home />}
            sx={{ mb: 3 }}
          >
            <DetailRow label="Address" value={escrow.propertyAddress} />
            <DetailRow label="City" value={escrow.city} />
            <DetailRow label="State" value={escrow.state} />
            <DetailRow label="Zip Code" value={escrow.zipCode} />
            <DetailRow 
              label="Property Type" 
              value={escrow.propertyType}
              chip={<StatusChip status={escrow.propertyType} variant="outlined" />}
            />
          </DetailSection>
          
          {/* Financial Details */}
          <DetailSection 
            title="Financial Details" 
            icon={<AttachMoney />}
            sx={{ mb: 3 }}
          >
            <DetailRow 
              label="Purchase Price" 
              value={`${escrow.purchasePrice?.toLocaleString()}`}
              valueColor="success.main"
            />
            <DetailRow 
              label="Earnest Money Deposit" 
              value={`${escrow.earnestMoneyDeposit?.toLocaleString()}`}
            />
            <DetailRow 
              label="Down Payment" 
              value={`${escrow.downPayment?.toLocaleString()}`}
            />
            <DetailRow 
              label="Loan Amount" 
              value={`${(escrow.purchasePrice - escrow.downPayment)?.toLocaleString()}`}
            />
            <DetailRow 
              label="My Commission" 
              value={`${escrow.myCommission?.toLocaleString()}`}
              valueColor="primary.main"
            />
          </DetailSection>
          
          {/* Parties */}
          <DetailSection 
            title="Parties Involved" 
            icon={<People />}
            sx={{ mb: 3 }}
          >
            <DetailRow label="Buyer" value={escrow.buyerName} />
            <DetailRow label="Seller" value={escrow.sellerName} />
            <DetailRow label="Listing Agent" value={escrow.listingAgent} />
            <DetailRow label="Buyer Agent" value={escrow.buyerAgent} />
            <DetailRow label="Escrow Officer" value={escrow.escrowOfficer} />
            <DetailRow label="Lender" value={escrow.lenderName || 'Cash'} />
          </DetailSection>
        </Grid>
        
        {/* Right Column */}
        <Grid item xs={12} md={4}>
          {/* Timeline */}
          <DetailSection 
            title="Timeline" 
            icon={<CalendarToday />}
            collapsible
            sx={{ mb: 3 }}
          >
            <DetailRow 
              label="Contract Date" 
              value={new Date(escrow.contractDate).toLocaleDateString()}
            />
            <DetailRow 
              label="Scheduled COE" 
              value={new Date(escrow.scheduledCoeDate).toLocaleDateString()}
            />
            <DetailRow 
              label="Days to Close" 
              value={escrow.daysToClose}
              valueColor={escrow.daysToClose < 7 ? 'error.main' : 'text.primary'}
            />
          </DetailSection>
          
          {/* Activity History */}
          <DetailSection 
            title="Activity History" 
            collapsible
            defaultExpanded={false}
          >
            <DetailTimeline events={activities} />
          </DetailSection>
        </Grid>
      </Grid>
    </Container>
  );
};

export default EscrowDetail;
```

**Step 6: Apply Same Pattern to Other Detail Pages**
- ListingDetail.jsx
- ClientDetail.jsx
- AppointmentDetail.jsx
- LeadDetail.jsx

**Success Criteria:**
- ✅ 5-6 shared detail components created
- ✅ All detail pages refactored to use shared components
- ✅ Consistent layout across all detail pages
- ✅ Better mobile experience
- ✅ Collapsible sections work smoothly
- ✅ Timeline shows activity history

**Testing Checklist:**
- [ ] All detail pages have same header layout
- [ ] Sections are collapsible
- [ ] DetailRows display correctly
- [ ] Timeline shows events chronologically
- [ ] Breadcrumbs navigation works
- [ ] Action buttons work (Edit, Archive)
- [ ] Mobile responsive (sections stack vertically)

---

### PHASE 3: REAL-TIME EVERYWHERE (Week 4)
**Goal:** Complete WebSocket implementation across all modules  
**Time Investment:** 10-12 hours

---

#### 3.1 Complete WebSocket Infrastructure
**⏰ Time:** 10-12 hours  
**Priority:** CRITICAL  
**Problem:** Only escrows module has real-time updates, 4 modules missing

**Why This Matters:**
- Users in same team can't see each other's changes
- No real-time collaboration
- Must refresh page to see updates
- Feels outdated compared to modern apps
- Critical for team productivity

**Current State:**
- ✅ Escrows: Full WebSocket support
- ❌ Listings: No WebSocket
- ❌ Clients: No WebSocket
- ❌ Appointments: No WebSocket
- ❌ Leads: No WebSocket

**Action Plan:**

**Step 1: Audit Current WebSocket Implementation**
```javascript
// File: backend/src/services/websocket.service.js
// Current implementation (already working for escrows):

class WebSocketService {
  initialize(server) {
    this.io = socketIo(server, {
      cors: {
        origin: process.env.FRONTEND_URL,
        methods: ["GET", "POST"],
        credentials: true
      }
    });
    
    this.io.on('connection', (socket) => {
      socket.join(`user-${socket.userId}`);
      socket.join(`team-${socket.teamId}`);
    });
  }
  
  // Emit to specific user
  emitToUser(userId, event, data) {
    this.io.to(`user-${userId}`).emit(event, data);
  }
  
  // Emit to entire team
  emitToTeam(teamId, event, data) {
    this.io.to(`team-${teamId}`).emit(event, data);
  }
}
```

**Step 2: Add WebSocket Events to Listings Controller**
```javascript
// File: backend/src/controllers/listings.controller.js

const websocketService = require('../services/websocket.service');

exports.create = async (req, res) => {
  try {
    const listing = await createListing(req.body, req.user);
    
    // ✅ NEW: Emit WebSocket event
    websocketService.emitToUser(req.user.id, 'listing:created', listing);
    websocketService.emitToTeam(req.user.team_id, 'listing:created', listing);
    
    res.status(201).json({ success: true, data: listing });
  } catch (error) {
    // error handling
  }
};

exports.update = async (req, res) => {
  try {
    const listing = await updateListing(req.params.id, req.body, req.user);
    
    // ✅ NEW: Emit WebSocket event
    websocketService.emitToUser(req.user.id, 'listing:updated', listing);
    websocketService.emitToTeam(req.user.team_id, 'listing:updated', listing);
    
    res.json({ success: true, data: listing });
  } catch (error) {
    // error handling
  }
};

exports.delete = async (req, res) => {
  try {
    await deleteListing(req.params.id, req.user);
    
    // ✅ NEW: Emit WebSocket event
    websocketService.emitToUser(req.user.id, 'listing:deleted', { id: req.params.id });
    websocketService.emitToTeam(req.user.team_id, 'listing:deleted', { id: req.params.id });
    
    res.json({ success: true });
  } catch (error) {
    // error handling
  }
};
```

**Step 3: Wire Up Frontend WebSocket Listeners**
```javascript
// File: frontend/src/pages/ListingsPage.jsx

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import websocketService from '../services/websocket.service';
import { useSnackbar } from 'notistack';

const ListingsPage = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  
  useEffect(() => {
    // Listen for real-time updates
    const handleListingCreated = (listing) => {
      queryClient.invalidateQueries(['listings']);
      enqueueSnackbar(`New listing: ${listing.propertyAddress}`, {
        variant: 'info',
        autoHideDuration: 3000
      });
    };
    
    const handleListingUpdated = (listing) => {
      queryClient.invalidateQueries(['listings']);
      queryClient.invalidateQueries(['listing', listing.id]);
      enqueueSnackbar('Listing updated', { variant: 'success' });
    };
    
    const handleListingDeleted = ({ id }) => {
      queryClient.invalidateQueries(['listings']);
      queryClient.removeQueries(['listing', id]);
      enqueueSnackbar('Listing deleted', { variant: 'info' });
    };
    
    // Subscribe to events
    websocketService.on('listing:created', handleListingCreated);
    websocketService.on('listing:updated', handleListingUpdated);
    websocketService.on('listing:deleted', handleListingDeleted);
    
    // Cleanup
    return () => {
      websocketService.off('listing:created', handleListingCreated);
      websocketService.off('listing:updated', handleListingUpdated);
      websocketService.off('listing:deleted', handleListingDeleted);
    };
  }, [queryClient, enqueueSnackbar]);
  
  // ... rest of component
};
```

**Step 4: Repeat for Clients, Appointments, Leads**

**Clients Controller:**
```javascript
// backend/src/controllers/clients.controller.js

exports.create = async (req, res) => {
  const client = await createClient(req.body, req.user);
  websocketService.emitToUser(req.user.id, 'client:created', client);
  websocketService.emitToTeam(req.user.team_id, 'client:created', client);
  res.status(201).json({ success: true, data: client });
};

exports.update = async (req, res) => {
  const client = await updateClient(req.params.id, req.body, req.user);
  websocketService.emitToUser(req.user.id, 'client:updated', client);
  websocketService.emitToTeam(req.user.team_id, 'client:updated', client);
  res.json({ success: true, data: client });
};

exports.delete = async (req, res) => {
  await deleteClient(req.params.id, req.user);
  websocketService.emitToUser(req.user.id, 'client:deleted', { id: req.params.id });
  websocketService.emitToTeam(req.user.team_id, 'client:deleted', { id: req.params.id });
  res.json({ success: true });
};
```

**Appointments Controller:**
```javascript
// backend/src/controllers/appointments.controller.js

exports.create = async (req, res) => {
  const appointment = await createAppointment(req.body, req.user);
  websocketService.emitToUser(req.user.id, 'appointment:created', appointment);
  websocketService.emitToTeam(req.user.team_id, 'appointment:created', appointment);
  res.status(201).json({ success: true, data: appointment });
};

exports.update = async (req, res) => {
  const appointment = await updateAppointment(req.params.id, req.body, req.user);
  websocketService.emitToUser(req.user.id, 'appointment:updated', appointment);
  websocketService.emitToTeam(req.user.team_id, 'appointment:updated', appointment);
  res.json({ success: true, data: appointment });
};

exports.delete = async (req, res) => {
  await deleteAppointment(req.params.id, req.user);
  websocketService.emitToUser(req.user.id, 'appointment:deleted', { id: req.params.id });
  websocketService.emitToTeam(req.user.team_id, 'appointment:deleted', { id: req.params.id });
  res.json({ success: true });
};
```

**Leads Controller:**
```javascript
// backend/src/controllers/leads.controller.js

exports.create = async (req, res) => {
  const lead = await createLead(req.body, req.user);
  websocketService.emitToUser(req.user.id, 'lead:created', lead);
  websocketService.emitToTeam(req.user.team_id, 'lead:created', lead);
  res.status(201).json({ success: true, data: lead });
};

exports.update = async (req, res) => {
  const lead = await updateLead(req.params.id, req.body, req.user);
  websocketService.emitToUser(req.user.id, 'lead:updated', lead);
  websocketService.emitToTeam(req.user.team_id, 'lead:updated', lead);
  res.json({ success: true, data: lead });
};

exports.delete = async (req, res) => {
  await deleteLead(req.params.id, req.user);
  websocketService.emitToUser(req.user.id, 'lead:deleted', { id: req.params.id });
  websocketService.emitToTeam(req.user.team_id, 'lead:deleted', { id: req.params.id });
  res.json({ success: true });
};
```

**Step 5: Create Reusable WebSocket Hook**
```javascript
// File: frontend/src/hooks/useRealtimeUpdates.js

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import websocketService from '../services/websocket.service';

/**
 * Hook to enable real-time updates for any module
 * @param {string} module - Module name (escrows, listings, clients, etc.)
 * @param {boolean} showNotifications - Show toast notifications on updates
 */
export const useRealtimeUpdates = (module, showNotifications = true) => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  
  useEffect(() => {
    const handleCreated = (item) => {
      queryClient.invalidateQueries([module]);
      if (showNotifications) {
        enqueueSnackbar(`New ${module.slice(0, -1)} created`, {
          variant: 'info',
          autoHideDuration: 3000
        });
      }
    };
    
    const handleUpdated = (item) => {
      queryClient.invalidateQueries([module]);
      queryClient.invalidateQueries([module.slice(0, -1), item.id]);
      if (showNotifications) {
        enqueueSnackbar(`${module.slice(0, -1)} updated`, { variant: 'success' });
      }
    };
    
    const handleDeleted = ({ id }) => {
      queryClient.invalidateQueries([module]);
      queryClient.removeQueries([module.slice(0, -1), id]);
      if (showNotifications) {
        enqueueSnackbar(`${module.slice(0, -1)} deleted`, { variant: 'info' });
      }
    };
    
    // Subscribe
    websocketService.on(`${module.slice(0, -1)}:created`, handleCreated);
    websocketService.on(`${module.slice(0, -1)}:updated`, handleUpdated);
    websocketService.on(`${module.slice(0, -1)}:deleted`, handleDeleted);
    
    // Cleanup
    return () => {
      websocketService.off(`${module.slice(0, -1)}:created`, handleCreated);
      websocketService.off(`${module.slice(0, -1)}:updated`, handleUpdated);
      websocketService.off(`${module.slice(0, -1)}:deleted`, handleDeleted);
    };
  }, [module, queryClient, enqueueSnackbar, showNotifications]);
};

// Usage in any dashboard:
// const ListingsPage = () => {
//   useRealtimeUpdates('listings');
//   // ... rest of component
// };
```

**Step 6: Update All Dashboards**
```javascript
// File: frontend/src/pages/ListingsPage.jsx
import { useRealtimeUpdates } from '../hooks/useRealtimeUpdates';

const ListingsPage = () => {
  useRealtimeUpdates('listings');
  // Component automatically gets real-time updates now!
};

// File: frontend/src/pages/ClientsPage.jsx
import { useRealtimeUpdates } from '../hooks/useRealtimeUpdates';

const ClientsPage = () => {
  useRealtimeUpdates('clients');
};

// File: frontend/src/pages/AppointmentsPage.jsx
import { useRealtimeUpdates } from '../hooks/useRealtimeUpdates';

const AppointmentsPage = () => {
  useRealtimeUpdates('appointments');
};

// File: frontend/src/pages/LeadsPage.jsx
import { useRealtimeUpdates } from '../hooks/useRealtimeUpdates';

const LeadsPage = () => {
  useRealtimeUpdates('leads');
};
```

**Success Criteria:**
- ✅ All 5 modules emit WebSocket events (created, updated, deleted)
- ✅ All dashboards listen for real-time updates
- ✅ Multi-user collaboration works (see each other's changes instantly)
- ✅ Notifications show for updates
- ✅ Query cache invalidates correctly
- ✅ No performance issues (tested with 10+ concurrent users)

**Testing Checklist:**
- [ ] Open 2 browser sessions (different users)