# AI Agents Setup Guide - Cost Control & Management

## Overview

The Real Estate CRM includes 14 AI agents powered by Claude API. **By default, all agents are DISABLED to prevent unexpected API charges.** This guide explains how to manage your AI agents safely.

## Important: Cost Control

### Default State: DISABLED
- All AI agents start in a **disabled state**
- No API calls will be made to Claude/Anthropic
- No charges will occur until you explicitly enable agents
- Each agent shows a clear message when disabled

### API Pricing (as of 2024)
- **Claude 3 Opus**: $15/million input tokens, $75/million output tokens
- **Claude 3 Sonnet**: $3/million input tokens, $15/million output tokens  
- **Claude 3 Haiku**: $0.25/million input tokens, $1.25/million output tokens

## Setup Instructions

### 1. Set Up Your API Key
First, add your Anthropic API key to your environment:

```bash
# In backend/.env
ANTHROPIC_API_KEY=your-anthropic-api-key-here
```

⚠️ **Without this key, agents will use mock responses even when enabled.**

### 2. Initialize Agents (First Time Only)
Run the initialization script to set up all agents as disabled:

```bash
cd backend
npm run init-agents
# or
node src/scripts/initialize-ai-agents.js
```

### 3. Run Database Migration
Apply the migration to set default disabled state:

```bash
npm run migrate
```

## Managing AI Agents

### From the UI (Recommended)

1. Navigate to the **AI Team Dashboard**
2. Each agent shows its current status:
   - 🔴 Red indicator = Disabled (no API charges)
   - 🟢 Green indicator = Enabled (API calls active)
3. Click the toggle switch to enable/disable agents
4. You'll see a confirmation message with cost warnings

### What Happens When Disabled

When an agent is disabled, API calls return:

```json
{
  "success": false,
  "error": "AGENT_DISABLED",
  "message": "Alex (Executive Assistant) is currently disabled. Toggle Alex on to enable Claude API access for daily briefings, task management, and team coordination.",
  "agentId": "alex",
  "agentName": "Alex - Executive Assistant"
}
```

### What Happens When Enabled

When enabled:
1. Agent can make real API calls to Claude
2. Each API call is tracked in the database
3. Token usage and costs are monitored
4. You'll be charged based on Anthropic's pricing

## AI Agent List

### Executive Team
- **Alex** - Executive Assistant (Claude 3 Opus)
  - Daily briefings, task coordination
  - Higher cost, best quality

### Sales Department  
- **Sarah** - Buyer Department Manager (Claude 3 Sonnet)
- **Mike** - Listing Department Manager (Claude 3 Sonnet)
- **Buyer Lead Qualifier** (Claude 3 Haiku)
- **Buyer Nurture Specialist** (Claude 3 Haiku)

### Marketing Department
- **Listing Launch Specialist** (Claude 3 Haiku)
- **Listing Marketing Agent** (Claude 3 Haiku)

### Operations Department
- **David** - Operations Manager (Claude 3 Sonnet)
- **Showing Coordinator** (Claude 3 Haiku)
- **Transaction Coordinator** (Claude 3 Haiku)

### Analytics Department
- **Market Analyst** (Claude 3 Haiku)
- **Financial Analyst** (Claude 3 Haiku)

### Technology Department
- **Database Specialist** (Claude 3 Haiku)

### Legal Department
- **Compliance Officer** (Claude 3 Haiku)

## Token Usage Monitoring

### View Usage in UI
- Go to AI Team Dashboard
- Click "Token Usage" tab
- View by agent, date range, and costs

### Database Queries
```sql
-- Current month usage
SELECT 
  agent_id,
  SUM(tokens_used) as tokens,
  SUM(estimated_cost) as cost
FROM ai_token_usage
WHERE date >= DATE_TRUNC('month', CURRENT_DATE)
GROUP BY agent_id;

-- Check agent limits
SELECT 
  id,
  name,
  enabled,
  tokens_used,
  monthly_token_limit
FROM ai_agents
WHERE tokens_used > token_warning_threshold;
```

## Safety Features

### 1. Token Limits
- Monthly limit: 500,000 tokens per agent (configurable)
- Warning threshold: 400,000 tokens (80%)
- Automatic alerts when approaching limits

### 2. Enable/Disable History
All agent toggles are logged with timestamps

### 3. Cost Tracking
- Real-time cost estimation
- Daily and monthly breakdowns
- Per-agent cost tracking

## Testing Without Charges

### Mock Mode
If `ANTHROPIC_API_KEY` is not set:
- Agents return demo responses
- No API calls are made
- Perfect for development/testing

### Enable Specific Agents Only
Start with one agent (e.g., Alex) to test the integration before enabling others.

## Best Practices

1. **Start Small**: Enable one agent at a time
2. **Monitor Daily**: Check token usage regularly
3. **Set Budgets**: Use monthly limits to control costs
4. **Disable When Not Needed**: Turn off agents during development
5. **Use Appropriate Models**: 
   - Haiku for simple tasks (cheapest)
   - Sonnet for complex reasoning
   - Opus for critical decisions

## Troubleshooting

### Agent Shows as Disabled But I Enabled It
- Check if the database migration ran
- Verify the agent toggle saved properly
- Check browser console for errors

### API Key Not Working
- Ensure `ANTHROPIC_API_KEY` is in backend/.env
- Restart the backend server
- Check the key is valid in Anthropic's console

### High Token Usage
1. Check which agents are enabled
2. Review recent API calls
3. Adjust monthly limits
4. Disable high-usage agents

## Emergency Disable All Agents

Run this SQL command to disable all agents immediately:

```sql
UPDATE ai_agents SET enabled = FALSE;
```

Or use the script:
```bash
node backend/src/scripts/disable-all-agents.js
```

---

Remember: **You're in full control**. No AI agent will make API calls or incur charges unless you explicitly enable it. Start with agents disabled, test with mock data, and enable only what you need.