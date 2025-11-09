import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Button,
  Stack,
  Divider,
  IconButton,
  Checkbox,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  ExpandMore,
  ContentCopy,
  CheckCircle,
  RadioButtonUnchecked,
  Storage,
  Palette,
  Assessment,
  Cloud,
  Code,
  BugReport,
  Description,
} from '@mui/icons-material';

// Styled Components
const ProjectAccordion = styled(Accordion)(({ theme }) => ({
  '&:before': { display: 'none' },
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: `${theme.spacing(1)}px !important`,
  marginBottom: theme.spacing(2),
  '&.Mui-expanded': {
    margin: `0 0 ${theme.spacing(2)}px 0`,
  },
}));

const ProjectSummary = styled(AccordionSummary)(({ theme }) => ({
  minHeight: '64px !important',
  '& .MuiAccordionSummary-content': {
    margin: `${theme.spacing(1.5)} 0`,
    alignItems: 'center',
  },
}));

const TaskAccordion = styled(Accordion)(({ theme }) => ({
  '&:before': { display: 'none' },
  boxShadow: 'none',
  border: `1px solid ${theme.palette.grey[300]}`,
  borderRadius: `${theme.spacing(0.5)}px !important`,
  marginBottom: theme.spacing(1),
  backgroundColor: theme.palette.grey[50],
  '&.Mui-expanded': {
    margin: `0 0 ${theme.spacing(1)}px 0`,
  },
}));

const TaskSummary = styled(AccordionSummary)(({ theme }) => ({
  minHeight: '48px !important',
  '& .MuiAccordionSummary-content': {
    margin: `${theme.spacing(1)} 0`,
  },
}));

const PromptBox = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: theme.palette.grey[100],
  border: `1px solid ${theme.palette.grey[300]}`,
  borderRadius: theme.spacing(1),
  fontFamily: 'monospace',
  fontSize: '12px',
  lineHeight: 1.6,
  whiteSpace: 'pre-wrap',
  maxHeight: '400px',
  overflowY: 'auto',
  '&::-webkit-scrollbar': {
    width: '8px',
  },
  '&::-webkit-scrollbar-track': {
    background: theme.palette.grey[200],
  },
  '&::-webkit-scrollbar-thumb': {
    background: theme.palette.grey[400],
    borderRadius: '4px',
  },
}));

const PriorityChip = styled(Chip)(({ priority, theme }) => {
  const colors = {
    critical: { bg: theme.palette.error.main, text: '#fff' },
    high: { bg: theme.palette.warning.main, text: '#000' },
    medium: { bg: theme.palette.info.main, text: '#fff' },
    low: { bg: theme.palette.grey[400], text: '#000' },
  };
  return {
    backgroundColor: colors[priority]?.bg || colors.medium.bg,
    color: colors[priority]?.text || colors.medium.text,
    fontWeight: 600,
    fontSize: '11px',
    textTransform: 'uppercase',
  };
});

// ESCROWS MODULE PROJECTS
const ESCROWS_PROJECTS = [
  {
    id: 'escrows-dashboard',
    name: 'Escrows Dashboard - Beautiful & Functional',
    icon: <Palette />,
    priority: 'critical',
    module: 'Escrows',
    description: 'Make the Escrows dashboard beautiful with all view modes, filters, and perfect data display',
    tasks: [
      {
        id: 'dashboard-ui',
        name: 'Fix Dashboard UI/UX',
        needsAI: true,
        userTasks: [
          'Review current dashboard layout and note what feels clunky',
          'Decide which view modes you want (Card, List, Table, Calendar)',
          'List all filters you need (status, date range, agent, price range)',
        ],
        aiPrompt: `# TASK: Fix Escrows Dashboard UI/UX

## GOAL
Make the Escrows dashboard beautiful, intuitive, and fully functional with multiple view modes, comprehensive filters, and smooth interactions.

## CURRENT STATE
File: /frontend/src/components/dashboards/escrows/index.jsx
- Exists but may have layout issues, missing features, or outdated design
- Need to audit and improve

## REQUIREMENTS

### 1. View Modes (User can toggle between)
- **Card View**: Cards in responsive grid (3-4 columns on desktop)
- **List View**: Vertical list with thumbnails
- **Table View**: Sortable table with columns
- **Calendar View**: Escrows plotted by closing date

### 2. Filters (All should work)
- **Status**: Dropdown (Active, Pending, Closed, Cancelled)
- **Date Range**: Date picker (Created, Closing Date)
- **Agent**: Dropdown of team members
- **Price Range**: Min/Max sliders
- **Search**: Text input (property address, client name, escrow number)

### 3. Actions
- **Create New**: Button opens modal/form
- **Bulk Actions**: Select multiple → Bulk delete, Bulk status change
- **Sort**: Click column headers to sort
- **Refresh**: Button to reload data

### 4. Loading States
- **Skeleton loaders** while fetching data
- **Empty state** with friendly message when no escrows
- **Error state** with retry button if API fails

## IMPLEMENTATION STEPS

### Step 1: Audit Current Code
\`\`\`bash
# Check what exists
cat /frontend/src/components/dashboards/escrows/index.jsx

# Check if view mode components exist
ls /frontend/src/components/dashboards/escrows/
\`\`\`

### Step 2: Create View Mode Components
\`\`\`
CREATE /frontend/src/components/dashboards/escrows/EscrowsCard.jsx
CREATE /frontend/src/components/dashboards/escrows/EscrowsList.jsx
CREATE /frontend/src/components/dashboards/escrows/EscrowsTable.jsx
CREATE /frontend/src/components/dashboards/escrows/EscrowsCalendar.jsx
\`\`\`

Each component should:
- Accept \`escrows\` array as prop
- Handle empty state
- Handle loading state
- Support onClick to navigate to detail page

### Step 3: Main Dashboard Component
\`\`\`javascript
// /frontend/src/components/dashboards/escrows/index.jsx

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import escrowsService from '../../../services/escrows.service';

const EscrowsDashboard = () => {
  const [viewMode, setViewMode] = useState('card'); // cards, list, table, calendar
  const [filters, setFilters] = useState({
    status: 'all',
    dateRange: null,
    agent: 'all',
    priceRange: [0, 10000000],
    search: '',
  });

  const { data: escrows, isLoading, error } = useQuery({
    queryKey: ['escrows', filters],
    queryFn: () => escrowsService.getAll(filters),
  });

  return (
    <Box>
      {/* Header with stats */}
      <EscrowsStats escrows={escrows} />

      {/* View mode toggle + filters */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <ViewModeToggle value={viewMode} onChange={setViewMode} />
        <FilterBar filters={filters} onChange={setFilters} />
      </Box>

      {/* Render appropriate view */}
      {isLoading && <SkeletonLoader />}
      {error && <ErrorState onRetry={() => refetch()} />}
      {!isLoading && escrows?.length === 0 && <EmptyState />}

      {viewMode === 'card' && <EscrowsCard escrows={escrows} />}
      {viewMode === 'list' && <EscrowsList escrows={escrows} />}
      {viewMode === 'table' && <EscrowsTable escrows={escrows} />}
      {viewMode === 'calendar' && <EscrowsCalendar escrows={escrows} />}
    </Box>
  );
};
\`\`\`

### Step 4: Filter Components
\`\`\`
CREATE /frontend/src/components/dashboards/escrows/FilterBar.jsx

Requirements:
- Status dropdown (Active, Pending, Closed, Cancelled, All)
- Date range picker (from/to dates)
- Agent dropdown (fetch from users API)
- Price range slider (0 - $10M)
- Search input (debounced 300ms)
- Reset filters button
\`\`\`

### Step 5: Stats Cards
\`\`\`
CREATE /frontend/src/components/dashboards/escrows/EscrowsStats.jsx

Show 4 cards:
- Total Active (count + total value)
- Closing This Month (count)
- Average Days to Close
- Total Commissions Pending
\`\`\`

## SUCCESS CRITERIA
✅ All 4 view modes work and look beautiful
✅ All filters work and update URL query params
✅ Search is debounced (doesn't fire on every keystroke)
✅ Loading skeletons show while fetching
✅ Empty state shows when no escrows match filters
✅ Error state shows with retry button if API fails
✅ Stats cards show accurate real-time data
✅ UI is responsive (works on mobile)

## TESTING
1. Load dashboard → see escrows in cards view
2. Toggle to list view → layout changes
3. Toggle to table view → sortable columns work
4. Toggle to calendar view → escrows plotted by closing date
5. Filter by status "Active" → only active escrows show
6. Search "123 Main St" → finds correct escrow
7. Clear filters → all escrows show again
8. Disconnect internet → error state shows with retry button

## DELIVERABLES
1. index.jsx (main dashboard)
2. EscrowsCard.jsx
3. EscrowsList.jsx
4. EscrowsTable.jsx
5. EscrowsCalendar.jsx
6. FilterBar.jsx
7. EscrowsStats.jsx
8. ViewModeToggle.jsx
9. EmptyState.jsx
10. ErrorState.jsx`,
      },
      {
        id: 'dashboard-data-display',
        name: 'Perfect Data Display & Formatting',
        needsAI: true,
        userTasks: [
          'List all escrow names/addresses that need to be displayed',
          'Verify property addresses are correct in database',
          'Decide date format preference (MM/DD/YYYY or relative "2 days ago")',
        ],
        aiPrompt: `# TASK: Perfect Data Display & Formatting

## GOAL
Ensure all escrow data displays correctly with proper formatting for dates, currency, addresses, and status badges.

## REQUIREMENTS

### 1. Property Address Formatting
- **Full Address**: "123 Main St, Los Angeles, CA 90001"
- **Truncate long addresses**: "123 Really Long Str..." (with tooltip on hover)
- **Missing address**: Show "Address not provided" in gray

### 2. Date Formatting
- **Absolute**: "03/15/2024" or "Mar 15, 2024"
- **Relative**: "2 days ago", "in 5 days"
- **Overdue dates**: Red color
- **Missing dates**: Show "Not set" in gray

### 3. Currency Formatting
- **Purchase Price**: "$1,234,567" (no decimals for whole dollars)
- **Commission**: "$45,678.50" (always show cents)
- **Large numbers**: "1.2M" in compact view, full "$1,200,000" in detail

### 4. Status Badges
\`\`\`javascript
const STATUS_COLORS = {
  'active': { bg: '#4caf50', text: '#fff' }, // Green
  'pending': { bg: '#ff9800', text: '#000' }, // Orange
  'closed': { bg: '#2196f3', text: '#fff' }, // Blue
  'cancelled': { bg: '#f44336', text: '#fff' }, // Red
};
\`\`\`

### 5. Agent/User Display
- **Avatar**: Show profile photo or initials
- **Name**: "John Doe" (not username "jdoe123")
- **Multiple agents**: Show "+2" badge if more than 2

## IMPLEMENTATION

### Create Utility Functions
\`\`\`javascript
// /frontend/src/utils/formatters.js

export const formatCurrency = (amount, compact = false) => {
  if (!amount) return '$0';
  if (compact && amount >= 1000000) {
    return \`$\${(amount / 1000000).toFixed(1)}M\`;
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
};

export const formatDate = (date, relative = false) => {
  if (!date) return 'Not set';
  const d = new Date(date);
  if (relative) {
    const now = new Date();
    const diffMs = d - now;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';
    if (diffDays > 0) return \`in \${diffDays} days\`;
    return \`\${Math.abs(diffDays)} days ago\`;
  }
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export const formatAddress = (address, maxLength = 40) => {
  if (!address) return 'Address not provided';
  if (address.length <= maxLength) return address;
  return address.substring(0, maxLength) + '...';
};
\`\`\`

### Use in Components
\`\`\`javascript
// EscrowCard.jsx
import { formatCurrency, formatDate, formatAddress } from '../../../utils/formatters';

<Typography variant="h6">{formatAddress(escrow.property_address)}</Typography>
<Typography variant="body2">{formatCurrency(escrow.purchase_price, true)}</Typography>
<Typography variant="caption">{formatDate(escrow.closing_date, true)}</Typography>
<Chip label={escrow.status} sx={{ backgroundColor: STATUS_COLORS[escrow.status].bg }} />
\`\`\`

## SUCCESS CRITERIA
✅ All dates formatted consistently
✅ All currency shows proper symbols and commas
✅ Long addresses truncate with ellipsis
✅ Status badges color-coded correctly
✅ Missing data shows "Not set" instead of blank
✅ Relative dates show "in 5 days" for future dates
✅ Overdue dates highlighted in red

## DELIVERABLES
1. formatters.js utility file
2. Updated EscrowCard.jsx with formatters
3. Updated EscrowsList.jsx with formatters
4. Updated EscrowsTable.jsx with formatters`,
      },
    ],
  },
  {
    id: 'escrows-detail',
    name: 'Escrows Detail Page - Beautiful & Functional',
    icon: <Assessment />,
    priority: 'critical',
    module: 'Escrows',
    description: 'Perfect the escrow detail page with all sections, inline editing, and beautiful layout',
    tasks: [
      {
        id: 'detail-layout',
        name: 'Build Detail Page Layout',
        needsAI: true,
        userTasks: [
          'Review current detail page at /escrows/:id',
          'List which sections you want (Overview, Documents, Contacts, Timeline, Commission)',
          'Decide if you want tabs or vertical sections',
        ],
        aiPrompt: `# TASK: Build Escrow Detail Page Layout

## GOAL
Create a beautiful, functional escrow detail page with hero section and tabbed/sectioned content.

## REQUIREMENTS

### Layout Structure
\`\`\`
┌─────────────────────────────────────┐
│         Hero Section                │
│  123 Main St | $1.2M | Active      │
│  Closing: Mar 15, 2024              │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│ [Overview] [Documents] [Contacts]   │
│ [Timeline] [Checklist] [Commission] │
├─────────────────────────────────────┤
│                                     │
│    Tab Content Here                 │
│                                     │
└─────────────────────────────────────┘
\`\`\`

### Hero Section
- Property address (large, bold)
- Purchase price (formatted)
- Status badge (color-coded)
- Key dates (opened, closing, closed)
- Edit/Delete buttons (top right)
- Back button (top left)

### Tabs
1. **Overview**: All escrow fields (editable)
2. **Documents**: File upload/list
3. **Contacts**: Linked clients/agents
4. **Timeline**: Activity log
5. **Checklist**: Tasks with checkboxes
6. **Commission**: Calculator & breakdown

## IMPLEMENTATION

\`\`\`javascript
// /frontend/src/components/details/escrows/index.jsx

import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Tabs, Tab, Box } from '@mui/material';
import EscrowHero from './EscrowHero';
import EscrowOverview from './EscrowOverview';
import EscrowDocuments from './EscrowDocuments';
// ... other imports

const EscrowDetail = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState(0);

  const { data: escrow, isLoading } = useQuery({
    queryKey: ['escrow', id],
    queryFn: () => escrowsService.getById(id),
  });

  if (isLoading) return <CircularProgress />;
  if (!escrow) return <Alert severity="error">Escrow not found</Alert>;

  return (
    <Box>
      <EscrowHero escrow={escrow} />

      <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
        <Tab label="Overview" />
        <Tab label="Documents" />
        <Tab label="Contacts" />
        <Tab label="Timeline" />
        <Tab label="Checklist" />
        <Tab label="Commission" />
      </Tabs>

      <Box sx={{ p: 3 }}>
        {activeTab === 0 && <EscrowOverview escrow={escrow} />}
        {activeTab === 1 && <EscrowDocuments escrowId={id} />}
        {activeTab === 2 && <EscrowContacts escrowId={id} />}
        {activeTab === 3 && <EscrowTimeline escrowId={id} />}
        {activeTab === 4 && <EscrowChecklist escrowId={id} />}
        {activeTab === 5 && <EscrowCommission escrow={escrow} />}
      </Box>
    </Box>
  );
};
\`\`\`

## SUCCESS CRITERIA
✅ Hero section shows key info
✅ Tabs switch content smoothly
✅ Each tab loads its own data
✅ Edit/Delete buttons work
✅ Breadcrumbs show correct path
✅ Back button returns to dashboard
✅ URL updates with tab (e.g., /escrows/123?tab=documents)

## DELIVERABLES
1. index.jsx (main detail component)
2. EscrowHero.jsx
3. Tab components (6 files)`,
      },
      {
        id: 'inline-editing',
        name: 'Add Inline Editing',
        needsAI: true,
        userTasks: [
          'Test clicking on each field to see if it becomes editable',
          'List any fields that should NOT be editable (e.g., created_at)',
        ],
        aiPrompt: `# TASK: Add Inline Editing to Detail Page

## GOAL
Make all appropriate fields editable inline with auto-save or save button.

## APPROACH
**Click to Edit**: Click any field → becomes editable → save on blur or Enter key

## IMPLEMENTATION
\`\`\`javascript
// Create reusable EditableField component
const EditableField = ({ label, value, onSave, type = 'text' }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  const handleSave = () => {
    if (editValue !== value) {
      onSave(editValue);
    }
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <TextField
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyPress={(e) => e.key === 'Enter' && handleSave()}
        autoFocus
        fullWidth
      />
    );
  }

  return (
    <Box onClick={() => setIsEditing(true)} sx={{ cursor: 'pointer' }}>
      <Typography variant="caption">{label}</Typography>
      <Typography variant="body1">{value || 'Click to edit'}</Typography>
    </Box>
  );
};
\`\`\`

## SUCCESS CRITERIA
✅ Click field → becomes editable
✅ Save on Enter or blur
✅ Shows success toast after save
✅ Reverts if API fails
✅ Date fields use date picker
✅ Currency fields auto-format

## DELIVERABLES
1. EditableField.jsx component
2. Updated EscrowOverview.jsx using EditableField`,
      },
    ],
  },
  {
    id: 'escrows-data-review',
    name: 'Personal Data Review - All Escrows Complete',
    icon: <CheckCircle />,
    priority: 'high',
    module: 'Escrows',
    description: 'Review every escrow record to ensure all data, files, contacts, and checklists are complete',
    tasks: [
      {
        id: 'data-audit',
        name: 'Audit All Escrow Data',
        needsAI: false,
        userTasks: [
          'Open each escrow in detail page',
          'Verify property address is correct',
          'Verify purchase price and closing date',
          'Verify status is up-to-date',
          'Check for missing required fields',
          'Fix any incorrect or missing data',
        ],
      },
      {
        id: 'upload-files',
        name: 'Upload All Escrow Documents',
        needsAI: false,
        userTasks: [
          'For each escrow, upload:',
          '- Purchase agreement',
          '- Seller disclosures',
          '- Inspection reports',
          '- Title documents',
          '- Commission invoices',
          'Organize files in folders if applicable',
          'Rename files with consistent naming',
        ],
      },
      {
        id: 'link-contacts',
        name: 'Link All Contacts to Escrows',
        needsAI: false,
        userTasks: [
          'For each escrow, link:',
          '- Buyer contact(s)',
          '- Seller contact(s)',
          '- Lender (if applicable)',
          '- Title company',
          '- Listing agent',
          "- Buyer's agent",
          'Verify contact info is complete (phone, email)',
        ],
      },
      {
        id: 'update-checklists',
        name: 'Update All Checklists',
        needsAI: false,
        userTasks: [
          'For each escrow, review checklist:',
          '- Mark completed tasks as done',
          '- Add due dates to pending tasks',
          '- Assign tasks to correct person',
          '- Delete irrelevant tasks',
          'Verify checklist matches actual progress',
        ],
      },
    ],
  },
  {
    id: 'escrows-backend',
    name: 'Escrows Backend - APIs, Database, Logic',
    icon: <Storage />,
    priority: 'high',
    module: 'Escrows',
    description: 'Ensure database schema, API endpoints, validation, and business logic are production-ready',
    tasks: [
      {
        id: 'verify-schema',
        name: 'Verify Database Schema',
        needsAI: true,
        userTasks: [
          'List all fields you need in escrows table',
          'Check if any fields are missing',
        ],
        aiPrompt: `# TASK: Verify Escrows Database Schema

## GOAL
Ensure escrows table has all required fields, proper indexes, and constraints.

## VERIFICATION STEPS

\`\`\`sql
-- Check current schema
\\d escrows;

-- Verify required fields exist:
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'escrows'
ORDER BY ordinal_position;

-- Check indexes
\\d+ escrows;

-- Expected indexes:
-- - idx_escrows_escrow_number (UNIQUE)
-- - idx_escrows_property_address
-- - idx_escrows_status
-- - idx_escrows_closing_date
-- - idx_escrows_user_id
-- - idx_escrows_team_id
\`\`\`

## REQUIRED FIELDS
- id (UUID, PRIMARY KEY)
- escrow_number (VARCHAR, UNIQUE)
- property_address (TEXT, NOT NULL)
- purchase_price (NUMERIC)
- closing_date (TIMESTAMP)
- escrow_status (VARCHAR) -- active, pending, closed, cancelled
- buyer_name (VARCHAR)
- seller_name (VARCHAR)
- commission_percentage (NUMERIC)
- commission_amount (NUMERIC)
- listing_id (UUID, FK to listings)
- client_id (UUID, FK to clients)
- user_id (UUID, FK to users)
- team_id (UUID, FK to teams)
- created_at, updated_at, deleted_at (TIMESTAMP)

## ADD MISSING FIELDS/INDEXES
\`\`\`sql
-- Add missing field example
ALTER TABLE escrows ADD COLUMN IF NOT EXISTS opening_date TIMESTAMP;

-- Add missing index example
CREATE INDEX IF NOT EXISTS idx_escrows_opening_date ON escrows(opening_date);
\`\`\`

## SUCCESS CRITERIA
✅ All required fields exist
✅ All indexes created for performance
✅ Foreign keys link correctly
✅ Constraints enforced (NOT NULL, UNIQUE)

## DELIVERABLES
1. Schema verification report
2. Migration SQL for missing fields/indexes`,
      },
      {
        id: 'test-apis',
        name: 'Test All API Endpoints',
        needsAI: true,
        userTasks: [
          'Try creating an escrow via API',
          'Try updating an escrow',
          'Try deleting an escrow',
          'Note any errors or issues',
        ],
        aiPrompt: `# TASK: Test All Escrows API Endpoints

## GOAL
Verify all CRUD operations work correctly with proper validation and error handling.

## ENDPOINTS TO TEST

### 1. GET /v1/escrows
\`\`\`bash
curl -H "Authorization: Bearer TOKEN" https://api.jaydenmetz.com/v1/escrows
\`\`\`
Expected: List of escrows with pagination

### 2. GET /v1/escrows/:id
\`\`\`bash
curl -H "Authorization: Bearer TOKEN" https://api.jaydenmetz.com/v1/escrows/ESC-2025-0001
\`\`\`
Expected: Single escrow details

### 3. POST /v1/escrows
\`\`\`bash
curl -X POST -H "Authorization: Bearer TOKEN" -H "Content-Type: application/json" \\
  https://api.jaydenmetz.com/v1/escrows \\
  -d '{
    "property_address": "123 Test St",
    "purchase_price": 500000,
    "escrow_status": "active"
  }'
\`\`\`
Expected: Created escrow with generated ID

### 4. PUT /v1/escrows/:id
\`\`\`bash
curl -X PUT -H "Authorization: Bearer TOKEN" -H "Content-Type: application/json" \\
  https://api.jaydenmetz.com/v1/escrows/ESC-2025-0001 \\
  -d '{"purchase_price": 550000}'
\`\`\`
Expected: Updated escrow

### 5. DELETE /v1/escrows/:id
\`\`\`bash
curl -X DELETE -H "Authorization: Bearer TOKEN" https://api.jaydenmetz.com/v1/escrows/ESC-2025-0001
\`\`\`
Expected: Soft delete (deleted_at set)

## VALIDATION TESTS

Test missing required fields:
\`\`\`bash
curl -X POST -H "Authorization: Bearer TOKEN" -H "Content-Type: application/json" \\
  https://api.jaydenmetz.com/v1/escrows \\
  -d '{"purchase_price": 500000}'
\`\`\`
Expected: 400 error "property_address is required"

## SUCCESS CRITERIA
✅ All endpoints return correct status codes
✅ Validation errors have clear messages
✅ Created records have proper timestamps
✅ Soft delete doesn't hard delete
✅ Unauthorized requests return 401

## DELIVERABLES
1. Test script with all curl commands
2. Report of any failing endpoints`,
      },
    ],
  },
  {
    id: 'escrows-frontend',
    name: 'Escrows Frontend - Consistent Structure',
    icon: <Code />,
    priority: 'medium',
    module: 'Escrows',
    description: 'Ensure consistent folder structure, services, and components following best practices',
    tasks: [
      {
        id: 'folder-structure',
        name: 'Audit Folder Structure',
        needsAI: false,
        userTasks: [
          'Check /components/dashboards/escrows/ exists with all view components',
          'Check /components/details/escrows/ exists with all tab components',
          'Check /components/common/widgets/ has EscrowCard, EscrowRow',
          'Check /services/escrows.service.js exists',
          'Note any files in wrong locations',
        ],
      },
      {
        id: 'create-service',
        name: 'Create/Verify Escrows Service',
        needsAI: true,
        userTasks: [],
        aiPrompt: `# TASK: Create/Verify Escrows Service

## GOAL
Ensure escrows.service.js exists with all API methods.

## FILE LOCATION
/frontend/src/services/escrows.service.js

## REQUIRED METHODS
\`\`\`javascript
import apiInstance from './api.service';

const escrowsService = {
  // List all escrows with filters
  async getAll(filters = {}) {
    const query = new URLSearchParams(filters).toString();
    return apiInstance.get(\`/escrows?\${query}\`);
  },

  // Get single escrow
  async getById(id) {
    return apiInstance.get(\`/escrows/\${id}\`);
  },

  // Create new escrow
  async create(data) {
    return apiInstance.post('/escrows', data);
  },

  // Update escrow
  async update(id, data) {
    return apiInstance.put(\`/escrows/\${id}\`, data);
  },

  // Delete escrow (soft delete)
  async delete(id) {
    return apiInstance.delete(\`/escrows/\${id}\`);
  },

  // Get stats
  async getStats() {
    return apiInstance.get('/escrows/stats');
  },
};

export default escrowsService;
\`\`\`

## SUCCESS CRITERIA
✅ File exists at correct path
✅ All methods implemented
✅ Uses apiInstance (not fetch directly)
✅ Exports default

## DELIVERABLES
1. escrows.service.js file`,
      },
    ],
  },
  {
    id: 'escrows-websocket',
    name: 'Escrows WebSocket - Real-Time Sync',
    icon: <Cloud />,
    priority: 'medium',
    module: 'Escrows',
    description: 'Enable real-time updates when escrows are created/updated/deleted by other users',
    tasks: [
      {
        id: 'websocket-backend',
        name: 'Verify Backend WebSocket Emits Events',
        needsAI: true,
        userTasks: [],
        aiPrompt: `# TASK: Verify Backend WebSocket Emits Escrows Events

## GOAL
Ensure escrows controller emits WebSocket events on create/update/delete.

## VERIFICATION

Check escrows.controller.js:
\`\`\`javascript
// After creating escrow
const websocketService = require('../services/websocket.service');
websocketService.emitToRoom('escrows', 'escrow.created', newEscrow);

// After updating escrow
websocketService.emitToRoom('escrows', 'escrow.updated', updatedEscrow);

// After deleting escrow
websocketService.emitToRoom('escrows', 'escrow.deleted', { id: escrowId });
\`\`\`

## ADD IF MISSING
\`\`\`javascript
// In POST /v1/escrows (create)
const result = await pool.query(/* INSERT */);
const newEscrow = result.rows[0];

// Emit WebSocket event
websocketService.emitToRoom('escrows', 'escrow.created', newEscrow);
\`\`\`

## SUCCESS CRITERIA
✅ Events emitted on create
✅ Events emitted on update
✅ Events emitted on delete

## DELIVERABLES
1. Updated escrows.controller.js with events`,
      },
      {
        id: 'websocket-frontend',
        name: 'Frontend Listens for Escrows Events',
        needsAI: true,
        userTasks: [],
        aiPrompt: `# TASK: Frontend Listens for Escrows WebSocket Events

## GOAL
Dashboard automatically updates when another user changes escrows.

## IMPLEMENTATION

In EscrowsDashboard component:
\`\`\`javascript
import websocketService from '../../../services/websocket.service';
import { useQueryClient } from '@tanstack/react-query';

const EscrowsDashboard = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Join escrows room
    websocketService.joinRoom('escrows');

    // Listen for events
    websocketService.on('escrow.created', (escrow) => {
      // Invalidate cache to refetch
      queryClient.invalidateQueries({ queryKey: ['escrows'] });
      // Show toast
      toast.success(\`New escrow created: \${escrow.property_address}\`);
    });

    websocketService.on('escrow.updated', (escrow) => {
      queryClient.invalidateQueries({ queryKey: ['escrows'] });
      queryClient.invalidateQueries({ queryKey: ['escrow', escrow.id] });
      toast.info(\`Escrow updated: \${escrow.property_address}\`);
    });

    websocketService.on('escrow.deleted', ({ id }) => {
      queryClient.invalidateQueries({ queryKey: ['escrows'] });
      toast.warning('Escrow deleted');
    });

    return () => {
      websocketService.leaveRoom('escrows');
    };
  }, []);

  // ... rest of component
};
\`\`\`

## SUCCESS CRITERIA
✅ User A creates escrow → User B's dashboard updates
✅ User A edits escrow → User B sees changes immediately
✅ User A deletes escrow → User B's dashboard removes it
✅ Toast notifications show who made the change

## DELIVERABLES
1. Updated EscrowsDashboard with WebSocket listeners`,
      },
    ],
  },
  {
    id: 'escrows-testing',
    name: 'Escrows Testing & QA',
    icon: <BugReport />,
    priority: 'medium',
    module: 'Escrows',
    description: 'Test all features manually and write automated tests where applicable',
    tasks: [
      {
        id: 'manual-testing',
        name: 'Manual Testing Checklist',
        needsAI: false,
        userTasks: [
          'Dashboard loads without errors',
          'All view modes work (cards, list, table, calendar)',
          'Filters work (status, date range, search)',
          'Create new escrow (all fields, save, verify)',
          'Edit existing escrow (change field, save, verify)',
          'Delete escrow (confirm modal, soft delete)',
          'Upload document (file uploads, preview, download)',
          'Link contacts (search, link, verify)',
          'Complete checklist tasks (check boxes, verify)',
          'WebSocket updates work (open 2 browsers, edit in one, see in other)',
        ],
      },
    ],
  },
  {
    id: 'escrows-documentation',
    name: 'Escrows Documentation',
    icon: <Description />,
    priority: 'low',
    module: 'Escrows',
    description: 'Document the Escrows module for future reference and replication to other modules',
    tasks: [
      {
        id: 'write-docs',
        name: 'Write Module Documentation',
        needsAI: false,
        userTasks: [
          'Document folder structure used',
          'Document API endpoints',
          'Document database schema',
          'Document WebSocket events',
          'Take screenshots of dashboard and detail page',
          'Write user guide (how to use escrows module)',
        ],
      },
    ],
  },
];

const ProjectRoadmapDashboard = () => {
  const [expandedProjects, setExpandedProjects] = useState([]);
  const [expandedTasks, setExpandedTasks] = useState([]);
  const [copiedPrompt, setCopiedPrompt] = useState(null);

  const toggleProject = (projectId) => {
    setExpandedProjects((prev) =>
      prev.includes(projectId)
        ? prev.filter((id) => id !== projectId)
        : [...prev, projectId]
    );
  };

  const toggleTask = (taskId) => {
    setExpandedTasks((prev) =>
      prev.includes(taskId)
        ? prev.filter((id) => id !== taskId)
        : [...prev, taskId]
    );
  };

  const copyPrompt = (taskId, prompt) => {
    navigator.clipboard.writeText(prompt);
    setCopiedPrompt(taskId);
    setTimeout(() => setCopiedPrompt(null), 2000);
  };

  const completedProjects = ESCROWS_PROJECTS.filter(p =>
    p.tasks.every(t => t.completed)
  ).length;

  const totalTasks = ESCROWS_PROJECTS.reduce((sum, p) => sum + p.tasks.length, 0);
  const completedTasks = ESCROWS_PROJECTS.reduce((sum, p) =>
    sum + p.tasks.filter(t => t.completed).length, 0
  );

  return (
    <Box>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          Escrows Module - Complete Roadmap
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Perfect the Escrows module as template for all other modules (Listings, Clients, Appointments, Leads)
        </Typography>
        <Stack direction="row" spacing={2}>
          <Chip
            label={`${ESCROWS_PROJECTS.length} Projects`}
            color="default"
            size="small"
          />
          <Chip
            label={`${completedProjects}/${ESCROWS_PROJECTS.length} Projects Complete`}
            color={completedProjects === ESCROWS_PROJECTS.length ? 'success' : 'primary'}
            size="small"
          />
          <Chip
            label={`${completedTasks}/${totalTasks} Tasks Complete`}
            color={completedTasks === totalTasks ? 'success' : 'default'}
            size="small"
          />
        </Stack>
      </Paper>

      {/* Projects List */}
      <Stack spacing={2}>
        {ESCROWS_PROJECTS.map((project) => {
          const projectCompleted = project.tasks.every(t => t.completed);
          const projectTasksCompleted = project.tasks.filter(t => t.completed).length;

          return (
            <ProjectAccordion
              key={project.id}
              expanded={expandedProjects.includes(project.id)}
              onChange={() => toggleProject(project.id)}
            >
              <ProjectSummary expandIcon={<ExpandMore />}>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ width: '100%', pr: 2 }}>
                  <Box sx={{ color: 'primary.main', display: 'flex' }}>{project.icon}</Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body1" fontWeight={600}>
                      {project.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {project.description}
                    </Typography>
                  </Box>
                  <PriorityChip priority={project.priority} label={project.priority} size="small" />
                  <Chip
                    label={`${projectTasksCompleted}/${project.tasks.length}`}
                    size="small"
                    color={projectCompleted ? 'success' : 'default'}
                    icon={projectCompleted ? <CheckCircle /> : undefined}
                  />
                </Stack>
              </ProjectSummary>

              <AccordionDetails>
                <Stack spacing={1}>
                  {project.tasks.map((task) => (
                    <TaskAccordion
                      key={task.id}
                      expanded={expandedTasks.includes(task.id)}
                      onChange={() => toggleTask(task.id)}
                    >
                      <TaskSummary expandIcon={<ExpandMore />}>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ width: '100%' }}>
                          <Checkbox
                            checked={task.completed || false}
                            size="small"
                            icon={<RadioButtonUnchecked />}
                            checkedIcon={<CheckCircle />}
                          />
                          <Typography variant="body2" fontWeight={500} sx={{ flex: 1 }}>
                            {task.name}
                          </Typography>
                          {task.needsAI && (
                            <Chip label="AI Ready" size="small" color="info" sx={{ fontSize: '10px' }} />
                          )}
                        </Stack>
                      </TaskSummary>

                      <AccordionDetails>
                        {task.needsAI && task.aiPrompt && (
                          <Box sx={{ mb: 2 }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                              <Typography variant="subtitle2" fontWeight={600}>
                                AI Prompt
                              </Typography>
                              <Button
                                size="small"
                                startIcon={<ContentCopy />}
                                onClick={() => copyPrompt(task.id, task.aiPrompt)}
                                color={copiedPrompt === task.id ? 'success' : 'primary'}
                              >
                                {copiedPrompt === task.id ? 'Copied!' : 'Copy Prompt'}
                              </Button>
                            </Stack>
                            <PromptBox elevation={0}>
                              {task.aiPrompt}
                            </PromptBox>
                          </Box>
                        )}

                        {task.userTasks && task.userTasks.length > 0 && (
                          <Box>
                            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                              Your Tasks:
                            </Typography>
                            <List dense>
                              {task.userTasks.map((userTask, idx) => (
                                <ListItem key={idx} disablePadding>
                                  <ListItemIcon sx={{ minWidth: 24 }}>
                                    <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: 'primary.main' }} />
                                  </ListItemIcon>
                                  <ListItemText
                                    primary={userTask}
                                    primaryTypographyProps={{ variant: 'body2' }}
                                  />
                                </ListItem>
                              ))}
                            </List>
                          </Box>
                        )}
                      </AccordionDetails>
                    </TaskAccordion>
                  ))}
                </Stack>
              </AccordionDetails>
            </ProjectAccordion>
          );
        })}
      </Stack>
    </Box>
  );
};

export default ProjectRoadmapDashboard;
