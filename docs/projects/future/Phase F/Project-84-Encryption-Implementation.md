# Project-84: Encryption Implementation

**Phase**: F | **Priority**: CRITICAL | **Status**: Not Started
**Est**: 8 hrs + 2 hrs = 10 hrs | **Deps**: Project-83 complete
**MILESTONE**: Data encryption complete

## 🎯 Goal
Implement comprehensive encryption for data at rest, TLS/HTTPS everywhere, field-level encryption for sensitive data, and secure key management.

## 📋 Current → Target
**Now**: TLS/HTTPS active; password hashing with bcrypt; no field-level encryption
**Target**: Complete encryption implementation with data at rest encryption, field-level encryption for sensitive data (SSN, bank accounts), TLS 1.3, and secure key management
**Success Metric**: All sensitive data encrypted at rest; TLS 1.3 enforced; encryption keys rotated; zero plaintext sensitive data in database

## 📖 Context
Encryption is the last line of defense for data protection. This project implements encryption at rest (PostgreSQL encryption, S3 encryption), field-level encryption for highly sensitive data (SSN, bank account numbers), enforces TLS 1.3 for all connections, and implements secure key management with rotation. Combined with Projects 76-83, this completes the defense-in-depth security architecture.

Key features: Database encryption at rest, field-level encryption with AES-256, TLS 1.3 enforcement, secure key storage (AWS KMS or environment variables), key rotation, and encryption audit logging.

## ⚠️ Risk Assessment

### Technical Risks
- **Key Loss**: Losing encryption keys = permanent data loss
- **Performance Impact**: Encryption adding latency
- **Key Rotation Complexity**: Re-encrypting data during rotation
- **Backup Encryption**: Backups must also be encrypted

### Business Risks
- **Data Breach**: Unencrypted data exposed in breach
- **Compliance Violations**: Unencrypted PII failing GDPR/HIPAA
- **Key Management Issues**: Exposed keys compromising encryption
- **Recovery Failures**: Unable to decrypt data after key loss

## 🔄 Rollback Plan

### Before Starting
```bash
git tag pre-project-84-encryption-$(date +%Y%m%d)
git push origin pre-project-84-encryption-$(date +%Y%m%d)

# CRITICAL: Backup database before implementing encryption
pg_dump $DATABASE_URL > backup-pre-encryption-$(date +%Y%m%d).sql

# Backup encryption keys (store securely offline)
echo "$ENCRYPTION_KEY" > encryption-key-backup-$(date +%Y%m%d).txt
# Store this file in secure offline location!
```

### If Things Break
```bash
# If encryption breaks data access
# Rollback encryption service
git checkout pre-project-84-encryption-YYYYMMDD -- backend/src/services/encryption.service.js
git push origin main

# CRITICAL: Do NOT lose encryption keys!
# If keys lost, data is PERMANENTLY UNRECOVERABLE
```

## ✅ Tasks

### Planning (1.5 hours)
- [ ] Identify sensitive fields requiring encryption (SSN, bank accounts, etc.)
- [ ] Select encryption algorithm (AES-256-GCM)
- [ ] Plan key management strategy (AWS KMS vs environment variables)
- [ ] Design key rotation process
- [ ] Document encryption architecture

### Implementation (6 hours)
- [ ] **Field-Level Encryption** (2.5 hours):
  - [ ] Install crypto library (Node.js crypto module)
  - [ ] Implement AES-256-GCM encryption service
  - [ ] Add encryption for SSN fields
  - [ ] Add encryption for bank account numbers
  - [ ] Add encryption for other sensitive PII
  - [ ] Implement deterministic encryption for searchable fields

- [ ] **Database Encryption at Rest** (1 hour):
  - [ ] Enable PostgreSQL encryption (Railway or self-hosted)
  - [ ] Verify S3 server-side encryption (SSE-S3 or SSE-KMS)
  - [ ] Enable backup encryption

- [ ] **TLS/HTTPS Hardening** (1 hour):
  - [ ] Enforce TLS 1.3 (disable TLS 1.0, 1.1, 1.2)
  - [ ] Configure secure cipher suites
  - [ ] Implement HSTS headers
  - [ ] Enable certificate pinning (optional)

- [ ] **Key Management** (1.5 hours):
  - [ ] Set up AWS KMS (or secure key storage)
  - [ ] Implement key rotation process
  - [ ] Add master key + data encryption keys (DEK) pattern
  - [ ] Implement key versioning
  - [ ] Secure key storage in environment variables

### Testing (1.5 hours)
- [ ] Test field-level encryption/decryption
- [ ] Test encrypted field searches
- [ ] Test TLS 1.3 enforcement
- [ ] Test key rotation process
- [ ] Performance test (encryption overhead)
- [ ] Test backup/restore with encrypted data

### Documentation (1 hour)
- [ ] Document encryption architecture
- [ ] Create key management procedures
- [ ] Add encryption to SECURITY_REFERENCE.md
- [ ] Document key rotation process
- [ ] Create disaster recovery plan (key loss)

## 🧪 Verification Tests

### Test 1: Field-Level Encryption
```bash
# Create client with encrypted SSN
curl -X POST https://api.jaydenmetz.com/v1/clients \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "ssn": "123-45-6789"
  }'
# Expected: 200 OK, client created

# Verify SSN encrypted in database
psql $DATABASE_URL -c "SELECT ssn FROM clients WHERE email = 'john@example.com';"
# Expected: Encrypted string (not plaintext "123-45-6789")
# Example: "enc:v1:Xy9zKm...base64..." (not readable)

# Retrieve client via API (should decrypt)
curl -X GET https://api.jaydenmetz.com/v1/clients/<client_id> \
  -H "Authorization: Bearer $TOKEN"
# Expected: SSN returned as "123-45-6789" (decrypted)
```

### Test 2: TLS 1.3 Enforcement
```bash
# Test TLS version
curl -v --tls-max 1.2 https://api.jaydenmetz.com
# Expected: Connection refused (TLS 1.2 not allowed)

curl -v --tls-max 1.3 https://api.jaydenmetz.com
# Expected: Connection successful (TLS 1.3 allowed)
```

### Test 3: Database Encryption at Rest
```bash
# Check PostgreSQL encryption status (Railway)
# Login to Railway dashboard → PostgreSQL → Settings → Encryption
# Expected: "Encryption at rest: Enabled"

# Check S3 encryption
aws s3api get-bucket-encryption --bucket <bucket-name>
# Expected: ServerSideEncryptionConfiguration with AES256 or aws:kms
```

## 📝 Implementation Notes

### AES-256-GCM Encryption Service
```javascript
const crypto = require('crypto');

class EncryptionService {
  constructor() {
    this.algorithm = 'aes-256-gcm';
    this.keyVersion = 'v1';
    this.masterKey = Buffer.from(process.env.ENCRYPTION_KEY, 'hex'); // 32 bytes
  }

  encrypt(plaintext) {
    // Generate random IV (initialization vector)
    const iv = crypto.randomBytes(16);

    // Create cipher
    const cipher = crypto.createCipheriv(this.algorithm, this.masterKey, iv);

    // Encrypt
    let encrypted = cipher.update(plaintext, 'utf8', 'base64');
    encrypted += cipher.final('base64');

    // Get auth tag (GCM mode)
    const authTag = cipher.getAuthTag().toString('base64');

    // Format: enc:version:iv:authTag:ciphertext
    return `enc:${this.keyVersion}:${iv.toString('base64')}:${authTag}:${encrypted}`;
  }

  decrypt(ciphertext) {
    // Parse encrypted format
    const parts = ciphertext.split(':');
    if (parts[0] !== 'enc' || parts.length !== 5) {
      throw new Error('Invalid encrypted format');
    }

    const [, version, ivBase64, authTagBase64, encrypted] = parts;

    // Check version (for key rotation)
    if (version !== this.keyVersion) {
      throw new Error(`Unsupported encryption version: ${version}`);
    }

    // Decode components
    const iv = Buffer.from(ivBase64, 'base64');
    const authTag = Buffer.from(authTagBase64, 'base64');

    // Create decipher
    const decipher = crypto.createDecipheriv(this.algorithm, this.masterKey, iv);
    decipher.setAuthTag(authTag);

    // Decrypt
    let decrypted = decipher.update(encrypted, 'base64', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  // Deterministic encryption for searchable fields (less secure, but allows equality searches)
  encryptDeterministic(plaintext) {
    // Use HMAC as deterministic encryption (same input → same output)
    const hmac = crypto.createHmac('sha256', this.masterKey);
    hmac.update(plaintext);
    return `det:${this.keyVersion}:${hmac.digest('base64')}`;
  }
}

module.exports = new EncryptionService();
```

### Encrypting Sensitive Fields
```javascript
const encryptionService = require('./encryption.service');

// In client service
async function createClient(clientData) {
  // Encrypt SSN before storing
  if (clientData.ssn) {
    clientData.ssn = encryptionService.encrypt(clientData.ssn);
  }

  // Encrypt bank account
  if (clientData.bank_account) {
    clientData.bank_account = encryptionService.encrypt(clientData.bank_account);
  }

  const client = await db.query(
    'INSERT INTO clients (name, email, ssn, bank_account) VALUES ($1, $2, $3, $4) RETURNING *',
    [clientData.name, clientData.email, clientData.ssn, clientData.bank_account]
  );

  // Decrypt for response
  return decryptClient(client.rows[0]);
}

async function getClient(clientId) {
  const result = await db.query('SELECT * FROM clients WHERE id = $1', [clientId]);
  return decryptClient(result.rows[0]);
}

function decryptClient(client) {
  if (client.ssn && client.ssn.startsWith('enc:')) {
    client.ssn = encryptionService.decrypt(client.ssn);
  }

  if (client.bank_account && client.bank_account.startsWith('enc:')) {
    client.bank_account = encryptionService.decrypt(client.bank_account);
  }

  return client;
}
```

### Database Schema for Encrypted Fields
```sql
-- Encrypted fields must be TEXT (not VARCHAR) to accommodate encrypted length
ALTER TABLE clients ALTER COLUMN ssn TYPE TEXT;
ALTER TABLE clients ALTER COLUMN bank_account TYPE TEXT;

-- Add encryption_version column to track key versions
ALTER TABLE clients ADD COLUMN encryption_version VARCHAR(10) DEFAULT 'v1';
```

### TLS/HTTPS Configuration (Express)
```javascript
const express = require('express');
const https = require('https');
const fs = require('fs');

const app = express();

// HSTS header (force HTTPS)
app.use((req, res, next) => {
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  next();
});

// TLS 1.3 only (if self-hosting)
const tlsOptions = {
  key: fs.readFileSync('server.key'),
  cert: fs.readFileSync('server.crt'),
  minVersion: 'TLSv1.3',
  ciphers: [
    'TLS_AES_128_GCM_SHA256',
    'TLS_AES_256_GCM_SHA384',
    'TLS_CHACHA20_POLY1305_SHA256'
  ].join(':')
};

https.createServer(tlsOptions, app).listen(443);
```

### Key Rotation Process
```javascript
async function rotateEncryptionKey(newKey) {
  const oldEncryptionService = new EncryptionService(process.env.ENCRYPTION_KEY, 'v1');
  const newEncryptionService = new EncryptionService(newKey, 'v2');

  // Get all records with encrypted fields
  const clients = await db.query("SELECT id, ssn, bank_account FROM clients WHERE encryption_version = 'v1'");

  for (const client of clients.rows) {
    // Decrypt with old key
    const ssnDecrypted = client.ssn ? oldEncryptionService.decrypt(client.ssn) : null;
    const bankDecrypted = client.bank_account ? oldEncryptionService.decrypt(client.bank_account) : null;

    // Re-encrypt with new key
    const ssnReencrypted = ssnDecrypted ? newEncryptionService.encrypt(ssnDecrypted) : null;
    const bankReencrypted = bankDecrypted ? newEncryptionService.encrypt(bankDecrypted) : null;

    // Update database
    await db.query(
      "UPDATE clients SET ssn = $1, bank_account = $2, encryption_version = 'v2' WHERE id = $3",
      [ssnReencrypted, bankReencrypted, client.id]
    );
  }

  console.log(`Rotated encryption for ${clients.rows.length} clients`);
}
```

### Generating Encryption Key
```bash
# Generate secure 256-bit encryption key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Output: a1b2c3d4e5f6... (64 hex characters = 32 bytes = 256 bits)

# Add to .env
echo "ENCRYPTION_KEY=<generated-key>" >> .env

# CRITICAL: Backup this key securely offline!
```

### AWS KMS Integration (Optional)
```javascript
const AWS = require('aws-sdk');
const kms = new AWS.KMS({ region: 'us-east-1' });

async function encryptWithKMS(plaintext) {
  const params = {
    KeyId: process.env.AWS_KMS_KEY_ID,
    Plaintext: plaintext
  };

  const result = await kms.encrypt(params).promise();
  return result.CiphertextBlob.toString('base64');
}

async function decryptWithKMS(ciphertext) {
  const params = {
    CiphertextBlob: Buffer.from(ciphertext, 'base64')
  };

  const result = await kms.decrypt(params).promise();
  return result.Plaintext.toString('utf8');
}
```

## 📏 CLAUDE.md Compliance
- [ ] NO Enhanced/Optimized/V2 files
- [ ] Store ENCRYPTION_KEY in .env (NEVER commit to git!)
- [ ] Use existing service patterns
- [ ] Auto-commit and push after completion (excluding .env)

## 🧪 Test Coverage Impact
**After Project-84**:
- Encryption tests: Coverage for encrypt/decrypt operations
- Field-level tests: Verify sensitive fields encrypted in database
- TLS tests: Verify TLS 1.3 enforcement
- Key rotation tests: Verify re-encryption process works

## 🔗 Dependencies

### Depends On
- Project-83 (Session Management Review - session tokens need encryption)

### Blocks
- Project-85 (Compliance Documentation - encryption is compliance requirement)

### Parallel Work
- None (encryption is critical path for compliance)

## 🎯 Project Selection Criteria

### Can Start If:
- ✅ Project-83 complete (session management hardened)
- ✅ Sensitive data identified (SSN, bank accounts, etc.)
- ✅ Encryption key generated and backed up
- ✅ Test environment available for testing

### Should Skip If:
- ❌ No sensitive data stored (unlikely for CRM)
- ❌ Already fully encrypted (rare)

### Optimal Timing:
- After session management (Project-83)
- Before compliance audits (Project-85)
- Before handling real customer PII

## ✅ Success Criteria
- [ ] Field-level encryption implemented (AES-256-GCM)
- [ ] Sensitive fields encrypted in database
- [ ] Database encryption at rest enabled
- [ ] S3 encryption at rest enabled
- [ ] TLS 1.3 enforced
- [ ] HSTS headers configured
- [ ] Encryption keys backed up securely
- [ ] Key rotation process documented
- [ ] Zero plaintext sensitive data in database
- [ ] Documentation complete

## 🚀 Production Deployment Checkpoint

### Pre-Deployment Verification
- [ ] Encryption key generated and backed up (CRITICAL!)
- [ ] Test encryption/decryption on staging
- [ ] Verify TLS 1.3 on staging
- [ ] Test key rotation process on staging
- [ ] Performance test (encryption overhead acceptable)

### Post-Deployment Verification
- [ ] Test field-level encryption on production
- [ ] Verify TLS 1.3 enforced
- [ ] Check database encryption status
- [ ] Monitor encryption errors (<0.1%)
- [ ] Verify backups also encrypted

### Rollback Triggers
- Encryption keys lost (DISASTER - requires restore from backup)
- Encryption/decryption failures (>1%)
- Severe performance degradation (>500ms added latency)
- TLS enforcement breaking API clients

## 🏁 Completion Checklist
- [ ] All tasks complete
- [ ] Field-level encryption implemented
- [ ] Sensitive fields encrypted
- [ ] Database encryption at rest enabled
- [ ] TLS 1.3 enforced
- [ ] HSTS headers configured
- [ ] Encryption keys backed up
- [ ] Key rotation process implemented
- [ ] Zero plaintext sensitive data
- [ ] Documentation complete
- [ ] MILESTONE ACHIEVED: Data encryption complete

---
**Started**: _____ | **Completed**: _____ | **Actual**: _____ hrs
**Blocker**: _____ | **Learning**: _____
