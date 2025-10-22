# Broker KPI Dashboard Requirements
**Created:** October 22, 2025
**Purpose:** Define broker visibility, agent metrics, and notifications

---

## 🎯 CORE PRINCIPLE

> **"Broker is an agent first, manager second"**
>
> Josh Riley needs:
> - **Brokerage-Wide KPIs** (total production across all agents)
> - **Team-Level KPIs** (production by team within brokerage)
> - **Individual Agent KPIs** (performance metrics per agent)
> - His own PRIVATE lead pipeline (no clutter from 40 agents)
> - Notifications when agents produce (escrows, clients, listings)
> - Clean separation between "My Business" and "Team Business"

---

## 📊 BROKER VISIBILITY HIERARCHY

### **Three Levels of KPIs:**

```
🏢 Brokerage-Wide KPIs (All Agents Combined)
├─ Total Production: 127 escrows ($48.5M volume)
├─ Total Leads: 47,823 across all agents
├─ Total Appointments: 2,134 scheduled
├─ Average Conversion: 2.4%
├─ Average Show Rate: 74.3%
└─ Month-over-Month Growth: +12.5%

👥 Team-Level KPIs (By Team)
├─ Riley Real Estate Team (Josh's team)
│   ├─ Production: 45 escrows ($17.2M)
│   ├─ Agents: 12
│   └─ Avg per Agent: 3.75 escrows
├─ Jayden Metz Realty Group (Jayden's team)
│   ├─ Production: 8 escrows ($3.2M)
│   ├─ Agents: 1
│   └─ Avg per Agent: 8.0 escrows
└─ Rangel Realty Group (Lee's team)
    ├─ Production: 74 escrows ($28.1M)
    ├─ Agents: 15
    └─ Avg per Agent: 4.93 escrows

👤 Individual Agent KPIs (Per Agent)
└─ Jayden Metz: 8 escrows, 1,247 leads (2.3% conversion)
```

---

## 📊 BROKER VISIBILITY MODEL

### **Level 1: Full Visibility (Business Transactions)**
✅ Broker sees ALL details (gets notified)

| Data Type | Broker Access | Notification | Reason |
|-----------|--------------|--------------|---------|
| **Escrows** | Full details | ✅ Real-time | Compliance, production tracking |
| **Clients** | Full details | ✅ Real-time | Database growth, team asset |
| **Listings** | Full details | ✅ Real-time | Inventory management, MLS compliance |

**Example Notification:**
```
🏠 New Escrow Created
Agent: Jayden Metz
Property: 123 Main St, Bakersfield CA
Price: $450,000
Status: Active Under Contract
View Details →
```

---

### **Level 2: Metrics Only (Private Pipeline Data)**
📊 Broker sees COUNTS and METRICS, not individual records

| Data Type | Broker Access | What They See | What They DON'T See |
|-----------|--------------|---------------|---------------------|
| **Leads** | Metrics only | "1,247 total leads, 45 new this month" | Individual lead names/details |
| **Appointments** | Metrics only | "52 scheduled, 38 completed (73%)" | Meeting details, times, locations |

**Example Agent Card (Broker Dashboard):**
```
┌─────────────────────────────────────────┐
│ Jayden Metz - Agent                     │
├─────────────────────────────────────────┤
│ Leads Pipeline                          │
│  • Total: 1,247 leads                   │
│  • New (30d): 45 leads                  │
│  • Conversion: 2.3% (12/523)            │
├─────────────────────────────────────────┤
│ Appointment Activity                    │
│  • Scheduled: 52 appointments           │
│  • Completed: 38 appointments           │
│  • Show Rate: 73%                       │
│  • No-Shows: 14 (27%)                   │
├─────────────────────────────────────────┤
│ Production (YTD)                        │
│  • Escrows: 8 ($3.2M volume)            │
│  • Clients: 23 active                   │
│  • Listings: 5 active                   │
├─────────────────────────────────────────┤
│ Last Activity: 2 hours ago              │
│ [View Full Report] [Message Agent]     │
└─────────────────────────────────────────┘
```

---

### **Level 3: Broker's Own Private Data**
🔒 Broker has SEPARATE pipeline (not mixed with agents)

| Data Type | Josh Riley's Data | Visibility |
|-----------|------------------|------------|
| **Leads** | Josh's paid Zillow leads, referrals | Private (agents can't see) |
| **Appointments** | Josh's personal appointments | Private (agents can't see) |
| **Escrows** | Josh's deals | Public (shows in brokerage totals) |
| **Clients** | Josh's clients | Public (part of brokerage database) |

**Example: Broker's Own Dashboard**
```
My Pipeline (Josh Riley)
├─ My Leads: 87 leads (private)
│   └─ 12 from Zillow ads (paid)
│   └─ 5 from past client referrals
│   └─ 3 from networking events
├─ My Appointments: 12 scheduled this week
│   └─ Mon 10am: Sarah (viewing 456 Oak St)
│   └─ Tue 2pm: Mike (buyer consultation)
├─ My Production (YTD)
│   └─ Escrows: 2 ($850K volume)
│   └─ Clients: 8 active
```

---

## 📈 KEY PERFORMANCE INDICATORS (KPIs)

### **1. Brokerage-Wide KPIs (Overview Dashboard)**

#### Total Production Metrics
```sql
-- Brokerage-wide production summary
SELECT
  COUNT(DISTINCT e.id) AS total_escrows,
  COUNT(DISTINCT CASE WHEN e.escrow_status IN ('Active', 'Pending') THEN e.id END) AS active_escrows,
  COUNT(DISTINCT CASE WHEN e.escrow_status = 'Closed' THEN e.id END) AS closed_escrows,
  COALESCE(SUM(e.purchase_price), 0) AS total_volume,
  COALESCE(SUM(e.my_commission), 0) AS total_commission,

  COUNT(DISTINCT c.id) AS total_clients,
  COUNT(DISTINCT l.id) AS total_listings,

  -- Lead metrics (aggregated across all agents)
  COUNT(DISTINCT leads.id) AS total_leads,
  COUNT(DISTINCT CASE WHEN leads.status = 'converted' THEN leads.id END) AS converted_leads,
  ROUND(
    COUNT(DISTINCT CASE WHEN leads.status = 'converted' THEN leads.id END)::numeric /
    NULLIF(COUNT(DISTINCT leads.id), 0) * 100,
    2
  ) AS avg_conversion_rate,

  -- Appointment metrics (aggregated)
  COUNT(DISTINCT appts.id) AS total_appointments,
  COUNT(DISTINCT CASE WHEN appts.status = 'completed' THEN appts.id END) AS completed_appointments,
  ROUND(
    COUNT(DISTINCT CASE WHEN appts.status = 'completed' THEN appts.id END)::numeric /
    NULLIF(COUNT(DISTINCT appts.id), 0) * 100,
    1
  ) AS avg_show_rate,

  COUNT(DISTINCT u.id) AS total_agents

FROM users u
LEFT JOIN escrows e ON e.user_id = u.id AND e.created_at >= DATE_TRUNC('year', NOW())
LEFT JOIN clients c ON c.user_id = u.id AND c.status = 'active'
LEFT JOIN listings l ON l.user_id = u.id AND l.status = 'active'
LEFT JOIN leads ON leads.user_id = u.id
LEFT JOIN appointments appts ON appts.agent_id = u.id AND appts.start_time >= NOW() - INTERVAL '30 days'

WHERE u.broker_id = 'josh-broker-id'
  AND u.role IN ('agent', 'team_owner', 'broker');
```

**Example Output (Brokerage Overview Card):**
```
Associated Real Estate (Josh Riley's Brokerage)
─────────────────────────────────────────────────
📊 YTD Production
  • 127 escrows ($48.5M volume)
  • $727,500 total commission
  • 45 active escrows in pipeline

👥 Database
  • 342 active clients
  • 67 active listings
  • 47,823 total leads (2.4% conversion)

📅 Activity (30 days)
  • 2,134 appointments scheduled
  • 1,587 completed (74.3% show rate)

👨‍💼 Team Size
  • 28 active agents across 3 teams
```

---

#### Month-over-Month Growth
```sql
-- Compare this month to last month
WITH this_month AS (
  SELECT
    COUNT(e.id) AS escrows_count,
    COALESCE(SUM(e.purchase_price), 0) AS volume
  FROM escrows e
  JOIN users u ON e.user_id = u.id
  WHERE u.broker_id = 'josh-broker-id'
    AND e.created_at >= DATE_TRUNC('month', NOW())
),
last_month AS (
  SELECT
    COUNT(e.id) AS escrows_count,
    COALESCE(SUM(e.purchase_price), 0) AS volume
  FROM escrows e
  JOIN users u ON e.user_id = u.id
  WHERE u.broker_id = 'josh-broker-id'
    AND e.created_at >= DATE_TRUNC('month', NOW() - INTERVAL '1 month')
    AND e.created_at < DATE_TRUNC('month', NOW())
)
SELECT
  tm.escrows_count AS this_month_escrows,
  lm.escrows_count AS last_month_escrows,
  ROUND((tm.escrows_count - lm.escrows_count)::numeric / NULLIF(lm.escrows_count, 0) * 100, 1) AS escrow_growth_pct,

  tm.volume AS this_month_volume,
  lm.volume AS last_month_volume,
  ROUND((tm.volume - lm.volume) / NULLIF(lm.volume, 0) * 100, 1) AS volume_growth_pct
FROM this_month tm, last_month lm;
```

**Example Output (Growth Metrics):**
```
Month-over-Month Growth
─────────────────────────
This Month: 14 escrows ($5.2M)
Last Month: 12 escrows ($4.6M)
Growth: +16.7% escrows, +13.0% volume
```

---

### **2. Team-Level KPIs (By Team Comparison)**

```sql
-- Production by team (for broker with multiple teams)
SELECT
  t.name AS team_name,
  COUNT(DISTINCT u.id) AS agent_count,
  COUNT(DISTINCT e.id) AS total_escrows,
  COALESCE(SUM(e.purchase_price), 0) AS total_volume,
  COALESCE(SUM(e.my_commission), 0) AS total_commission,

  -- Calculate per-agent averages
  ROUND(COUNT(DISTINCT e.id)::numeric / NULLIF(COUNT(DISTINCT u.id), 0), 2) AS escrows_per_agent,
  ROUND(COALESCE(SUM(e.purchase_price), 0) / NULLIF(COUNT(DISTINCT u.id), 0), 0) AS volume_per_agent,

  -- Lead/appointment metrics
  COUNT(DISTINCT leads.id) AS total_leads,
  ROUND(
    COUNT(DISTINCT CASE WHEN leads.status = 'converted' THEN leads.id END)::numeric /
    NULLIF(COUNT(DISTINCT leads.id), 0) * 100,
    2
  ) AS conversion_rate

FROM teams t
LEFT JOIN users u ON u.team_id = t.team_id AND u.role IN ('agent', 'team_owner')
LEFT JOIN escrows e ON e.user_id = u.id AND e.created_at >= DATE_TRUNC('year', NOW())
LEFT JOIN leads ON leads.user_id = u.id

WHERE t.primary_broker_id = 'josh-broker-id'

GROUP BY t.team_id, t.name
ORDER BY total_volume DESC;
```

**Example Output (Team Comparison Table):**
| Team Name | Agents | Escrows | Volume | Avg/Agent | Conversion |
|-----------|--------|---------|---------|-----------|------------|
| Rangel Realty Group | 15 | 74 | $28.1M | $1.87M | 2.8% |
| Riley Real Estate Team | 12 | 45 | $17.2M | $1.43M | 2.1% |
| Jayden Metz Realty Group | 1 | 8 | $3.2M | $3.20M | 2.3% |

**Insights:**
- Jayden's team has highest per-agent production ($3.2M vs $1.87M)
- Rangel Realty has highest total volume ($28.1M)
- Rangel Realty has best conversion rate (2.8%)

---

### **3. Agent-Level KPIs (Individual Performance)**

#### 1. **Lead Metrics**
```sql
-- Total leads by agent
SELECT
  u.first_name || ' ' || u.last_name AS agent_name,
  COUNT(l.id) AS total_leads,
  COUNT(CASE WHEN l.created_at >= NOW() - INTERVAL '30 days' THEN 1 END) AS new_leads_30d,
  COUNT(CASE WHEN l.status = 'converted' THEN 1 END) AS converted_leads,
  ROUND(
    COUNT(CASE WHEN l.status = 'converted' THEN 1 END)::numeric /
    NULLIF(COUNT(l.id), 0) * 100,
    2
  ) AS conversion_rate_pct
FROM users u
LEFT JOIN leads l ON l.user_id = u.id AND l.is_private = FALSE
WHERE u.broker_id = 'josh-broker-id'
  AND u.role = 'agent'
GROUP BY u.id, u.first_name, u.last_name
ORDER BY total_leads DESC;
```

**Output:**
| Agent | Total Leads | New (30d) | Converted | Conversion % |
|-------|-------------|-----------|-----------|--------------|
| Jayden Metz | 1,247 | 45 | 29 | 2.33% |
| Cole Rangel | 823 | 31 | 18 | 2.19% |
| Lee Rangel | 1,502 | 67 | 42 | 2.80% |

---

#### 2. **Appointment Metrics**
```sql
-- Appointment activity and show rate
SELECT
  u.first_name || ' ' || u.last_name AS agent_name,
  COUNT(a.id) AS total_appointments,
  COUNT(CASE WHEN a.status = 'completed' THEN 1 END) AS completed,
  COUNT(CASE WHEN a.status = 'no_show' THEN 1 END) AS no_shows,
  ROUND(
    COUNT(CASE WHEN a.status = 'completed' THEN 1 END)::numeric /
    NULLIF(COUNT(a.id), 0) * 100,
    1
  ) AS show_rate_pct
FROM users u
LEFT JOIN appointments a ON a.agent_id = u.id
WHERE u.broker_id = 'josh-broker-id'
  AND u.role = 'agent'
  AND a.start_time >= NOW() - INTERVAL '30 days'
GROUP BY u.id, u.first_name, u.last_name
ORDER BY total_appointments DESC;
```

**Output:**
| Agent | Scheduled | Completed | No-Shows | Show Rate |
|-------|-----------|-----------|----------|-----------|
| Jayden Metz | 52 | 38 | 14 | 73.1% |
| Cole Rangel | 41 | 33 | 8 | 80.5% |
| Lee Rangel | 78 | 61 | 17 | 78.2% |

---

#### 3. **Production Metrics**
```sql
-- Production by agent (escrows, clients, volume)
SELECT
  u.first_name || ' ' || u.last_name AS agent_name,
  COUNT(DISTINCT e.id) AS total_escrows,
  COUNT(DISTINCT c.id) AS total_clients,
  COUNT(DISTINCT l.id) AS active_listings,
  COALESCE(SUM(e.purchase_price), 0) AS total_volume,
  COALESCE(SUM(e.my_commission), 0) AS total_commission
FROM users u
LEFT JOIN escrows e ON e.user_id = u.id AND e.escrow_status IN ('Active', 'Pending', 'Closed')
LEFT JOIN clients c ON c.user_id = u.id AND c.status = 'active'
LEFT JOIN listings l ON l.user_id = u.id AND l.status = 'active'
WHERE u.broker_id = 'josh-broker-id'
  AND u.role = 'agent'
  AND e.created_at >= DATE_TRUNC('year', NOW()) -- YTD
GROUP BY u.id, u.first_name, u.last_name
ORDER BY total_volume DESC;
```

**Output:**
| Agent | Escrows | Clients | Listings | Volume (YTD) | Commission |
|-------|---------|---------|----------|--------------|------------|
| Jayden Metz | 8 | 23 | 5 | $3,200,000 | $48,000 |
| Lee Rangel | 12 | 34 | 8 | $4,850,000 | $72,750 |
| Cole Rangel | 5 | 15 | 3 | $1,675,000 | $25,125 |

---

#### 4. **Activity Tracking**
```sql
-- Last activity timestamp (most recent action)
SELECT
  u.first_name || ' ' || u.last_name AS agent_name,
  GREATEST(
    u.last_login,
    (SELECT MAX(created_at) FROM leads WHERE user_id = u.id),
    (SELECT MAX(created_at) FROM appointments WHERE agent_id = u.id),
    (SELECT MAX(created_at) FROM escrows WHERE user_id = u.id)
  ) AS last_activity,
  NOW() - GREATEST(...) AS time_since_activity
FROM users u
WHERE u.broker_id = 'josh-broker-id'
  AND u.role = 'agent'
ORDER BY last_activity DESC;
```

**Output:**
| Agent | Last Activity | Time Since |
|-------|--------------|------------|
| Jayden Metz | 2 hours ago | 2h 15m |
| Cole Rangel | 5 hours ago | 5h 42m |
| Lee Rangel | 1 day ago | 1d 3h |

---

## 🔔 NOTIFICATION SYSTEM

### **What Broker Gets Notified About:**

✅ **New Escrow** - Agent creates new transaction
```json
{
  "type": "escrow.created",
  "agent": "Jayden Metz",
  "property": "123 Main St, Bakersfield CA",
  "price": 450000,
  "link": "/escrows/abc-123"
}
```

✅ **New Client** - Agent adds client to database
```json
{
  "type": "client.created",
  "agent": "Cole Rangel",
  "client": "Sarah Johnson",
  "source": "Referral",
  "link": "/clients/xyz-789"
}
```

✅ **New Listing** - Agent lists property
```json
{
  "type": "listing.created",
  "agent": "Lee Rangel",
  "property": "456 Oak Ave, Tehachapi CA",
  "list_price": 575000,
  "link": "/listings/def-456"
}
```

❌ **NOT Notified About:**
- Individual lead created (too many, causes clutter)
- Appointment scheduled (agent's personal calendar)
- Lead status changed (agent's pipeline management)

---

## 🗄️ DATABASE SCHEMA ADDITIONS

### **1. Add KPI Tracking Table**
```sql
-- /backend/migrations/035_create_agent_kpis_table.sql

CREATE TABLE agent_kpis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  broker_id UUID NOT NULL REFERENCES brokers(id) ON DELETE CASCADE,

  -- Time period (monthly snapshots)
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,

  -- Lead metrics
  total_leads INTEGER DEFAULT 0,
  new_leads INTEGER DEFAULT 0,
  converted_leads INTEGER DEFAULT 0,
  conversion_rate NUMERIC(5,2), -- 2.35%

  -- Appointment metrics
  total_appointments INTEGER DEFAULT 0,
  completed_appointments INTEGER DEFAULT 0,
  no_shows INTEGER DEFAULT 0,
  show_rate NUMERIC(5,2), -- 73.5%

  -- Production metrics
  total_escrows INTEGER DEFAULT 0,
  total_clients INTEGER DEFAULT 0,
  active_listings INTEGER DEFAULT 0,
  total_volume NUMERIC(12,2), -- $1,234,567.89
  total_commission NUMERIC(10,2),

  -- Activity tracking
  last_activity TIMESTAMP WITH TIME ZONE,
  days_active INTEGER, -- Days with activity in period

  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, period_start, period_end)
);

CREATE INDEX idx_agent_kpis_user ON agent_kpis(user_id);
CREATE INDEX idx_agent_kpis_broker ON agent_kpis(broker_id);
CREATE INDEX idx_agent_kpis_period ON agent_kpis(period_start, period_end);
```

### **2. Add Broker Notification Settings**
```sql
-- /backend/migrations/036_create_broker_notification_settings.sql

CREATE TABLE broker_notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  broker_id UUID NOT NULL REFERENCES brokers(id) ON DELETE CASCADE,

  -- What to get notified about
  notify_escrow_created BOOLEAN DEFAULT TRUE,
  notify_client_created BOOLEAN DEFAULT TRUE,
  notify_listing_created BOOLEAN DEFAULT TRUE,
  notify_escrow_closed BOOLEAN DEFAULT TRUE,

  -- How to get notified
  email_notifications BOOLEAN DEFAULT TRUE,
  in_app_notifications BOOLEAN DEFAULT TRUE,
  sms_notifications BOOLEAN DEFAULT FALSE,

  -- Thresholds (optional - notify only if above threshold)
  min_escrow_value NUMERIC(12,2), -- Only notify if escrow > $X

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(broker_id)
);
```

---

## 🎨 UI COMPONENTS NEEDED

### **1. Broker Dashboard (New Page)**
```
/broker-dashboard
├─ Brokerage Overview (total volume, active escrows, etc.)
├─ Agent Performance Cards (one per agent)
│   ├─ Lead metrics
│   ├─ Appointment metrics
│   ├─ Production metrics
│   └─ Last activity
├─ Recent Activity Feed (escrows/clients/listings created)
└─ My Pipeline (Josh's private leads/appointments)
```

### **2. Agent Performance Card Component**
```jsx
// /frontend/src/components/broker/AgentPerformanceCard.jsx
<AgentPerformanceCard agent={agent}>
  <MetricRow label="Leads" value={agent.total_leads} delta={agent.new_leads_30d} />
  <MetricRow label="Conversion" value={agent.conversion_rate + '%'} />
  <MetricRow label="Appointments" value={agent.total_appointments} />
  <MetricRow label="Show Rate" value={agent.show_rate + '%'} />
  <MetricRow label="Production" value={formatCurrency(agent.total_volume)} />
  <Button>View Full Report</Button>
</AgentPerformanceCard>
```

### **3. Broker Notification Bell**
```jsx
// /frontend/src/components/broker/BrokerNotifications.jsx
<NotificationBell count={unreadCount}>
  <Notification type="escrow.created">
    🏠 Jayden Metz created new escrow: 123 Main St ($450K)
  </Notification>
  <Notification type="client.created">
    👤 Cole Rangel added client: Sarah Johnson
  </Notification>
  <Notification type="listing.created">
    📋 Lee Rangel listed property: 456 Oak Ave ($575K)
  </Notification>
</NotificationBell>
```

---

## 🔧 API ENDPOINTS NEEDED

### **Broker KPI Endpoints**
```javascript
// Get all agent KPIs for broker
GET /api/broker/agents/kpis
Query: ?period=30d

// Get specific agent detailed report
GET /api/broker/agents/:userId/report
Query: ?startDate=2025-01-01&endDate=2025-10-22

// Get broker notifications
GET /api/broker/notifications
Query: ?unread=true&limit=50

// Mark notification as read
PATCH /api/broker/notifications/:id/read

// Update broker notification settings
PUT /api/broker/notification-settings
Body: { notify_escrow_created: true, min_escrow_value: 100000 }
```

---

## 🚀 IMPLEMENTATION PRIORITY

1. **Week 1 (Database):** Add agent_kpis table, broker_notification_settings
2. **Week 2 (Backend):** Build KPI aggregation service, notification service
3. **Week 3 (Frontend):** Build BrokerDashboard page, AgentPerformanceCard component
4. **Week 4 (Testing):** Test with real Josh Riley account, 40+ agent simulation

---

**END OF BROKER KPI REQUIREMENTS**
