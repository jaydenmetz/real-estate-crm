import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  Container,
  Tabs,
  Tab,
  Paper,
  useTheme,
  Backdrop
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Import custom hooks and utilities
import { useEscrowData } from './hooks/useEscrowData';
// import { useThemeMode } from '../../../hooks/useThemeMode'; // TODO: Create this hook or remove dark mode toggle
// PHASE 2: Removed emergency auth utility (now handled by AuthContext auto-refresh)

// Import Data Editor components
import DataEditorView from './components/DataEditorView';

// Import Debug Panels
import EscrowDebugPanel from './components/EscrowDebugPanel';

// PHASE 2-6: Import refactored components
import EscrowHeroCard from './components/EscrowHeroCard';
import EscrowLeftSidebar from './components/EscrowLeftSidebar';
import EscrowRightSidebar from './components/EscrowRightSidebar';
import EscrowMainContent from './components/EscrowMainContent';
import EscrowDetailHeader from './components/EscrowDetailHeader';
import EscrowLoadingState from './components/EscrowLoadingState';
import EscrowErrorState from './components/EscrowErrorState';

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

function EscrowDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);
  
  const [activeTab, setActiveTab] = useState(0);
  const [expandedWidget, setExpandedWidget] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // PHASE 3: Sidebar state
  const [notes, setNotes] = useState('');
  const [reminders, setReminders] = useState([
    { id: 1, text: 'Follow up on inspection report', completed: false },
    { id: 2, text: 'Request appraisal update', completed: false },
  ]);
  const [automations, setAutomations] = useState({
    contingencyReminders: true,
    documentTracking: true,
    closingReminders: false,
  });
  
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

  // PHASE 2: Handle refresh (removed emergency auth logic)
  const handleRefresh = async () => {
    setIsRefreshing(true);

    // PHASE 2: AuthContext now handles token refresh automatically
    // No need for manual emergency auth here
    await refetch();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // Handle save all (for data editor)
  const handleSaveAll = async () => {
    await saveAllChanges();
  };

  // PHASE 5-6: Sidebar handlers (using utilities)
  const handleReminderToggle = (id) => {
    setReminders(reminders.map(r =>
      r.id === id ? { ...r, completed: !r.completed } : r
    ));
  };

  const handleAddReminder = (text) => {
    setReminders([...reminders, { id: Date.now(), text, completed: false }]);
  };

  const handleDeleteReminder = (id) => {
    setReminders(reminders.filter(r => r.id !== id));
  };

  const handleToggleAutomation = (key) => {
    setAutomations({ ...automations, [key]: !automations[key] });
  };

  const handleQuickAction = (action) => {
    console.log('Quick action:', action);
    // TODO: Implement actual quick actions
  };

  // PHASE 6: Loading state component
  if (loading && !data) {
    return <EscrowLoadingState />;
  }

  // PHASE 6: Error state component
  if (error) {
    return (
      <EscrowErrorState
        error={error}
        escrowId={id}
        onBack={() => navigate('/escrows')}
        onRefresh={handleRefresh}
      />
    );
  }

  return (
    <StyledContainer maxWidth={false}>
      <GlassCard elevation={0}>
        {/* PHASE 5: Header Component */}
        <EscrowDetailHeader
          escrowNumber={data?.details?.escrowNumber}
          propertyAddress={data?.details?.propertyAddress}
          hasUnsavedChanges={hasUnsavedChanges}
          isRefreshing={isRefreshing}
          isDarkMode={isDarkMode}
          onBack={() => navigate('/escrows')}
          onSave={handleSaveAll}
          onRefresh={handleRefresh}
          onToggleDarkMode={toggleDarkMode}
          showSaveButton={activeTab === 1}
        />

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
              {/* PHASE 2: Test new hero card */}
              <EscrowHeroCard
                escrow={data}
                onEmailParties={() => console.log('Email all parties')}
                onGenerateStatement={() => console.log('Generate statement')}
                onMoreActions={() => console.log('More actions')}
              />

              {/* PHASE 3: Three-column layout with sidebars */}
              <Box display="flex">
                {/* Left Sidebar */}
                <EscrowLeftSidebar
                  escrowId={id}
                  notes={notes}
                  onNotesChange={setNotes}
                  reminders={reminders}
                  onReminderToggle={handleReminderToggle}
                  onAddReminder={handleAddReminder}
                  onDeleteReminder={handleDeleteReminder}
                />

                {/* PHASE 4: Main Content with widget grid */}
                <EscrowMainContent
                  data={data}
                  expandedWidget={expandedWidget}
                  onWidgetExpand={handleWidgetExpand}
                  onUpdateSection={updateSection}
                />

                {/* Right Sidebar */}
                <EscrowRightSidebar
                  escrowId={id}
                  automations={automations}
                  onToggleAutomation={handleToggleAutomation}
                  dealHealth={{
                    percentage: 85,
                    indicators: [
                      { type: 'success', text: 'All documents received' },
                      { type: 'warning', text: 'Appraisal pending' },
                    ],
                  }}
                  onQuickAction={handleQuickAction}
                />
              </Box>
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