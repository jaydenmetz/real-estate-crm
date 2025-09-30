# Railway Environment Variables Setup

## Phase 1: JWT Secret Configuration

### Step 1: Access Railway Dashboard
1. Go to https://railway.app
2. Navigate to your `real-estate-crm` project
3. Click on the backend service
4. Go to **Variables** tab

### Step 2: Add Environment Variables

Add these variables (click "+ New Variable" for each):

```bash
# JWT Configuration
JWT_SECRET=e1262903455a3af4daf165b6ec00ad22ed68495bdb5669ecfda97d1ad2989bb1ebf89220c709b0bdbcf2eb67fe7d546718076e0d336b8ea586ab7fd80aeec940

JWT_ACCESS_TOKEN_EXPIRY=15m
JWT_REFRESH_TOKEN_EXPIRY=7d

# Ensure Node environment is set
NODE_ENV=production
```

### Step 3: Redeploy Service

After adding variables:
1. Click **"Deploy"** or wait for auto-deploy
2. Variables will be available on next deployment
3. Check logs for: `✅ Using JWT_SECRET from environment`

---

## Verification

### Test JWT Secret is Being Used

```bash
# Check Railway logs for this message:
# "✅ Using JWT_SECRET from environment"
# NOT: "⚠️  WARNING: Using fallback JWT_SECRET"
```

### Verify Health Tests Still Pass

After deployment:
1. Go to https://crm.jaydenmetz.com/health
2. All tests should still pass (172/184)
3. No new authentication errors

---

## Security Notes

⚠️ **IMPORTANT:**
- **DO NOT commit JWT_SECRET to git**
- Keep this value secure (treat like password)
- If compromised, regenerate and update Railway
- Use different secrets for dev/staging/production

✅ **Current Setup:**
- JWT Secret: 512-bit random hex (secure)
- Access tokens: 15 minutes (short-lived)
- Refresh tokens: 7 days (revocable)
- Old tokens still work during migration

---

## Troubleshooting

### Problem: "Using fallback JWT_SECRET" warning

**Solution:**
1. Check variable is named exactly: `JWT_SECRET`
2. No spaces or quotes around the value
3. Redeploy after adding variable
4. Check Railway dashboard shows variable present

### Problem: Login stops working after deployment

**Likely cause:** Old JWT tokens signed with old secret

**Solution:**
1. Users need to re-login once
2. Or keep old secret temporarily during migration
3. Frontend will auto-refresh using refresh token

### Problem: Health tests fail after adding JWT_SECRET

**This should NOT happen** - we have fallback support

**If it does:**
```bash
# Temporarily remove JWT_SECRET from Railway
# Tests should work again
# Debug auth middleware
```

---

## Rollback Plan

If anything goes wrong:

1. **Remove JWT_SECRET variable** from Railway
2. System will use fallback (hardcoded secret)
3. Everything returns to original state
4. Zero downtime

---

## Next Steps After Setup

Once JWT_SECRET is configured:

✅ Phase 1.2 Complete
- [ ] Phase 1.3: Update auth middleware
- [ ] Phase 1.4: Create RefreshTokenService
- [ ] Phase 1.5: Deploy and test
- [ ] Phase 2: Update login endpoint
- [ ] Phase 3: Update frontend

---

## Generated Secret (For Your Records)

```
JWT_SECRET=e1262903455a3af4daf165b6ec00ad22ed68495bdb5669ecfda97d1ad2989bb1ebf89220c709b0bdbcf2eb67fe7d546718076e0d336b8ea586ab7fd80aeec940
```

**Store this securely** (password manager, Railway only)
