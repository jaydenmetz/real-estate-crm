# Project-24: Documents Module Implementation

**Phase**: B | **Priority**: MEDIUM | **Status**: Not Started
**Est**: 10 hrs + 2 hrs = 12 hrs | **Deps**: Projects 18-22 (Core modules), Project 23 (Contacts)

## 🎯 Goal
Implement document upload, storage, and management system for escrows.

## 📋 Current → Target
**Now**: No document upload/storage functionality
**Target**: Full document management with upload, categorization, escrow association, version control
**Success Metric**: Documents can be uploaded, stored, listed, and downloaded; permissions enforced

## 📖 Context
Real estate transactions require extensive document management: contracts, disclosures, inspection reports, appraisals, title documents, etc. This project implements a document module that allows users to upload files, categorize them, associate them with escrows, and manage permissions. Documents must be securely stored, easily retrievable, and properly organized by transaction.

Key features: file upload (drag-and-drop), file storage (local or S3), document categorization (contract, disclosure, inspection, etc.), escrow association, access permissions (who can view/download), and version control (uploading new version of same document).

## ⚠️ Risk Assessment

### Technical Risks
- **File Storage**: Local storage vs S3 decision
- **Large File Uploads**: Performance with multi-MB PDFs
- **Security**: Unauthorized file access
- **Storage Costs**: S3 costs if cloud storage

### Business Risks
- **Document Loss**: Files not saved properly
- **Privacy Violations**: Wrong person accessing confidential docs
- **Storage Limits**: Running out of disk space

## 🔄 Rollback Plan

### Before Starting
```bash
git tag pre-project-24-documents-$(date +%Y%m%d)
git push origin pre-project-24-documents-$(date +%Y%m%d)

# Backup documents table if exists
pg_dump $DATABASE_URL -t documents > backup-documents-$(date +%Y%m%d).sql
```

### If Things Break
```bash
git checkout pre-project-24-documents-YYYYMMDD -- frontend/src/components/documents
git checkout pre-project-24-documents-YYYYMMDD -- backend/src/controllers/documents.controller.js
git push origin main
```

## ✅ Tasks

### Planning (1.5 hours)
- [ ] Design documents table schema
- [ ] Choose storage strategy (local filesystem or S3)
- [ ] Plan file upload API endpoint
- [ ] Document permission model
- [ ] Plan document categories

### Implementation (6.5 hours)
- [ ] **Database** (1 hour):
  - [ ] Create documents table migration
  - [ ] Add escrow_id foreign key
  - [ ] Add uploaded_by user reference
  - [ ] Add category, file_path, file_size, mime_type columns

- [ ] **Backend API** (3 hours):
  - [ ] Implement POST /v1/documents (upload)
  - [ ] Implement GET /v1/documents/:id (download)
  - [ ] Implement GET /v1/escrows/:id/documents (list for escrow)
  - [ ] Implement DELETE /v1/documents/:id (remove)
  - [ ] Add file validation (size limits, allowed types)
  - [ ] Implement storage logic (save to /uploads or S3)

- [ ] **Frontend UI** (2.5 hours):
  - [ ] Create DocumentsWidget for escrow detail page
  - [ ] Implement drag-and-drop file upload
  - [ ] Add document list display
  - [ ] Add download/delete buttons
  - [ ] Add category dropdown
  - [ ] Show file metadata (size, date, uploader)

### Testing (2 hours)
- [ ] Test file upload (PDF, DOCX, images)
- [ ] Test file download
- [ ] Test permissions (agent can't access other's docs)
- [ ] Test large file handling (10MB+ PDFs)
- [ ] Test delete functionality

### Documentation (0.5 hours)
- [ ] Document upload API
- [ ] Document supported file types
- [ ] Note storage strategy

## 🧪 Verification Tests

### Test 1: Document Upload
```bash
TOKEN="<JWT token>"
ESCROW_ID="<escrow UUID>"

# Upload document
curl -X POST https://api.jaydenmetz.com/v1/documents \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@contract.pdf" \
  -F "escrow_id=$ESCROW_ID" \
  -F "category=contract" \
  -F "name=Purchase Contract"
# Expected: 201, returns document ID and file_path
```

### Test 2: List & Download
```bash
# List documents for escrow
curl -X GET https://api.jaydenmetz.com/v1/escrows/$ESCROW_ID/documents \
  -H "Authorization: Bearer $TOKEN"
# Expected: Array of documents with metadata

# Download document
DOC_ID="<document UUID>"
curl -X GET https://api.jaydenmetz.com/v1/documents/$DOC_ID \
  -H "Authorization: Bearer $TOKEN" \
  -o downloaded-file.pdf
# Expected: File downloads successfully
```

### Test 3: UI Upload Works
```bash
# Visit: https://crm.jaydenmetz.com/escrows/<id>
# Scroll to Documents widget
# Drag PDF file onto upload area
# Select category from dropdown
# Click Upload button
# Verify document appears in list
# Click download icon, verify file downloads
```

## 📝 Implementation Notes

### Documents Table Schema
```sql
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  escrow_id UUID REFERENCES escrows(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size INTEGER, -- bytes
  mime_type VARCHAR(100),
  category VARCHAR(50), -- contract, disclosure, inspection, appraisal, title, other
  uploaded_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);
```

### Document Categories
- `contract` - Purchase agreement
- `disclosure` - Property disclosures
- `inspection` - Inspection reports
- `appraisal` - Appraisal reports
- `title` - Title/escrow documents
- `addendum` - Contract addenda
- `other` - Miscellaneous

### File Storage Strategy
**Option 1: Local Filesystem** (simpler, for MVP)
- Save files to `/backend/uploads/documents/`
- Organize by escrow: `/uploads/documents/{escrow_id}/{filename}`
- Serve via Express static middleware

**Option 2: AWS S3** (production-grade)
- Use AWS SDK to upload to S3 bucket
- Store S3 URL in database
- Use pre-signed URLs for downloads
- Better for scaling, backups, CDN

**Recommendation**: Start with local filesystem, migrate to S3 later

### Allowed File Types
- **Documents**: .pdf, .doc, .docx
- **Images**: .jpg, .jpeg, .png
- **Spreadsheets**: .xls, .xlsx
- **Max Size**: 25MB per file

## 📏 CLAUDE.md Compliance
- [ ] NO Enhanced/Optimized/V2 files
- [ ] Create new DocumentsWidget.jsx (not enhancing existing)
- [ ] Use apiInstance for API calls
- [ ] Follow escrow widget pattern

## 🧪 Test Coverage Impact
**After Project-24**:
- Documents API: Full CRUD coverage
- Upload/download: Tested
- Permissions: Verified

## 🔗 Dependencies

### Depends On
- Projects 18-22 (Core modules, especially escrows)
- Project 23 (Contacts for permission model)

### Blocks
- None

### Parallel Work
- Can work alongside Projects 25-26

## 🎯 Project Selection Criteria

### Can Start If:
- ✅ Escrows module working (Project-18)
- ✅ Contacts implemented (Project-23)
- ✅ Storage strategy decided

### Should Skip If:
- ❌ Escrows module broken
- ❌ No plan for file storage

### Optimal Timing:
- After Project-23 completes
- 1-2 days of work (12 hours)

## ✅ Success Criteria
- [ ] Documents table created
- [ ] File upload API working
- [ ] Files stored successfully (local or S3)
- [ ] DocumentsWidget displays files
- [ ] Download functionality works
- [ ] Permissions enforced (user can only access own team's docs)
- [ ] Supported file types validated
- [ ] Performance acceptable (<5s for 10MB uploads)
- [ ] Documentation complete

## 🏁 Completion Checklist
- [ ] All tasks complete
- [ ] Documents table created
- [ ] Upload/download working
- [ ] UI widget functional
- [ ] Permissions tested
- [ ] Zero console errors
- [ ] Deployed to production
- [ ] Documentation updated

---
**Started**: _____ | **Completed**: _____ | **Actual**: _____ hrs
**Blocker**: _____ | **Learning**: _____
