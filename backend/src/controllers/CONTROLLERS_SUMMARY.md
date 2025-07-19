# Controllers Directory Structure

## Controller Files (11 total)

### Core Entity Controllers
1. **escrows.controller.js** - Escrow management
   - Currently used by escrows route for database endpoints
   - Handles getAllEscrows and getEscrowById

2. **listings.controller.js** - Listing management
   - Not currently used (logic is inline in routes)
   - Full implementation available

3. **clients.controller.js** - Client management
   - Not currently used (logic is inline in routes)
   - Full implementation available

4. **appointments.controller.js** - Appointment management
   - Not currently used (logic is inline in routes)
   - Full implementation available

5. **leads.controller.js** - Lead management
   - Not currently used (logic is inline in routes)
   - Full implementation available (largest controller at 54KB)

### Supporting Controllers
6. **ai.controller.js** - AI agent management
   - Actively used by ai.routes.js
   - Handles agent management, token usage, daily briefings

7. **commissions.controller.js** - Commission tracking
8. **communications.controller.js** - Communication management
9. **expenses.controller.js** - Expense tracking
10. **invoices.controller.js** - Invoice management
11. **webhooks.controller.js** - Webhook handling

## Removed Files (Backed up)
The following duplicate/versioned files were moved to `_backup_controllers/`:
- ai.controller.updated.js
- escrowController.simple.js (renamed to escrows.controller.js)
- escrowController.updated.js
- escrows.controller.js (duplicate implementation)

## Current Implementation Pattern

### Routes Using Controllers:
- ✅ AI routes → ai.controller.js
- ✅ Escrows routes → escrows.controller.js (database endpoints only)

### Routes with Inline Logic:
- ❌ Listings - has controller but not used
- ❌ Clients - has controller but not used
- ❌ Appointments - has controller but not used
- ❌ Leads - has controller but not used

## Recommendations

1. **Consider migrating inline route logic to controllers** for better separation of concerns
2. **All controllers now follow consistent naming convention**: `entity.controller.js`

## File Naming Convention
All controllers now follow the standard pattern:
- ✅ `escrows.controller.js`
- ✅ `listings.controller.js`
- ✅ `clients.controller.js`
- ❌ `escrowController.simple.js`
- ❌ `escrowController.updated.js`