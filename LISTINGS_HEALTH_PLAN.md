# Listings Health Dashboard Implementation Plan

## Overview
Create a comprehensive health monitoring dashboard for the listings module, mirroring the escrows health dashboard functionality but focused on listing-specific metrics and operations.

## Architecture Components

### 1. Database Schema Requirements

#### Tables to Monitor:
- **listings** (main table)
- **listing_price_history** (price changes tracking)
- **listing_showings** (showing appointments)
- **listing_analytics** (views, inquiries)
- **listing_documents** (photos, disclosures)

#### Key Metrics to Track:
- Total active listings
- Average days on market
- Price reduction frequency
- Showing-to-offer ratio
- Expired/withdrawn rates
- Photo/document compliance

### 2. API Endpoints Structure

#### Main Health Endpoint: `/v1/listings/health`
```javascript
GET /v1/listings/health
GET /v1/listings/health/db
GET /v1/listings/health/auth
GET /v1/listings/health/crud
GET /v1/listings/health/analytics
GET /v1/listings/health/compliance
```

### 3. Health Check Categories

#### A. Database Health
- Connection status
- Query performance
- Table indexes
- Data integrity

#### B. CRUD Operations
- Create test listing
- Read listing details
- Update listing status
- Archive/delete listing
- Price change tracking

#### C. Listing Analytics
- Active listings count
- Average list price
- Days on market distribution
- Price reduction statistics
- Status distribution (Active, Pending, Sold, etc.)

#### D. Compliance Checks
- Required fields completeness
- Photo requirements (min 5 photos)
- MLS compliance fields
- Disclosure documents
- Commission agreements

#### E. Performance Metrics
- API response times
- Database query times
- Bulk operation performance
- Search/filter efficiency

### 4. Frontend Components

#### Dashboard Sections:
1. **System Status Card**
   - Overall health score
   - Quick stats (active, pending, sold)
   - Last sync time

2. **CRUD Operations Test**
   - Run full CRUD cycle
   - Display operation times
   - Show success/failure states

3. **Listing Statistics**
   - Active inventory metrics
   - Price distribution charts
   - Market time analysis
   - Status breakdown pie chart

4. **Compliance Monitor**
   - Missing photos alert
   - Incomplete listings list
   - Expired listings requiring action
   - Document upload status

5. **Performance Metrics**
   - Response time graphs
   - Database query performance
   - API usage statistics

### 5. Implementation Steps

#### Phase 1: Backend API
1. Create `listings-health.routes.js`
2. Implement health check controllers
3. Add analytics queries
4. Create test data generators

#### Phase 2: Frontend Component
1. Create `ListingsHealthDashboard.jsx`
2. Implement data fetching hooks
3. Add visual charts/graphs
4. Create action buttons

#### Phase 3: Integration
1. Add to main navigation
2. Set up auto-refresh
3. Add export functionality
4. Implement alerts/notifications

### 6. Specific Listing Metrics

#### Key Performance Indicators:
```javascript
{
  inventory: {
    total_active: 45,
    new_this_week: 5,
    price_reduced: 8,
    pending: 12,
    sold_this_month: 15
  },
  pricing: {
    avg_list_price: 750000,
    median_list_price: 650000,
    avg_price_per_sqft: 425,
    avg_reduction_percentage: 3.5
  },
  market_time: {
    avg_days_on_market: 35,
    median_dom: 28,
    fastest_sale: 2,
    longest_active: 180
  },
  performance: {
    showing_to_offer_ratio: 0.15,
    list_to_sale_ratio: 0.97,
    expired_rate: 0.05,
    withdrawn_rate: 0.03
  }
}
```

### 7. Test Scenarios

#### Automated Tests:
1. **Create Test Listing**
   - Generate realistic data
   - Validate all fields
   - Check MLS integration

2. **Update Scenarios**
   - Price reduction
   - Status change
   - Add showing
   - Update photos

3. **Search/Filter Tests**
   - By price range
   - By status
   - By location
   - By days on market

4. **Bulk Operations**
   - Import multiple listings
   - Bulk status update
   - Mass price adjustment

### 8. Error Handling

#### Monitor for:
- Invalid price formats
- Missing required fields
- Duplicate MLS numbers
- Expired listing reactivation
- Photo upload failures

### 9. Security Considerations

#### Implement:
- Role-based access (agents see own listings)
- Sensitive data masking
- Audit trail for changes
- API rate limiting
- Data validation

### 10. Visual Design

#### Color Coding:
- Green: Healthy/Active
- Yellow: Warning/Pending
- Red: Critical/Expired
- Blue: Informational
- Purple: Premium/Featured

#### Charts to Include:
- Line graph: Price trends
- Bar chart: Listings by status
- Pie chart: Property type distribution
- Heat map: Geographic distribution
- Timeline: Activity history

## Database Migrations Needed

```sql
-- Create listing analytics table if not exists
CREATE TABLE IF NOT EXISTS listing_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    listing_id UUID REFERENCES listings(id),
    metric_type VARCHAR(50),
    metric_value JSONB,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for performance
CREATE INDEX idx_listing_analytics_listing_id ON listing_analytics(listing_id);
CREATE INDEX idx_listing_analytics_metric_type ON listing_analytics(metric_type);
CREATE INDEX idx_listing_analytics_recorded_at ON listing_analytics(recorded_at);

-- Create listing health metrics view
CREATE OR REPLACE VIEW listing_health_metrics AS
SELECT
    COUNT(*) FILTER (WHERE status = 'Active') as active_count,
    COUNT(*) FILTER (WHERE status = 'Pending') as pending_count,
    COUNT(*) FILTER (WHERE status = 'Sold') as sold_count,
    AVG(price) FILTER (WHERE status = 'Active') as avg_active_price,
    AVG(EXTRACT(epoch FROM (NOW() - listing_date))/86400)::INT as avg_days_on_market
FROM listings
WHERE deleted_at IS NULL;
```

## API Implementation Details

### Health Check Response Format:
```json
{
  "success": true,
  "timestamp": "2024-01-20T10:30:00Z",
  "data": {
    "overall_health": "healthy",
    "score": 95,
    "components": {
      "database": {
        "status": "healthy",
        "latency": 15,
        "connections": 5
      },
      "crud_operations": {
        "create": "passed",
        "read": "passed",
        "update": "passed",
        "delete": "passed",
        "time_ms": 250
      },
      "analytics": {
        "total_listings": 156,
        "active_listings": 45,
        "data_freshness": "current"
      },
      "compliance": {
        "missing_photos": 3,
        "incomplete_listings": 2,
        "expired_needing_action": 5
      }
    }
  }
}
```

## Frontend State Management

```javascript
// Redux slice structure
const listingsHealthSlice = {
  status: 'idle',
  data: {
    overall_health: null,
    metrics: {},
    tests: {},
    lastUpdate: null
  },
  error: null,
  autoRefresh: true,
  refreshInterval: 30000
};
```

## Testing Strategy

### Unit Tests:
- API endpoint responses
- Data transformation functions
- Error handling

### Integration Tests:
- Full CRUD cycle
- Database transactions
- API authentication

### E2E Tests:
- Dashboard load time
- User interactions
- Data export functionality

## Monitoring & Alerts

### Set up alerts for:
- Database connection failures
- Slow query performance (>1s)
- High error rates (>5%)
- Missing required data
- Stale listings (>180 days)

## Performance Targets

- Page load: <2 seconds
- API response: <200ms
- Database queries: <100ms
- Auto-refresh: Every 30 seconds
- Data export: <5 seconds for 1000 records

## Rollout Plan

1. **Week 1**: Backend API development
2. **Week 2**: Frontend component creation
3. **Week 3**: Integration and testing
4. **Week 4**: Performance optimization and deployment

This comprehensive plan ensures the listings health dashboard will provide real-time monitoring, actionable insights, and maintain system integrity for the listings module.