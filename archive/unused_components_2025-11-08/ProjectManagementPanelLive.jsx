import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Paper,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  LinearProgress,
  CircularProgress,
  Alert,
  Stack,
  Grid,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  ExpandMore,
  CheckCircle,
  RadioButtonUnchecked,
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
} from '@mui/icons-material';
import projectsService from '../../services/projects.service';
import tasksService from '../../services/tasks.service';

// Styled Components
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2),
  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  maxHeight: '600px',
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
  marginBottom: theme.spacing(0.75),
  '&.Mui-expanded': {
    margin: `0 0 ${theme.spacing(0.75)}px 0`,
  },
}));

const CompactCategorySummary = styled(AccordionSummary)(({ theme }) => ({
  minHeight: '48px !important',
  '& .MuiAccordionSummary-content': {
    margin: `${theme.spacing(1)} 0`,
  },
}));

const PriorityBadge = styled(Chip)(({ priority, theme }) => {
  const colors = {
    critical: { bg: theme.palette.error.main, text: '#fff' },
    high: { bg: theme.palette.warning.main, text: '#000' },
    medium: { bg: theme.palette.info.main, text: '#fff' },
    low: { bg: theme.palette.grey[400], text: '#000' },
  };
  return {
    backgroundColor: colors[priority]?.bg || colors.medium.bg,
    color: colors[priority]?.text || colors.medium.text,
    fontWeight: 600,
    fontSize: '10px',
  };
});

// Category icons mapping
const CATEGORY_ICONS = {
  'Core Data & Database': <Storage />,
  'Frontend Display & UX': <Code />,
  'Backend Infrastructure': <Build />,
  'Technical Debt': <BugReport />,
  'Security': <Security />,
  'Performance': <Speed />,
  'AI Integration': <SmartToy />,
  'Productization': <Storefront />,
  'Analytics': <Assessment />,
  'Game-Changing Features': <Psychology />,
};

const ProjectManagementPanelLive = () => {
  const [expandedCategories, setExpandedCategories] = useState([]);

  // Fetch all projects
  const { data: projects = [], isLoading, error } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await projectsService.getAll();
      return response;
    },
  });

  // Fetch all tasks for projects
  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks', 'all'],
    queryFn: async () => {
      const response = await tasksService.getAll();
      return response;
    },
    enabled: projects.length > 0,
  });

  // Group projects by category and attach tasks
  const categorizedData = useMemo(() => {
    if (!projects.length) return [];

    // Group projects by category
    const grouped = {};
    projects.forEach((project) => {
      const category = project.category || 'Uncategorized';
      if (!grouped[category]) {
        grouped[category] = {
          category,
          icon: CATEGORY_ICONS[category] || <Build />,
          description: '',
          priority: 'medium',
          projects: [],
        };
      }

      // Find tasks for this project
      const projectTasks = tasks.filter((task) => task.project_id === project.id);
      const totalTasks = projectTasks.length;
      const completedTasks = projectTasks.filter((t) => t.status === 'completed').length;
      const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      grouped[category].projects.push({
        ...project,
        tasks: projectTasks,
        progress: project.progress_percentage || progress,
        total_tasks: totalTasks,
        completed_tasks: completedTasks,
      });
    });

    // Convert to array and sort by priority
    const priorityOrder = { critical: 1, high: 2, medium: 3, low: 4 };
    return Object.values(grouped).sort((a, b) => {
      const maxPriorityA = Math.min(...a.projects.map((p) => priorityOrder[p.priority] || 3));
      const maxPriorityB = Math.min(...b.projects.map((p) => priorityOrder[p.priority] || 3));
      return maxPriorityA - maxPriorityB;
    });
  }, [projects, tasks]);

  // Calculate overall stats
  const overallStats = useMemo(() => {
    const total = projects.length;
    const completed = projects.filter((p) => p.status === 'completed').length;
    const inProgress = projects.filter((p) => p.status === 'in-progress').length;
    const notStarted = projects.filter((p) => p.status === 'not-started').length;

    return {
      total,
      completed,
      inProgress,
      notStarted,
      completionPercentage: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }, [projects]);

  const toggleCategory = (category) => {
    const isExpanded = expandedCategories.includes(category);
    setExpandedCategories(
      isExpanded
        ? expandedCategories.filter((c) => c !== category)
        : [...expandedCategories, category]
    );
  };

  if (isLoading) {
    return (
      <StyledPaper>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
          <CircularProgress />
        </Box>
      </StyledPaper>
    );
  }

  if (error) {
    return (
      <StyledPaper>
        <Alert severity="error">
          Failed to load projects: {error.message}
        </Alert>
      </StyledPaper>
    );
  }

  return (
    <StyledPaper>
      {/* Header */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" fontWeight={700} gutterBottom>
          Development Roadmap
        </Typography>
        <Stack direction="row" spacing={2} sx={{ mb: 1 }}>
          <Chip label={`${overallStats.total} Projects`} size="small" color="default" />
          <Chip label={`${overallStats.completed} Completed`} size="small" color="success" />
          <Chip label={`${overallStats.inProgress} In Progress`} size="small" color="primary" />
          <Chip label={`${overallStats.notStarted} Not Started`} size="small" color="default" />
        </Stack>
        <Box sx={{ mt: 1 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <LinearProgress
              variant="determinate"
              value={overallStats.completionPercentage}
              sx={{ flex: 1, height: 8, borderRadius: 4 }}
            />
            <Typography variant="caption" fontWeight={600}>
              {overallStats.completionPercentage}%
            </Typography>
          </Stack>
        </Box>
      </Box>

      {/* Scrollable Categories */}
      <ScrollableContent>
        {categorizedData.map((category) => {
          const categoryProgress = Math.round(
            category.projects.reduce((sum, p) => sum + (p.progress || 0), 0) / category.projects.length
          );
          const completedProjects = category.projects.filter((p) => p.status === 'completed').length;

          return (
            <CategoryAccordion
              key={category.category}
              expanded={expandedCategories.includes(category.category)}
              onChange={() => toggleCategory(category.category)}
            >
              <CompactCategorySummary expandIcon={<ExpandMore />}>
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ width: '100%' }}>
                  <Box sx={{ color: 'primary.main' }}>{category.icon}</Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" fontWeight={600}>
                      {category.category}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {category.projects.length} projects • {completedProjects} completed
                    </Typography>
                  </Box>
                  <Box sx={{ minWidth: 60, textAlign: 'right' }}>
                    <LinearProgress
                      variant="determinate"
                      value={categoryProgress}
                      sx={{ height: 4, borderRadius: 2, mb: 0.5 }}
                    />
                    <Typography variant="caption" fontWeight={600}>
                      {categoryProgress}%
                    </Typography>
                  </Box>
                </Stack>
              </CompactCategorySummary>

              <AccordionDetails>
                <Box>
                  {category.description && (
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5, display: 'block' }}>
                      {category.description}
                    </Typography>
                  )}

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
                              {project.progress}% ({project.completed_tasks}/{project.total_tasks})
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

export default ProjectManagementPanelLive;
