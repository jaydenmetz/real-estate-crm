# Project-88: E2E Test Implementation

**Phase**: G | **Priority**: CRITICAL | **Status**: Not Started
**Est**: 12 hrs + 3 hrs = 15 hrs | **Deps**: Project-87 complete
**MILESTONE**: Critical user journeys automated

## 🎯 Goal
Implement end-to-end tests covering critical user journeys using Playwright or Cypress, including visual regression testing and test data management.

## 📋 Current → Target
**Now**: No automated E2E tests; manual testing only; no visual regression testing
**Target**: Critical paths have E2E tests; visual regression testing enabled; automated test data management; tests run in CI/CD
**Success Metric**: 15+ critical user journeys tested; visual regression tests catching UI breaks; E2E tests in CI/CD pipeline

## 📖 Context
End-to-end tests verify complete user workflows from the browser perspective. This project sets up Playwright or Cypress to test critical paths like user registration, escrow creation, dashboard interactions, and multi-module workflows. E2E tests catch integration issues, UI bugs, and workflow problems that unit and integration tests miss.

Key activities: Choose E2E framework, set up test infrastructure, write critical path tests, implement visual regression testing, create test data management, and integrate with CI/CD.

## ⚠️ Risk Assessment

### Technical Risks
- **Test Flakiness**: Browser tests unstable due to timing issues
- **Slow Execution**: E2E tests significantly slower than other tests
- **Environment Issues**: Tests passing locally but failing in CI/CD
- **Maintenance Burden**: UI changes breaking many tests

### Business Risks
- **False Confidence**: Passing E2E tests but bugs in edge cases
- **CI/CD Bottleneck**: Slow tests delaying deployments
- **High Maintenance**: Tests requiring constant updates
- **Coverage Gaps**: Missing critical user scenarios

## 🔄 Rollback Plan

### Before Starting
```bash
git tag pre-project-88-e2e-$(date +%Y%m%d)
git push origin pre-project-88-e2e-$(date +%Y%m%d)

# Backup package files
cp package.json package.json.backup
cp playwright.config.js playwright.config.js.backup 2>/dev/null || true
```

### If Things Break
```bash
# Remove E2E infrastructure
git checkout pre-project-88-e2e-YYYYMMDD -- e2e/ playwright.config.js package.json
npm install
git push origin main
```

## ✅ Tasks

### Planning (2.5 hours)
- [ ] Choose E2E framework (Playwright vs Cypress)
- [ ] Map critical user journeys to test
- [ ] Design page object model structure
- [ ] Plan visual regression testing approach
- [ ] Document test data management strategy

### Implementation (9.5 hours)
- [ ] **E2E Framework Setup** (2 hours):
  - [ ] Install Playwright/Cypress
  - [ ] Configure test runner
  - [ ] Set up browsers (Chromium, Firefox, Safari)
  - [ ] Configure test timeouts and retries
  - [ ] Set up video recording on failure
  - [ ] Configure screenshots

- [ ] **Page Objects** (1.5 hours):
  - [ ] Create LoginPage object
  - [ ] Create DashboardPage object
  - [ ] Create EscrowsPage object
  - [ ] Create ListingsPage object
  - [ ] Create common navigation helpers

- [ ] **Critical Path Tests** (4 hours):
  - [ ] User registration flow
  - [ ] Login/logout flow
  - [ ] Escrow creation workflow
  - [ ] Listing creation workflow
  - [ ] Dashboard interactions
  - [ ] Client management workflow
  - [ ] Appointment scheduling workflow
  - [ ] Search and filter functionality
  - [ ] Document upload workflow
  - [ ] Settings update workflow

- [ ] **Visual Regression** (1.5 hours):
  - [ ] Set up visual regression library
  - [ ] Create baseline screenshots
  - [ ] Add visual tests for key pages
  - [ ] Configure diff thresholds

- [ ] **Test Data Management** (0.5 hours):
  - [ ] Create E2E test database setup
  - [ ] Build test data generators
  - [ ] Implement cleanup scripts

### Testing (2 hours)
- [ ] Run E2E tests locally
- [ ] Test cross-browser compatibility
- [ ] Verify visual regression tests
- [ ] Test CI/CD integration
- [ ] Check test execution time
- [ ] Verify test isolation

### Documentation (1 hour)
- [ ] Document E2E test structure
- [ ] Document running E2E tests
- [ ] Document adding new E2E tests
- [ ] Document page object pattern
- [ ] Add E2E testing to README

## 🧪 Verification Tests

### Test 1: Run E2E Tests
```bash
# Run all E2E tests
npm run test:e2e

# Expected: All critical paths tested successfully
# Videos and screenshots captured on failure
```

### Test 2: Run Specific Test
```bash
# Test escrow creation workflow
npm run test:e2e -- --grep "escrow creation"

# Expected: Complete escrow workflow tested (login → create → verify)
```

### Test 3: Visual Regression Test
```bash
# Update baseline screenshots
npm run test:e2e:update-screenshots

# Run visual regression tests
npm run test:e2e:visual

# Expected: UI changes detected and flagged
```

## 📝 Implementation Notes

### E2E Test Structure (Playwright)
```
e2e/
├── tests/
│   ├── auth/
│   │   ├── registration.spec.js
│   │   └── login.spec.js
│   ├── escrows/
│   │   ├── create-escrow.spec.js
│   │   ├── edit-escrow.spec.js
│   │   └── escrow-workflow.spec.js
│   ├── listings/
│   │   └── create-listing.spec.js
│   ├── dashboard/
│   │   └── dashboard-interactions.spec.js
│   └── visual/
│       ├── homepage.visual.spec.js
│       ├── dashboard.visual.spec.js
│       └── escrows.visual.spec.js
├── pages/
│   ├── LoginPage.js
│   ├── DashboardPage.js
│   ├── EscrowsPage.js
│   └── ListingsPage.js
├── helpers/
│   ├── testData.js
│   ├── auth.js
│   └── database.js
└── playwright.config.js
```

### Page Object Example
```javascript
// pages/LoginPage.js
class LoginPage {
  constructor(page) {
    this.page = page;
    this.emailInput = page.locator('input[name="email"]');
    this.passwordInput = page.locator('input[name="password"]');
    this.loginButton = page.locator('button[type="submit"]');
  }

  async goto() {
    await this.page.goto('https://crm.jaydenmetz.com/login');
  }

  async login(email, password) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
    await this.page.waitForURL('**/dashboard');
  }

  async expectLoginError() {
    await expect(this.page.locator('.error-message')).toBeVisible();
  }
}

module.exports = { LoginPage };
```

### E2E Test Example
```javascript
// tests/escrows/create-escrow.spec.js
const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../../pages/LoginPage');
const { DashboardPage } = require('../../pages/DashboardPage');
const { EscrowsPage } = require('../../pages/EscrowsPage');

test.describe('Escrow Creation Workflow', () => {
  test('should create new escrow from dashboard', async ({ page }) => {
    // Login
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('admin@jaydenmetz.com', 'SecurePassword123!');

    // Navigate to escrows
    const dashboard = new DashboardPage(page);
    await dashboard.navigateToEscrows();

    // Create escrow
    const escrowsPage = new EscrowsPage(page);
    await escrowsPage.clickCreateEscrow();
    await escrowsPage.fillEscrowForm({
      propertyAddress: '123 Test St, Test City, CA 90210',
      closingDate: '2025-12-31',
      purchasePrice: 500000,
      buyerName: 'John Doe',
      sellerName: 'Jane Smith'
    });
    await escrowsPage.submitForm();

    // Verify creation
    await expect(page.locator('.success-message')).toContainText('Escrow created');
    await expect(page.locator('.escrow-card').first()).toContainText('123 Test St');
  });

  test('should validate required fields', async ({ page }) => {
    // Login and navigate
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('admin@jaydenmetz.com', 'SecurePassword123!');

    const dashboard = new DashboardPage(page);
    await dashboard.navigateToEscrows();

    // Try to create without required fields
    const escrowsPage = new EscrowsPage(page);
    await escrowsPage.clickCreateEscrow();
    await escrowsPage.submitForm();

    // Verify validation
    await expect(page.locator('.error-message')).toContainText('required');
  });
});
```

### Playwright Configuration
```javascript
// playwright.config.js
module.exports = {
  testDir: './e2e/tests',
  timeout: 30000,
  retries: 2,
  use: {
    baseURL: process.env.E2E_BASE_URL || 'https://crm.jaydenmetz.com',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
    {
      name: 'firefox',
      use: { browserName: 'firefox' },
    },
    {
      name: 'webkit',
      use: { browserName: 'webkit' },
    },
  ],
};
```

### Critical User Journeys to Test
1. **User Onboarding**: Register → Verify email → Complete profile → Access dashboard
2. **Escrow Lifecycle**: Create escrow → Upload docs → Update status → Close escrow
3. **Listing Management**: Create listing → Add photos → Publish → Mark sold
4. **Client Workflow**: Add client → Assign escrow → Add notes → Schedule appointment
5. **Lead Conversion**: Capture lead → Qualify → Convert to client → Create escrow
6. **Appointment Scheduling**: Create appointment → Send reminder → Mark completed
7. **Dashboard Interactions**: View stats → Filter data → Search → Export
8. **Document Management**: Upload file → Categorize → Download → Delete
9. **User Settings**: Update profile → Change password → Configure notifications
10. **Multi-user Collaboration**: Create escrow → Assign team member → Add comments

### Visual Regression Testing
```javascript
// tests/visual/dashboard.visual.spec.js
const { test, expect } = require('@playwright/test');

test('dashboard matches baseline', async ({ page }) => {
  await page.goto('https://crm.jaydenmetz.com/dashboard');

  // Login first
  await page.fill('input[name="email"]', 'admin@jaydenmetz.com');
  await page.fill('input[name="password"]', 'SecurePassword123!');
  await page.click('button[type="submit"]');

  await page.waitForURL('**/dashboard');

  // Take screenshot and compare
  await expect(page).toHaveScreenshot('dashboard.png', {
    maxDiffPixels: 100
  });
});
```

## 📏 CLAUDE.md Compliance
- [ ] NO Enhanced/Optimized/V2 files
- [ ] E2E tests in /e2e directory
- [ ] Playwright config at root level
- [ ] Auto-commit and push after completion

## 🧪 Test Coverage Impact
**After Project-88**:
- E2E tests: 15+ critical paths automated
- Visual regression: Key pages monitored
- Cross-browser: Tested in Chrome, Firefox, Safari
- Test data: Automated management

## 🔗 Dependencies

### Depends On
- Project-87 (Integration tests provide foundation)
- Frontend deployed and accessible
- Test user accounts created

### Blocks
- Project-95 (Regression suite includes E2E tests)

### Parallel Work
- Can work alongside Project-89 (Performance testing)

## 🎯 Project Selection Criteria

### Can Start If:
- ✅ Project-87 complete
- ✅ Frontend accessible on staging/production
- ✅ Test data available
- ✅ CI/CD pipeline ready for E2E tests

### Should Skip If:
- ❌ No UI (API-only application)
- ❌ Not using automated testing

### Optimal Timing:
- After Project-87 complete
- Before final regression suite (Project-95)

## ✅ Success Criteria
- [ ] E2E framework installed and configured
- [ ] 15+ critical paths have E2E tests
- [ ] Page object model implemented
- [ ] Visual regression tests created
- [ ] Test data management automated
- [ ] Tests run in 3 browsers
- [ ] CI/CD integration working
- [ ] Test execution < 10 minutes
- [ ] Test flakiness < 5%
- [ ] Documentation complete
- [ ] MILESTONE ACHIEVED: Critical user journeys automated

## 🚀 Production Deployment Checkpoint

### Pre-Deployment Verification
- [ ] All E2E tests passing locally
- [ ] Tests passing in CI/CD
- [ ] Visual baselines updated
- [ ] Test data scripts working
- [ ] Browser compatibility verified

### Post-Deployment Verification
- [ ] E2E tests run on every deploy
- [ ] Failures block deployment
- [ ] Test results visible in CI/CD
- [ ] Screenshots/videos captured on failure

### Rollback Triggers
- E2E tests consistently failing (>10% failure rate)
- Test suite taking >20 minutes
- High flakiness (>10% flaky tests)
- CI/CD pipeline blocked by E2E tests

## 🏁 Completion Checklist
- [ ] All tasks complete
- [ ] E2E framework configured
- [ ] Critical paths tested
- [ ] Page objects created
- [ ] Visual regression enabled
- [ ] Test data automated
- [ ] CI/CD integration working
- [ ] Zero blocking flaky tests
- [ ] Documentation updated
- [ ] MILESTONE ACHIEVED: E2E tests operational

---
**Started**: _____ | **Completed**: _____ | **Actual**: _____ hrs
**Blocker**: _____ | **Learning**: _____
