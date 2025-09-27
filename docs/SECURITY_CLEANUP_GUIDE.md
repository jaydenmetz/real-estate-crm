# Security Cleanup Guide - Final Phase 1 Tasks

## ⚠️ IMPORTANT: Create a backup first!
```bash
cp -r /Users/jaydenmetz/Desktop/real-estate-crm /Users/jaydenmetz/Desktop/real-estate-crm-backup-$(date +%Y%m%d)
```

---

## 1. Remove Credentials from Git History

### Step 1: Install git-filter-repo
```bash
brew install git-filter-repo
```

### Step 2: Identify files with credentials to remove
First, let's check which files need to be removed from history:
```bash
cd /Users/jaydenmetz/Desktop/real-estate-crm

# List files that contain credentials
git log --all --full-history -- "*test-api-auth.sh" "*test-escrow*.sh" "*.env" "*backup*.sh" | head -20
```

### Step 3: Remove files from git history
```bash
# Remove test scripts with embedded credentials
git filter-repo --path backend/test-api-auth.sh --invert-paths --force
git filter-repo --path backend/test-escrow-health-with-testmode.sh --invert-paths --force
git filter-repo --path backend/test-escrow-delete-workflow.sh --invert-paths --force
git filter-repo --path backend/backup-database.sh --invert-paths --force

# Remove any .env files that were accidentally committed
git filter-repo --path-glob '**/.env' --invert-paths --force
git filter-repo --path-glob '**/.env.*' --invert-paths --force
```

### Step 4: Force push cleaned history
⚠️ **WARNING**: This will rewrite git history. Make sure all team members are aware!
```bash
git push --force --all origin
git push --force --tags origin
```

---

## 2. Rotate Database Password in Railway

### Step 1: Generate new secure password
```bash
# Generate a 32-character secure password
openssl rand -base64 32
```
Example output: `K3mP9xQ2vL8nR5tY7wA4zB6jH1sD0gF3`

### Step 2: Update Railway environment variables
1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Select your project
3. Go to Variables tab
4. Update these variables with new values:
   - `DB_PASSWORD`: [your new password]
   - `DATABASE_URL`: Update the password portion in the connection string
   - `JWT_SECRET`: Generate new 64-character secret using:
     ```bash
     openssl rand -hex 32
     ```

### Step 3: Update local .env file
```bash
# Update your local .env with new credentials
# Never commit this file!
```

### Step 4: Verify connection with new password
```bash
# Test connection with new password
PGPASSWORD='your-new-password' psql -h ballast.proxy.rlwy.net -p 20017 -U postgres -d railway -c "SELECT 1;"
```

---

## 3. Invalidate Existing API Keys

### Step 1: Connect to database with NEW password
```bash
PGPASSWORD='your-new-password' psql -h ballast.proxy.rlwy.net -p 20017 -U postgres -d railway
```

### Step 2: Invalidate all existing API keys
```sql
-- View existing API keys first
SELECT
    id,
    key_prefix,
    name,
    is_active,
    created_at,
    user_id
FROM api_keys
ORDER BY created_at DESC;

-- Invalidate all existing API keys
UPDATE api_keys
SET
    is_active = false,
    revoked_at = CURRENT_TIMESTAMP,
    revoked_reason = 'Security rotation - Phase 1 cleanup'
WHERE is_active = true;

-- Verify all keys are revoked
SELECT COUNT(*) as active_keys FROM api_keys WHERE is_active = true;
-- Should return 0

-- Exit psql
\q
```

### Step 3: Generate new API key for testing
```bash
# First, get a JWT token with the new credentials
JWT_TOKEN=$(curl -s -X POST https://api.jaydenmetz.com/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@jaydenmetz.com","password":"AdminPassword123!"}' \
  | grep -o '"token":"[^"]*' | cut -d'"' -f4)

# Create new API key
curl -X POST https://api.jaydenmetz.com/v1/api-keys \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "New Secure API Key", "expiresInDays": 365}'
```

### Step 4: Update CLAUDE.md with security note
Add this note to your CLAUDE.md:
```markdown
## Security Notes
- All API keys rotated on [DATE]
- Git history cleaned of credentials on [DATE]
- Database password last rotated on [DATE]
- Next security rotation scheduled for [DATE + 90 days]
```

---

## Verification Checklist

Run these commands to verify cleanup is complete:

### 1. Check git history is clean
```bash
# Should return no results
git log --all --full-history --grep="ueLIWnvALZWVbRdnOmpLGsrrukeGLGQQ"
git log --all --full-history -- "*.env"
git log --all --full-history -- "*test-api-auth.sh"
```

### 2. Test new database password works
```bash
# Should connect successfully with new password
PGPASSWORD='your-new-password' psql -h ballast.proxy.rlwy.net -p 20017 -U postgres -d railway -c "SELECT version();"
```

### 3. Verify old API keys don't work
```bash
# This should fail with unauthorized
curl https://api.jaydenmetz.com/v1/escrows \
  -H "X-API-Key: [any-old-api-key]"
```

### 4. Test new API key works
```bash
# This should succeed
API_KEY="your-new-api-key" ./backend/test-api-auth-secure.sh
```

---

## Post-Cleanup Actions

1. **Notify team members** about git history rewrite
2. **Document** the security rotation in your project wiki
3. **Schedule** next rotation (90 days recommended)
4. **Monitor** logs for any authentication failures
5. **Update** any CI/CD pipelines with new credentials

---

## Emergency Rollback

If something goes wrong:

1. **Restore from backup**:
   ```bash
   rm -rf /Users/jaydenmetz/Desktop/real-estate-crm
   cp -r /Users/jaydenmetz/Desktop/real-estate-crm-backup-[date] /Users/jaydenmetz/Desktop/real-estate-crm
   cd /Users/jaydenmetz/Desktop/real-estate-crm
   git push --force origin main
   ```

2. **Restore database password** in Railway dashboard to old value

3. **Re-activate old API keys** (if needed temporarily):
   ```sql
   UPDATE api_keys
   SET is_active = true, revoked_at = NULL
   WHERE revoked_reason = 'Security rotation - Phase 1 cleanup';
   ```

---

## Security Best Practices Going Forward

1. **Never commit credentials** - Always use environment variables
2. **Use .env.example** - Document required variables without values
3. **Rotate regularly** - Set calendar reminders for 90-day rotations
4. **Audit access** - Review who has access to production credentials
5. **Use secrets management** - Consider tools like HashiCorp Vault or AWS Secrets Manager
6. **Enable 2FA** - On GitHub, Railway, and all production services
7. **Monitor for leaks** - Use GitHub secret scanning and tools like TruffleHog

---

## Completion Confirmation

After completing all steps, verify with:
```bash
echo "✅ Git history cleaned: $(git log --all --grep='password' | wc -l) password references"
echo "✅ Database accessible: $(PGPASSWORD='new-pass' psql -h ballast.proxy.rlwy.net -p 20017 -U postgres -d railway -c 'SELECT 1' 2>&1 | grep -c '1 row')"
echo "✅ API keys rotated: Check Railway logs for authentication"
echo "✅ Security Phase 1 Complete!"
```