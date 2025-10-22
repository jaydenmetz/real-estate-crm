-- Migration 034: Create test users (jayden, cole)
-- Purpose: Create test accounts for multi-tenant testing
-- Created: October 22, 2025

-- Note: This migration assumes:
-- - Lee Rangel's team (Rangel Realty Group) already exists
-- - Josh Riley's broker already exists
-- - Password hashing will be done via application layer
-- Skip if users already exist

-- This is a placeholder - actual user creation should be done via:
-- POST /api/auth/register with proper password hashing
-- or manual psql INSERT with bcrypt-hashed passwords

-- For now, just add a comment showing what we need:
-- User 1: jayden@jaydenmetz.com (agent, can be toggled to broker_admin)
-- User 2: cole@rangelrealty.com (agent on Lee's team)

-- Actual creation will be done in Phase 2 when we have the auth system
-- ready to properly hash passwords

SELECT 'Test users should be created via auth/register endpoint' AS note;

-- Rollback: No action needed (users not created)
