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
} from '@mui/icons-material';

// Styled Components
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2),
  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
}));

const CategoryAccordion = styled(Accordion)(({ theme }) => ({
  '&:before': {
    display: 'none',
  },
  boxShadow: 'none',
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: `${theme.spacing(1)}px !important`,
  marginBottom: theme.spacing(1.5),
  '&.Mui-expanded': {
    margin: `0 0 ${theme.spacing(1.5)}px 0`,
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
  const [expandedCategories, setExpandedCategories] = useState(['Core Data & Database']);
  const [expandedProjects, setExpandedProjects] = useState([]);

  const handleCategoryToggle = (category) => (event, isExpanded) => {
    setExpandedCategories(
      isExpanded
        ? [...expandedCategories, category]
        : expandedCategories.filter(c => c !== category)
    );
  };

  const handleProjectToggle = (projectId) => (event, isExpanded) => {
    setExpandedProjects(
      isExpanded
        ? [...expandedProjects, projectId]
        : expandedProjects.filter(p => p !== projectId)
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
          name: 'Tasks & Projects Module (NEW)',
          status: 'not-started',
          priority: 'medium',
          progress: 0,
          tasks: [
            { name: 'Design tasks table schema', status: 'not-started', priority: 'medium' },
            { name: 'Design projects table schema', status: 'not-started', priority: 'medium' },
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
            { name: 'Remove 243 console.log statements', status: 'not-started', priority: 'high' },
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
  ];

  const totalProjects = projectData.reduce((sum, cat) => sum + cat.projects.length, 0);
  const completedProjects = projectData.reduce(
    (sum, cat) => sum + cat.projects.filter(p => p.status === 'completed').length,
    0
  );
  const overallProgress = Math.round((completedProjects / totalProjects) * 100);

  return (
    <StyledPaper>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" gutterBottom fontWeight={700}>
          🎯 Professional CRM Development Plan
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Comprehensive project breakdown using software engineering best practices
        </Typography>

        <Box sx={{ mt: 2, mb: 2 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="body2" color="text.secondary">
              Overall Progress:
            </Typography>
            <Box sx={{ flex: 1 }}>
              <LinearProgress
                variant="determinate"
                value={overallProgress}
                sx={{ height: 8, borderRadius: 1 }}
              />
            </Box>
            <Typography variant="body2" fontWeight={600}>
              {completedProjects}/{totalProjects} Projects ({overallProgress}%)
            </Typography>
          </Stack>
        </Box>

        <Divider sx={{ my: 2 }} />
      </Box>

      {projectData.map((category) => {
        const categoryProgress = calculateCategoryProgress(category.projects);
        const completedProjectsInCategory = category.projects.filter(p => p.status === 'completed').length;

        return (
          <CategoryAccordion
            key={category.category}
            expanded={expandedCategories.includes(category.category)}
            onChange={handleCategoryToggle(category.category)}
          >
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ width: '100%', pr: 2 }}>
                <Box sx={{ color: 'primary.main' }}>
                  {getCategoryIcon(category.category)}
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {category.category}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {category.description}
                  </Typography>
                </Box>
                <PriorityBadge priority={category.priority} label={category.priority.toUpperCase()} size="small" />
                <Badge badgeContent={category.projects.length} color="primary">
                  <Chip
                    label={`${completedProjectsInCategory}/${category.projects.length}`}
                    size="small"
                    color={categoryProgress === 100 ? 'success' : 'default'}
                  />
                </Badge>
              </Stack>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ mt: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={categoryProgress}
                  sx={{ mb: 2, height: 6, borderRadius: 1 }}
                />

                {category.projects.map((project) => (
                  <ProjectAccordion
                    key={project.id}
                    expanded={expandedProjects.includes(project.id)}
                    onChange={handleProjectToggle(project.id)}
                  >
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Stack direction="row" spacing={2} alignItems="center" sx={{ width: '100%', pr: 2 }}>
                        <Box>
                          {project.status === 'completed' ? (
                            <CheckCircle color="success" />
                          ) : (
                            <RadioButtonUnchecked color="action" />
                          )}
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" fontWeight={600}>
                            {project.name}
                          </Typography>
                        </Box>
                        <PriorityBadge priority={project.priority} label={project.priority} size="small" />
                        <StatusBadge status={project.status} label={project.status} size="small" />
                        <Typography variant="caption" color="text.secondary" sx={{ minWidth: '50px', textAlign: 'right' }}>
                          {project.progress}%
                        </Typography>
                      </Stack>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Box sx={{ pl: 4 }}>
                        <LinearProgress
                          variant="determinate"
                          value={project.progress}
                          sx={{ mb: 2, height: 4, borderRadius: 1 }}
                        />

                        {project.tasks.map((task, idx) => (
                          <TaskItem key={idx} completed={task.status === 'completed'}>
                            <Box sx={{ mr: 2 }}>
                              {task.status === 'completed' ? (
                                <CheckCircle fontSize="small" color="success" />
                              ) : (
                                <RadioButtonUnchecked fontSize="small" color="action" />
                              )}
                            </Box>
                            <Typography
                              variant="body2"
                              sx={{
                                flex: 1,
                                textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                              }}
                            >
                              {task.name}
                            </Typography>
                            <PriorityBadge priority={task.priority} label={task.priority} size="small" />
                          </TaskItem>
                        ))}
                      </Box>
                    </AccordionDetails>
                  </ProjectAccordion>
                ))}
              </Box>
            </AccordionDetails>
          </CategoryAccordion>
        );
      })}

      <Box sx={{ mt: 3, p: 2, bgcolor: 'primary.light', borderRadius: 2 }}>
        <Typography variant="caption" color="primary.contrastText" fontWeight={600}>
          💡 STRATEGY: Start with Core Data → Display → Backend → AI → Productize
        </Typography>
      </Box>
    </StyledPaper>
  );
};

export default ProjectManagementPanel;
