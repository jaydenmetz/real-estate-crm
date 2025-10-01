# Routes Directory Structure

## Main Entity Routes (Your Focus)
These are the primary routes for your core business entities:

1. **escrows.js** - Escrow management endpoints
   - GET/POST/PUT/DELETE for escrows
   - Checklist, timeline, documents, notes endpoints
   - Stats and analytics endpoints

2. **listings.js** - Property listing endpoints
   - GET/POST/PUT/DELETE for listings
   - Status updates, price history
   - Stats and analytics endpoints

3. **clients.js** - Client management endpoints
   - GET/POST/PUT/DELETE for clients
   - Transactions, communications, notes
   - Stats endpoints

4. **appointments.js** - Appointment scheduling endpoints
   - GET/POST/PUT/DELETE for appointments
   - Calendar integration
   - Stats endpoints

5. **leads.js** - Lead management endpoints
   - GET/POST/PUT/DELETE for leads
   - Lead scoring, activities
   - Conversion endpoints

## Supporting Routes

6. **auth.js** - Authentication endpoints
   - Login, logout, token management
   - User profile endpoints

7. **analytics.js** - Analytics and reporting endpoints
   - Dashboard data
   - Various metrics and reports

8. **ai.routes.js** - AI agent endpoints
   - AI team management
   - Agent activities

9. **upload.routes.js** - File upload endpoints
   - Image and document uploads
   - File management

10. **documents.routes.js** - Document management
    - Document storage and retrieval

11. **webhooks.routes.js** - Webhook endpoints
    - External integrations

12. **commissions.routes.js** - Commission tracking
13. **invoices.routes.js** - Invoice management  
14. **expenses.routes.js** - Expense tracking

## Removed Files (Backed up)
The following duplicate files were moved to `_backup_routes/`:
- escrows.routes.js (duplicate of escrows.js)
- escrow.routes.updated.js (partial update)
- listings.routes.js (duplicate of listings.js)
- clients.routes.js (duplicate of clients.js)
- appointments.routes.js (duplicate of appointments.js)
- leads.routes.js (duplicate of leads.js)
- analytics.routes.js (duplicate of analytics.js)
- detailRoutes.js (unused)
- health.routes.js (functionality in app.js)
- communications.routes.js (unused)

## Route Naming Convention
Going forward, use simple names without ".routes" suffix:
- ✅ `escrows.js`
- ❌ `escrows.routes.js`

All routes are mounted under `/v1` prefix in app.js