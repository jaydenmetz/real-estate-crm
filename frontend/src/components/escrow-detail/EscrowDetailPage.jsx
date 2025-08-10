import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  Container,
  Tabs,
  Tab,
  Paper,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery,
  Fade,
  Backdrop
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
  ArrowBack as ArrowBackIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Import custom hooks and API
import { useEscrowData } from './hooks/useEscrowData';
import { useThemeMode } from '../../hooks/useThemeMode';

// Import Dashboard widgets
import DetailsWidget from './widgets/DetailsWidget';
import PropertyWidget from './widgets/PropertyWidget';
import PeopleWidget from './widgets/PeopleWidget';
import TimelineWidget from './widgets/TimelineWidget';
import FinancialsWidget from './widgets/FinancialsWidget';
import ChecklistWidget from './widgets/ChecklistWidget';

// Import Data Editor components
import DataEditorView from './data-editor/DataEditorView';

// Import Debug Panel
import EscrowDebugPanel from './EscrowDebugPanel';

// Styled components with glassmorphism
const StyledContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(3),
  paddingBottom: theme.spacing(3),
  minHeight: '100vh',
  background: theme.palette.mode === 'dark' 
    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
}));

const GlassCard = styled(Paper)(({ theme }) => ({
  background: theme.palette.mode === 'dark'
    ? 'rgba(30, 30, 30, 0.8)'
    : 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(20px)',
  borderRadius: theme.spacing(2),
  border: `1px solid ${theme.palette.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.1)' 
    : 'rgba(255, 255, 255, 0.3)'}`,
  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
  overflow: 'hidden',
  transition: 'all 0.3s ease',
}));

const StyledTabs = styled(Tabs)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.divider}`,
  '& .MuiTabs-indicator': {
    height: 3,
    borderRadius: '3px 3px 0 0',
    background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
  },
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '1rem',
  marginRight: theme.spacing(4),
  minHeight: 64,
  '&.Mui-selected': {
    color: theme.palette.mode === 'dark' ? '#fff' : '#667eea',
  },
}));

const HeaderBar = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(2, 3),
  borderBottom: `1px solid ${theme.palette.divider}`,
  background: theme.palette.mode === 'dark'
    ? 'rgba(0, 0, 0, 0.3)'
    : 'rgba(255, 255, 255, 0.5)',
}));

const WidgetGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(3),
  padding: theme.spacing(3),
  [theme.breakpoints.up('xs')]: {
    gridTemplateColumns: '1fr',
  },
  [theme.breakpoints.up('sm')]: {
    gridTemplateColumns: 'repeat(2, 1fr)',
  },
  [theme.breakpoints.up('md')]: {
    gridTemplateColumns: 'repeat(3, 1fr)',
  },
  [theme.breakpoints.up('lg')]: {
    gridTemplateColumns: 'repeat(4, 1fr)',
  },
}));

function EscrowDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { isDarkMode, toggleDarkMode } = useThemeMode();
  
  const [activeTab, setActiveTab] = useState(0);
  const [expandedWidget, setExpandedWidget] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Fetch escrow data
  const {
    data,
    loading,
    error,
    refetch,
    updateSection,
    hasUnsavedChanges,
    saveAllChanges
  } = useEscrowData(id);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setExpandedWidget(null);
  };

  // Handle widget expansion
  const handleWidgetExpand = useCallback((widgetId) => {
    setExpandedWidget(expandedWidget === widgetId ? null : widgetId);
  }, [expandedWidget]);

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // Handle save all (for data editor)
  const handleSaveAll = async () => {
    await saveAllChanges();
  };

  if (loading && !data) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        <CircularProgress size={60} sx={{ color: 'white' }} />
      </Box>
    );
  }

  if (error) {
    // Check if user is admin for debug panel
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    const isAdmin = user && (user.role === 'admin' || user.role === 'system_admin');
    
    return (
      <StyledContainer maxWidth={false}>
        {isAdmin ? (
          <Box sx={{ maxWidth: 1400, margin: '0 auto', p: 2 }}>
            <EscrowDebugPanel error={error} escrowId={escrowId} />
          </Box>
        ) : (
          <GlassCard sx={{ p: 4, textAlign: 'center' }}>
            <Alert severity="error" sx={{ mb: 2 }}>
              {error.message || 'Failed to load escrow details'}
            </Alert>
            <Box>
              <IconButton onClick={() => navigate('/escrows')} sx={{ mr: 2 }}>
                <ArrowBackIcon />
              </IconButton>
              <IconButton onClick={handleRefresh}>
                <RefreshIcon />
              </IconButton>
            </Box>
          </GlassCard>
        )}
      </StyledContainer>
    );
  }

  return (
    <StyledContainer maxWidth={false}>
      <GlassCard elevation={0}>
        {/* Header */}
        <HeaderBar>
          <Box display="flex" alignItems="center" gap={2}>
            <Tooltip title="Back to Escrows">
              <IconButton onClick={() => navigate('/escrows')} size="large">
                <ArrowBackIcon />
              </IconButton>
            </Tooltip>
            <Box>
              <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ margin: 0, fontSize: '1.5rem' }}
              >
                {data?.details?.escrowNumber || 'Escrow Details'}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                style={{ margin: 0, fontSize: '0.875rem', opacity: 0.7 }}
              >
                {data?.details?.propertyAddress}
              </motion.p>
            </Box>
          </Box>
          
          <Box display="flex" alignItems="center" gap={1}>
            {hasUnsavedChanges && activeTab === 1 && (
              <Tooltip title="Save All Changes">
                <IconButton onClick={handleSaveAll} color="primary">
                  <SaveIcon />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title={isRefreshing ? "Refreshing..." : "Refresh Data"}>
              <span>
                <IconButton 
                  onClick={handleRefresh} 
                  disabled={isRefreshing}
                >
                  <motion.div
                    animate={isRefreshing ? { rotate: 360 } : {}}
                    transition={{ duration: 1, repeat: isRefreshing ? Infinity : 0 }}
                  >
                    <RefreshIcon />
                  </motion.div>
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title={isDarkMode ? "Light Mode" : "Dark Mode"}>
              <IconButton onClick={toggleDarkMode}>
                {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
            </Tooltip>
          </Box>
        </HeaderBar>

        {/* Tabs */}
        <StyledTabs
          value={activeTab}
          onChange={handleTabChange}
          aria-label="escrow detail tabs"
        >
          <StyledTab
            icon={<DashboardIcon />}
            iconPosition="start"
            label="Dashboard"
          />
          <StyledTab
            icon={<EditIcon />}
            iconPosition="start"
            label="Data Editor"
          />
        </StyledTabs>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 0 ? (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <WidgetGrid>
                {/* Details Widget */}
                <Box gridColumn={isMobile ? 'span 1' : 'span 2'}>
                  <DetailsWidget
                    data={data?.details}
                    expanded={expandedWidget === 'details'}
                    onExpand={() => handleWidgetExpand('details')}
                    onUpdate={(changes) => updateSection('details', changes)}
                  />
                </Box>

                {/* Property Widget */}
                <Box gridColumn={isMobile ? 'span 1' : 'span 2'}>
                  <PropertyWidget
                    data={data?.['property-details']}
                    expanded={expandedWidget === 'property'}
                    onExpand={() => handleWidgetExpand('property')}
                    onUpdate={(changes) => updateSection('property-details', changes)}
                  />
                </Box>

                {/* People Widget */}
                <PeopleWidget
                  data={data?.people}
                  expanded={expandedWidget === 'people'}
                  onExpand={() => handleWidgetExpand('people')}
                  onUpdate={(changes) => updateSection('people', changes)}
                />

                {/* Timeline Widget */}
                <TimelineWidget
                  data={data?.timeline}
                  expanded={expandedWidget === 'timeline'}
                  onExpand={() => handleWidgetExpand('timeline')}
                  onUpdate={(changes) => updateSection('timeline', changes)}
                />

                {/* Financials Widget */}
                <Box gridColumn={isMobile ? 'span 1' : 'span 2'}>
                  <FinancialsWidget
                    data={data?.financials}
                    expanded={expandedWidget === 'financials'}
                    onExpand={() => handleWidgetExpand('financials')}
                    onUpdate={(changes) => updateSection('financials', changes)}
                  />
                </Box>

                {/* Checklist Widgets */}
                <ChecklistWidget
                  title="Loan Checklist"
                  data={data?.['checklist-loan']}
                  type="loan"
                  expanded={expandedWidget === 'checklist-loan'}
                  onExpand={() => handleWidgetExpand('checklist-loan')}
                  onUpdate={(changes) => updateSection('checklist-loan', changes)}
                />

                <ChecklistWidget
                  title="House Checklist"
                  data={data?.['checklist-house']}
                  type="house"
                  expanded={expandedWidget === 'checklist-house'}
                  onExpand={() => handleWidgetExpand('checklist-house')}
                  onUpdate={(changes) => updateSection('checklist-house', changes)}
                />

                <ChecklistWidget
                  title="Admin Checklist"
                  data={data?.['checklist-admin']}
                  type="admin"
                  expanded={expandedWidget === 'checklist-admin'}
                  onExpand={() => handleWidgetExpand('checklist-admin')}
                  onUpdate={(changes) => updateSection('checklist-admin', changes)}
                />
              </WidgetGrid>
            </motion.div>
          ) : (
            <motion.div
              key="editor"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <DataEditorView
                data={data}
                onUpdate={updateSection}
                hasUnsavedChanges={hasUnsavedChanges}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </GlassCard>

      {/* Expanded Widget Backdrop */}
      <Backdrop
        open={expandedWidget !== null}
        onClick={() => setExpandedWidget(null)}
        sx={{
          zIndex: theme.zIndex.drawer - 1,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(5px)',
        }}
      />
    </StyledContainer>
  );
}

export default EscrowDetailPage;