# Project-92: Mobile Testing Framework

**Phase**: G | **Priority**: MEDIUM | **Status**: Not Started
**Est**: 8 hrs + 2 hrs = 10 hrs | **Deps**: Project-88 complete
**MILESTONE**: Mobile experience validated

## 🎯 Goal
Implement mobile testing framework to verify responsive design, touch interactions, offline capability, and mobile-specific user flows across iOS and Android devices.

## 📋 Current → Target
**Now**: No mobile testing; manual testing on limited devices only
**Target**: Automated mobile tests; iOS/Android coverage; touch interaction tests; offline capability verified; mobile viewports tested
**Success Metric**: Mobile tests running in CI/CD; iOS Safari and Android Chrome tested; responsive breakpoints validated; touch gestures working

## 📖 Context
Mobile users represent a significant portion of CRM usage. This project creates automated tests for mobile devices, including responsive design validation, touch interaction testing, and offline capability verification. Tests run on real devices/simulators and cover iOS Safari and Android Chrome browsers.

Key activities: Set up mobile test infrastructure, create responsive viewport tests, test touch interactions, verify offline functionality, and validate mobile-specific workflows.

## ⚠️ Risk Assessment

### Technical Risks
- **Device Fragmentation**: Many device/OS combinations to test
- **Simulator Limitations**: Simulators not matching real devices
- **Test Flakiness**: Mobile tests more prone to timing issues
- **Tool Complexity**: Mobile testing tools harder to configure

### Business Risks
- **Poor Mobile UX**: Bugs frustrating mobile users
- **User Churn**: Mobile issues driving users away
- **Competitive Disadvantage**: Better mobile experience from competitors
- **Market Limitation**: Missing mobile users limits growth

## 🔄 Rollback Plan

### Before Starting
```bash
git tag pre-project-92-mobile-$(date +%Y%m%d)
git push origin pre-project-92-mobile-$(date +%Y%m%d)

# Backup mobile test configs
cp mobile-tests/ mobile-tests-backup/ -r 2>/dev/null || true
```

### If Things Break
```bash
# Restore configs
git checkout pre-project-92-mobile-YYYYMMDD -- mobile-tests/
git push origin main
```

## ✅ Tasks

### Planning (2 hours)
- [ ] Define mobile device matrix (iOS/Android versions)
- [ ] Plan responsive breakpoints to test
- [ ] Document mobile-specific user flows
- [ ] Design touch interaction tests
- [ ] Plan offline testing approach

### Implementation (6 hours)
- [ ] **Mobile Test Infrastructure** (1.5 hours):
  - [ ] Configure mobile viewports in Playwright/Cypress
  - [ ] Set up iOS simulator (or BrowserStack)
  - [ ] Set up Android emulator (or BrowserStack)
  - [ ] Configure touch event simulation
  - [ ] Set up network throttling

- [ ] **Responsive Design Tests** (2 hours):
  - [ ] Test mobile viewport (375x667 - iPhone SE)
  - [ ] Test tablet viewport (768x1024 - iPad)
  - [ ] Test large mobile (414x896 - iPhone 11)
  - [ ] Test landscape orientation
  - [ ] Test navigation menu (hamburger)
  - [ ] Test form layouts
  - [ ] Test table responsiveness
  - [ ] Test card layouts

- [ ] **Touch Interaction Tests** (1.5 hours):
  - [ ] Test tap gestures
  - [ ] Test swipe gestures
  - [ ] Test pinch-to-zoom
  - [ ] Test long press
  - [ ] Test scroll behavior
  - [ ] Test dropdown menus
  - [ ] Test modal interactions

- [ ] **Mobile Workflows** (1 hour):
  - [ ] Test mobile login
  - [ ] Test mobile dashboard
  - [ ] Test creating escrow on mobile
  - [ ] Test uploading photos from mobile
  - [ ] Test mobile search/filter
  - [ ] Test mobile navigation

### Testing (1.5 hours)
- [ ] Run mobile tests on iOS simulator
- [ ] Run mobile tests on Android emulator
- [ ] Test on real devices (if available)
- [ ] Verify touch interactions
- [ ] Check offline capability

### Documentation (0.5 hours)
- [ ] Document mobile testing setup
- [ ] Document device matrix
- [ ] Document running mobile tests
- [ ] Add mobile testing to README

## 🧪 Verification Tests

### Test 1: Mobile Viewport Test
```bash
# Run mobile responsive tests
npm run test:mobile:responsive

# Expected: All breakpoints tested, layouts correct
```

### Test 2: iOS Safari Test
```bash
# Run on iOS simulator
npm run test:mobile:ios

# Expected: All mobile workflows working on iOS Safari
```

### Test 3: Android Chrome Test
```bash
# Run on Android emulator
npm run test:mobile:android

# Expected: All mobile workflows working on Android Chrome
```

## 📝 Implementation Notes

### Mobile Test Structure
```
mobile-tests/
├── responsive/
│   ├── mobile-viewport.spec.js
│   ├── tablet-viewport.spec.js
│   ├── landscape.spec.js
│   └── navigation.spec.js
├── touch/
│   ├── tap-gestures.spec.js
│   ├── swipe-gestures.spec.js
│   ├── scroll.spec.js
│   └── long-press.spec.js
├── workflows/
│   ├── mobile-login.spec.js
│   ├── mobile-dashboard.spec.js
│   ├── mobile-escrow.spec.js
│   └── mobile-upload.spec.js
├── offline/
│   └── offline-capability.spec.js
└── devices/
    ├── ios-config.js
    └── android-config.js
```

### Playwright Mobile Configuration
```javascript
// playwright.config.js
module.exports = {
  projects: [
    // Desktop browsers (existing)
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },

    // Mobile devices
    {
      name: 'Mobile Chrome',
      use: {
        browserName: 'chromium',
        ...devices['Pixel 5'],
      },
    },
    {
      name: 'Mobile Safari',
      use: {
        browserName: 'webkit',
        ...devices['iPhone 12'],
      },
    },
    {
      name: 'iPad',
      use: {
        browserName: 'webkit',
        ...devices['iPad Pro'],
      },
    },
  ],
};
```

### Responsive Viewport Test
```javascript
// mobile-tests/responsive/mobile-viewport.spec.js
const { test, expect, devices } = require('@playwright/test');

test.describe('Mobile Responsive Design', () => {
  test('should display mobile navigation on small screens', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('https://crm.jaydenmetz.com/dashboard');

    // Login first
    await page.fill('input[name="email"]', 'admin@jaydenmetz.com');
    await page.fill('input[name="password"]', 'SecurePassword123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');

    // Hamburger menu should be visible on mobile
    const hamburgerMenu = page.locator('[aria-label="menu"]');
    await expect(hamburgerMenu).toBeVisible();

    // Desktop navigation should be hidden
    const desktopNav = page.locator('.desktop-navigation');
    await expect(desktopNav).not.toBeVisible();
  });

  test('should make tables scrollable on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('https://crm.jaydenmetz.com/escrows');

    // Login
    await page.fill('input[name="email"]', 'admin@jaydenmetz.com');
    await page.fill('input[name="password"]', 'SecurePassword123!');
    await page.click('button[type="submit"]');

    // Table should be in scrollable container
    const tableContainer = page.locator('.table-container');
    await expect(tableContainer).toHaveCSS('overflow-x', 'auto');
  });

  test('should stack cards vertically on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('https://crm.jaydenmetz.com/dashboard');

    // Login
    await page.fill('input[name="email"]', 'admin@jaydenmetz.com');
    await page.fill('input[name="password"]', 'SecurePassword123!');
    await page.click('button[type="submit"]');

    // Cards should be full width on mobile
    const cards = page.locator('.stat-card');
    const firstCard = cards.first();

    const boundingBox = await firstCard.boundingBox();
    // Card width should be close to viewport width (minus padding)
    expect(boundingBox.width).toBeGreaterThan(340);
  });
});
```

### Touch Interaction Tests
```javascript
// mobile-tests/touch/tap-gestures.spec.js
const { test, expect, devices } = require('@playwright/test');

test.use({ ...devices['iPhone 12'] });

test.describe('Touch Interactions', () => {
  test('should handle tap on buttons', async ({ page }) => {
    await page.goto('https://crm.jaydenmetz.com/login');

    // Tap email input
    await page.tap('input[name="email"]');
    await page.fill('input[name="email"]', 'admin@jaydenmetz.com');

    // Tap password input
    await page.tap('input[name="password"]');
    await page.fill('input[name="password"]', 'SecurePassword123!');

    // Tap login button
    await page.tap('button[type="submit"]');

    await expect(page).toHaveURL(/dashboard/);
  });

  test('should handle swipe to dismiss modals', async ({ page }) => {
    await page.goto('https://crm.jaydenmetz.com/escrows');

    // Login and open escrow
    await page.tap('input[name="email"]');
    await page.fill('input[name="email"]', 'admin@jaydenmetz.com');
    await page.tap('input[name="password"]');
    await page.fill('input[name="password"]', 'SecurePassword123!');
    await page.tap('button[type="submit"]');

    // Open create escrow modal
    await page.tap('button[aria-label="Create Escrow"]');

    // Wait for modal
    const modal = page.locator('.modal');
    await expect(modal).toBeVisible();

    // Swipe down to dismiss (if implemented)
    // Or tap close button
    await page.tap('[aria-label="Close"]');

    await expect(modal).not.toBeVisible();
  });

  test('should handle scroll on long lists', async ({ page }) => {
    await page.goto('https://crm.jaydenmetz.com/escrows');

    // Login
    await page.tap('input[name="email"]');
    await page.fill('input[name="email"]', 'admin@jaydenmetz.com');
    await page.tap('input[name="password"]');
    await page.fill('input[name="password"]', 'SecurePassword123!');
    await page.tap('button[type="submit"]');

    // Scroll down
    await page.evaluate(() => window.scrollBy(0, 500));

    // Verify scroll worked
    const scrollY = await page.evaluate(() => window.scrollY);
    expect(scrollY).toBeGreaterThan(400);
  });
});
```

### Mobile Workflow Test
```javascript
// mobile-tests/workflows/mobile-escrow.spec.js
const { test, expect, devices } = require('@playwright/test');

test.use({ ...devices['Pixel 5'] });

test.describe('Mobile Escrow Creation', () => {
  test('should create escrow from mobile device', async ({ page }) => {
    await page.goto('https://crm.jaydenmetz.com/login');

    // Mobile login
    await page.tap('input[name="email"]');
    await page.fill('input[name="email"]', 'admin@jaydenmetz.com');
    await page.tap('input[name="password"]');
    await page.fill('input[name="password"]', 'SecurePassword123!');
    await page.tap('button[type="submit"]');

    await expect(page).toHaveURL(/dashboard/);

    // Navigate to escrows (might be in hamburger menu)
    await page.tap('[aria-label="menu"]');
    await page.tap('text=Escrows');

    // Create new escrow
    await page.tap('[aria-label="Create Escrow"]');

    // Fill form (on mobile)
    await page.tap('input[name="property_address"]');
    await page.fill('input[name="property_address"]', '123 Mobile Test St');

    await page.tap('input[name="closing_date"]');
    await page.fill('input[name="closing_date"]', '2025-12-31');

    await page.tap('input[name="purchase_price"]');
    await page.fill('input[name="purchase_price"]', '500000');

    // Submit
    await page.tap('button[type="submit"]');

    // Verify success
    await expect(page.locator('.success-message')).toContainText('created');
  });
});
```

### Offline Capability Test
```javascript
// mobile-tests/offline/offline-capability.spec.js
const { test, expect, devices } = require('@playwright/test');

test.use({ ...devices['iPhone 12'] });

test.describe('Offline Capability', () => {
  test('should show offline indicator when network lost', async ({ page, context }) => {
    await page.goto('https://crm.jaydenmetz.com/dashboard');

    // Login
    await page.fill('input[name="email"]', 'admin@jaydenmetz.com');
    await page.fill('input[name="password"]', 'SecurePassword123!');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/dashboard/);

    // Go offline
    await context.setOffline(true);

    // Try to load data
    await page.click('[aria-label="Refresh"]').catch(() => {});

    // Should show offline message
    const offlineMessage = page.locator('.offline-indicator');
    await expect(offlineMessage).toBeVisible();
    await expect(offlineMessage).toContainText('offline');
  });

  test('should cache data for offline viewing', async ({ page, context }) => {
    await page.goto('https://crm.jaydenmetz.com/dashboard');

    // Login
    await page.fill('input[name="email"]', 'admin@jaydenmetz.com');
    await page.fill('input[name="password"]', 'SecurePassword123!');
    await page.click('button[type="submit"]');

    // Load escrows while online
    await page.click('text=Escrows');
    await page.waitForSelector('.escrow-card');

    const escrowCount = await page.locator('.escrow-card').count();

    // Go offline
    await context.setOffline(true);

    // Reload page
    await page.reload();

    // Data should still be visible (from cache/service worker)
    const cachedEscrowCount = await page.locator('.escrow-card').count();
    expect(cachedEscrowCount).toBeGreaterThan(0);
  });
});
```

### Device Matrix
**iOS Devices**:
- iPhone SE (375x667)
- iPhone 12 (390x844)
- iPhone 12 Pro Max (428x926)
- iPad (810x1080)
- iPad Pro (1024x1366)

**Android Devices**:
- Pixel 5 (393x851)
- Galaxy S21 (360x800)
- Galaxy Tab (800x1280)

**Browsers**:
- iOS Safari
- Android Chrome
- Mobile Firefox (optional)

## 📏 CLAUDE.md Compliance
- [ ] NO Enhanced/Optimized/V2 files
- [ ] Mobile tests in /mobile-tests directory
- [ ] Use Playwright device emulation
- [ ] Auto-commit and push after completion

## 🧪 Test Coverage Impact
**After Project-92**:
- Mobile viewports: All breakpoints tested
- Touch interactions: Comprehensive coverage
- Device matrix: iOS and Android covered
- Offline capability: Verified

## 🔗 Dependencies

### Depends On
- Project-88 (E2E framework provides foundation)
- Responsive design implemented

### Blocks
- None (complements existing tests)

### Parallel Work
- Can work alongside Project-93 (Cross-browser testing)

## 🎯 Project Selection Criteria

### Can Start If:
- ✅ Project-88 complete
- ✅ Responsive design implemented
- ✅ Mobile devices/simulators available
- ✅ CI/CD supports mobile testing

### Should Skip If:
- ❌ Desktop-only application
- ❌ No mobile users expected

### Optimal Timing:
- After Project-88 complete
- After responsive design implemented
- Before production launch

## ✅ Success Criteria
- [ ] Mobile test framework configured
- [ ] iOS tests passing
- [ ] Android tests passing
- [ ] Responsive breakpoints validated
- [ ] Touch interactions tested
- [ ] Offline capability verified
- [ ] Mobile workflows automated
- [ ] CI/CD integration working
- [ ] Documentation complete
- [ ] MILESTONE ACHIEVED: Mobile experience validated

## 🚀 Production Deployment Checkpoint

### Pre-Deployment Verification
- [ ] All mobile tests passing
- [ ] iOS Safari tested
- [ ] Android Chrome tested
- [ ] Touch interactions working
- [ ] Responsive layouts correct

### Post-Deployment Verification
- [ ] Mobile tests run on each deploy
- [ ] Real device testing performed
- [ ] Mobile analytics configured
- [ ] Mobile user feedback monitored

### Rollback Triggers
- Mobile tests consistently failing
- Touch interactions broken
- Responsive layouts broken
- High mobile user complaints

## 🏁 Completion Checklist
- [ ] All tasks complete
- [ ] Mobile framework configured
- [ ] iOS tests implemented
- [ ] Android tests implemented
- [ ] Touch tests working
- [ ] Offline tests passing
- [ ] CI/CD integration working
- [ ] Documentation updated
- [ ] MILESTONE ACHIEVED: Mobile testing complete

---
**Started**: _____ | **Completed**: _____ | **Actual**: _____ hrs
**Blocker**: _____ | **Learning**: _____
