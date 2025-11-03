# CLAUDE.md - Real Estate CRM Development Guide

**Last Updated:** November 3, 2025
**Project Status:** Phase A Complete (15/105 projects) - Phase B Active
**Roadmap Reference:** `/docs/COMPLETE_ROADMAP.md` (105 projects across 8 phases)

---

## ⚡ CRITICAL: NEVER STOP FOR TOKEN LIMITS

**IMPORTANT**: User has plenty of AI tokens available.

❌ **DO NOT** stop projects due to "context approaching limits"
❌ **DO NOT** suggest ending session early
❌ **DO NOT** pause work to "prepare for next session"

✅ **CONTINUE working** until user explicitly says to stop
✅ **CONTINUE implementing** projects one after another
✅ **ONLY STOP** if you literally run out of tokens (system error)

**Keep going! Complete as many projects as possible in each session.** 🚀

---

## 🎯 CURRENT DEVELOPMENT FOCUS

### Active Priorities (November 2025)
1. **UI/UX Desktop Optimization** - MacBook viewport perfection
2. **Component Refactoring** - Breaking down monolithic components (EscrowsDashboard: 3,914 lines → modular)
3. **Real-Time WebSocket** - Extend beyond escrows to all modules
4. **Payment Processing** - Stripe integration for SaaS model

### Quick Access
- **Production:** https://crm.jaydenmetz.com
- **API:** https://api.jaydenmetz.com/v1
- **Deploy:** Auto-deploys from GitHub → Railway
- **Test Dashboard:** https://crm.jaydenmetz.com/health (228/228 tests passing)

### Roadmap Integration
- **Roadmap:** `/docs/COMPLETE_ROADMAP.md` (105 projects - NEVER EDIT)
- **Progress:** `/docs/PROGRESS_TRACKER.md` (update after EACH project)
- **Current Status:** Ready to start Project 01 of 105
- **Method:** Follow projects sequentially for systematic completion

---

## 🚀 PROJECT WORKFLOW (CRITICAL - READ THIS!)

### When User Says "Start Next Project"

**DO THIS (in exact order):**

1. **Check `docs/projects/current/Phase X/` folder:**
   ```bash
   ls -1 docs/projects/current/Phase\ */Project-*.md | sort | head -1
   ```
   - Find the **LOWEST numbered** project file
   - This is the next project to implement

2. **SPECIAL: If this is Project-X1 (first project of new phase - e.g., 16, 31, 46):**
   - **FIRST create Pre-Phase Readiness Report:**
     - Use template: `docs/projects/Pre-Phase Readiness Report.md`
     - Audit: Authentication, Module Completeness, Performance, Technical Debt, Test Coverage
     - Save as: `docs/projects/Pre-Phase-[X]-Readiness-Report-[Date].md`
     - Review findings before starting first project
   - **THEN proceed with project implementation**

3. **If project files exist in current phase:**
   - Open the lowest-numbered project file
   - Update status to "In Progress"
   - Update "Actual Time Started" with current time
   - Create git tag: `git tag pre-project-XX-$(date +%Y%m%d)`
   - Implement ALL tasks in the project file
   - Run ALL verification tests locally
   - Test locally if possible: `cd frontend && npm run build` (catch build errors before deploying)
   - Commit and push to deploy: `git add -A && git commit -m "..." && git push origin main`
   - **WAIT for Railway deployment to complete** (use verification loop below)
   - Update project file with:
     - "Actual Time Completed"
     - "Actual Duration"
     - "Variance"
     - Implementation notes
     - Completion checklist
   - Change status to "Complete"
   - **Move completed project to `docs/projects/current/completed/`**
   - Commit and push

3. **If ONLY Phase Summary remains (all projects moved to completed/):**
   - **Phase is complete!**
   - Run comprehensive phase verification tests from Phase Summary
   - If all tests pass:
     - Create final phase completion report
     - **Move ALL files from `docs/projects/current/completed/` BACK into `docs/projects/current/Phase X/`**
     - **Move entire `docs/projects/current/Phase X/` folder to `docs/projects/archive/`**
     - Print: "✅ Phase X Successfully Implemented - All projects complete!"
     - **Move NEXT phase from `docs/projects/future/` to `docs/projects/current/`**
     - Example: `mv docs/projects/future/Phase\ B docs/projects/current/`
   - If tests fail:
     - Identify failing project
     - Move it back to current/Phase X/ for rework

4. **If `docs/projects/current/` is empty AND `docs/projects/future/` is empty:**
   - **ALL 105 PROJECTS COMPLETE!** 🎉
   - Print: "✅ CONGRATULATIONS! All 105 projects complete - CRM is 100% market-ready!"
   - Create final completion report
   - Update CLAUDE.md status to "100% Complete"

### Folder Structure During Execution

```
docs/projects/
├── current/                    # ACTIVE WORK AREA
│   ├── Phase A/               # Current phase being worked on
│   │   ├── Phase-A-Summary.md
│   │   ├── Project-02-*.md    # Next project (lowest number)
│   │   ├── Project-03-*.md
│   │   └── ... (remaining projects)
│   └── completed/             # Completed projects from current phase
│       └── Project-01-*.md    # Recently completed
├── archive/                   # COMPLETED PHASES
│   ├── Phase A/              # (after all 15 projects done)
│   │   ├── Phase-A-Summary.md
│   │   ├── Project-01-*.md
│   │   └── ... (all 15 projects)
│   └── Phase B/              # (future)
└── future/                    # UPCOMING PHASES
    ├── Phase B/              # Next phase to start
    ├── Phase C/
    └── ... (Phases D-H)
```

### Critical Rules

**DO:**
✅ Always find LOWEST numbered project in current/Phase X/
✅ Implement projects in sequential order (01 → 02 → 03...)
✅ Move each completed project to current/completed/
✅ Run phase verification when only summary remains
✅ Move entire phase to archive/ when verified
✅ Move next phase from future/ to current/

**DO NOT:**
❌ NEVER create new project files (all 105 already exist)
❌ NEVER edit files in future/ or archive/ folders
❌ NEVER skip projects or change order
❌ NEVER start Phase B before Phase A complete
❌ NEVER leave completed projects in current/Phase X/

### Example Flow

**Starting state:**
```
current/Phase A/ (15 projects)
completed/ (empty)
```

**After Project-01:**
```
current/Phase A/ (14 projects: 02-15)
completed/Project-01-*.md
```

**After Project-15:**
```
current/Phase A/ (only Phase-A-Summary.md)
completed/ (15 projects: 01-15)
```

**After Phase A verification passes:**
```
archive/Phase A/ (16 files: summary + all 15 projects)
current/Phase B/ (moved from future/)
completed/ (empty again)
```

### Railway Deployment Verification (CRITICAL)

**After `git push origin main`, ALWAYS verify deployment before marking complete:**

```bash
# Wait and verify both frontend and backend deploy successfully
# Check every 30 seconds for up to 5 minutes

for i in {1..10}; do
  echo "Deployment check $i/10..."

  # Check frontend
  FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://crm.jaydenmetz.com)

  # Check backend
  BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://api.jaydenmetz.com/v1/health)

  echo "Frontend: $FRONTEND_STATUS | Backend: $BACKEND_STATUS"

  # Both should return 200 (frontend) and 200 or 401 (backend needs auth)
  if [ "$FRONTEND_STATUS" = "200" ] && [ "$BACKEND_STATUS" = "200" -o "$BACKEND_STATUS" = "401" ]; then
    echo "✅ Both services deployed successfully!"
    break
  fi

  if [ $i -lt 10 ]; then
    echo "Waiting 30 seconds..."
    sleep 30
  fi
done
```

**If deployment fails:**
1. Check Railway dashboard for build errors
2. Look for import errors, missing modules, webpack issues
3. Fix locally, commit, push again
4. DO NOT mark project complete until deployment succeeds

### PROJECT COMPLETION CHECKLIST (MANDATORY - READ BEFORE MOVING TO completed/)

**Before moving ANY project file to `docs/projects/current/completed/`, verify ALL of these:**

✅ **Metadata Section (lines 1-10):**
  - [ ] Status changed to "Complete"
  - [ ] Actual Time Completed filled in (not [HH:MM on Date])
  - [ ] Actual Duration calculated (not [Calculate:...])
  - [ ] Variance calculated (not [Actual - Estimated...])
  - [ ] NO duplicate lines (check for repeated completion times)

✅ **Tasks Section:**
  - [ ] ALL checkboxes marked [x] for completed tasks
  - [ ] If no changes: marked [x] with note like "NO CHANGES NEEDED"

✅ **Verification Tests Section:**
  - [ ] ALL tests marked: **Pass/Fail:** [x] PASS (or FAIL with reason)
  - [ ] Never leave as: **Pass/Fail:** [ ]

✅ **Implementation Notes Section (REQUIRED):**
  - [ ] **Changes Made**: Detailed list of every file/folder changed (or "NO CHANGES")
  - [ ] **Issues Encountered**: Problems faced (or "None")
  - [ ] **Decisions Made**: Why certain choices were made (with rationale)

✅ **Archive Information Section (REQUIRED):**
  - [ ] **Completion Date**: Actual date (not [Date])
  - [ ] **Final Status**: Success/Partial/Blocked (not [Success/Partial/Blocked])
  - [ ] **Lessons Learned**: Real lessons (not [Brief notes])
  - [ ] **Follow-up Items**: Actual items or "None" (not [Any items...])

❌ **STOP if you find ANY of these placeholders:**
  - [HH:MM on Date]
  - [Date]
  - [Calculate: XX hours YY minutes]
  - [Brief notes]
  - [Any items for future projects]
  - [ ] (empty checkboxes in completed sections)

**If ANY placeholder remains: DO NOT move to completed/, fix it first!**

### When to Say "Phase Complete"

Only when:
1. All individual projects moved to completed/
2. Only Phase-X-Summary.md remains in current/Phase X/
3. Phase verification tests all pass
4. User confirms phase is complete

---

## 📊 ROADMAP OVERVIEW (105 Projects)

### Current Position
```
[ ] Project 01: Environment Configuration Cleanup  <- START HERE
[ ] Project 02: Remove Duplicate Code Files
[ ] Projects 03-105: See /docs/COMPLETE_ROADMAP.md
```

| Phase | Name | Projects | Hours | Status |
|-------|------|----------|-------|--------|
| **A** | Foundation & Structure | 1-15 | 145h | 🔄 Ready to start |
| **B** | Core Functionality | 16-30 | 153.5h | ⏳ Blocked by A |
| **C** | Advanced Features | 31-45 | 185h | ⏳ Blocked by B |
| **D** | UI/UX Refinement | 46-60 | 171.2h | ⏳ Blocked by B |
| **E** | Data & Analytics | 61-75 | 165h | ⏳ Blocked by B |
| **F** | Security & Compliance | 76-85 | 100h | ⏳ Blocked by C,D,E |
| **G** | Testing & Quality | 86-95 | 120h | ⏳ Blocked by F |
| **H** | Deployment & Operations | 96-105 | 95h | ⏳ Blocked by G |

**Key Milestones:**
- Project 31: Stripe Integration (enables revenue)
- Project 35: MLS API (major efficiency gain)
- Project 105: System Complete (market-ready)

---

## 📋 HOW TO USE THE PROGRESS TRACKER

### Daily Workflow with Roadmap
```bash
# 1. Check current project
cat /docs/PROGRESS_TRACKER.md | grep "Current Project"

# 2. Get project details from roadmap
grep -A 5 "^| 01 |" /docs/COMPLETE_ROADMAP.md

# 3. Execute the project
# ... do the work ...

# 4. Update Progress Tracker (example for Project 01)
# Change: | 01 | Environment Config | 8h | - | ⏳ | - | Ready |
# To:     | 01 | Environment Config | 8h | 7.5h | ✅ | Nov 2 | Done |

# 5. Commit with project reference
git add -A
git commit -m "Complete Project 01: Environment Configuration

Roadmap: Phase A, Project 01 of 105
Result: All env vars consolidated
Next: Project 02 - Remove Duplicate Code Files

Co-Authored-By: Claude <noreply@anthropic.com>"
git push origin main
```

### Three-Document System
1. **COMPLETE_ROADMAP.md** - Master plan (immutable)
2. **PROGRESS_TRACKER.md** - Living progress document
3. **CLAUDE.md** - This guide with current context

---

## 🛠️ DEVELOPMENT WORKFLOW

### Core Principles
1. **Edit in place** - Never create duplicate files (no Component2.jsx, ComponentEnhanced.jsx)
2. **Safety-first** - Preserve API calls while restructuring presentation
3. **Iterative refinement** - Small improvements over complete rewrites
4. **Test before commit** - All changes tested locally first
5. **Auto-commit** - Push to GitHub immediately with descriptive messages
6. **Follow roadmap** - Complete projects in sequence for systematic progress

### Git Workflow
```bash
git add -A
git commit -m "Your change description

Co-Authored-By: Claude <noreply@anthropic.com>"
git push origin main
```

---

## 📁 PROJECT STRUCTURE

### File Organization Rules
```
real-estate-crm/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/      # Auth, validation
│   │   ├── routes/         # API endpoints
│   │   └── services/       # Business logic
│   └── migrations/         # Database migrations
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── dashboards/  # Main dashboard views
│       │   ├── details/     # Detail pages structure
│       │   │   └── [entity]/
│       │   │       ├── hero/
│       │   │       ├── widgets/
│       │   │       └── sidebar/
│       │   ├── common/      # Shared components
│       │   └── health/      # Health check dashboards
│       └── services/        # API and WebSocket
├── docs/                    # Active documentation only
│   ├── COMPLETE_ROADMAP.md # Master plan (105 projects)
│   └── PROGRESS_TRACKER.md # Living progress document
├── scripts/                 # Utility scripts
└── archive/                # Old code versions
```

### Critical Rules
- **NO files in root** except README.md, CLAUDE.md, docker-compose.yml, railway.json
- **NO duplicate files** - Edit existing files, don't create versions
- **Archive old code** to `archive/ComponentName_YYYY-MM-DD.jsx`
- **Docs stay minimal** - Only active reference docs in `/docs`

---

## 🏗️ ARCHITECTURE PATTERNS

### Component Architecture
```javascript
// Config-driven components using entity configurations
const entityConfig = {
  entity: 'escrows',
  api: { endpoints: {...} },
  dashboard: { 
    hero: {...},
    filters: {...},
    views: ['grid', 'list', 'calendar']
  }
};
```

### API Pattern (Centralized)
```javascript
// Always use apiInstance from api.service.js
import { apiInstance } from './services/api.service';

// Automatic JWT refresh
const data = await apiInstance.get('/escrows');

// Never use raw fetch() except for auth
```

### State Management
- React Query for server state
- Context for auth/user state
- Local state for UI state
- WebSocket for real-time updates

---

## 🚨 TECHNICAL DEBT & ROADMAP ALIGNMENT

### Why Use the Roadmap?
Your current issues are addressed systematically through the 105 projects:
- **EscrowsDashboard.jsx (3,914 lines)** → Fixed before Project 18
- **WebSocket Coverage** → Project 25 (Phase B)
- **Console.log Cleanup** → Part of Project 15
- **Contacts Table** → Project 23 (Phase B)
- **Stripe Integration** → Project 31 (Phase C)
- **Mobile Responsiveness** → Projects 46-48 (Phase D)

### Phase A First (Projects 1-15)
Must complete foundation before fixing features:
1. Environment configs (Project 01)
2. Remove duplicates (Project 02)
3. Naming conventions (Project 03)
4. API standardization (Project 09)
5. Build verification (Project 15)

**Estimated Time:** 145 hours for clean foundation  
**Then:** Move to Phase B for core functionality fixes

---

## 🔐 SECURITY & AUTHENTICATION

### Current Implementation
- **Auth:** Dual system (JWT + API Keys)
- **Security Score:** 10/10 (OWASP 2024 compliant)
- **Tests:** 228/228 passing
- **API Keys:** Clean 64-char hex strings (no prefixes)

### Security Features
✅ Account lockout (5 attempts)  
✅ Rate limiting (30 req/15min)  
✅ JWT refresh tokens  
✅ Security event logging  
✅ CORS configured  
✅ Input validation  

---

## 💡 BEST PRACTICES

### Before Creating Components
```bash
# ALWAYS check for existing files first
find frontend/src -name "*ComponentName*" 2>/dev/null
```

### Debugging Order
1. Check for duplicate files FIRST
2. Verify correct imports
3. Check build output
4. Only then review code logic

### Grid Layouts in Cards
- **Full-width layouts:** Can use 3-4 columns
- **Inside cards/widgets:** MAX 2 columns (prevent text overlap)
- **Use presets:** `layouts.statsGrid2x2` for cards

### Responsive Design
```jsx
// Inside cards - 2 column max
<Grid container spacing={2}>
  <Grid item xs={6} sm={6}>  // Always 2×2

// Page level - can use more
<Grid container spacing={3}>
  <Grid item xs={12} sm={6} md={3}>  // OK for full-width
```

---

## 🚀 DATABASE & SCALING

### Current Setup
- **Database:** PostgreSQL on Railway
- **Hosting:** Railway with auto-deploy
- **Performance:** Sub-200ms response times
- **Scale:** Ready for 1-50 teams

### Future Scaling Path
1. **Phase 1 (Now):** Single-tenant on Railway ($20-50/month)
2. **Phase 2 (50+ teams):** Add team_id, subdomain routing
3. **Phase 3 (500+ teams):** Migrate to AWS/Supabase
4. **Phase 4 (Enterprise):** Kubernetes, read replicas

---

## 📋 ACTIVE DOCUMENTATION

Keep these docs current in `/docs`:
- `COMPLETE_ROADMAP.md` - 105 project master plan
- `PROGRESS_TRACKER.md` - Living progress document
- `ARCHITECTURE.md` - System patterns
- `API_REFERENCE.md` - Endpoint documentation  
- `DATABASE_STRUCTURE.md` - Schema reference
- `SECURITY_REFERENCE.md` - Security architecture

Archive completed docs to `/docs/archive/YYYY/`

---

## 🎯 PROJECT GOALS

### Immediate (This Sprint)
- [ ] Start Project 01: Environment Configuration
- [ ] Complete Phase A: Foundation (Projects 1-15)
- [ ] Desktop UI optimization
- [ ] Break down EscrowsDashboard.jsx

### Roadmap-Driven Goals
- **Week 1-4:** Complete Phase A (Foundation)
- **Week 5-9:** Complete Phase B (Core Functionality)
- **Week 10-14:** Complete Phase C (Revenue Features)
- **Q2 2026:** Complete all 105 projects (100% market-ready)

### Long Term (12 months)
- [ ] 10,000+ customers
- [ ] Multi-tenant architecture
- [ ] Marketplace ecosystem
- [ ] International expansion

---

## 🔧 QUICK COMMANDS

```bash
# Development
cd frontend && npm start
cd backend && npm run dev

# Testing
./scripts/testing/test-api-auth.sh

# Database backup
cd backend && ./scripts/backup.sh

# Roadmap Navigation
grep "Current Project" /docs/PROGRESS_TRACKER.md
grep "^| [0-9]" /docs/COMPLETE_ROADMAP.md | grep "⏳" | head -5
awk '/Phase.*Projects.*Hours/{print}' /docs/COMPLETE_ROADMAP.md

# Check for duplicates (Project 02)
find . -type f \( -name "*.jsx" -o -name "*.js" \) | xargs basename -a | sort | uniq -d

# Check naming conventions (Project 03)
find frontend/src/components -name "*.jsx" | xargs basename -a | grep -v "^[A-Z]"
```

---

## ⚡ KEY REMINDERS

1. **The code is guilty until proven innocent** - Always audit code before blaming deployment
2. **No duplicate files ever** - Edit in place or archive the old
3. **Commit and push immediately** - Don't wait for permission
4. **2 columns max in cards** - Prevents text overlap
5. **Use apiInstance always** - Centralized API handling
6. **Test locally first** - Then push for auto-deploy
7. **Follow the roadmap** - Complete projects in sequence
8. **Update progress tracker** - After EVERY project completion

---

## 📊 PROGRESS TRACKING

**Files:** 525/627 (82% but unstructured)  
**Projects:** 0/105 (Starting systematic approach)  
**Next Project:** 01 - Environment Configuration (8 hours)  
**Target Completion:** May 2026 at 15 hrs/week

For full roadmap details: `/docs/COMPLETE_ROADMAP.md`  
For current progress: `/docs/PROGRESS_TRACKER.md`  

---

This guide is maintained for Claude to assist with Real Estate CRM development. 
For detailed implementation history, see `/docs/archive/`.