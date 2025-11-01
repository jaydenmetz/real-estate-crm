# CLAUDE.md - Real Estate CRM Development Guide

**Last Updated:** November 1, 2025  
**Project Status:** 82% Complete (Core functionality operational, optimizing for market launch)

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

---

## 🛠️ DEVELOPMENT WORKFLOW

### Core Principles
1. **Edit in place** - Never create duplicate files (no Component2.jsx, ComponentEnhanced.jsx)
2. **Safety-first** - Preserve API calls while restructuring presentation
3. **Iterative refinement** - Small improvements over complete rewrites
4. **Test before commit** - All changes tested locally first
5. **Auto-commit** - Push to GitHub immediately with descriptive messages

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

## 🚨 TECHNICAL DEBT & KNOWN ISSUES

### Critical (This Week)
1. **EscrowsDashboard.jsx** - 3,914 lines → Refactor into 8-10 components
2. **WebSocket Coverage** - Only escrows has real-time (need: listings, clients, leads, appointments)
3. **Console.log Cleanup** - 243 debug statements in production

### High Priority (This Month)
4. **Contacts Table** - Not implemented (ContactSelectionModal uses mock data)
5. **Admin Authorization** - Permission checks incomplete
6. **Mobile App** - Xcode app needs completion

### Time Estimates
- Total to 100%: ~50-67 hours
- At 15 hours/week: 4-5 weeks

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
- `ARCHITECTURE.md` - System patterns
- `API_REFERENCE.md` - Endpoint documentation  
- `DATABASE_STRUCTURE.md` - Schema reference
- `SECURITY_REFERENCE.md` - Security architecture

Archive completed docs to `/docs/archive/YYYY/`

---

## 🎯 PROJECT GOALS

### Immediate (This Sprint)
- [ ] Break down EscrowsDashboard.jsx
- [ ] Implement WebSocket for all modules
- [ ] Desktop UI optimization
- [ ] Stripe payment integration

### Short Term (3 months)
- [ ] Launch beta with 100 users
- [ ] Complete mobile app
- [ ] Full real-time collaboration
- [ ] AI agent orchestration

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

# Check for duplicates
find frontend/src -name "*.jsx" | xargs -I {} basename {} | sort | uniq -d
```

---

## ⚡ KEY REMINDERS

1. **The code is guilty until proven innocent** - Always audit code before blaming deployment
2. **No duplicate files ever** - Edit in place or archive the old
3. **Commit and push immediately** - Don't wait for permission
4. **2 columns max in cards** - Prevents text overlap
5. **Use apiInstance always** - Centralized API handling
6. **Test locally first** - Then push for auto-deploy

---

This guide is maintained for Claude to assist with Real Estate CRM development. 
For detailed implementation history, see `/docs/archive/`.