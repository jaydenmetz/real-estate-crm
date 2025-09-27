# Project Structure

## Root Directory
```
real-estate-crm/
├── backend/                 # Node.js/Express API
├── frontend/                # React SPA
├── docs/                   # All documentation
├── scripts/                # Utility and test scripts
├── api-docs/               # API documentation
├── CLAUDE.md              # AI assistant guidelines
├── README.md              # Project overview
├── docker-compose.yml     # Docker configuration
├── railway.json           # Railway deployment config
└── package.json           # Root package config
```

## Backend Structure
```
backend/
├── src/
│   ├── app.js             # Express application
│   ├── controllers/       # Request handlers
│   ├── middleware/        # Authentication, rate limiting
│   ├── routes/           # API endpoints
│   ├── services/         # Business logic
│   └── config/           # Configuration files
├── scripts/              # Operational scripts
│   └── backup.sh        # Database backup
├── migrations/          # Database migrations
└── package.json        # Backend dependencies
```

## Frontend Structure
```
frontend/
├── src/
│   ├── components/
│   │   ├── health/          # Health dashboards (clean)
│   │   │   ├── HealthOverviewDashboard.jsx
│   │   │   ├── EscrowsHealthDashboard.jsx
│   │   │   ├── ListingsHealthDashboard.jsx
│   │   │   ├── ClientsHealthDashboard.jsx
│   │   │   ├── AppointmentsHealthDashboard.jsx
│   │   │   ├── LeadsHealthDashboard.jsx
│   │   │   └── archive/    # Old versions
│   │   ├── dashboards/     # Module dashboards
│   │   ├── details/        # Detail views
│   │   ├── common/         # Shared components
│   │   └── auth/           # Authentication
│   ├── services/           # API services
│   ├── contexts/          # React contexts
│   ├── pages/            # Page components
│   ├── utils/           # Utilities
│   └── App.jsx         # Main app component
├── public/            # Static files
└── package.json      # Frontend dependencies
```

## Documentation (docs/)
- ARCHITECTURE.md - System architecture
- SCALING_GUIDE.md - Scaling strategies
- DATABASE_RELATIONSHIPS.md - DB schema
- API_DOCUMENTATION.md - API reference
- SECURITY_CLEANUP_GUIDE.md - Security best practices
- And more...

## Scripts Organization
```
scripts/
├── testing/          # Test scripts
│   ├── test-api-auth.sh
│   ├── test-all-endpoints.sh
│   └── ...
├── backend/         # Backend utilities
│   ├── create-api-key.sh
│   └── railway-deploy-commands.sh
└── ...             # Other utility scripts
```

## Clean Practices
- ✅ No duplicate files (no file2.jsx, fileEnhanced.jsx)
- ✅ All documentation in /docs
- ✅ All scripts organized by purpose
- ✅ Health dashboards consolidated
- ✅ Clear folder hierarchy
- ✅ Archives in dedicated folders