#!/usr/bin/env node

/**
 * Script to generate secure random keys for environment variables
 * Run: node scripts/generate-secure-keys.js
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Generate secure random key
function generateKey(bytes = 32) {
  return crypto.randomBytes(bytes).toString('hex');
}

// Generate all required keys
const keys = {
  JWT_SECRET: generateKey(32),
  MASTER_API_KEY: generateKey(32),
  EXECUTIVE_API_KEY: generateKey(32),
  BUYER_MANAGER_KEY: generateKey(32),
  LISTING_MANAGER_KEY: generateKey(32),
  OPS_MANAGER_KEY: generateKey(32),

  // AI Agent Keys (prefix with agent_ for clarity)
  BUYER_QUALIFIER_KEY: `agent_buyer_${generateKey(24)}`,
  BUYER_NURTURE_KEY: `agent_nurture_${generateKey(24)}`,
  SHOWING_COORD_KEY: `agent_showing_${generateKey(24)}`,
  LISTING_LAUNCH_KEY: `agent_listing_${generateKey(24)}`,
  MARKET_ANALYST_KEY: `agent_market_${generateKey(24)}`,
  LISTING_MARKETING_KEY: `agent_marketing_${generateKey(24)}`,
  TRANSACTION_COORD_KEY: `agent_transaction_${generateKey(24)}`,
  COMPLIANCE_KEY: `agent_compliance_${generateKey(24)}`,
  FINANCIAL_ANALYST_KEY: `agent_financial_${generateKey(24)}`,
  DATABASE_SPECIALIST_KEY: `agent_database_${generateKey(24)}`,

  // Session keys
  SESSION_SECRET: generateKey(32),
  COOKIE_SECRET: generateKey(32),

  // Encryption keys (for future use)
  ENCRYPTION_KEY: generateKey(32),
  ENCRYPTION_IV: generateKey(16)
};

console.log('🔐 Generated Secure Keys\n');
console.log('Copy these to your .env file or Railway environment variables:\n');
console.log('=' .repeat(80));

for (const [key, value] of Object.entries(keys)) {
  console.log(`${key}=${value}`);
}

console.log('=' .repeat(80));
console.log('\n⚠️  IMPORTANT SECURITY NOTES:');
console.log('1. Never commit these keys to git');
console.log('2. Store them in Railway environment variables for production');
console.log('3. Use .env.vault for secure local development');
console.log('4. Rotate keys regularly (every 90 days recommended)');
console.log('5. Different keys for each environment (dev, staging, prod)');

// Optional: Save to a temporary file (will be deleted after reading)
const tempFile = path.join(__dirname, '..', '.env.generated');
const envContent = Object.entries(keys)
  .map(([key, value]) => `${key}=${value}`)
  .join('\n');

fs.writeFileSync(tempFile, envContent);
console.log(`\n✅ Keys also saved to: ${tempFile}`);
console.log('   (Copy these values then delete this file!)\n');

// Generate Railway CLI commands
console.log('\n🚂 Railway CLI Commands to set these variables:');
console.log('=' .repeat(80));
for (const [key, value] of Object.entries(keys)) {
  console.log(`railway variables set ${key}="${value}"`);
}
console.log('=' .repeat(80));

console.log('\n✨ Done! Remember to delete .env.generated after copying the values.');