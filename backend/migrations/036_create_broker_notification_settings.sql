-- Migration 036: Create broker_notification_settings table
-- Purpose: Broker preferences for what notifications to receive
-- Created: October 22, 2025

CREATE TABLE broker_notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  broker_id UUID NOT NULL UNIQUE,

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

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_broker_notification_settings_broker ON broker_notification_settings(broker_id);

-- Rollback (if needed):
-- DROP TABLE broker_notification_settings;
