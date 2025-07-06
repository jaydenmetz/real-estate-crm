-- Add scheduled touches table for nurture campaigns
CREATE TABLE scheduled_touches (
  id SERIAL PRIMARY KEY,
  lead_id VARCHAR(20) REFERENCES leads(id) ON DELETE CASCADE,
  client_id VARCHAR(20) REFERENCES clients(id) ON DELETE CASCADE,
  type VARCHAR(100) NOT NULL,
  template VARCHAR(100),
  scheduled_date TIMESTAMP NOT NULL,
  executed_date TIMESTAMP,
  status VARCHAR(20) DEFAULT 'scheduled',
  content TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT check_entity_reference CHECK (
    (lead_id IS NOT NULL AND client_id IS NULL) OR 
    (lead_id IS NULL AND client_id IS NOT NULL)
  )
);

-- Add indexes
CREATE INDEX idx_scheduled_touches_date ON scheduled_touches(scheduled_date);
CREATE INDEX idx_scheduled_touches_status ON scheduled_touches(status);
CREATE INDEX idx_scheduled_touches_lead ON scheduled_touches(lead_id);
CREATE INDEX idx_scheduled_touches_client ON scheduled_touches(client_id);

-- Add webhook deliveries table
CREATE TABLE webhook_deliveries (
  id SERIAL PRIMARY KEY,
  webhook_id VARCHAR(20) REFERENCES webhooks(id) ON DELETE CASCADE,
  event_type VARCHAR(100) NOT NULL,
  payload JSONB NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  http_status INTEGER,
  response_body TEXT,
  attempted_at TIMESTAMP,
  delivered_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_webhook_deliveries_status ON webhook_deliveries(status);
CREATE INDEX idx_webhook_deliveries_webhook ON webhook_deliveries(webhook_id);

-- Add marketing_plan column to listings
ALTER TABLE listings ADD COLUMN marketing_plan JSONB;

-- Add AI activity tracking improvements
ALTER TABLE ai_activities ADD COLUMN cost_estimate DECIMAL(10,4);
ALTER TABLE ai_activities ADD COLUMN model_used VARCHAR(50);

-- Update AI activities with cost tracking
UPDATE ai_activities SET 
  model_used = 'claude-3-haiku-20240307',
  cost_estimate = tokens_used * 0.00000025
WHERE agent_id LIKE '%agent%';

UPDATE ai_activities SET 
  model_used = 'claude-3-sonnet-20240229',
  cost_estimate = tokens_used * 0.000003
WHERE agent_id LIKE '%manager%';

UPDATE ai_activities SET 
  model_used = 'claude-3-opus-20240229',
  cost_estimate = tokens_used * 0.000015
WHERE agent_id = 'alex_executive';