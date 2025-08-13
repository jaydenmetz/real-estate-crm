import React, { useState } from 'react';
import {
  Box,
  Card,
  Typography,
  Grid,
  Chip,
  IconButton,
  Stack,
  LinearProgress,
  Button,
  Paper,
  Checkbox,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
  Tab,
  Tabs,
  Badge,
  Tooltip
} from '@mui/material';
import {
  CheckCircle,
  RadioButtonUnchecked,
  Assignment,
  Home,
  AccountBalance,
  Gavel,
  Engineering,
  AttachMoney,
  Description,
  Edit,
  ExpandMore,
  ExpandLess,
  PlaylistAddCheck,
  Warning,
  Schedule,
  AssignmentTurnedIn,
  AssignmentLate,
  CheckBox,
  CheckBoxOutlineBlank,
  Verified
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';

const WidgetContainer = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  padding: theme.spacing(3),
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
  background: 'white'
}));

const ChecklistCard = styled(Paper)(({ theme, status }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.spacing(1.5),
  border: `2px solid ${
    status === 'completed' ? theme.palette.success.light :
    status === 'in_progress' ? theme.palette.warning.light :
    theme.palette.grey[300]
  }`,
  backgroundColor: 
    status === 'completed' ? theme.palette.success.light + '10' :
    status === 'in_progress' ? theme.palette.warning.light + '10' :
    'white',
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.1)'
  }
}));

const StyledTabs = styled(Tabs)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.divider}`,
  marginBottom: theme.spacing(3),
  '& .MuiTab-root': {
    textTransform: 'none',
    fontWeight: 600,
    minHeight: 48
  },
  '& .MuiTabs-indicator': {
    backgroundColor: theme.palette.primary.main,
    height: 3
  }
}));

const ProgressBar = styled(LinearProgress)(({ theme }) => ({
  height: 6,
  borderRadius: 3,
  backgroundColor: theme.palette.grey[200],
  '& .MuiLinearProgress-bar': {
    borderRadius: 3,
    background: 'linear-gradient(90deg, #764ba2 0%, #667eea 100%)'
  }
}));

const ChecklistItem = styled(ListItem)(({ theme, checked }) => ({
  borderRadius: theme.spacing(1),
  marginBottom: theme.spacing(1),
  backgroundColor: checked ? theme.palette.success.light + '10' : 'transparent',
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: theme.palette.action.hover
  }
}));

const CategoryIcon = ({ category, size = 'medium' }) => {
  const iconProps = { fontSize: size };
  switch(category) {
    case 'loan':
      return <AccountBalance {...iconProps} />;
    case 'property':
    case 'house':
      return <Home {...iconProps} />;
    case 'title':
      return <Gavel {...iconProps} />;
    case 'inspection':
      return <Engineering {...iconProps} />;
    case 'appraisal':
      return <AttachMoney {...iconProps} />;
    case 'documents':
    case 'admin':
      return <Description {...iconProps} />;
    default:
      return <Assignment {...iconProps} />;
  }
};

const ChecklistsWidget = ({ data = {}, onEdit, onToggleItem }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [expandedCategories, setExpandedCategories] = useState({});

  // Default checklist structure
  const defaultChecklists = {
    loan: {
      preApproval: false,
      loanApplication: false,
      incomeVerification: false,
      creditCheck: false,
      appraisalOrdered: false,
      underwriting: false,
      clearToClose: false,
      finalApproval: false
    },
    house: {
      initialWalkthrough: false,
      inspectionScheduled: false,
      inspectionCompleted: false,
      repairNegotiation: false,
      repairsCompleted: false,
      reinspection: false,
      finalWalkthrough: false,
      utilities: false
    },
    title: {
      titleOrdered: false,
      titleSearch: false,
      titleCleared: false,
      titleInsurance: false,
      deedPrepared: false,
      recordingScheduled: false
    },
    admin: {
      purchaseAgreement: false,
      escrowOpened: false,
      earnestMoneyDeposited: false,
      contingencyRemoval: false,
      closingDisclosure: false,
      finalDocsSigned: false,
      fundingCompleted: false,
      keysDelivered: false
    }
  };

  // Merge default with actual data
  const checklists = {
    loan: { ...defaultChecklists.loan, ...(data.loan || {}) },
    house: { ...defaultChecklists.house, ...(data.house || {}) },
    title: { ...defaultChecklists.title, ...(data.title || {}) },
    admin: { ...defaultChecklists.admin, ...(data.admin || {}) }
  };

  // Category metadata
  const categories = [
    { id: 'loan', label: 'Loan & Financing', icon: AccountBalance, color: 'primary' },
    { id: 'house', label: 'Property & Inspection', icon: Home, color: 'success' },
    { id: 'title', label: 'Title & Legal', icon: Gavel, color: 'warning' },
    { id: 'admin', label: 'Administrative', icon: Description, color: 'info' }
  ];

  // Calculate progress for each category
  const calculateProgress = (category) => {
    const items = Object.values(checklists[category] || {});
    const completed = items.filter(Boolean).length;
    return items.length > 0 ? (completed / items.length) * 100 : 0;
  };

  // Calculate overall progress
  const overallProgress = () => {
    const allItems = Object.values(checklists).flatMap(cat => Object.values(cat));
    const completed = allItems.filter(Boolean).length;
    return allItems.length > 0 ? (completed / allItems.length) * 100 : 0;
  };

  // Get category status
  const getCategoryStatus = (category) => {
    const progress = calculateProgress(category);
    if (progress === 100) return 'completed';
    if (progress > 0) return 'in_progress';
    return 'pending';
  };

  // Toggle category expansion
  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  // Handle checkbox toggle
  const handleCheckToggle = (category, item) => {
    onToggleItem?.(category, item, !checklists[category][item]);
  };

  // Format item label
  const formatLabel = (key) => {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  };

  // Count stats
  const totalItems = Object.values(checklists).flatMap(cat => Object.values(cat)).length;
  const completedItems = Object.values(checklists).flatMap(cat => Object.values(cat)).filter(Boolean).length;
  const remainingItems = totalItems - completedItems;

  return (
    <WidgetContainer
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Transaction Checklists
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {completedItems} of {totalItems} tasks completed
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Chip
            icon={<CheckCircle />}
            label={`${completedItems} Done`}
            color="success"
            size="small"
          />
          <Chip
            icon={<Schedule />}
            label={`${remainingItems} Pending`}
            color="warning"
            size="small"
          />
          <IconButton size="small" onClick={() => onEdit?.('checklists')}>
            <Edit />
          </IconButton>
        </Stack>
      </Box>

      {/* Overall Progress */}
      <Paper sx={{ p: 2, mb: 3, bgcolor: 'primary.50', borderRadius: 2 }} elevation={0}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="subtitle2" fontWeight={600}>
            Overall Progress
          </Typography>
          <Typography variant="h6" fontWeight="bold" color="primary">
            {Math.round(overallProgress())}%
          </Typography>
        </Box>
        <ProgressBar variant="determinate" value={overallProgress()} />
      </Paper>

      {/* Category Tabs */}
      <StyledTabs
        value={activeTab}
        onChange={(e, newValue) => setActiveTab(newValue)}
        variant="scrollable"
        scrollButtons="auto"
      >
        <Tab
          label="All Categories"
          icon={
            <Badge badgeContent={totalItems} color="primary">
              <PlaylistAddCheck />
            </Badge>
          }
          iconPosition="start"
        />
        {categories.map((category) => {
          const progress = calculateProgress(category.id);
          const Icon = category.icon;
          return (
            <Tab
              key={category.id}
              label={category.label}
              icon={
                <Badge
                  badgeContent={`${Math.round(progress)}%`}
                  color={progress === 100 ? 'success' : 'default'}
                >
                  <Icon />
                </Badge>
              }
              iconPosition="start"
            />
          );
        })}
      </StyledTabs>

      {/* Content */}
      {activeTab === 0 ? (
        // All Categories View
        <Stack spacing={2}>
          {categories.map((category) => {
            const categoryData = checklists[category.id];
            const status = getCategoryStatus(category.id);
            const progress = calculateProgress(category.id);
            const isExpanded = expandedCategories[category.id];
            
            return (
              <ChecklistCard
                key={category.id}
                status={status}
                elevation={0}
              >
                <Box
                  onClick={() => toggleCategory(category.id)}
                  sx={{ cursor: 'pointer' }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <CategoryIcon category={category.id} />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {category.label}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {Object.values(categoryData).filter(Boolean).length} of{' '}
                        {Object.keys(categoryData).length} completed
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="h6" fontWeight="bold" color={category.color}>
                        {Math.round(progress)}%
                      </Typography>
                    </Box>
                    <IconButton size="small">
                      {isExpanded ? <ExpandLess /> : <ExpandMore />}
                    </IconButton>
                  </Box>
                  <ProgressBar
                    variant="determinate"
                    value={progress}
                    sx={{ mb: 2 }}
                  />
                </Box>
                
                <Collapse in={isExpanded}>
                  <List dense disablePadding>
                    {Object.entries(categoryData).map(([key, value]) => (
                      <ChecklistItem
                        key={key}
                        checked={value}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCheckToggle(category.id, key);
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <Checkbox
                            edge="start"
                            checked={value}
                            tabIndex={-1}
                            disableRipple
                            icon={<CheckBoxOutlineBlank />}
                            checkedIcon={<CheckBox />}
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={formatLabel(key)}
                          primaryTypographyProps={{
                            sx: {
                              textDecoration: value ? 'line-through' : 'none',
                              color: value ? 'text.secondary' : 'text.primary'
                            }
                          }}
                        />
                        {value && (
                          <Verified fontSize="small" sx={{ color: 'success.main' }} />
                        )}
                      </ChecklistItem>
                    ))}
                  </List>
                </Collapse>
              </ChecklistCard>
            );
          })}
        </Stack>
      ) : (
        // Individual Category View
        (() => {
          const category = categories[activeTab - 1];
          const categoryData = checklists[category.id];
          const progress = calculateProgress(category.id);
          
          return (
            <Box>
              <Paper sx={{ p: 3, mb: 3, bgcolor: `${category.color}.50`, borderRadius: 2 }} elevation={0}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item>
                    <CategoryIcon category={category.id} size="large" />
                  </Grid>
                  <Grid item xs>
                    <Typography variant="h6" fontWeight={600}>
                      {category.label}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {Object.values(categoryData).filter(Boolean).length} of{' '}
                      {Object.keys(categoryData).length} tasks completed
                    </Typography>
                  </Grid>
                  <Grid item>
                    <Typography variant="h3" fontWeight="bold" color={category.color}>
                      {Math.round(progress)}%
                    </Typography>
                  </Grid>
                </Grid>
                <ProgressBar
                  variant="determinate"
                  value={progress}
                  sx={{ mt: 2 }}
                />
              </Paper>

              <List>
                <AnimatePresence>
                  {Object.entries(categoryData).map(([key, value], index) => (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <ChecklistItem
                        checked={value}
                        onClick={() => handleCheckToggle(category.id, key)}
                        sx={{ mb: 1 }}
                      >
                        <ListItemIcon>
                          <Checkbox
                            edge="start"
                            checked={value}
                            tabIndex={-1}
                            disableRipple
                            icon={<RadioButtonUnchecked />}
                            checkedIcon={<CheckCircle />}
                            sx={{
                              color: value ? 'success.main' : 'text.disabled',
                              '&.Mui-checked': {
                                color: 'success.main'
                              }
                            }}
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={formatLabel(key)}
                          primaryTypographyProps={{
                            fontWeight: value ? 400 : 600,
                            sx: {
                              textDecoration: value ? 'line-through' : 'none',
                              color: value ? 'text.secondary' : 'text.primary'
                            }
                          }}
                        />
                        {value && (
                          <Chip
                            label="Complete"
                            size="small"
                            color="success"
                            icon={<Verified />}
                          />
                        )}
                      </ChecklistItem>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </List>
            </Box>
          );
        })()
      )}

      {totalItems === 0 && (
        <Box sx={{ py: 6, textAlign: 'center', color: 'text.secondary' }}>
          <Assignment sx={{ fontSize: 48, mb: 2, opacity: 0.3 }} />
          <Typography variant="body1">
            No checklist items configured
          </Typography>
          <Button
            variant="contained"
            sx={{ mt: 2 }}
            onClick={() => onEdit?.('checklists')}
          >
            Configure Checklists
          </Button>
        </Box>
      )}
    </WidgetContainer>
  );
};

export default ChecklistsWidget;