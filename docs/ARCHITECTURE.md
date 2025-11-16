# 🏗️ Real Estate CRM - System Architecture

**NOTE (November 2025):** This project has migrated to **Domain-Driven Design (DDD)** architecture. For current structure and patterns, see [DDD_STRUCTURE.md](DDD_STRUCTURE.md). This file remains for historical reference and general architectural principles.

---

## 📐 Architecture Philosophy
**Goal:** Enterprise-grade, maintainable, scalable architecture following industry best practices.

**Current Approach:** Domain-Driven Design (DDD) with module-based organization - See [DDD_STRUCTURE.md](DDD_STRUCTURE.md)

---

## 🎯 Backend Architecture (Node.js/Express)

### Directory Structure
```
backend/
├── src/
│   ├── routes/           # Route definitions (*.routes.js)
│   ├── controllers/       # Request handlers (*.controller.js)
│   ├── services/          # Business logic (*.service.js)
│   ├── models/            # Data models (*.model.js)
│   ├── middleware/        # Express middleware (*.middleware.js)
│   ├── config/            # Configuration files
│   ├── utils/             # Utility functions
│   └── app.js            # Express app setup
└── server.js             # Server entry point
```

### Layer Responsibilities

#### 1. **Routes Layer** (`*.routes.js`)
- **Purpose:** Define API endpoints and HTTP methods
- **Responsibilities:**
  - Route definitions
  - Input validation (express-validator)
  - Authentication/authorization middleware
  - NO business logic
- **Naming:** `{resource}.routes.js` (e.g., `escrows.routes.js`)

```javascript
// Example: escrows.routes.js
router.get('/', 
  authenticate,
  validate(querySchema),
  escrowsController.getAll
);
```

#### 2. **Controllers Layer** (`*.controller.js`)
- **Purpose:** Handle HTTP requests/responses
- **Responsibilities:**
  - Extract request data
  - Call service methods
  - Format responses
  - Error handling
  - NO database queries
- **Naming:** `{resource}.controller.js`

```javascript
// Example: escrows.controller.js
async getAll(req, res) {
  try {
    const result = await escrowsService.findAll(req.query);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error });
  }
}
```

#### 3. **Services Layer** (`*.service.js`)
- **Purpose:** Business logic and orchestration
- **Responsibilities:**
  - Business rules
  - Data transformation
  - Orchestrate multiple operations
  - Call repositories/models
- **Naming:** `{resource}.service.js`

```javascript
// Example: escrows.service.js
async findAll(filters) {
  const escrows = await EscrowModel.find(filters);
  return escrows.map(transform);
}
```

#### 4. **Models Layer** (`*.model.js`)
- **Purpose:** Data structure and database interaction
- **Responsibilities:**
  - Schema definitions
  - Database queries
  - Data validation
- **Naming:** `{Resource}.model.js` (PascalCase)

---

## 🎨 Frontend Architecture (React)

### Directory Structure
```
frontend/
├── src/
│   ├── components/
│   │   ├── common/        # Reusable UI components
│   │   ├── layout/        # Layout components
│   │   ├── features/      # Feature-specific components
│   │   └── pages/         # Page components
│   ├── services/
│   │   └── api.js        # API service (single source)
│   ├── hooks/            # Custom React hooks
│   ├── contexts/         # React contexts
│   ├── utils/            # Utility functions
│   ├── constants/        # App constants
│   └── App.jsx          # Root component
```

### Key Patterns

#### 1. **Single API Service**
- **File:** `/services/api.js`
- **Pattern:** Singleton class with methods for all API calls
- **Benefits:** 
  - Centralized error handling
  - Consistent authentication
  - Easy to mock for testing

```javascript
// services/api.js
class ApiService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL;
  }
  
  async request(endpoint, options) {
    // Centralized request logic
  }
  
  // Resource-specific methods
  escrows = {
    getAll: () => this.request('/escrows'),
    getById: (id) => this.request(`/escrows/${id}`)
  }
}

export default new ApiService();
```

#### 2. **Component Organization**
```
components/
├── common/           # Buttons, Cards, Modals
├── layout/           # Header, Footer, Sidebar
├── features/
│   ├── escrows/     # Escrow-specific components
│   ├── listings/    # Listing-specific components
│   └── clients/     # Client-specific components
└── pages/           # Full page components
```

#### 3. **Debug Components**
- **Production:** `DebugCardWithApiTests.jsx` - Full-featured debug panel
- **Purpose:** System admin tools for monitoring and testing

---

## 🔄 Request Flow

```
[Browser] 
    ↓ HTTP Request
[Routes Layer] → Validation → Auth
    ↓
[Controller Layer] → Extract/Transform
    ↓
[Service Layer] → Business Logic
    ↓
[Model Layer] → Database
    ↓
[Service Layer] → Transform
    ↓
[Controller Layer] → Format Response
    ↓ HTTP Response
[Browser]
```

---

## 📋 File Naming Conventions

### Backend
- Routes: `{resource}.routes.js` (plural, lowercase)
- Controllers: `{resource}.controller.js` (plural, lowercase)
- Services: `{resource}.service.js` (plural, lowercase)
- Models: `{Resource}.model.js` (singular, PascalCase)
- Middleware: `{function}.middleware.js` (lowercase)

### Frontend
- Components: `{ComponentName}.jsx` (PascalCase)
- Services: `{service}.service.js` (lowercase)
- Hooks: `use{HookName}.js` (camelCase)
- Utils: `{utility}.js` (lowercase)
- Constants: `{CONSTANTS}.js` (UPPERCASE)

---

## 🔑 API Endpoints Structure

### RESTful Conventions
```
GET    /v1/escrows          # List all
GET    /v1/escrows/:id      # Get one
POST   /v1/escrows          # Create
PUT    /v1/escrows/:id      # Update (full)
PATCH  /v1/escrows/:id      # Update (partial)
DELETE /v1/escrows/:id      # Delete

# Sub-resources
GET    /v1/escrows/:id/timeline
GET    /v1/escrows/:id/people
GET    /v1/escrows/:id/documents
POST   /v1/escrows/:id/notes
```

---

## 🔒 Middleware Stack

1. **Security:** Helmet, CORS
2. **Parsing:** body-parser, multer
3. **Authentication:** JWT verification
4. **Authorization:** Role/permission checks
5. **Validation:** Input validation
6. **Rate Limiting:** Request throttling
7. **Error Handling:** Centralized error handler

---

## 📊 Data Flow Patterns

### Frontend → Backend
1. User action in React component
2. Call API service method
3. Service adds auth headers
4. Request hits backend route
5. Middleware validates/authenticates
6. Controller processes request
7. Service executes business logic
8. Model queries database
9. Response flows back through layers

### State Management
- **Local State:** Component-specific (useState)
- **Context:** Cross-component shared state
- **API Cache:** React Query or SWR
- **Auth State:** AuthContext with localStorage

---

## 🚀 Best Practices

### Backend
✅ Separation of concerns (routes → controllers → services → models)
✅ Input validation on all routes
✅ Consistent error handling
✅ API versioning (/v1)
✅ Environment-based configuration
✅ Comprehensive logging

### Frontend
✅ Single API service instance
✅ Component reusability
✅ Custom hooks for logic
✅ Error boundaries
✅ Loading states
✅ Optimistic updates

---

## 📝 Example Implementation

### Complete Feature Flow: Get Escrow Details

**1. Frontend Component**
```jsx
// pages/EscrowDetail.jsx
import api from 'services/api';

function EscrowDetail({ id }) {
  const [escrow, setEscrow] = useState(null);
  
  useEffect(() => {
    api.escrows.getById(id)
      .then(setEscrow);
  }, [id]);
}
```

**2. API Service**
```javascript
// services/api.js
escrows: {
  getById: (id) => this.request(`/v1/escrows/${id}`)
}
```

**3. Route**
```javascript
// routes/escrows.routes.js
router.get('/:id',
  authenticate,
  validate(params('id').isUUID()),
  escrowsController.getById
);
```

**4. Controller**
```javascript
// controllers/escrows.controller.js
async getById(req, res) {
  const result = await escrowsService.findById(req.params.id);
  res.json({ success: true, data: result });
}
```

**5. Service**
```javascript
// services/escrows.service.js
async findById(id) {
  const escrow = await Escrow.findById(id);
  return this.transform(escrow);
}
```

---

## 🔧 Configuration

### Environment Variables
```
# Backend
NODE_ENV=production
DATABASE_URL=postgresql://...
JWT_SECRET=...
API_PORT=5000

# Frontend
REACT_APP_API_URL=https://api.example.com
REACT_APP_ENV=production
```

---

## 📚 Technology Stack

### Backend
- **Runtime:** Node.js v18+
- **Framework:** Express.js
- **Database:** PostgreSQL
- **ORM:** Native SQL (pg library)
- **Authentication:** JWT
- **Validation:** express-validator

### Frontend
- **Framework:** React 18
- **UI Library:** Material-UI
- **State:** Context API + Hooks
- **API Client:** Native Fetch
- **Build Tool:** Create React App
- **Routing:** React Router v6

---

## 🎯 Summary

This architecture provides:
- **Maintainability:** Clear separation of concerns
- **Scalability:** Modular, loosely coupled design
- **Testability:** Each layer can be tested independently
- **Security:** Multiple layers of validation and auth
- **Performance:** Efficient data flow and caching
- **Developer Experience:** Consistent patterns and naming

---

*Last Updated: August 2025*
*Version: 2.0*