# Project-82: File Upload Security

**Phase**: F | **Priority**: HIGH | **Status**: Not Started
**Est**: 6 hrs + 2 hrs = 8 hrs | **Deps**: Project-76 complete
**MILESTONE**: None

## 🎯 Goal
Implement comprehensive file upload security including file type validation, virus scanning, size limits, and secure storage.

## 📋 Current → Target
**Now**: Basic file uploads for documents; minimal validation; files stored on Railway filesystem
**Target**: Secure file upload system with type validation, virus scanning, size limits, secure storage (S3), and sanitized filenames
**Success Metric**: All file uploads validated; malicious files blocked; virus scanning active; secure storage implemented; zero file upload vulnerabilities

## 📖 Context
File upload vulnerabilities allow attackers to upload malicious files (web shells, malware, executables) that can compromise the server. This project implements defense-in-depth file upload security: file type validation (MIME type + magic bytes), virus scanning with ClamAV, size limits, filename sanitization, and secure storage on S3 (not filesystem).

Key features: File type allowlist (PDF, DOCX, images only), magic byte verification, virus scanning, size limits (10MB per file), filename sanitization, secure S3 storage, and temporary upload directory cleanup.

## ⚠️ Risk Assessment

### Technical Risks
- **False Positives**: Legitimate files flagged as malicious
- **Virus Scanner Downtime**: ClamAV service unavailable
- **Storage Costs**: S3 storage fees increasing
- **Performance Impact**: Virus scanning slowing uploads

### Business Risks
- **Malware Distribution**: Users uploading/downloading malware
- **Server Compromise**: Web shell upload gaining server access
- **Data Breach**: Malicious files accessing sensitive data
- **Legal Liability**: Platform used for malware distribution

## 🔄 Rollback Plan

### Before Starting
```bash
git tag pre-project-82-file-upload-$(date +%Y%m%d)
git push origin pre-project-82-file-upload-$(date +%Y%m%d)

# Backup documents table
pg_dump $DATABASE_URL -t documents > backup-documents-$(date +%Y%m%d).sql
```

### If Things Break
```bash
# If file upload security blocks legitimate files
# Rollback upload middleware
git checkout pre-project-82-file-upload-YYYYMMDD -- backend/src/middleware/upload.middleware.js
git push origin main

# Or temporarily disable virus scanning (emergency only)
# DISABLE_VIRUS_SCAN=true
```

## ✅ Tasks

### Planning (1 hour)
- [ ] Define allowed file types (PDF, DOCX, XLSX, images)
- [ ] Plan virus scanning integration (ClamAV or cloud service)
- [ ] Design S3 storage structure (buckets, paths)
- [ ] Plan file size limits (per file, per user)
- [ ] Document filename sanitization rules

### Implementation (5 hours)
- [ ] **File Validation** (1.5 hours):
  - [ ] Install multer for file uploads
  - [ ] Implement file type validation (MIME type check)
  - [ ] Add magic byte verification (not just extension)
  - [ ] Implement size limit validation (10MB per file)
  - [ ] Add filename sanitization (remove special chars)

- [ ] **Virus Scanning** (1.5 hours):
  - [ ] Install ClamAV or integrate cloud scanner (VirusTotal API)
  - [ ] Implement virus scanning middleware
  - [ ] Add quarantine for suspicious files
  - [ ] Create virus scan reporting

- [ ] **Secure Storage** (1.5 hours):
  - [ ] Set up AWS S3 bucket (or Railway storage)
  - [ ] Install AWS SDK
  - [ ] Implement S3 upload service
  - [ ] Generate signed URLs for downloads
  - [ ] Implement temporary file cleanup

- [ ] **Security Hardening** (0.5 hours):
  - [ ] Disable directory listing
  - [ ] Set restrictive file permissions
  - [ ] Add Content-Disposition header (force download)
  - [ ] Implement file access logging

### Testing (1.5 hours)
- [ ] Test allowed file types (PDF, DOCX, images)
- [ ] Test blocked file types (EXE, BAT, SH, PHP)
- [ ] Test virus scanning (EICAR test file)
- [ ] Test size limit enforcement (upload 11MB file)
- [ ] Test filename sanitization (special characters)
- [ ] Test S3 storage and signed URLs

### Documentation (0.5 hours)
- [ ] Document allowed file types
- [ ] Add file upload security to SECURITY_REFERENCE.md
- [ ] Create file upload best practices guide
- [ ] Document S3 configuration

## 🧪 Verification Tests

### Test 1: File Type Validation
```bash
# Test allowed file type (PDF)
curl -X POST https://api.jaydenmetz.com/v1/documents/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@test-document.pdf" \
  -F "document_type=contract"
# Expected: 200 OK, file uploaded

# Test blocked file type (EXE)
curl -X POST https://api.jaydenmetz.com/v1/documents/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@malware.exe" \
  -F "document_type=contract"
# Expected: 400 Bad Request (file type not allowed)
```

### Test 2: Virus Scanning (EICAR Test)
```bash
# Create EICAR test file (harmless virus test file)
echo 'X5O!P%@AP[4\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*' > eicar.txt

# Upload EICAR file
curl -X POST https://api.jaydenmetz.com/v1/documents/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@eicar.txt" \
  -F "document_type=test"
# Expected: 400 Bad Request (virus detected)
```

### Test 3: File Size Limit
```bash
# Create 11MB file (exceeds 10MB limit)
dd if=/dev/zero of=large-file.pdf bs=1M count=11

# Upload large file
curl -X POST https://api.jaydenmetz.com/v1/documents/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@large-file.pdf" \
  -F "document_type=contract"
# Expected: 413 Payload Too Large (file too large)
```

## 📝 Implementation Notes

### Allowed File Types
```javascript
const allowedMimeTypes = {
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/gif': ['.gif']
};

const blockedExtensions = [
  '.exe', '.bat', '.sh', '.cmd', '.com', // Executables
  '.php', '.jsp', '.asp', '.aspx', // Server scripts
  '.js', '.jar', '.app', '.dmg', // Other executables
  '.zip', '.rar' // Archives (can contain malware)
];
```

### File Upload Middleware (Multer)
```javascript
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

// Temporary storage (before virus scan)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, '/tmp/uploads/');
  },
  filename: (req, file, cb) => {
    const randomName = crypto.randomBytes(16).toString('hex');
    const ext = path.extname(file.originalname);
    cb(null, `${randomName}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 1 // One file per request
  },
  fileFilter: (req, file, cb) => {
    // Check MIME type
    if (!allowedMimeTypes[file.mimetype]) {
      return cb(new Error('File type not allowed'));
    }

    // Check extension
    const ext = path.extname(file.originalname).toLowerCase();
    if (blockedExtensions.includes(ext)) {
      return cb(new Error('File extension blocked'));
    }

    cb(null, true);
  }
});
```

### Magic Byte Verification
```javascript
const fileType = require('file-type');
const fs = require('fs').promises;

async function verifyFileType(filePath, reportedMimeType) {
  // Read file magic bytes
  const buffer = await fs.readFile(filePath);
  const type = await fileType.fromBuffer(buffer);

  if (!type) {
    throw new Error('Unable to determine file type');
  }

  // Verify MIME type matches magic bytes
  if (type.mime !== reportedMimeType) {
    throw new Error(`File type mismatch: claimed ${reportedMimeType}, actual ${type.mime}`);
  }

  return true;
}
```

### Virus Scanning (ClamAV)
```javascript
const NodeClam = require('clamscan');

const clamscan = new NodeClam().init({
  clamdscan: {
    host: 'localhost',
    port: 3310
  }
});

async function scanFile(filePath) {
  const { isInfected, viruses } = await clamscan.isInfected(filePath);

  if (isInfected) {
    // Quarantine file
    await fs.unlink(filePath);
    throw new Error(`Virus detected: ${viruses.join(', ')}`);
  }

  return true;
}
```

### S3 Upload Service
```javascript
const AWS = require('aws-sdk');
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

async function uploadToS3(filePath, fileName) {
  const fileContent = await fs.readFile(filePath);

  const params = {
    Bucket: process.env.S3_BUCKET,
    Key: `documents/${fileName}`,
    Body: fileContent,
    ContentDisposition: 'attachment', // Force download
    ServerSideEncryption: 'AES256' // Encrypt at rest
  };

  const result = await s3.upload(params).promise();
  return result.Location;
}

async function getSignedUrl(fileName, expiresIn = 3600) {
  const params = {
    Bucket: process.env.S3_BUCKET,
    Key: `documents/${fileName}`,
    Expires: expiresIn // URL expires in 1 hour
  };

  return s3.getSignedUrl('getObject', params);
}
```

### Filename Sanitization
```javascript
const sanitize = require('sanitize-filename');

function sanitizeFilename(filename) {
  // Remove path separators
  let safe = filename.replace(/[\/\\]/g, '');

  // Use sanitize-filename library
  safe = sanitize(safe);

  // Replace spaces with underscores
  safe = safe.replace(/\s+/g, '_');

  // Remove multiple dots (keep only extension dot)
  const parts = safe.split('.');
  if (parts.length > 2) {
    const ext = parts.pop();
    safe = parts.join('_') + '.' + ext;
  }

  // Limit length
  if (safe.length > 100) {
    const ext = path.extname(safe);
    const base = path.basename(safe, ext);
    safe = base.substring(0, 100 - ext.length) + ext;
  }

  return safe;
}
```

### Complete Upload Flow
```javascript
router.post('/documents/upload',
  authenticate,
  upload.single('file'),
  async (req, res) => {
    try {
      const { file } = req;

      // 1. Verify file type (magic bytes)
      await verifyFileType(file.path, file.mimetype);

      // 2. Scan for viruses
      await scanFile(file.path);

      // 3. Sanitize filename
      const safeName = sanitizeFilename(file.originalname);

      // 4. Upload to S3
      const s3Url = await uploadToS3(file.path, safeName);

      // 5. Save to database
      const document = await documentsService.create({
        user_id: req.user.id,
        file_name: safeName,
        file_size: file.size,
        mime_type: file.mimetype,
        storage_url: s3Url,
        document_type: req.body.document_type
      });

      // 6. Delete temporary file
      await fs.unlink(file.path);

      res.json({ success: true, document });
    } catch (error) {
      // Clean up temporary file
      if (req.file) {
        await fs.unlink(req.file.path).catch(() => {});
      }
      res.status(400).json({ success: false, error: error.message });
    }
  }
);
```

## 📏 CLAUDE.md Compliance
- [ ] NO Enhanced/Optimized/V2 files
- [ ] Store AWS credentials in .env (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY)
- [ ] Use existing upload patterns
- [ ] Auto-commit and push after completion

## 🧪 Test Coverage Impact
**After Project-82**:
- File upload tests: Coverage for allowed/blocked file types
- Virus scan tests: EICAR test file blocked
- Size limit tests: Large files rejected
- Filename sanitization tests: Special characters removed
- S3 integration tests: Upload and signed URL generation

## 🔗 Dependencies

### Depends On
- Project-76 (Security Audit Complete - file upload is security risk)
- AWS S3 account (or Railway storage)
- ClamAV installed (or VirusTotal API key)

### Blocks
- None (file upload security is independent)

### Parallel Work
- Can work alongside Projects 77-81, 83-84

## 🎯 Project Selection Criteria

### Can Start If:
- ✅ Project-76 complete (security audit done)
- ✅ File uploads already implemented (enhancing security)
- ✅ S3 bucket created (or Railway storage configured)
- ✅ ClamAV available (or cloud scanner API)

### Should Skip If:
- ❌ No file uploads in application
- ❌ Internal-only application (low risk)

### Optimal Timing:
- After security audit (Project-76)
- Before accepting user file uploads
- Before public beta launch

## ✅ Success Criteria
- [ ] File type validation implemented (MIME + magic bytes)
- [ ] Virus scanning active (ClamAV or cloud service)
- [ ] Size limits enforced (10MB per file)
- [ ] Filename sanitization working
- [ ] S3 storage implemented
- [ ] Signed URLs for downloads
- [ ] Temporary file cleanup working
- [ ] EICAR test file blocked
- [ ] Malicious file types blocked (EXE, PHP, etc.)
- [ ] Documentation complete

## 🚀 Production Deployment Checkpoint

### Pre-Deployment Verification
- [ ] S3 bucket created and configured
- [ ] AWS credentials in Railway environment variables
- [ ] ClamAV running (or cloud scanner configured)
- [ ] File upload tested on staging
- [ ] EICAR test blocked on staging

### Post-Deployment Verification
- [ ] Test file upload on production
- [ ] Test virus scanning (EICAR file)
- [ ] Verify S3 uploads working
- [ ] Test signed URL downloads
- [ ] Monitor upload errors (<5%)

### Rollback Triggers
- Virus scanning blocking legitimate files (>10%)
- S3 uploads failing consistently
- File type validation too restrictive
- ClamAV service unavailable

## 🏁 Completion Checklist
- [ ] All tasks complete
- [ ] File type validation implemented
- [ ] Virus scanning active
- [ ] Size limits enforced
- [ ] Filename sanitization working
- [ ] S3 storage implemented
- [ ] Signed URLs working
- [ ] EICAR test blocked
- [ ] Temporary files cleaned up
- [ ] Documentation complete

---
**Started**: _____ | **Completed**: _____ | **Actual**: _____ hrs
**Blocker**: _____ | **Learning**: _____
