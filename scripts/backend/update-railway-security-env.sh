#!/bin/bash

# Update Railway Environment Variables - OWASP 2024 Security Standards
# Run this script to configure production security on Railway

echo "🔒 Updating Railway environment variables for OWASP 2024 security..."
echo ""

# Check if railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Install it first:"
    echo "   npm install -g @railway/cli"
    echo "   railway login"
    exit 1
fi

# JWT Configuration (CRITICAL CHANGES)
echo "📝 Setting JWT configuration..."
railway variables set JWT_EXPIRATION=15m
railway variables set REFRESH_TOKEN_EXPIRATION=7d

# Token Security
echo "📝 Setting token security features..."
railway variables set ENABLE_TOKEN_ROTATION=true
railway variables set ENABLE_THEFT_DETECTION=true
railway variables set ENABLE_DEVICE_FINGERPRINT_CHECK=false
railway variables set ENABLE_IP_ANOMALY_DETECTION=false

# Account Security
echo "📝 Setting account security policies..."
railway variables set MAX_LOGIN_ATTEMPTS=5
railway variables set LOCKOUT_DURATION_MINUTES=30
railway variables set ENABLE_EMAIL_LOGIN_NOTIFICATIONS=true

# Password Policy
echo "📝 Setting password requirements..."
railway variables set MIN_PASSWORD_LENGTH=12
railway variables set REQUIRE_UPPERCASE=true
railway variables set REQUIRE_LOWERCASE=true
railway variables set REQUIRE_NUMBER=true
railway variables set REQUIRE_SPECIAL_CHAR=true

# Cookie Security
echo "📝 Setting cookie security..."
railway variables set COOKIE_SECURE=true
railway variables set COOKIE_HTTPONLY=true
railway variables set COOKIE_SAMESITE=strict
railway variables set COOKIE_MAX_AGE=604800000

# Security Event Logging
echo "📝 Setting security event logging..."
railway variables set ENABLE_SECURITY_EVENT_LOGGING=true
railway variables set LOG_FAILED_LOGIN_ATTEMPTS=true
railway variables set LOG_SUCCESSFUL_LOGINS=true
railway variables set LOG_TOKEN_REFRESH=true
railway variables set LOG_ACCOUNT_LOCKOUTS=true

# Rate Limiting
echo "📝 Setting rate limiting..."
railway variables set RATE_LIMIT_LOGIN_ATTEMPTS=30
railway variables set RATE_LIMIT_LOGIN_WINDOW_MS=900000

echo ""
echo "✅ Environment variables updated successfully!"
echo ""
echo "🚀 Railway will automatically redeploy with new configuration."
echo ""
echo "⏱️  Expected deployment time: 2-3 minutes"
echo ""
echo "📋 Next steps:"
echo "   1. Wait for Railway deployment to complete"
echo "   2. Test login at https://crm.jaydenmetz.com"
echo "   3. Verify token auto-refresh works (wait 15 minutes)"
echo "   4. Test account lockout (5 failed login attempts)"
echo "   5. Check security event logs in database"
echo ""
echo "🔙 Rollback (if needed):"
echo "   railway variables set JWT_EXPIRATION=30d"
echo "   railway variables set ENABLE_TOKEN_ROTATION=false"
echo ""
