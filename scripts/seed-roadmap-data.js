#!/usr/bin/env node

/**
 * Seed Script: Populate projects and tasks from hardcoded roadmap
 *
 * This script takes all 40 projects and 150+ tasks from ProjectManagementPanel.jsx
 * and inserts them into the production database with proper relationships.
 *
 * Usage: node scripts/seed-roadmap-data.js
 */

const { Pool } = require('pg');

// Database connection (using Railway production credentials)
const pool = new Pool({
  user: 'postgres',
  host: 'ballast.proxy.rlwy.net',
  database: 'railway',
  password: 'ueLIWnvALZWVbRdnOmpLGsrrukeGLGQQ',
  port: 20017,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Admin user and team IDs
const ADMIN_USER_ID = '65483115-0e3e-43f3-8a4a-488a6f0df017';
const TEAM_ID = '7d6e5c4b-8a9b-3c2d-1e0f-9a8b7c6d5e4f';

// ALL ROADMAP DATA (from ProjectManagementPanel.jsx)
const roadmapData = [
  {
    category: 'Core Data & Database',
    priority: 'critical',
    projects: [
      {
        name: 'Escrows Database & CRUD',
        status: 'in-progress',
        priority: 'critical',
        progress: 75,
        tasks: [
          { name: 'Import all escrow data from spreadsheets', status: 'not-started', priority: 'critical' },
          { name: 'Verify database schema matches all fields', status: 'in-progress', priority: 'critical' },
          { name: 'Test all CRUD operations (create, read, update, delete)', status: 'not-started', priority: 'critical' },
          { name: 'Validate data integrity and relationships', status: 'not-started', priority: 'high' },
          { name: 'Add missing fields discovered during import', status: 'not-started', priority: 'medium' },
        ]
      },
      {
        name: 'Listings Database & CRUD',
        status: 'not-started',
        priority: 'critical',
        progress: 0,
        tasks: [
          { name: 'Import all listing data', status: 'not-started', priority: 'critical' },
          { name: 'Verify database schema', status: 'not-started', priority: 'critical' },
          { name: 'Test all CRUD operations', status: 'not-started', priority: 'critical' },
          { name: 'Validate MLS integration fields', status: 'not-started', priority: 'high' },
        ]
      },
      {
        name: 'Clients Database & CRUD',
        status: 'not-started',
        priority: 'critical',
        progress: 0,
        tasks: [
          { name: 'Import all client data', status: 'not-started', priority: 'critical' },
          { name: 'Verify database schema', status: 'not-started', priority: 'critical' },
          { name: 'Test all CRUD operations', status: 'not-started', priority: 'critical' },
          { name: 'Link clients to escrows/listings', status: 'not-started', priority: 'high' },
        ]
      },
      {
        name: 'Leads Database & CRUD',
        status: 'not-started',
        priority: 'high',
        progress: 0,
        tasks: [
          { name: 'Import all lead data', status: 'not-started', priority: 'high' },
          { name: 'Add lead_type column to schema', status: 'not-started', priority: 'high' },
          { name: 'Test all CRUD operations', status: 'not-started', priority: 'high' },
          { name: 'Build lead qualification workflow', status: 'not-started', priority: 'medium' },
        ]
      },
      {
        name: 'Appointments Database & CRUD',
        status: 'not-started',
        priority: 'high',
        progress: 0,
        tasks: [
          { name: 'Import all appointment data', status: 'not-started', priority: 'high' },
          { name: 'Verify database schema', status: 'not-started', priority: 'high' },
          { name: 'Test all CRUD operations', status: 'not-started', priority: 'high' },
          { name: 'Integrate with calendar sync', status: 'not-started', priority: 'medium' },
        ]
      },
      {
        name: 'Contacts Database (NEW)',
        status: 'not-started',
        priority: 'critical',
        progress: 0,
        tasks: [
          { name: 'Create contacts table schema', status: 'not-started', priority: 'critical' },
          { name: 'Migrate existing contact data from escrows', status: 'not-started', priority: 'critical' },
          { name: 'Build contact CRUD operations', status: 'not-started', priority: 'critical' },
          { name: 'Replace ContactSelectionModal mock data', status: 'not-started', priority: 'high' },
        ]
      },
      {
        name: 'Commissions, Invoices & Expenses',
        status: 'completed',
        priority: 'medium',
        progress: 100,
        tasks: [
          { name: 'Commissions CRUD', status: 'completed', priority: 'medium' },
          { name: 'Invoices CRUD', status: 'completed', priority: 'medium' },
          { name: 'Expenses CRUD', status: 'completed', priority: 'medium' },
        ]
      },
      {
        name: 'Tasks & Projects Module (✅ NEW - Just Created!)',
        status: 'in-progress',
        priority: 'medium',
        progress: 30,
        tasks: [
          { name: 'Design tasks table schema', status: 'completed', priority: 'medium' },
          { name: 'Design projects table schema', status: 'completed', priority: 'medium' },
          { name: 'Create database migration', status: 'completed', priority: 'medium' },
          { name: 'Build task/project CRUD operations', status: 'not-started', priority: 'medium' },
          { name: 'Add task assignment and tracking', status: 'not-started', priority: 'low' },
        ]
      },
    ]
  },
  {
    category: 'Frontend Display & UX',
    priority: 'critical',
    projects: [
      {
        name: 'Escrows Dashboard',
        status: 'in-progress',
        priority: 'critical',
        progress: 80,
        tasks: [
          { name: 'Display all escrows in optimal format', status: 'completed', priority: 'critical' },
          { name: 'Refactor EscrowsDashboard.jsx (3,914 lines → 8-10 components)', status: 'not-started', priority: 'critical' },
          { name: 'Add filtering and search', status: 'completed', priority: 'high' },
          { name: 'Add sorting by all columns', status: 'completed', priority: 'high' },
          { name: 'Optimize for performance (1000+ escrows)', status: 'not-started', priority: 'medium' },
        ]
      },
      {
        name: 'Escrow Detail Page',
        status: 'in-progress',
        priority: 'critical',
        progress: 90,
        tasks: [
          { name: 'Design compact hero card', status: 'completed', priority: 'critical' },
          { name: 'Build 4-widget layout (Timeline, Financials, People, Documents)', status: 'completed', priority: 'critical' },
          { name: 'Add collapsible sidebars', status: 'completed', priority: 'high' },
          { name: 'Implement inline editing for all fields', status: 'completed', priority: 'critical' },
          { name: 'Add activity feed with real-time updates', status: 'completed', priority: 'high' },
          { name: 'Polish UI based on designer feedback', status: 'in-progress', priority: 'high' },
        ]
      },
      {
        name: 'Listings Dashboard',
        status: 'not-started',
        priority: 'critical',
        progress: 60,
        tasks: [
          { name: 'Display all listings in grid/list format', status: 'not-started', priority: 'critical' },
          { name: 'Implement Zillow-style redesign', status: 'not-started', priority: 'high' },
          { name: 'Add photo gallery with carousel', status: 'not-started', priority: 'high' },
          { name: 'Add map view integration', status: 'not-started', priority: 'medium' },
        ]
      },
      {
        name: 'Clients Dashboard',
        status: 'not-started',
        priority: 'critical',
        progress: 50,
        tasks: [
          { name: 'Display all clients in list format', status: 'not-started', priority: 'critical' },
          { name: 'Add client detail page', status: 'not-started', priority: 'critical' },
          { name: 'Add inline editing for all fields', status: 'not-started', priority: 'high' },
          { name: 'Link to related escrows/listings', status: 'not-started', priority: 'high' },
        ]
      },
      {
        name: 'Leads Dashboard',
        status: 'not-started',
        priority: 'high',
        progress: 50,
        tasks: [
          { name: 'Display leads in kanban format', status: 'not-started', priority: 'high' },
          { name: 'Add lead detail page', status: 'not-started', priority: 'high' },
          { name: 'Add lead conversion workflow', status: 'not-started', priority: 'medium' },
        ]
      },
      {
        name: 'Appointments Dashboard',
        status: 'not-started',
        priority: 'high',
        progress: 50,
        tasks: [
          { name: 'Display appointments in calendar format', status: 'not-started', priority: 'high' },
          { name: 'Add appointment detail modal', status: 'not-started', priority: 'high' },
          { name: 'Add quick add appointment', status: 'not-started', priority: 'medium' },
        ]
      },
      {
        name: 'Home Dashboard Redesign',
        status: 'not-started',
        priority: 'medium',
        progress: 0,
        tasks: [
          { name: 'Design new home dashboard layout', status: 'not-started', priority: 'medium' },
          { name: 'Add AI-powered insights section', status: 'not-started', priority: 'low' },
          { name: 'Add quick actions panel', status: 'not-started', priority: 'medium' },
        ]
      },
    ]
  },
  {
    category: 'Backend Infrastructure',
    priority: 'high',
    projects: [
      {
        name: 'Escrows Controller Refactor',
        status: 'not-started',
        priority: 'critical',
        progress: 0,
        tasks: [
          { name: 'Extract schema detection to schema.service.js', status: 'not-started', priority: 'critical' },
          { name: 'Extract query builder to escrow.query.service.js', status: 'not-started', priority: 'critical' },
          { name: 'Reduce escrows.controller.js from 2,791 → <800 lines', status: 'not-started', priority: 'critical' },
        ]
      },
      {
        name: 'WebSocket Real-Time Sync',
        status: 'in-progress',
        priority: 'critical',
        progress: 20,
        tasks: [
          { name: 'Add WebSocket events for listings', status: 'not-started', priority: 'critical' },
          { name: 'Add WebSocket events for clients', status: 'not-started', priority: 'critical' },
          { name: 'Add WebSocket events for appointments', status: 'not-started', priority: 'critical' },
          { name: 'Add WebSocket events for leads', status: 'not-started', priority: 'critical' },
        ]
      },
      {
        name: 'Authorization & Permissions',
        status: 'not-started',
        priority: 'high',
        progress: 0,
        tasks: [
          { name: 'Implement permission checks in authorization.middleware.js', status: 'not-started', priority: 'high' },
          { name: 'Add role-based access control (RBAC)', status: 'not-started', priority: 'high' },
          { name: 'Add team-level permissions', status: 'not-started', priority: 'medium' },
        ]
      },
      {
        name: 'Email Notifications',
        status: 'not-started',
        priority: 'medium',
        progress: 0,
        tasks: [
          { name: 'Build email.service.js with SendGrid', status: 'not-started', priority: 'medium' },
          { name: 'Create email templates table', status: 'not-started', priority: 'medium' },
          { name: 'Add password reset emails', status: 'not-started', priority: 'high' },
          { name: 'Add appointment reminder emails', status: 'not-started', priority: 'low' },
        ]
      },
    ]
  },
  {
    category: 'Technical Debt & Refactoring',
    priority: 'high',
    projects: [
      {
        name: 'Remove Console.log Pollution',
        status: 'not-started',
        priority: 'high',
        progress: 0,
        tasks: [
          { name: 'Remove 243 console.log statements', status: 'not-started', priority: 'high' },
          { name: 'Replace with proper logging service', status: 'not-started', priority: 'medium' },
        ]
      },
      {
        name: 'Remove .backup Files',
        status: 'not-started',
        priority: 'medium',
        progress: 0,
        tasks: [
          { name: 'Delete 6 .backup files', status: 'not-started', priority: 'medium' },
          { name: 'Verify no functionality broken', status: 'not-started', priority: 'medium' },
        ]
      },
    ]
  },
  {
    category: 'Security & Compliance',
    priority: 'medium',
    projects: [
      {
        name: 'Security Event Monitoring Dashboard',
        status: 'not-started',
        priority: 'medium',
        progress: 0,
        tasks: [
          { name: 'Build user security dashboard in Settings page', status: 'not-started', priority: 'medium' },
          { name: 'Add email alerts for account lockouts', status: 'not-started', priority: 'medium' },
          { name: 'Add GDPR deletion endpoint', status: 'not-started', priority: 'low' },
        ]
      },
    ]
  },
  {
    category: 'Performance & Optimization',
    priority: 'low',
    projects: [
      {
        name: 'Redis Caching Layer',
        status: 'not-started',
        priority: 'low',
        progress: 0,
        tasks: [
          { name: 'Set up Redis/Upstash', status: 'not-started', priority: 'low' },
          { name: 'Cache frequently accessed data', status: 'not-started', priority: 'low' },
        ]
      },
    ]
  },
  {
    category: 'AI Integration',
    priority: 'low',
    projects: [
      {
        name: 'AI Best Practices & Defaults',
        status: 'not-started',
        priority: 'low',
        progress: 0,
        tasks: [
          { name: 'Create AI settings page for default behaviors', status: 'not-started', priority: 'low' },
          { name: 'Define business rules for AI agents', status: 'not-started', priority: 'low' },
          { name: 'Set up guardrails and limits', status: 'not-started', priority: 'low' },
        ]
      },
      {
        name: 'AI Lead Qualification',
        status: 'not-started',
        priority: 'low',
        progress: 0,
        tasks: [
          { name: 'Build AI agent to score leads', status: 'not-started', priority: 'low' },
          { name: 'Auto-assign priority to leads', status: 'not-started', priority: 'low' },
        ]
      },
      {
        name: 'AI Appointment Scheduling',
        status: 'not-started',
        priority: 'low',
        progress: 0,
        tasks: [
          { name: 'Build AI agent to suggest optimal appointment times', status: 'not-started', priority: 'low' },
          { name: 'Auto-schedule based on preferences', status: 'not-started', priority: 'low' },
        ]
      },
      {
        name: 'AI Data Entry Assistant',
        status: 'not-started',
        priority: 'low',
        progress: 0,
        tasks: [
          { name: 'Build AI to auto-populate fields from emails', status: 'not-started', priority: 'low' },
          { name: 'Extract data from documents', status: 'not-started', priority: 'low' },
        ]
      },
    ]
  },
  {
    category: 'Productization & Sales',
    priority: 'low',
    projects: [
      {
        name: 'Membership Tiers',
        status: 'not-started',
        priority: 'low',
        progress: 0,
        tasks: [
          { name: 'Design Basic, Pro, Enterprise tiers', status: 'not-started', priority: 'low' },
          { name: 'Implement feature gating', status: 'not-started', priority: 'low' },
        ]
      },
      {
        name: 'Marketplace Listing',
        status: 'not-started',
        priority: 'low',
        progress: 0,
        tasks: [
          { name: 'Create product landing page', status: 'not-started', priority: 'low' },
          { name: 'Record demo videos', status: 'not-started', priority: 'low' },
          { name: 'Write documentation for customers', status: 'not-started', priority: 'low' },
        ]
      },
    ]
  },
  {
    category: 'Analytics & Reporting',
    priority: 'medium',
    projects: [
      {
        name: 'Business Intelligence Dashboard',
        status: 'not-started',
        priority: 'medium',
        progress: 0,
        tasks: [
          { name: 'Add revenue forecasting', status: 'not-started', priority: 'medium' },
          { name: 'Add pipeline health metrics', status: 'not-started', priority: 'medium' },
          { name: 'Add conversion funnel analytics', status: 'not-started', priority: 'low' },
        ]
      },
    ]
  },
  {
    category: 'Game-Changing Features',
    priority: 'high',
    projects: [
      {
        name: '🔮 Predictive Closing Date AI',
        status: 'not-started',
        priority: 'high',
        progress: 0,
        tasks: [
          { name: 'Analyze historical escrow timeline data', status: 'not-started', priority: 'high' },
          { name: 'Build ML model to predict actual closing date based on current stage', status: 'not-started', priority: 'high' },
          { name: 'Show confidence intervals and risk factors', status: 'not-started', priority: 'medium' },
          { name: 'Alert when escrow is trending toward delay', status: 'not-started', priority: 'high' },
        ]
      },
      {
        name: '📄 Smart Document Assistant',
        status: 'not-started',
        priority: 'high',
        progress: 0,
        tasks: [
          { name: 'OCR scan uploaded documents and extract key data', status: 'not-started', priority: 'high' },
          { name: 'Auto-populate CRM fields from scanned contracts', status: 'not-started', priority: 'high' },
          { name: 'Flag missing required documents by escrow stage', status: 'not-started', priority: 'high' },
          { name: 'Suggest next document needed based on timeline', status: 'not-started', priority: 'medium' },
        ]
      },
      {
        name: '🌐 Client Self-Service Portal',
        status: 'not-started',
        priority: 'high',
        progress: 0,
        tasks: [
          { name: 'Build branded client login page', status: 'not-started', priority: 'high' },
          { name: 'Allow clients to view their escrow progress in real-time', status: 'not-started', priority: 'high' },
          { name: 'Enable clients to upload documents directly', status: 'not-started', priority: 'high' },
          { name: 'Add e-signature integration (DocuSign/HelloSign)', status: 'not-started', priority: 'medium' },
          { name: 'Send automated status updates via email/SMS', status: 'not-started', priority: 'medium' },
        ]
      },
      {
        name: '📊 Automated CMA Generator',
        status: 'not-started',
        priority: 'medium',
        progress: 0,
        tasks: [
          { name: 'Pull comparable sales data from MLS API', status: 'not-started', priority: 'medium' },
          { name: 'Auto-generate professional CMA reports with charts', status: 'not-started', priority: 'medium' },
          { name: 'Suggest optimal listing price based on comps', status: 'not-started', priority: 'medium' },
          { name: 'Export as branded PDF for client presentation', status: 'not-started', priority: 'low' },
        ]
      },
      {
        name: '🎤 Voice-to-CRM Notes',
        status: 'not-started',
        priority: 'medium',
        progress: 0,
        tasks: [
          { name: 'Add voice recording button on mobile', status: 'not-started', priority: 'medium' },
          { name: 'Transcribe voice notes to text using Whisper API', status: 'not-started', priority: 'medium' },
          { name: 'Auto-categorize notes (client call, showing notes, follow-up)', status: 'not-started', priority: 'low' },
          { name: 'Extract action items and create tasks automatically', status: 'not-started', priority: 'low' },
        ]
      },
      {
        name: '🔔 Smart Price Drop Alerts',
        status: 'not-started',
        priority: 'medium',
        progress: 0,
        tasks: [
          { name: 'Monitor MLS for price drops on properties matching client criteria', status: 'not-started', priority: 'medium' },
          { name: 'Auto-notify clients when dream property drops price', status: 'not-started', priority: 'medium' },
          { name: 'Track how long properties stay on market', status: 'not-started', priority: 'low' },
          { name: 'Suggest negotiation strategies based on days on market', status: 'not-started', priority: 'low' },
        ]
      },
      {
        name: '🤝 Referral & Relationship Mapping',
        status: 'not-started',
        priority: 'medium',
        progress: 0,
        tasks: [
          { name: 'Build visual network graph of client relationships', status: 'not-started', priority: 'medium' },
          { name: 'Track who referred who (client genealogy)', status: 'not-started', priority: 'medium' },
          { name: 'Calculate lifetime referral value per client', status: 'not-started', priority: 'low' },
          { name: 'Auto-suggest clients who might refer based on satisfaction', status: 'not-started', priority: 'low' },
        ]
      },
      {
        name: '📧 Personalized Drip Campaigns',
        status: 'not-started',
        priority: 'medium',
        progress: 0,
        tasks: [
          { name: 'Build email template library (just listed, market update, closing congratulations)', status: 'not-started', priority: 'medium' },
          { name: 'Trigger campaigns based on lead stage (new lead → nurtured → hot)', status: 'not-started', priority: 'medium' },
          { name: 'Personalize content using client data (name, property type, location)', status: 'not-started', priority: 'low' },
          { name: 'Track open rates and engagement scores', status: 'not-started', priority: 'low' },
        ]
      },
      {
        name: '📱 Native Mobile App (iOS/Android)',
        status: 'not-started',
        priority: 'low',
        progress: 0,
        tasks: [
          { name: 'Design mobile-first UI with React Native', status: 'not-started', priority: 'low' },
          { name: 'Add offline mode for viewing escrows without internet', status: 'not-started', priority: 'low' },
          { name: 'Enable push notifications for urgent tasks', status: 'not-started', priority: 'low' },
          { name: 'Add camera integration for instant document upload', status: 'not-started', priority: 'low' },
        ]
      },
      {
        name: '🎯 AI Transaction Coordinator',
        status: 'not-started',
        priority: 'high',
        progress: 0,
        tasks: [
          { name: 'Build AI that knows typical escrow timeline milestones', status: 'not-started', priority: 'high' },
          { name: 'Auto-create tasks for each stage (appraisal ordered, inspection scheduled, etc.)', status: 'not-started', priority: 'high' },
          { name: 'Remind agent of upcoming deadlines 3 days before', status: 'not-started', priority: 'high' },
          { name: 'Flag when escrow deviates from standard timeline', status: 'not-started', priority: 'medium' },
          { name: 'Suggest who to contact when stuck (lender, escrow officer, etc.)', status: 'not-started', priority: 'medium' },
        ]
      },
    ]
  },
];

async function seedRoadmap() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    console.log('🌱 Starting roadmap seed...\n');

    let totalProjects = 0;
    let totalTasks = 0;

    for (const category of roadmapData) {
      console.log(`📁 Category: ${category.category}`);

      for (const project of category.projects) {
        // Insert project
        const projectResult = await client.query(`
          INSERT INTO projects (
            name, category, status, priority, progress_percentage,
            owner_id, team_id, created_by,
            completed_date
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          RETURNING id
        `, [
          project.name,
          category.category,
          project.status,
          project.priority,
          project.progress,
          ADMIN_USER_ID,
          TEAM_ID,
          ADMIN_USER_ID,
          project.status === 'completed' ? new Date() : null
        ]);

        const projectId = projectResult.rows[0].id;
        totalProjects++;

        console.log(`  ✅ ${project.name} (${project.tasks.length} tasks)`);

        // Insert tasks
        for (let i = 0; i < project.tasks.length; i++) {
          const task = project.tasks[i];
          await client.query(`
            INSERT INTO tasks (
              name, project_id, status, priority, position,
              team_id, created_by, completed_date
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          `, [
            task.name,
            projectId,
            task.status,
            task.priority,
            i + 1,
            TEAM_ID,
            ADMIN_USER_ID,
            task.status === 'completed' ? new Date() : null
          ]);
          totalTasks++;
        }
      }
      console.log('');
    }

    await client.query('COMMIT');

    console.log('✨ Seed complete!');
    console.log(`📊 Inserted ${totalProjects} projects and ${totalTasks} tasks\n`);

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Seed failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the seed
seedRoadmap().catch(console.error);
