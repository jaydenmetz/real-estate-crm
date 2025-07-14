-- Migration: Disable AI agents by default to prevent API charges
-- Date: 2025-07-14
-- Description: Changes default agent state to disabled and updates existing agents

-- 1. Update existing agents to disabled
UPDATE ai_agents SET enabled = FALSE WHERE enabled = TRUE;

-- 2. Change default value for new agents
ALTER TABLE ai_agents ALTER COLUMN enabled SET DEFAULT FALSE;

-- 3. Add configuration for API access messages
ALTER TABLE ai_agents ADD COLUMN IF NOT EXISTS 
  disabled_message TEXT DEFAULT 'Toggle this agent on to enable Claude API access';

-- 4. Update disabled messages for each agent
UPDATE ai_agents SET disabled_message = CASE 
  WHEN id = 'alex' THEN 'Alex (Executive Assistant) is currently disabled. Toggle Alex on to enable Claude API access for daily briefings, task management, and team coordination.'
  WHEN id = 'sarah' THEN 'Sarah (Buyer Department Manager) is currently disabled. Toggle Sarah on to enable Claude API access for buyer lead management and nurturing.'
  WHEN id = 'mike' THEN 'Mike (Listing Department Manager) is currently disabled. Toggle Mike on to enable Claude API access for listing optimization and marketing.'
  WHEN id = 'david' THEN 'David (Operations Manager) is currently disabled. Toggle David on to enable Claude API access for compliance and transaction coordination.'
  WHEN id = 'buyer_lead_qualifier' THEN 'Buyer Lead Qualifier is currently disabled. Toggle this agent on to enable Claude API access for automated lead qualification.'
  WHEN id = 'buyer_nurture_specialist' THEN 'Buyer Nurture Specialist is currently disabled. Toggle this agent on to enable Claude API access for automated follow-ups.'
  WHEN id = 'listing_launch_specialist' THEN 'Listing Launch Specialist is currently disabled. Toggle this agent on to enable Claude API access for listing preparation.'
  WHEN id = 'listing_marketing_agent' THEN 'Listing Marketing Agent is currently disabled. Toggle this agent on to enable Claude API access for marketing content generation.'
  WHEN id = 'showing_coordinator' THEN 'Showing Coordinator is currently disabled. Toggle this agent on to enable Claude API access for automated showing scheduling.'
  WHEN id = 'transaction_coordinator' THEN 'Transaction Coordinator is currently disabled. Toggle this agent on to enable Claude API access for transaction management.'
  WHEN id = 'market_analyst' THEN 'Market Analyst is currently disabled. Toggle this agent on to enable Claude API access for market analysis and CMAs.'
  WHEN id = 'financial_analyst' THEN 'Financial Analyst is currently disabled. Toggle this agent on to enable Claude API access for commission tracking and financial reports.'
  WHEN id = 'database_specialist' THEN 'Database Specialist is currently disabled. Toggle this agent on to enable Claude API access for contact management.'
  WHEN id = 'compliance_officer' THEN 'Compliance Officer is currently disabled. Toggle this agent on to enable Claude API access for compliance monitoring.'
  ELSE 'This AI agent is currently disabled. Toggle it on to enable Claude API access.'
END;

-- 5. Add token usage warning threshold
ALTER TABLE ai_agents ADD COLUMN IF NOT EXISTS 
  token_warning_threshold INTEGER DEFAULT 100000;

-- 6. Add monthly token limit
ALTER TABLE ai_agents ADD COLUMN IF NOT EXISTS 
  monthly_token_limit INTEGER DEFAULT 500000;

-- 7. Create token usage tracking table
CREATE TABLE IF NOT EXISTS ai_token_usage (
  id SERIAL PRIMARY KEY,
  agent_id VARCHAR(50) REFERENCES ai_agents(id),
  date DATE NOT NULL,
  tokens_used INTEGER DEFAULT 0,
  api_calls INTEGER DEFAULT 0,
  estimated_cost DECIMAL(10,4) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(agent_id, date)
);

-- 8. Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_ai_token_usage_date ON ai_token_usage(date DESC);
CREATE INDEX IF NOT EXISTS idx_ai_agents_enabled ON ai_agents(enabled);

-- 9. Add comment explaining the change
COMMENT ON COLUMN ai_agents.enabled IS 'Controls whether agent can make Claude API calls. Default FALSE to prevent unexpected charges.';