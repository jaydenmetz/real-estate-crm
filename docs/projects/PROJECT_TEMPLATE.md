# Project-XX: [Name from Overview]

**Phase**: A | **Priority**: HIGH/MEDIUM/LOW | **Status**: Not Started
**Est**: X hrs + 30% = Y hrs | **Deps**: [Project-##] or None

## 🎯 Goal
[One sentence from overview]

## 📋 Current → Target
**Now**: [Current problem/state]
**Target**: [Desired end state]
**Success Metric**: [Specific measurable command/outcome]

## ⚠️ Risk Check
- **Breaking Changes**: [What could break]
- **Rollback Plan**: `git reset --hard pre-project-XX-$(date +%Y%m%d)`
- **Production Impact**: None/Low/Medium/High

## ✅ Tasks
□ Create backup tag: `git tag pre-project-XX-$(date +%Y%m%d)`
□ [Specific task from overview]
□ [Specific task from overview]
□ Test locally: [command]
□ Deploy & verify: https://crm.jaydenmetz.com/health (228/228)

## 🧪 Verification Tests
```bash
# BEFORE (baseline)
[command showing current state]
# Expected: [current result]

# AFTER (proof of success)  
[command proving fix worked]
# Expected: [success result]
```

## 🚀 Production Deploy
```bash
git add . && git commit -m "Project-XX: [Name]

Co-Authored-By: Claude <noreply@anthropic.com>"
git push origin main

# Monitor Railway: https://railway.app (2-3 min)
# Verify health: curl https://crm.jaydenmetz.com/health
# Test affected features: [specific user flow]
```

## 📏 CLAUDE.md Compliance
□ NO Enhanced/Optimized/V2 files
□ Edit in place, archive if needed
□ PascalCase components
□ Use apiInstance (never raw fetch)
□ Max 2 columns in cards

## 🏁 Completion Checklist
□ All tasks complete
□ 228/228 tests passing
□ Zero console errors
□ Deployed to production
□ User verified working

---
**[MILESTONE]** if Projects 02/06/10/15 - requires extra verification
**Started**: [HH:MM] | **Completed**: [HH:MM] | **Actual**: [X hrs]
**Blocker**: [what delayed] | **Learning**: [key insight]