# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Backend (Node.js/Express API)
```bash
cd backend
npm run dev          # Start development server with nodemon
npm start           # Start production server
npm run migrate     # Run database migrations
npm test           # Run Jest tests
```

### Frontend (React)
```bash
cd frontend
npm start          # Start development server (port 3001 in Docker)
npm run build      # Build for production
npm test          # Run React tests
```

### Docker Development
```bash
docker-compose up -d    # Start all services (PostgreSQL, Redis, API, Frontend)
docker-compose down     # Stop all services
docker-compose logs api # View API logs
```

## Architecture Overview

### Monorepo Structure
- **Backend**: Express.js API with PostgreSQL database and Redis cache
- **Frontend**: React SPA with Material-UI, Three.js for 3D virtual office
- **AI System**: 14 autonomous AI agents for real estate task automation

### Core Business Domains
1. **Escrows**: Transaction management and timeline tracking
2. **Listings**: Property inventory with MLS integration
3. **Clients**: Contact management with buyer/seller workflows
4. **Leads**: Lead qualification and nurturing pipeline
5. **Appointments**: Calendar and showing coordination

### Key Technical Components

#### AI Agent System
- Located in `backend/services/ai/`
- 14 specialized agents (buyer qualification, listing marketing, compliance, etc.)
- Autonomous task execution with WebSocket real-time updates
- Token usage tracking and cost management

#### 3D Virtual Office
- Frontend component using Three.js and Babylon.js
- Multiple office tier configurations (solo, team, enterprise)
- Interactive AI agent visualization and status monitoring
- Real-time agent activity display

#### Real-time Features
- WebSocket service for live data updates
- Real-time agent status and task notifications
- Live dashboard metrics and activity feeds

### Database Schema
- PostgreSQL with migrations in `backend/migrations/`
- Core entities: Escrows, Listings, Clients, Leads, Appointments
- AI agent activity logging and task tracking tables

### API Architecture
- RESTful API with `/v1` prefix
- Standardized response format with success/error handling
- Rate limiting and security middleware (Helmet, CORS)
- Mock data endpoints for development (analytics dashboard, entities)

### Frontend Architecture
- React Router for navigation
- Material-UI theme and component system
- React Query for API state management
- WebSocket integration for real-time updates
- Enhanced navigation with dashboard-focused routing

## Development Patterns

### API Response Format
All API endpoints return standardized responses:
```javascript
{
  success: boolean,
  data: object | array,
  error: { code: string, message: string },
  timestamp: string
}
```

### WebSocket Event Patterns
- `ai:*` events for AI agent communication
- Real-time dashboard data updates
- Connection status and client tracking

### Component Organization
- `dashboards/`: Main feature dashboards
- `details/`: Individual record detail views  
- `forms/`: Data entry components
- `common/`: Shared UI components
- `ai/`: AI-specific interfaces and controls

## Testing & Quality

### Running Tests
- Backend: `npm test` (Jest)
- Frontend: `npm test` (React Testing Library)
- Database migrations: `npm run migrate`

### Environment Setup
- Requires PostgreSQL 15+, Redis 7+, Node.js 18+
- Environment variables configured via `.env` files
- Docker Compose for local development environment