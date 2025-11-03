# Project-47: Dark Mode Implementation

**Phase**: D
**Priority**: LOW
**Status**: Not Started
**Estimated Time**: 10 hours (base) + 2 hours (buffer 20%) = 12 hours total
**Actual Time Started**: [HH:MM on Date]
**Actual Time Completed**: [HH:MM on Date]
**Actual Duration**: [Calculate: XX hours YY minutes]
**Variance**: [Actual - Estimated = +/- X hours]

---

## 🎯 Goal
Implement dark mode across the entire CRM with theme switching, preference storage, and consistent color palette.

## 📋 Context
Dark mode is expected in modern applications in 2025. It provides:
- Reduced eye strain in low-light environments
- Battery savings on OLED screens (mobile)
- Professional appearance
- User preference customization

**Implementation Approach:**
- Material-UI theme provider with light/dark themes
- Theme toggle in navigation/settings
- localStorage for preference persistence
- Smooth theme transitions
- Consistent color tokens across components

This is a LOW priority because it's aesthetic, not functional, but adds significant user delight.

---

## ⚠️ Risk Assessment

### Technical Risks:
- [ ] **Breaking Changes**: Color contrast issues in dark mode
- [ ] **Performance Impact**: Low - theme switching is client-side only
- [ ] **Dependencies**: Material-UI theme system, all components

### Business Risks:
- [ ] **User Impact**: Low - optional feature, light mode remains default
- [ ] **Downtime Risk**: None - pure CSS/theme changes
- [ ] **Data Risk**: None

---

## 🔄 Rollback Plan

### Before Starting:
- [ ] Create git tag: `git tag pre-project-47-$(date +%Y%m%d)`
- [ ] Run health tests: https://crm.jaydenmetz.com/health (228/228 baseline)
- [ ] Screenshot all pages in light mode for comparison

### Backup Methods:
**Git Rollback:**
```bash
git reset --hard pre-project-47-$(date +%Y%m%d)
git push --force origin main
```

### If Things Break:
1. **Immediate:** Disable dark mode toggle, force light mode
2. **Revert:** `git revert HEAD && git push`
3. **CSS Issue:** Check Material-UI theme palette definitions

### Recovery Checklist:
- [ ] Light mode still works perfectly
- [ ] No color contrast accessibility violations
- [ ] Theme preference saves correctly
- [ ] Health tests still pass (228/228)

---

## ✅ Tasks

### Planning
- [ ] Review Material-UI theming documentation
- [ ] Audit current color usage (hardcoded colors vs theme tokens)
- [ ] Design dark mode color palette (backgrounds, text, borders, accents)
- [ ] Plan theme toggle UI placement

### Implementation
- [ ] **Create Theme System:**
  - [ ] Create `src/theme/lightTheme.js` with light mode palette
  - [ ] Create `src/theme/darkTheme.js` with dark mode palette
  - [ ] Define color tokens: primary, secondary, background, surface, text, border, success, error, warning, info
  - [ ] Ensure WCAG AA contrast ratios in both themes

- [ ] **Theme Provider Setup:**
  - [ ] Wrap app in Material-UI ThemeProvider
  - [ ] Create ThemeContext for theme state management
  - [ ] Implement theme toggle function
  - [ ] Add theme preference to localStorage (`theme: 'light' | 'dark' | 'system'`)

- [ ] **Component Migration:**
  - [ ] Replace hardcoded colors with theme tokens (`theme.palette.background.default`)
  - [ ] Update Card components (background, borders)
  - [ ] Update Navigation (dark mode optimized)
  - [ ] Update Modals and Dialogs
  - [ ] Update Form inputs (borders, focus states)
  - [ ] Update Tables and Data Grids
  - [ ] Update Stat Cards and Widgets

- [ ] **Theme Toggle UI:**
  - [ ] Add theme toggle button to Navigation (sun/moon icon)
  - [ ] Add theme preference in Settings page (Light / Dark / System)
  - [ ] Add smooth transition animation (color transition 200ms)

- [ ] **System Theme Detection:**
  - [ ] Detect OS theme preference: `window.matchMedia('(prefers-color-scheme: dark)')`
  - [ ] Implement "System" theme option (follows OS)
  - [ ] Listen for OS theme changes and update

### Testing
- [ ] **Visual Testing:**
  - [ ] All pages in light mode (baseline)
  - [ ] All pages in dark mode
  - [ ] All modals in dark mode
  - [ ] All forms in dark mode
  - [ ] All charts/graphs readable in dark mode

- [ ] **Accessibility Testing:**
  - [ ] Color contrast analyzer (WCAG AA minimum)
  - [ ] Test with screen reader (dark mode shouldn't change semantics)

- [ ] **Persistence Testing:**
  - [ ] Set dark mode → refresh → still dark
  - [ ] Set light mode → refresh → still light
  - [ ] Set system mode → change OS theme → app follows

- [ ] Manual testing completed
- [ ] Run success metric test
- [ ] Run health dashboard tests (228/228)

### Documentation
- [ ] Add theme documentation to docs
- [ ] Update CLAUDE.md if new color token patterns established
- [ ] Add implementation notes below

---

## 🧪 Simple Verification Tests

### Test 1: Theme Toggle Test
**Steps:**
1. Open CRM in light mode (default)
2. Click theme toggle button (sun/moon icon)
3. Verify page switches to dark mode
4. Refresh page
5. Verify still in dark mode (localStorage persisted)

**Expected Result:** Theme preference persists across page reloads

**Pass/Fail:** [ ]

### Test 2: Color Contrast Test
**Steps:**
1. Enable dark mode
2. Use Chrome DevTools → Lighthouse → Accessibility
3. Run audit
4. Check for color contrast violations

**Expected Result:** Zero color contrast violations in both light and dark modes

**Pass/Fail:** [ ]

### Test 3: System Theme Test
**Steps:**
1. Set theme preference to "System"
2. Change OS theme (macOS: System Preferences → General → Appearance)
3. Verify CRM follows OS theme immediately
4. Toggle OS theme back and forth

**Expected Result:** CRM theme updates automatically when OS theme changes

**Pass/Fail:** [ ]

---

## 📝 Implementation Notes

### Changes Made:
- [File/component changed and why]

### Issues Encountered:
- [Issue and resolution]

### Decisions Made:
- **Decision:** Use "System" as default theme preference (not light)
  - **Rationale:** Respects user's OS-level preference, modern best practice

---

## 📐 CLAUDE.md Compliance

### Required Patterns:
- [ ] **NO duplicate files** - Edit existing files in place
- [ ] **Component naming**: PascalCase for components
- [ ] **API calls**: Use apiInstance from api.service.js
- [ ] **Responsive grids**: Max 2 columns inside cards/widgets
- [ ] **Archive old code**: Move to `archive/ComponentName_YYYY-MM-DD.jsx`
- [ ] **Git commits**: Include `Co-Authored-By: Claude <noreply@anthropic.com>`

### Project-Specific Rules:
- [ ] **Theme Tokens**: Always use `theme.palette.*` never hardcoded colors
- [ ] **Smooth Transitions**: Add `transition: 'color 0.2s, background-color 0.2s'`
- [ ] **Accessibility**: WCAG AA contrast ratios minimum (4.5:1 for text)
- [ ] **localStorage Key**: Use `appTheme` (consistent with auth patterns)

---

## 🧬 Test Coverage Impact

**Before Project-47:**
- Theme: Light mode only
- Color system: Mix of hardcoded colors and theme tokens

**After Project-47:**
- Themes: Light, Dark, System (3 modes)
- Color system: 100% theme tokens (no hardcoded colors)
- Accessibility: WCAG AA compliant in both modes

**New Test Coverage:**
- Theme toggle functionality
- localStorage persistence
- System theme detection

---

## 🔗 Dependencies

**Depends On:**
- Phase B complete (core UI exists to theme)

**Blocks:**
- None (dark mode is independent feature)

---

## 🎲 Project Selection Criteria

### ✅ Can Start This Project If:
- [ ] Phase B complete (all UI components exist)
- [ ] All 228 health tests passing
- [ ] Have 12 hours available this sprint
- [ ] No higher priority UI bugs

### 🚫 Should Skip/Defer If:
- [ ] Active P0 production issue
- [ ] Higher priority projects available (CRITICAL/HIGH)
- [ ] Less than 12 hours remaining in sprint
- [ ] Design team hasn't approved dark mode palette

### ⏰ Optimal Timing:
- **Best Day**: Any day (low risk, pure CSS)
- **Avoid**: Never - this is always safe to implement
- **Sprint Position**: Mid-sprint (after critical items)

---

## ✅ Success Criteria
- [ ] All tasks completed
- [ ] Theme toggle works in Navigation and Settings
- [ ] Theme preference persists in localStorage
- [ ] System theme detection works
- [ ] All pages render correctly in both light and dark modes
- [ ] Zero color contrast violations (WCAG AA)
- [ ] Smooth theme transitions (200ms)
- [ ] All 228 health tests still pass
- [ ] Code committed and pushed

---

## 📊 Completion Checklist

### Before Moving to Archive:
- [ ] All success criteria met
- [ ] User verified dark mode looks great
- [ ] No regression issues in light mode
- [ ] Clean git commit with descriptive message
- [ ] Project summary written
- [ ] Theme documentation added

### Archive Information:
**Completion Date:** [Date]
**Final Status:** [Success/Partial/Blocked]
**Lessons Learned:** [Dark mode is high delight, low effort - always implement]
**Follow-up Items:** [Monitor for hardcoded colors in new components]
