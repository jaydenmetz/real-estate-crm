import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  LinearProgress,
  IconButton,
  Tooltip,
  Badge,
  Stack,
  Divider,
  Grid,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  ExpandMore,
  CheckCircle,
  RadioButtonUnchecked,
  FiberManualRecord,
  Storage,
  Code,
  BugReport,
  Security,
  Speed,
  SmartToy,
  Storefront,
  Assessment,
  Build,
  Psychology,
  Smartphone,
  TrendingUp,
  CloudUpload,
  VpnKey,
  Celebration,
} from '@mui/icons-material';

// Styled Components
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2),
  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  maxHeight: '600px', // Fixed height to prevent scrolling
  display: 'flex',
  flexDirection: 'column',
}));

const ScrollableContent = styled(Box)(({ theme }) => ({
  overflowY: 'auto',
  flex: 1,
  paddingRight: theme.spacing(1),
  '&::-webkit-scrollbar': {
    width: '8px',
  },
  '&::-webkit-scrollbar-track': {
    background: theme.palette.grey[100],
    borderRadius: '4px',
  },
  '&::-webkit-scrollbar-thumb': {
    background: theme.palette.grey[400],
    borderRadius: '4px',
    '&:hover': {
      background: theme.palette.grey[600],
    },
  },
}));

const CategoryAccordion = styled(Accordion)(({ theme }) => ({
  '&:before': {
    display: 'none',
  },
  boxShadow: 'none',
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: `${theme.spacing(1)}px !important`,
  marginBottom: theme.spacing(0.75), // Tighter spacing
  '&.Mui-expanded': {
    margin: `0 0 ${theme.spacing(0.75)}px 0`,
  },
}));

const CompactCategorySummary = styled(AccordionSummary)(({ theme }) => ({
  minHeight: '48px !important', // Compact height
  '& .MuiAccordionSummary-content': {
    margin: `${theme.spacing(1)} 0`,
  },
}));

const ProjectAccordion = styled(Accordion)(({ theme }) => ({
  '&:before': {
    display: 'none',
  },
  boxShadow: 'none',
  backgroundColor: theme.palette.grey[50],
  marginBottom: theme.spacing(1),
  '&.Mui-expanded': {
    margin: `0 0 ${theme.spacing(1)}px 0`,
  },
}));

const TaskItem = styled(Box)(({ theme, completed }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(1, 2),
  marginBottom: theme.spacing(0.5),
  borderRadius: theme.spacing(1),
  backgroundColor: completed ? theme.palette.grey[50] : 'transparent',
  opacity: completed ? 0.6 : 1,
  transition: 'all 0.2s',
  '&:hover': {
    backgroundColor: theme.palette.grey[100],
  },
}));

const StatusBadge = styled(Chip)(({ status, theme }) => {
  const colors = {
    'not-started': { bg: theme.palette.grey[200], color: theme.palette.grey[700] },
    'in-progress': { bg: theme.palette.primary.light, color: theme.palette.primary.contrastText },
    'completed': { bg: theme.palette.success.light, color: theme.palette.success.contrastText },
    'blocked': { bg: theme.palette.error.light, color: theme.palette.error.contrastText },
  };
  return {
    backgroundColor: colors[status]?.bg || colors['not-started'].bg,
    color: colors[status]?.color || colors['not-started'].color,
    fontWeight: 600,
    fontSize: '0.75rem',
  };
});

const PriorityBadge = styled(Chip)(({ priority, theme }) => {
  const colors = {
    'critical': { bg: theme.palette.error.main, color: '#fff' },
    'high': { bg: theme.palette.warning.main, color: '#fff' },
    'medium': { bg: theme.palette.info.main, color: '#fff' },
    'low': { bg: theme.palette.grey[400], color: '#fff' },
  };
  return {
    backgroundColor: colors[priority]?.bg || colors['low'].bg,
    color: colors[priority]?.color || colors['low'].color,
    fontWeight: 600,
    fontSize: '0.7rem',
    height: '20px',
  };
});

const getCategoryIcon = (category) => {
  const icons = {
    'Core Data & Database': <Storage />,
    'Frontend Display & UX': <Code />,
    'Backend Infrastructure': <Build />,
    'Technical Debt & Refactoring': <BugReport />,
    'Security & Compliance': <Security />,
    'Performance & Optimization': <Speed />,
    'AI Integration': <SmartToy />,
    'Productization & Sales': <Storefront />,
    'Analytics & Reporting': <Assessment />,
    'Game-Changing Features': <Celebration />,
  };
  return icons[category] || <FiberManualRecord />;
};

const calculateProgress = (items) => {
  if (!items || items.length === 0) return 0;
  const completed = items.filter(item => item.status === 'completed').length;
  return Math.round((completed / items.length) * 100);
};

const calculateCategoryProgress = (projects) => {
  const allTasks = projects.flatMap(p => p.tasks || []);
  return calculateProgress(allTasks);
};

const ProjectManagementPanel = () => {
  const [expandedCategories, setExpandedCategories] = useState([]); // Start collapsed

  const handleCategoryToggle = (category) => (event, isExpanded) => {
    setExpandedCategories(
      isExpanded
        ? [...expandedCategories, category]
        : expandedCategories.filter(c => c !== category)
    );
  };

  // PROFESSIONAL SOFTWARE ENGINEERING PROJECT STRUCTURE
  const projectData = [
    {
      category: 'Core Data & Database',
      icon: <Storage />,
      description: 'Build complete, reliable data foundation',
      priority: 'critical',
      projects: [
        {
          id: 'escrows-db',
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
          id: 'listings-db',
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
          id: 'clients-db',
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
          id: 'leads-db',
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
          id: 'appointments-db',
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
          id: 'contacts-db',
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
          id: 'commissions-invoices-expenses',
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
          id: 'tasks-projects-db',
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
      icon: <Code />,
      description: 'Build beautiful, functional dashboards',
      priority: 'critical',
      projects: [
        {
          id: 'escrows-dashboard',
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
          id: 'escrow-detail',
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
          id: 'listings-dashboard',
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
          id: 'clients-dashboard',
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
          id: 'leads-dashboard',
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
          id: 'appointments-dashboard',
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
          id: 'home-dashboard-redesign',
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
      icon: <Build />,
      description: 'Build robust, scalable API layer',
      priority: 'high',
      projects: [
        {
          id: 'escrows-controller',
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
          id: 'websocket-real-time',
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
          id: 'authorization',
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
          id: 'email-notifications',
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
      icon: <BugReport />,
      description: 'Clean up code and remove technical debt',
      priority: 'high',
      projects: [
        {
          id: 'remove-console-logs',
          name: 'Remove Console.log Pollution',
          status: 'not-started',
          priority: 'high',
          progress: 0,
          tasks: [
            { name: 'Remove 243 // console.log statements', status: 'not-started', priority: 'high' },
            { name: 'Replace with proper logging service', status: 'not-started', priority: 'medium' },
          ]
        },
        {
          id: 'remove-backup-files',
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
      icon: <Security />,
      description: 'Maintain 10/10 security score',
      priority: 'medium',
      projects: [
        {
          id: 'security-monitoring',
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
      icon: <Speed />,
      description: 'Optimize for speed and scale',
      priority: 'low',
      projects: [
        {
          id: 'caching',
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
      icon: <SmartToy />,
      description: 'AI-itize the system step by step',
      priority: 'low',
      projects: [
        {
          id: 'ai-defaults',
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
          id: 'ai-lead-qualification',
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
          id: 'ai-appointment-scheduling',
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
          id: 'ai-data-entry',
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
      icon: <Storefront />,
      description: 'Package and sell the system',
      priority: 'low',
      projects: [
        {
          id: 'membership-tiers',
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
          id: 'marketplace',
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
      icon: <Assessment />,
      description: 'Data-driven insights',
      priority: 'medium',
      projects: [
        {
          id: 'business-intelligence',
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
      icon: <Celebration />,
      description: '🚀 Innovation that sets you apart from EVERYONE',
      priority: 'high',
      projects: [
        {
          id: 'predictive-closing-dates',
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
          id: 'smart-document-assistant',
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
          id: 'client-portal',
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
          id: 'competitive-market-analysis',
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
          id: 'voice-notes',
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
          id: 'price-drop-alerts',
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
          id: 'referral-tracking',
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
          id: 'marketing-automation',
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
          id: 'mobile-app',
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
          id: 'transaction-coordinator',
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

  const totalProjects = projectData.reduce((sum, cat) => sum + cat.projects.length, 0);
  const completedProjects = projectData.reduce(
    (sum, cat) => sum + cat.projects.filter(p => p.status === 'completed').length,
    0
  );
  const overallProgress = Math.round((completedProjects / totalProjects) * 100);

  return (
    <StyledPaper>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h5" gutterBottom fontWeight={700}>
          🎯 CRM Development Roadmap
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Click categories to expand projects and tasks
        </Typography>

        <Box sx={{ mt: 2, mb: 2 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="body2" color="text.secondary">
              Overall:
            </Typography>
            <Box sx={{ flex: 1 }}>
              <LinearProgress
                variant="determinate"
                value={overallProgress}
                sx={{ height: 8, borderRadius: 1 }}
              />
            </Box>
            <Typography variant="body2" fontWeight={600}>
              {completedProjects}/{totalProjects} ({overallProgress}%)
            </Typography>
          </Stack>
        </Box>

        <Divider />
      </Box>

      <ScrollableContent>
        {projectData.map((category) => {
          const categoryProgress = calculateCategoryProgress(category.projects);
          const completedProjectsInCategory = category.projects.filter(p => p.status === 'completed').length;

          return (
            <CategoryAccordion
              key={category.category}
              expanded={expandedCategories.includes(category.category)}
              onChange={handleCategoryToggle(category.category)}
            >
              <CompactCategorySummary expandIcon={<ExpandMore />}>
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ width: '100%', pr: 2 }}>
                  <Box sx={{ color: 'primary.main', fontSize: '1.2rem' }}>
                    {getCategoryIcon(category.category)}
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" fontWeight={600} sx={{ fontSize: '0.9rem' }}>
                      {category.category}
                    </Typography>
                  </Box>
                  <PriorityBadge priority={category.priority} label={category.priority.toUpperCase()} size="small" />
                  <Chip
                    label={`${completedProjectsInCategory}/${category.projects.length}`}
                    size="small"
                    color={categoryProgress === 100 ? 'success' : 'default'}
                    sx={{ minWidth: '55px', fontSize: '0.75rem' }}
                  />
                </Stack>
              </CompactCategorySummary>
              <AccordionDetails>
                <Box sx={{ mt: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={categoryProgress}
                    sx={{ mb: 2, height: 6, borderRadius: 1 }}
                  />

                  <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                    {category.description}
                  </Typography>

                  <Grid container spacing={1}>
                    {category.projects.map((project) => (
                      <Grid item xs={12} key={project.id}>
                        <Box
                          sx={{
                            p: 1.5,
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 1,
                            backgroundColor: project.status === 'completed' ? 'success.light' : 'background.paper',
                            opacity: project.status === 'completed' ? 0.7 : 1,
                          }}
                        >
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Box>
                              {project.status === 'completed' ? (
                                <CheckCircle fontSize="small" color="success" />
                              ) : (
                                <RadioButtonUnchecked fontSize="small" color="action" />
                              )}
                            </Box>
                            <Typography variant="body2" fontWeight={500} sx={{ flex: 1 }}>
                              {project.name}
                            </Typography>
                            <PriorityBadge priority={project.priority} label={project.priority} size="small" />
                            <Typography variant="caption" color="text.secondary">
                              {project.progress}%
                            </Typography>
                          </Stack>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </AccordionDetails>
            </CategoryAccordion>
          );
        })}
      </ScrollableContent>

      <Box sx={{ mt: 2, p: 1.5, bgcolor: 'primary.light', borderRadius: 1 }}>
        <Typography variant="caption" color="primary.contrastText" fontWeight={600}>
          💡 STRATEGY: Data → Display → Backend → AI → Game-Changers → Productize
        </Typography>
      </Box>
    </StyledPaper>
  );
};

export default ProjectManagementPanel;
