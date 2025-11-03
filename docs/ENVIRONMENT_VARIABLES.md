# Environment Variables Reference

**Last Updated**: November 2, 2025
**Project**: Real Estate CRM
**Environments**: Local Development, Railway Production

---

## 📋 Quick Reference

### Required Variables (Must Set)
| Variable | Location | Purpose |
|----------|----------|---------|
| `DATABASE_URL` | Backend | PostgreSQL connection string |
| `JWT_SECRET` | Backend | Token signing key (64-char hex) |
| `PORT` | Backend | Server port (default: 5050) |
| `FRONTEND_URL` | Backend | CORS allowed origin |
| `REACT_APP_API_URL` | Frontend | Backend API endpoint |
| `REACT_APP_WS_URL` | Frontend | WebSocket endpoint |

### Optional Variables (Features)
| Variable | Location | Purpose |
|----------|----------|---------|
| `REDIS_URL` | Backend | Caching (future use) |
| `SENTRY_DSN` | Backend | Error tracking |
| `REACT_APP_SENTRY_DSN` | Frontend | Frontend error tracking |
| `GOOGLE_CLIENT_ID` | Both | OAuth calendar integration |
| `TWILIO_*` | Backend | SMS notifications |
| `OPENAI_API_KEY` | Backend | AI features |

---

## 🔧 Setup Instructions

### Local Development Setup

**1. Backend Setup:**
```bash
cd backend
cp .env.example .env
# Edit .env and fill in your values
```

**2. Frontend Setup:**
```bash
cd frontend
cp .env.example .env
# Frontend .env is pre-configured for local development (http://localhost:5050)
```

**3. Generate JWT Secret:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
# Copy output to JWT_SECRET in backend/.env
```

**4. Get DATABASE_URL from Railway:**
- Login to Railway dashboard
- Navigate to your project → PostgreSQL
- Copy "DATABASE_URL" from Variables tab
- Paste into backend/.env

---

## 📖 Variable Definitions

### Backend Variables

#### Database Configuration
- **`DATABASE_URL`** (REQUIRED)
  - **Format**: `postgresql://user:password@host:port/database`
  - **Example**: `postgresql://postgres:pass123@localhost:5432/railway`
  - **Railway**: Automatically provided, don't override
  - **Local**: Copy from Railway dashboard for testing with real data

- **`DB_HOST`**, **`DB_PORT`**, **`DB_USER`**, **`DB_PASSWORD`**, **`DB_NAME`**
  - **Status**: Legacy variables, not used if `DATABASE_URL` is set
  - **Keep**: For documentation purposes only

#### JWT Authentication
- **`JWT_SECRET`** (REQUIRED)
  - **Format**: 64-character hexadecimal string
  - **Generate**: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
  - **Security**: NEVER commit this value, rotate every 90 days
  - **Railway**: Set in Railway Variables tab

- **`JWT_ACCESS_TOKEN_EXPIRY`**
  - **Default**: `15m` (15 minutes)
  - **Format**: Time string (e.g., `15m`, `1h`, `7d`)
  - **Recommendation**: Keep short (15-30 minutes) for security

- **`JWT_REFRESH_TOKEN_EXPIRY`**
  - **Default**: `7d` (7 days)
  - **Format**: Time string
  - **Recommendation**: 7-30 days

- **`JWT_REFRESH_TOKEN_EXPIRY_DAYS`**
  - **Default**: `7`
  - **Format**: Number of days
  - **Note**: Duplicate of above, used in some legacy code

#### Server Configuration
- **`PORT`**
  - **Default**: `5050`
  - **Railway**: Automatically set to `$PORT` by Railway
  - **Local**: Use 5050 to match production

- **`NODE_ENV`**
  - **Values**: `development`, `production`, `test`
  - **Railway**: Automatically set to `production`
  - **Local**: Set to `development`

- **`API_VERSION`**
  - **Default**: `v1`
  - **Usage**: API route prefix (`/api/v1/`)

- **`FRONTEND_URL`**
  - **Production**: `https://crm.jaydenmetz.com`
  - **Local**: `http://localhost:3000`
  - **Usage**: CORS configuration

#### Admin Configuration
- **`ADMIN_EMAIL`**
  - **Value**: `admin@jaydenmetz.com`
  - **Usage**: Default admin account creation, security notifications

#### Security Configuration
- **`SECURITY_EVENT_RETENTION_DAYS`**
  - **Default**: `90`
  - **Usage**: How long to keep security audit logs

#### External Services
- **`REDIS_URL`** (OPTIONAL)
  - **Format**: `redis://host:port`
  - **Default**: `redis://localhost:6379`
  - **Status**: Currently not implemented, reserved for future caching

- **`SENTRY_DSN`** (OPTIONAL)
  - **Format**: `https://key@sentry.io/project-id`
  - **Usage**: Backend error tracking
  - **Setup**: Create project at sentry.io

#### Integrations
- **`GOOGLE_CLIENT_ID`**, **`GOOGLE_CLIENT_SECRET`** (OPTIONAL)
  - **Usage**: OAuth calendar integration (Phase C, Project-34)
  - **Setup**: Google Cloud Console → APIs & Services → Credentials

- **`TWILIO_ACCOUNT_SID`**, **`TWILIO_AUTH_TOKEN`**, **`TWILIO_PHONE_NUMBER`** (OPTIONAL)
  - **Usage**: SMS notifications (Phase C, Project-33)
  - **Setup**: twilio.com account

- **`OPENAI_API_KEY`** (OPTIONAL)
  - **Format**: `sk-...`
  - **Usage**: AI features (future phases)
  - **Setup**: platform.openai.com

- **`SKYSLOPE_*`** (OPTIONAL)
  - **Usage**: Document management integration (future)
  - **Setup**: SkySlope API credentials

- **`AWS_*`** (OPTIONAL)
  - **Usage**: File upload storage (Phase B, Project-24)
  - **Setup**: AWS S3 bucket credentials

#### File Uploads
- **`UPLOAD_DIR`**
  - **Default**: `./uploads`
  - **Usage**: Local file storage directory

- **`MAX_FILE_SIZE`**
  - **Default**: `10485760` (10 MB in bytes)
  - **Usage**: Maximum upload file size

#### Testing
- **`TEST_JWT`**, **`TEST_API_KEY`**
  - **Usage**: Automated health check tests
  - **Security**: These are dummy values for testing only

---

### Frontend Variables

#### API Configuration
- **`REACT_APP_API_URL`** (REQUIRED)
  - **Local**: `http://localhost:5050`
  - **Production**: `https://api.jaydenmetz.com`
  - **Railway**: Set in Railway Variables

- **`REACT_APP_BASE_URL`**
  - **Usage**: Alternative API URL reference (legacy)
  - **Note**: Same as `REACT_APP_API_URL`

- **`REACT_APP_WS_URL`** (REQUIRED)
  - **Local**: `ws://localhost:5050`
  - **Production**: `wss://api.jaydenmetz.com`
  - **Usage**: WebSocket real-time connection

#### React Configuration
- **`FAST_REFRESH`**
  - **Default**: `false`
  - **Reason**: Causes Hot Module Reload issues with some components

- **`NODE_ENV`**
  - **Values**: `development`, `production`
  - **Set by**: Create React App automatically

#### Google Services
- **`REACT_APP_GOOGLE_CLIENT_ID`** (OPTIONAL)
  - **Usage**: Google OAuth login/calendar (Phase C)

- **`REACT_APP_GOOGLE_MAPS_API_KEY`** (OPTIONAL)
  - **Usage**: Address autocomplete in forms
  - **APIs needed**: Places API, Maps JavaScript API, Geocoding API

#### Error Tracking
- **`REACT_APP_SENTRY_DSN`** (OPTIONAL)
  - **Usage**: Frontend error tracking
  - **Setup**: Separate Sentry project for frontend

- **`REACT_APP_SENTRY_FORCE`** (OPTIONAL)
  - **Default**: `false`
  - **Usage**: Force Sentry in development (for testing)

---

## 🚀 Railway Production Setup

### Automatic Variables (Set by Railway)
Railway automatically provides these:
- `PORT` - Dynamic port assignment
- `DATABASE_URL` - PostgreSQL connection string
- `NODE_ENV` - Set to `production`

### Required Manual Configuration
Set these in Railway Variables tab:

**Backend:**
```bash
JWT_SECRET=<your-64-char-hex-string>
FRONTEND_URL=https://crm.jaydenmetz.com
ADMIN_EMAIL=admin@jaydenmetz.com
SECURITY_EVENT_RETENTION_DAYS=90
```

**Frontend:**
```bash
REACT_APP_API_URL=https://api.jaydenmetz.com
REACT_APP_WS_URL=wss://api.jaydenmetz.com
REACT_APP_BASE_URL=https://api.jaydenmetz.com
```

### Optional (Add as Needed)
```bash
# Error Tracking
SENTRY_DSN=<backend-sentry-dsn>
REACT_APP_SENTRY_DSN=<frontend-sentry-dsn>

# Google Services
GOOGLE_CLIENT_ID=<google-client-id>
GOOGLE_CLIENT_SECRET=<google-secret>
REACT_APP_GOOGLE_CLIENT_ID=<google-client-id>
REACT_APP_GOOGLE_MAPS_API_KEY=<maps-api-key>

# Future: Twilio, OpenAI, AWS, etc.
```

---

## 🔒 Security Best Practices

### Never Commit These Files:
- ❌ `.env` (contains real secrets)
- ❌ `.env.local`
- ❌ `.env.production` (if it has real values)
- ✅ `.env.example` (safe template with placeholders)

### Verify .gitignore:
```bash
# Check these are in .gitignore
cat .gitignore | grep ".env"
```

Should show:
```
.env
.env.local
.env.*.local
```

### Rotate Secrets Regularly:
- **JWT_SECRET**: Every 90 days (invalidates all tokens)
- **API Keys**: When team members leave
- **Database passwords**: Every 6 months

---

## 🧪 Verification

### Test Backend Loads Variables:
```bash
cd backend
node -e "require('dotenv').config(); console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'SET ✅' : 'MISSING ❌'); console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'SET ✅' : 'MISSING ❌');"
```

### Test Frontend Loads Variables:
```bash
cd frontend
npm start
# Check browser console for REACT_APP_API_URL
```

### Test Production:
```bash
# Check Railway logs for successful startup
railway logs

# Test health endpoint
curl https://api.jaydenmetz.com/v1/health
```

---

## 📚 Related Documentation

- **Setup Guide**: [docs/archive/setup-guides/RAILWAY_ENVIRONMENT_SETUP.md](archive/setup-guides/RAILWAY_ENVIRONMENT_SETUP.md)
- **Security**: [SECURITY_REFERENCE.md](SECURITY_REFERENCE.md)
- **API Reference**: [API_REFERENCE.md](API_REFERENCE.md)
- **Database**: [DATABASE_STRUCTURE.md](DATABASE_STRUCTURE.md)

---

## 🆘 Troubleshooting

### "Cannot connect to database"
- Check `DATABASE_URL` is set correctly
- Verify Railway PostgreSQL is running
- Test connection: `psql $DATABASE_URL -c "SELECT 1;"`

### "JWT secret not configured"
- Check `JWT_SECRET` exists in .env
- Verify it's at least 32 characters
- Regenerate if needed (will logout all users)

### "CORS error" in frontend
- Check `FRONTEND_URL` in backend matches frontend domain
- Verify `REACT_APP_API_URL` in frontend points to correct backend

### Railway deployment fails
- Check all required variables set in Railway Variables tab
- View Railway logs for specific error message
- Verify no typos in variable names

---

**Last Reviewed**: November 2, 2025 (Project-01)
**Next Review**: After Phase C (when integrations added)
