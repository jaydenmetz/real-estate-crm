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
  Alert,
  IconButton,
  Tooltip,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  ExpandMore,
  ContentCopy,
  CheckCircle,
  Storage,
  Code,
  Assessment,
  Security,
  SmartToy,
  PhoneAndroid,
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
  minHeight: '72px !important',
  '& .MuiAccordionSummary-content': {
    margin: `${theme.spacing(2)} 0`,
    alignItems: 'center',
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

const PromptBox = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: theme.palette.grey[50],
  border: `1px solid ${theme.palette.grey[300]}`,
  borderRadius: theme.spacing(1),
  fontFamily: 'monospace',
  fontSize: '13px',
  lineHeight: 1.6,
  whiteSpace: 'pre-wrap',
  maxHeight: '400px',
  overflowY: 'auto',
  position: 'relative',
  '&::-webkit-scrollbar': {
    width: '8px',
  },
  '&::-webkit-scrollbar-track': {
    background: theme.palette.grey[100],
  },
  '&::-webkit-scrollbar-thumb': {
    background: theme.palette.grey[400],
    borderRadius: '4px',
  },
}));

const UserActionBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: theme.palette.warning.light,
  border: `2px solid ${theme.palette.warning.main}`,
  borderRadius: theme.spacing(1),
  marginTop: theme.spacing(2),
}));

// PROFESSIONAL PROJECT DATA WITH 5-STAR AI PROMPTS
const PROJECTS = [
  {
    id: 'escrows-complete',
    name: 'Complete Escrows Data Import & Validation',
    icon: <Storage />,
    priority: 'critical',
    progress: 45,
    completed: 3,
    total: 8,
    status: 'in-progress',
    aiPrompt: `# PROJECT: Complete Escrows Data Import & Validation

## ULTIMATE GOAL
Import all 50+ escrow transactions from Excel/CSV spreadsheets into the PostgreSQL database with 100% data integrity, proper relationships, and validation. This is critical for moving from spreadsheets to a database-driven CRM.

## WHY THIS IS NECESSARY
**Business Critical:**
- Cannot track active transactions without complete data
- Commission calculations depend on accurate closing dates and prices
- Client history is incomplete without full transaction records
- Reporting and analytics are impossible with partial data

**Technical Critical:**
- Database schema must handle all real-world field variations
- Foreign key relationships (clients, listings) must be validated
- Date formats, currency values, and NULL handling must be standardized
- Duplicate detection is essential (same property, different dates)

## SOFTWARE ENGINEERING AUDIT CHECKLIST
✅ Data validation before INSERT (prevent garbage data)
✅ Foreign key constraint enforcement (no orphaned records)
✅ Transaction rollback on errors (all-or-nothing imports)
✅ Duplicate detection algorithm (same address + similar date = potential duplicate)
✅ Data type enforcement (dates as TIMESTAMP, prices as NUMERIC)
✅ NULL vs empty string handling (standardize to NULL)
✅ Index creation for performance (escrow_number, property_address, closing_date)
✅ Audit trail logging (who imported what, when)
✅ Backup before import (rollback capability)

## IMPLEMENTATION TODO LIST

### Step 1: Data Preparation (USER TASK)
- [ ] Export all escrow data to CSV format
- [ ] Ensure columns match database schema: escrow_number, property_address, purchase_price, closing_date, escrow_status, buyer_name, seller_name, commission_percentage, commission_amount, listing_id, client_id
- [ ] Clean data: remove duplicates, fix date formats (YYYY-MM-DD), standardize status values
- [ ] Identify any missing required fields and fill them in
- [ ] Save cleaned CSV to: /Users/jaydenmetz/Desktop/escrows_import.csv

### Step 2: Pre-Import Validation Script (AI TASK)
\`\`\`
CREATE /backend/scripts/validate-escrows-csv.js

Requirements:
- Read CSV file and validate each row
- Check required fields: escrow_number, property_address, purchase_price, closing_date
- Validate data types: dates parseable, prices numeric
- Check for duplicates within CSV (same address + date within 30 days)
- Verify foreign keys exist: listing_id in listings table, client_id in clients table
- Output validation report: X rows valid, Y rows have errors with specific issues
- Do NOT import yet - only validate and report
\`\`\`

### Step 3: Import Script with Transaction Safety (AI TASK)
\`\`\`
CREATE /backend/scripts/import-escrows.js

Requirements:
- Use PostgreSQL BEGIN/COMMIT/ROLLBACK transactions
- Read validated CSV file
- For each row:
  1. Check if escrow_number already exists (skip if duplicate)
  2. Validate foreign keys (listing_id, client_id)
  3. INSERT into escrows table
  4. Log success/failure for each row
- If ANY row fails, ROLLBACK entire transaction
- Output detailed report: X rows imported, Y rows failed with reasons
- Create backup of escrows table before import
\`\`\`

### Step 4: Post-Import Validation (AI TASK)
\`\`\`
CREATE /backend/scripts/verify-escrows-import.js

Requirements:
- Count total escrows in database
- Verify all required fields are NOT NULL
- Check foreign key integrity (all listing_id and client_id exist)
- Validate data ranges: purchase_price > 0, closing_date is reasonable
- Check for duplicate escrow_numbers
- Generate statistical summary: total escrows, date range, price range, status breakdown
\`\`\`

### Step 5: Fix Any Data Issues (AI TASK)
\`\`\`
Based on validation report, create SQL migration to fix common issues:
- UPDATE NULL fields with default values
- Fix date format inconsistencies
- Standardize status values (e.g., "active" vs "Active" vs "ACTIVE")
- Add missing indexes for performance
\`\`\`

### Step 6: Test Escrows API (AI TASK)
\`\`\`
Verify all CRUD operations work with imported data:
- GET /v1/escrows (list all, pagination works)
- GET /v1/escrows/:id (individual records load)
- PUT /v1/escrows/:id (updates work)
- DELETE /v1/escrows/:id (soft delete works)
- Test filters: status, date range, price range
- Test search: property address, escrow number
\`\`\`

## SUCCESS CRITERIA
✅ All 50+ escrow records imported successfully
✅ Zero foreign key constraint violations
✅ All required fields populated (no critical NULLs)
✅ Duplicate detection working (no duplicate escrow_numbers)
✅ API endpoints return correct data
✅ Date formats standardized to ISO 8601
✅ Currency values stored as NUMERIC with 2 decimal places
✅ Backup created and rollback tested

## POTENTIAL PROBLEMS TO AVOID
❌ Importing without validation → garbage data in database
❌ No transaction safety → partial imports leave database inconsistent
❌ Missing foreign key checks → orphaned records
❌ No duplicate detection → same escrow imported twice
❌ Date format inconsistencies → query/sort failures
❌ No indexes → slow queries as data grows
❌ No backup → cannot rollback if import fails

## DELIVERABLES
1. validate-escrows-csv.js script with detailed validation
2. import-escrows.js script with transaction safety
3. verify-escrows-import.js script with integrity checks
4. SQL migration to fix any data issues found
5. Import summary report showing results`,

    userTasks: [
      'Export all escrow data to CSV with standardized columns',
      'Clean data: fix date formats, remove duplicates, fill required fields',
      'Save CSV to /Users/jaydenmetz/Desktop/escrows_import.csv',
      'Review validation report and fix any flagged issues',
      'Run import script and verify success',
      'Test escrows API endpoints with imported data',
    ],
  },

  {
    id: 'dashboard-health-system',
    name: 'Build Comprehensive Health Dashboard System',
    icon: <Assessment />,
    priority: 'high',
    progress: 80,
    completed: 8,
    total: 10,
    status: 'in-progress',
    aiPrompt: `# PROJECT: Build Comprehensive Health Dashboard System

## ULTIMATE GOAL
Create a centralized health monitoring system that runs automated tests for all 5 core modules (Escrows, Listings, Clients, Appointments, Leads) with real-time pass/fail indicators, detailed error logs, and one-click test execution. This enables rapid debugging and ensures production reliability.

## WHY THIS IS NECESSARY
**Business Critical:**
- Catch production bugs before users report them
- Verify API changes don't break existing features
- Monitor system health without manual testing
- Demonstrate reliability to stakeholders

**Technical Critical:**
- Automated regression testing saves 10+ hours/week
- Dual authentication testing (JWT + API Key) ensures security
- API response validation prevents silent failures
- Integration testing catches cross-module issues

## SOFTWARE ENGINEERING AUDIT CHECKLIST
✅ Automated test execution (no manual test running)
✅ Test isolation (tests don't affect production data)
✅ Error handling with detailed stack traces
✅ Rate limiting compliance (avoid triggering security blocks)
✅ Test data cleanup (delete test records after execution)
✅ Response time monitoring (flag slow endpoints)
✅ Authentication token management (auto-refresh)
✅ Visual pass/fail indicators (green/red, not just text)
✅ Copy-to-clipboard for debugging (share errors with team)
✅ Test coverage reporting (% of endpoints tested)

## IMPLEMENTATION TODO LIST

### Step 1: Health Dashboard Overview Page (AI TASK)
\`\`\`
CREATE /frontend/src/components/health/HealthOverviewDashboard.jsx

Requirements:
- Display 5 module cards: Escrows, Listings, Clients, Appointments, Leads
- Each card shows: Total Tests, Passed, Failed, Pass Rate %
- Color coding: Green (100%), Yellow (80-99%), Red (<80%)
- Click card to navigate to module-specific health page
- Auto-run all tests on page load with rate limiting (1 module per 2 seconds)
- Show loading spinners while tests run
- Display last test run timestamp
\`\`\`

### Step 2: Module-Specific Health Pages (AI TASK - ALREADY DONE)
\`\`\`
VERIFY these exist and work:
- /escrows/health (29 tests)
- /listings/health (26 tests)
- /clients/health (15 tests)
- /appointments/health (15 tests)
- /leads/health (14 tests)

Each should have:
- JWT token authentication tests
- API key authentication tests
- CRUD operation tests (Create, Read, Update, Delete)
- Filter/search tests
- Error handling tests (404, 401, 400)
- Expandable test details with request/response
\`\`\`

### Step 3: Add Missing Tests (AI TASK)
\`\`\`
Identify gaps in test coverage and add:

Escrows:
- [ ] Test commission calculation accuracy
- [ ] Test date range filtering
- [ ] Test status transition validation (pending → active → closed)
- [ ] Test WebSocket real-time sync

Listings:
- [ ] Test MLS data import validation
- [ ] Test image upload and retrieval
- [ ] Test listing status workflow (draft → active → sold)

Clients:
- [ ] Test duplicate detection (same email/phone)
- [ ] Test client merge functionality
- [ ] Test contact history tracking

All Modules:
- [ ] Test pagination (offset/limit)
- [ ] Test sorting (asc/desc, multiple fields)
- [ ] Test bulk operations (delete multiple)
- [ ] Test export to CSV
\`\`\`

### Step 4: Error Reporting System (AI TASK)
\`\`\`
CREATE /frontend/src/components/health/ErrorReportModal.jsx

Requirements:
- When test fails, display detailed error report:
  - Endpoint URL and method
  - Request headers (redact tokens)
  - Request body
  - Response status code
  - Response body
  - Error stack trace
  - Timestamp
- Copy button to copy full report to clipboard
- "Report to Sentry" button to manually log error
- Suggested fixes based on error type:
  - 401 → "Check authentication token is valid"
  - 404 → "Verify record exists in database"
  - 500 → "Check server logs for detailed error"
\`\`\`

### Step 5: Automated Test Scheduling (AI TASK)
\`\`\`
CREATE /frontend/src/services/healthScheduler.service.js

Requirements:
- Run health tests every 30 minutes automatically
- Store test results in localStorage with timestamps
- Display notification if any test fails
- Trend analysis: show pass rate over last 24 hours
- Alert if pass rate drops below 90%
\`\`\`

### Step 6: Performance Monitoring (AI TASK)
\`\`\`
ENHANCE health tests to track response times:
- Flag endpoints slower than 500ms
- Show average response time per endpoint
- Identify performance regressions (endpoint that used to be fast is now slow)
- Create performance dashboard showing slowest endpoints
\`\`\`

## SUCCESS CRITERIA
✅ Health dashboard accessible at /health
✅ 99+ total tests across all modules
✅ All tests pass (100% pass rate)
✅ Tests run in <60 seconds total
✅ Detailed error reports for failures
✅ Copy-to-clipboard for debugging
✅ Visual green/red indicators
✅ Automated test scheduling working
✅ Performance monitoring showing response times

## POTENTIAL PROBLEMS TO AVOID
❌ Tests running too fast → rate limiting blocks
❌ Tests using real data → data pollution
❌ No test cleanup → database fills with test records
❌ Hardcoded tokens → tests fail when tokens expire
❌ No error context → can't debug failures
❌ Tests affect production → use test flags or separate DB
❌ Slow tests → developers stop using health dashboard

## DELIVERABLES
1. HealthOverviewDashboard.jsx with 5 module cards
2. Missing test coverage added to all modules
3. ErrorReportModal.jsx with detailed error reporting
4. healthScheduler.service.js with automated testing
5. Performance monitoring dashboard`,

    userTasks: [
      'Navigate to /health and verify all modules show',
      'Click each module card and verify tests run',
      'Check that all 99+ tests pass (fix any failures)',
      'Review error reports for any failed tests',
      'Verify automated scheduling runs every 30 minutes',
      'Monitor performance dashboard for slow endpoints',
    ],
  },

  {
    id: 'security-hardening',
    name: 'Complete Security Audit & Hardening',
    icon: <Security />,
    priority: 'critical',
    progress: 90,
    completed: 9,
    total: 10,
    status: 'in-progress',
    aiPrompt: `# PROJECT: Complete Security Audit & Hardening

## ULTIMATE GOAL
Achieve and maintain a 10/10 security score based on OWASP 2024 Top 10 standards, with SOC 2 and GDPR compliance readiness. This protects sensitive real estate data (commissions, client info, transaction details) and prevents security breaches that could destroy business reputation.

## WHY THIS IS NECESSARY
**Business Critical:**
- Real estate transactions involve sensitive financial data (commissions, prices)
- Client PII must be protected (GDPR, CCPA compliance)
- Security breach could destroy business reputation
- Insurance and legal liability for data breaches

**Technical Critical:**
- Prevent unauthorized access to commission data
- Stop brute force login attacks
- Protect API keys and JWT tokens
- Prevent SQL injection and XSS attacks
- Ensure encryption in transit and at rest

## SOFTWARE ENGINEERING AUDIT CHECKLIST
✅ Authentication: JWT tokens with refresh rotation, bcrypt password hashing (cost 12)
✅ Authorization: Role-based access control (RBAC) with system_admin, team_admin, agent roles
✅ Rate limiting: 30 login attempts per 15 min per IP, 100 API requests per 15 min
✅ Account lockout: 5 failed attempts = 30 min lockout
✅ SQL injection prevention: Parameterized queries only (no string concatenation)
✅ XSS prevention: Input sanitization (DOMPurify), Content Security Policy headers
✅ CSRF protection: SameSite cookies, CSRF tokens for state-changing requests
✅ Secrets management: Environment variables only, never commit credentials
✅ HTTPS enforcement: All production traffic over TLS 1.3
✅ Security event logging: All auth events logged to security_events table

## IMPLEMENTATION TODO LIST

### Step 1: Security Audit Script (AI TASK)
\`\`\`
CREATE /backend/scripts/security-audit.js

Requirements:
- Scan codebase for security issues:
  - Hardcoded credentials (search for "password", "secret", "key")
  - SQL injection risks (string concatenation in queries)
  - Missing input validation (check all POST/PUT endpoints)
  - Unprotected endpoints (missing authentication middleware)
  - Weak bcrypt cost factor (should be >= 12)
  - Missing rate limiting
  - Cleartext password logs (check all console.log statements)
- Generate audit report with severity (critical, high, medium, low)
- Output line numbers and file paths for each issue
\`\`\`

### Step 2: Fix Critical Vulnerabilities (AI TASK)
\`\`\`
Based on audit report, fix issues in priority order:

CRITICAL (Fix immediately):
- [ ] Remove any hardcoded credentials
- [ ] Fix SQL injection vulnerabilities (use parameterized queries)
- [ ] Add authentication to unprotected endpoints
- [ ] Enable rate limiting on all public endpoints

HIGH (Fix this week):
- [ ] Add input validation to all POST/PUT endpoints
- [ ] Implement CSRF protection
- [ ] Add Content Security Policy headers
- [ ] Rotate any exposed secrets

MEDIUM (Fix this month):
- [ ] Increase bcrypt cost factor to 12
- [ ] Add security event logging for all auth events
- [ ] Implement session timeout (auto-logout after 30 min)
- [ ] Add IP-based anomaly detection
\`\`\`

### Step 3: Penetration Testing (AI TASK)
\`\`\`
CREATE /backend/tests/security-penetration.test.js

Requirements:
Test common attack vectors:
- [ ] Brute force login (verify account lockout triggers)
- [ ] SQL injection attempts (verify parameterized queries block)
- [ ] XSS attacks (verify input sanitization works)
- [ ] CSRF attacks (verify tokens required)
- [ ] JWT token tampering (verify signature validation)
- [ ] Expired token reuse (verify 401 returned)
- [ ] Privilege escalation (agent trying to access admin endpoints)
- [ ] Rate limit bypass attempts

Each test should:
1. Attempt the attack
2. Verify it's blocked
3. Verify security event is logged
4. Assert no data is compromised
\`\`\`

### Step 4: GDPR Compliance (AI TASK)
\`\`\`
IMPLEMENT GDPR data subject rights:

Right to Access:
- [ ] GET /v1/gdpr/export - Export all user data to JSON
- [ ] Include: profile, escrows, listings, clients, appointments, security events

Right to Erasure:
- [ ] DELETE /v1/gdpr/delete-account - Delete all user data
- [ ] Cascade delete all related records (escrows, listings, etc.)
- [ ] Anonymize instead of delete if legal requirements exist
- [ ] Log deletion in audit trail

Right to Rectification:
- [ ] All PUT endpoints allow users to correct their data
- [ ] Audit trail tracks all changes

Right to Data Portability:
- [ ] Export data in machine-readable format (JSON)
- [ ] Include metadata (timestamps, source system)
\`\`\`

### Step 5: Security Monitoring Dashboard (AI TASK)
\`\`\`
CREATE /frontend/src/components/admin/SecurityDashboard.jsx

Requirements (system_admin role only):
- Display security metrics:
  - Failed login attempts (last 24 hours)
  - Locked accounts (current count)
  - Rate limit violations (last 24 hours)
  - Geographic anomalies (logins from unusual locations)
- Real-time alerts:
  - Show notification if >10 failed logins from single IP
  - Alert if user logs in from new country
- Security event timeline (last 100 events)
- Quick actions:
  - Unlock user account
  - Revoke API key
  - Force password reset
\`\`\`

### Step 6: Security Documentation (AI TASK)
\`\`\`
UPDATE /docs/SECURITY_REFERENCE.md with:
- Current security score (10/10)
- OWASP 2024 compliance checklist
- Incident response playbook
- Secrets rotation schedule
- Security testing procedures
- Compliance status (GDPR, SOC 2)
\`\`\`

## SUCCESS CRITERIA
✅ Security audit script finds zero critical issues
✅ All penetration tests fail (attacks blocked)
✅ 100% of endpoints require authentication
✅ Rate limiting prevents brute force attacks
✅ Account lockout working (5 attempts = lockout)
✅ GDPR endpoints functional (export, delete)
✅ Security dashboard shows real-time metrics
✅ No hardcoded credentials in codebase
✅ All secrets in environment variables
✅ TLS 1.3 enforced in production

## POTENTIAL PROBLEMS TO AVOID
❌ Hardcoded secrets → commit to GitHub, instant breach
❌ No rate limiting → brute force attacks succeed
❌ Weak password hashing → rainbow table attacks work
❌ Missing input validation → SQL injection possible
❌ No CSRF protection → forged requests accepted
❌ Inadequate logging → cannot detect breaches
❌ No monitoring → breaches go unnoticed for weeks

## DELIVERABLES
1. security-audit.js script with comprehensive scanning
2. All critical and high vulnerabilities fixed
3. security-penetration.test.js with attack simulations
4. GDPR compliance endpoints implemented
5. SecurityDashboard.jsx for real-time monitoring
6. Updated SECURITY_REFERENCE.md documentation`,

    userTasks: [
      'Run security audit script and review findings',
      'Verify all critical vulnerabilities are fixed',
      'Test penetration suite and confirm all attacks blocked',
      'Review GDPR endpoints (export, delete)',
      'Check security dashboard shows real-time metrics',
      'Confirm no hardcoded secrets in codebase (git grep "password")',
    ],
  },

  {
    id: 'ai-transaction-coordinator',
    name: 'Build AI Transaction Coordinator',
    icon: <SmartToy />,
    priority: 'high',
    progress: 0,
    completed: 0,
    total: 12,
    status: 'not-started',
    aiPrompt: `# PROJECT: Build AI Transaction Coordinator

## ULTIMATE GOAL
Create an AI agent that monitors all active escrows and automatically completes routine tasks (order title reports, schedule inspections, send reminder emails) while flagging issues that need human attention. This saves 10+ hours/week of administrative work and ensures nothing falls through the cracks.

## WHY THIS IS NECESSARY
**Business Critical:**
- Real estate transactions have 50+ tasks per escrow
- Missing a deadline can kill a deal (inspection contingency, financing deadline)
- Manual tracking is error-prone (forgot to order appraisal)
- Competitive advantage (faster, more reliable than competitors)

**Technical Critical:**
- AI must understand transaction context (buyer vs seller side)
- Task dependencies (can't schedule final walkthrough before inspection)
- Deadline calculations (inspection due 17 days after acceptance)
- Integration with checklists system (auto-complete tasks)

## SOFTWARE ENGINEERING AUDIT CHECKLIST
✅ Idempotent operations (safe to run AI agent multiple times)
✅ Audit trail (log every action AI takes)
✅ Human approval for critical tasks (sending contracts, wiring funds)
✅ Rollback capability (undo AI actions if needed)
✅ Rate limiting (prevent AI from spamming APIs)
✅ Error handling (AI recovers from failures gracefully)
✅ Testing in sandbox (don't let AI affect real escrows during development)
✅ Monitoring dashboard (see what AI is doing in real-time)
✅ Kill switch (disable AI instantly if it misbehaves)

## IMPLEMENTATION TODO LIST

### Step 1: Define AI Agent Architecture (AI TASK)
\`\`\`
CREATE /backend/src/services/ai/transactionCoordinator.service.js

Requirements:
- Cron job runs every 30 minutes
- Fetches all active escrows (status = 'active')
- For each escrow:
  1. Load checklist tasks
  2. Identify tasks that can be auto-completed
  3. Check if conditions met (e.g., "Order title" → escrow opened)
  4. Execute task or flag for human review
  5. Log action to ai_actions table
- Human review required for:
  - Sending contracts (legal risk)
  - Wire instructions (fraud risk)
  - Commission calculations (financial risk)
- Auto-complete safe tasks:
  - Send reminder emails (inspection due tomorrow)
  - Update task status (mark "Order title" as done)
  - Create calendar events
\`\`\`

### Step 2: Build Auto-Complete Logic (AI TASK)
\`\`\`
CREATE /backend/src/services/ai/taskRules.js

Requirements:
Define rules for each task type:

"Order Title Report" → Auto-complete if:
- Escrow status = 'active'
- Escrow opened date exists
- No title report already ordered
- Action: Mark task complete, log "Title report ordered via AI"

"Schedule Home Inspection" → Auto-complete if:
- Inspection contingency period started
- No inspection scheduled yet
- Action: Create calendar event, mark task complete

"Send 3-Day Notice" → Auto-complete if:
- 3 days before contingency deadline
- Notice not sent yet
- Action: Send email, mark task complete

"Request Repairs" → FLAG FOR HUMAN:
- Inspection report received
- AI cannot decide what repairs to request
- Action: Create notification for agent
\`\`\`

### Step 3: Build AI Action Logging (AI TASK)
\`\`\`
CREATE database migration: 021_create_ai_actions_table.sql

Requirements:
CREATE TABLE ai_actions (
  id UUID PRIMARY KEY,
  agent_type VARCHAR(50), -- 'transaction_coordinator', 'lead_qualifier'
  action_type VARCHAR(50), -- 'task_completed', 'email_sent', 'flagged_for_review'
  entity_type VARCHAR(50), -- 'escrow', 'listing', 'client'
  entity_id VARCHAR(255), -- ESC-2025-0001
  task_id UUID, -- Link to task if applicable
  action_details JSONB, -- What AI did
  reasoning TEXT, -- Why AI did it
  confidence_score DECIMAL, -- How confident AI was (0-1)
  human_approved BOOLEAN, -- Did human review and approve?
  human_reviewed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_ai_actions_entity ON ai_actions(entity_type, entity_id);
CREATE INDEX idx_ai_actions_created ON ai_actions(created_at DESC);
\`\`\`

### Step 4: Build AI Monitoring Dashboard (AI TASK)
\`\`\`
CREATE /frontend/src/components/ai/AICoordinatorDashboard.jsx

Requirements:
Display in real-time:
- AI agent status (running, paused, error)
- Last run timestamp
- Actions taken today:
  - X tasks auto-completed
  - Y emails sent
  - Z issues flagged for review
- Pending human reviews (clickable to review)
- AI confidence scores (low confidence = human review)
- Error log (if AI encounters errors)
- Kill switch button (pause AI immediately)

For each AI action, show:
- What AI did ("Marked 'Order Title' as complete")
- Why ("Escrow opened 2 days ago, no title report ordered")
- Confidence (85%)
- Undo button (rollback action if wrong)
\`\`\`

### Step 5: Implement Email Automation (AI TASK)
\`\`\`
CREATE /backend/src/services/ai/emailAutomation.service.js

Requirements:
- AI can send pre-approved email templates:
  - Inspection reminder (3 days before deadline)
  - Document request (missing buyer docs)
  - Status update (escrow milestone reached)
- Emails require:
  - Template ID (pre-approved by human)
  - Recipient (client, lender, title company)
  - Context variables (escrow number, deadline date)
- Log all sent emails to ai_actions table
- Include unsubscribe link
- Track email opens/clicks
\`\`\`

### Step 6: Build Human Review Interface (AI TASK)
\`\`\`
CREATE /frontend/src/components/ai/AIReviewQueue.jsx

Requirements:
Display tasks flagged for human review:
- Task name and escrow context
- AI reasoning ("Inspection report received, repairs needed")
- AI suggested action (if any)
- Options:
  - Approve AI suggestion (mark task complete)
  - Take custom action (agent decides)
  - Delegate to team member
  - Snooze (remind me tomorrow)
- After review, mark as human_approved in ai_actions
\`\`\`

### Step 7: AI Learning & Improvement (AI TASK)
\`\`\`
CREATE /backend/src/services/ai/learning.service.js

Requirements:
Track AI accuracy over time:
- When human approves AI action → confidence++
- When human rejects AI action → analyze why, adjust rules
- Identify patterns:
  - "AI always gets X task wrong" → improve rule
  - "AI confidence <70% on Y task" → always flag for review
- Monthly report:
  - AI accuracy % (actions approved / total actions)
  - Time saved (tasks auto-completed × avg time per task)
  - Recommendations for new rules
\`\`\`

### Step 8: Integration Testing (AI TASK)
\`\`\`
CREATE /backend/tests/ai-coordinator.test.js

Requirements:
Test scenarios:
- [ ] AI completes safe task successfully
- [ ] AI flags risky task for human review
- [ ] AI handles missing data gracefully (no escrow date → skip)
- [ ] AI respects rate limits (doesn't spam emails)
- [ ] AI logs all actions correctly
- [ ] Human can undo AI actions
- [ ] Kill switch pauses AI immediately
- [ ] AI doesn't duplicate actions (idempotency)

Use test escrows (not real data):
- Create test escrow with status 'active'
- Add test checklist with auto-completable tasks
- Run AI agent
- Verify tasks completed correctly
- Verify actions logged
- Clean up test data
\`\`\`

## SUCCESS CRITERIA
✅ AI agent runs every 30 minutes automatically
✅ AI completes 10+ tasks per week
✅ Zero errors or duplicate actions
✅ All AI actions logged to ai_actions table
✅ Human review queue shows flagged tasks
✅ Undo functionality works for all AI actions
✅ Kill switch pauses AI instantly
✅ Monitoring dashboard shows real-time activity
✅ Email automation sends pre-approved templates
✅ 90%+ human approval rate (AI decisions are correct)

## POTENTIAL PROBLEMS TO AVOID
❌ AI sends wrong email → embarrassing, unprofessional
❌ AI marks critical task complete prematurely → deal falls apart
❌ No audit trail → can't debug AI mistakes
❌ No human review → AI goes rogue
❌ No kill switch → can't stop misbehaving AI
❌ AI duplicates actions → spam clients with emails
❌ No testing → AI breaks production escrows

## DELIVERABLES
1. transactionCoordinator.service.js with cron job
2. taskRules.js with auto-complete logic
3. ai_actions database table with logging
4. AICoordinatorDashboard.jsx with monitoring
5. emailAutomation.service.js with templates
6. AIReviewQueue.jsx for human oversight
7. learning.service.js for AI improvement
8. Comprehensive test suite with test escrows`,

    userTasks: [
      'Define which tasks are safe for AI to auto-complete',
      'Review and approve email templates for AI to send',
      'Set up test escrows for AI development (not real data)',
      'Monitor AI dashboard daily for first 2 weeks',
      'Review AI actions queue and approve/reject suggestions',
      'Provide feedback on AI accuracy to improve rules',
    ],
  },

  {
    id: 'mobile-app',
    name: 'Build Native Mobile App (iOS + Android)',
    icon: <PhoneAndroid />,
    priority: 'medium',
    progress: 0,
    completed: 0,
    total: 15,
    status: 'not-started',
    aiPrompt: `# PROJECT: Build Native Mobile App (iOS + Android)

## ULTIMATE GOAL
Create a native mobile app using React Native that provides full CRM functionality on iOS and Android, with offline support, push notifications, and camera integration for property photos. This enables agents to manage transactions while showing properties or at open houses.

## WHY THIS IS NECESSARY
**Business Critical:**
- Agents work in the field, not at desks
- Need to add clients, schedule showings, update escrows on-site
- Push notifications for important events (offer received, inspection scheduled)
- Camera integration for property photos and document scanning

**Technical Critical:**
- Web app is not optimized for mobile browsers
- Offline support for working without internet (rural properties)
- Native features (camera, GPS, push notifications) not available in web
- Better performance than mobile web

## SOFTWARE ENGINEERING AUDIT CHECKLIST
✅ Cross-platform code sharing (90%+ shared between iOS and Android)
✅ Offline-first architecture (sync when internet available)
✅ Push notification infrastructure (Firebase Cloud Messaging)
✅ Secure token storage (iOS Keychain, Android Keystore)
✅ Camera permissions handled gracefully
✅ App store compliance (privacy policy, terms of service)
✅ Automated builds (CI/CD for iOS and Android)
✅ Crash reporting (Sentry for mobile)
✅ Performance monitoring (React Native Performance)
✅ App size optimization (<50MB download)

## IMPLEMENTATION TODO LIST

### Step 1: React Native Project Setup (AI TASK)
\`\`\`
CREATE new React Native project:

npx react-native init RealEstateCRM --template react-native-template-typescript

Requirements:
- TypeScript for type safety
- React Navigation for routing
- React Query for API calls (reuse existing queries)
- AsyncStorage for offline data
- React Native Paper for Material Design UI
- React Native Camera for photos
- Firebase Cloud Messaging for push notifications
- Sentry for error tracking

Project structure:
/mobile
  /src
    /screens (HomeScreen, EscrowsScreen, etc.)
    /components (reuse web components where possible)
    /services (API calls, identical to web)
    /navigation (app navigation)
    /store (offline data)
\`\`\`

### Step 2: API Integration (AI TASK)
\`\`\`
REUSE existing services from web app:
- Copy /frontend/src/services to /mobile/src/services
- Replace axios with fetch (React Native compatible)
- Add offline queue for API calls:
  - Store failed requests in AsyncStorage
  - Retry when internet reconnects
  - Show "offline mode" indicator

Implement token management:
- Store JWT in iOS Keychain / Android Keystore (secure)
- Auto-refresh tokens before expiration
- Handle 401 errors (redirect to login)
\`\`\`

### Step 3: Core Screens (AI TASK)
\`\`\`
BUILD essential screens:

1. Login Screen
   - Email + password fields
   - "Remember me" checkbox
   - Biometric login (Face ID / fingerprint)

2. Home Screen
   - Quick stats (active escrows, today's appointments)
   - Quick actions (add client, create escrow)
   - Recent activity feed

3. Escrows Screen
   - List of all escrows with filters (active, pending, closed)
   - Swipe to complete tasks
   - Tap to view details

4. Escrow Detail Screen
   - All escrow info (address, price, dates)
   - Checklist with checkboxes
   - Documents section (view/upload)
   - Commission calculator

5. Clients Screen
   - Searchable list of clients
   - Tap to call/email/text
   - Add new client form

6. Calendar Screen
   - Month view with appointments
   - Tap to add new appointment
   - Push notification reminders
\`\`\`

### Step 4: Camera & Photo Features (AI TASK)
\`\`\`
IMPLEMENT React Native Camera:

Requirements:
- Take property photos
- Scan documents (driver's license, bank statements)
- Add photos to listings or escrows
- Compress images before upload (reduce bandwidth)
- Store photos locally if offline (upload when online)

Use cases:
- Listing photos (show property details)
- Inspection report photos (document issues)
- Client ID verification (KYC compliance)
- Property damage photos (for repairs)
\`\`\`

### Step 5: Push Notifications (AI TASK)
\`\`\`
IMPLEMENT Firebase Cloud Messaging:

Setup:
- Create Firebase project
- Add iOS and Android apps to Firebase
- Install react-native-push-notification
- Request notification permissions

Notification types:
- "Offer received on 123 Main St" (new escrow)
- "Inspection scheduled for tomorrow at 2pm" (calendar reminder)
- "Contingency deadline in 3 days" (important deadline)
- "Commission received: $15,000" (payment notification)

Backend integration:
- CREATE /backend/src/services/pushNotifications.service.js
- Send push when escrow created, task completed, etc.
- Store device tokens in users table
- Handle token refresh (tokens expire)
\`\`\`

### Step 6: Offline Support (AI TASK)
\`\`\`
IMPLEMENT offline-first architecture:

Requirements:
- Cache API responses in AsyncStorage
- Display cached data when offline
- Queue write operations (create/update/delete)
- Sync queue when internet reconnects
- Show "offline mode" indicator
- Conflict resolution (handle concurrent edits)

Example flow:
1. Agent creates new client while offline
2. Client saved to AsyncStorage with pending: true
3. Internet reconnects
4. App syncs pending changes to server
5. Server returns created client with ID
6. App updates local client with server ID
\`\`\`

### Step 7: App Store Submission (USER TASK)
\`\`\`
iOS App Store:
- [ ] Create Apple Developer account ($99/year)
- [ ] Generate app icons and screenshots
- [ ] Write app description and keywords
- [ ] Submit for review (7-10 day approval)

Google Play Store:
- [ ] Create Google Play Developer account ($25 one-time)
- [ ] Generate app icons and screenshots
- [ ] Write app description and keywords
- [ ] Submit for review (1-3 day approval)

Required assets:
- App icon (1024x1024)
- Screenshots (5+ per device size)
- Privacy policy URL
- Terms of service URL
\`\`\`

### Step 8: CI/CD Pipeline (AI TASK)
\`\`\`
SETUP automated builds:

Requirements:
- GitHub Actions workflow
- Build iOS app on every push to main
- Build Android app on every push to main
- Run tests before building
- Upload to TestFlight (iOS) and Google Play Internal Testing
- Notify team when new build available

Benefits:
- No manual builds (save 30+ min per release)
- Catch build errors early
- Beta testers get updates automatically
\`\`\`

## SUCCESS CRITERIA
✅ App installs on iOS and Android
✅ All core screens functional (home, escrows, clients, calendar)
✅ API integration works (fetch/create/update data)
✅ Offline mode works (cache data, sync when online)
✅ Camera integration works (take photos, upload)
✅ Push notifications work (receive and display)
✅ Biometric login works (Face ID, fingerprint)
✅ App submitted to both app stores
✅ CI/CD pipeline builds and deploys automatically
✅ Crash reporting to Sentry working

## POTENTIAL PROBLEMS TO AVOID
❌ iOS and Android diverge → maintain two codebases
❌ Large app size → users won't download
❌ No offline support → unusable in rural areas
❌ Poor performance → laggy UI, frustrated users
❌ Camera permissions denied → can't take photos
❌ Push notifications spam → users disable them
❌ Token storage insecure → credentials stolen

## DELIVERABLES
1. React Native project with TypeScript
2. 6 core screens (login, home, escrows, escrow detail, clients, calendar)
3. API integration with offline queue
4. Camera integration for photos
5. Push notifications system
6. Offline-first architecture with sync
7. iOS and Android builds
8. App store submissions
9. CI/CD pipeline for automated builds`,

    userTasks: [
      'Create Apple Developer account ($99/year)',
      'Create Google Play Developer account ($25 one-time)',
      'Provide app name, icon, and branding guidelines',
      'Write privacy policy and terms of service',
      'Generate app screenshots for both platforms',
      'Test beta builds on physical iOS and Android devices',
      'Submit apps to App Store and Google Play',
    ],
  },
];

const ProjectRoadmapDashboard = () => {
  const [expandedProjects, setExpandedProjects] = useState([]);
  const [copiedPrompt, setCopiedPrompt] = useState(null);

  const toggleProject = (projectId) => {
    setExpandedProjects((prev) =>
      prev.includes(projectId)
        ? prev.filter((id) => id !== projectId)
        : [...prev, projectId]
    );
  };

  const copyPrompt = (projectId, prompt) => {
    navigator.clipboard.writeText(prompt);
    setCopiedPrompt(projectId);
    setTimeout(() => setCopiedPrompt(null), 2000);
  };

  return (
    <Box>
      {/* Header Stats */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          Development Roadmap
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          5 Priority Projects with AI-Ready Prompts
        </Typography>
        <Stack direction="row" spacing={2}>
          <Chip
            label={`${PROJECTS.filter((p) => p.status === 'completed').length} Completed`}
            color="success"
            size="small"
          />
          <Chip
            label={`${PROJECTS.filter((p) => p.status === 'in-progress').length} In Progress`}
            color="primary"
            size="small"
          />
          <Chip
            label={`${PROJECTS.filter((p) => p.status === 'not-started').length} Not Started`}
            color="default"
            size="small"
          />
        </Stack>
      </Paper>

      {/* Projects List */}
      <Stack spacing={2}>
        {PROJECTS.map((project) => (
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
                    {project.completed}/{project.total} tasks completed
                  </Typography>
                </Box>
                <PriorityChip priority={project.priority} label={project.priority} size="small" />
                <Chip
                  label={`${project.progress}%`}
                  size="small"
                  color={project.progress === 100 ? 'success' : 'default'}
                  icon={project.status === 'completed' ? <CheckCircle /> : undefined}
                />
              </Stack>
            </ProjectSummary>

            <AccordionDetails>
              <Box>
                {/* Copy Prompt Button */}
                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="contained"
                    startIcon={<ContentCopy />}
                    onClick={() => copyPrompt(project.id, project.aiPrompt)}
                    color={copiedPrompt === project.id ? 'success' : 'primary'}
                  >
                    {copiedPrompt === project.id ? 'Copied!' : 'Copy AI Prompt'}
                  </Button>
                </Box>

                {/* AI Prompt */}
                <PromptBox elevation={0}>
                  {project.aiPrompt}
                </PromptBox>

                <Divider sx={{ my: 3 }} />

                {/* User Action Items */}
                <UserActionBox>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                    <Typography variant="subtitle2" fontWeight={700}>
                      ⚠️ USER ACTIONS REQUIRED
                    </Typography>
                  </Stack>
                  <Typography variant="body2" sx={{ mb: 1.5 }}>
                    Before AI can implement this project, you must complete:
                  </Typography>
                  <Stack spacing={0.5}>
                    {project.userTasks.map((task, idx) => (
                      <Typography key={idx} variant="body2" sx={{ pl: 2 }}>
                        • {task}
                      </Typography>
                    ))}
                  </Stack>
                </UserActionBox>
              </Box>
            </AccordionDetails>
          </ProjectAccordion>
        ))}
      </Stack>

      {/* Instructions */}
      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="body2" fontWeight={600} gutterBottom>
          How to Use This Dashboard:
        </Typography>
        <Typography variant="body2" component="div">
          1. Click a project to expand and view the full AI prompt
          <br />
          2. Complete all "USER ACTIONS REQUIRED" tasks first
          <br />
          3. Click "Copy AI Prompt" button
          <br />
          4. Paste into Claude or another AI assistant
          <br />
          5. AI will implement the entire project following the detailed specifications
        </Typography>
      </Alert>
    </Box>
  );
};

export default ProjectRoadmapDashboard;
