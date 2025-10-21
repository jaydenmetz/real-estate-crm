import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  CircularProgress,
  Alert,
  IconButton,
  Typography
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  X as CloseIcon
} from 'lucide-react';
import { styled } from '@mui/material/styles';
import { escrowsAPI } from '../../../services/api.service';
import { useEscrowWebSocket } from '../../../hooks/useEscrowWebSocket';

// Components
import EscrowDetailHero from './components/EscrowDetailHero';
import ActivityFeedBottomTab from './components/ActivityFeedBottomTab';

// Phase 2: New white card widgets
import TimelineWidget_White from './components/TimelineWidget_White';
import FinancialsWidget_White from './components/FinancialsWidget_White';
import PeopleWidget_White from './components/PeopleWidget_White';
import ChecklistsWidget_White from './components/ChecklistsWidget_White';
import PlaceholderWidget from './components/PlaceholderWidget';

// Modals (Phase 3: All modals have gradient headers)
import FinancialsModal from './modals/FinancialsModal';
import TimelineModal from './modals/TimelineModal';
import PeopleModal from './modals/PeopleModal';
import ChecklistsModal from './modals/ChecklistsModal';

const PageContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  maxWidth: '100vw',
  padding: theme.spacing(3),
  minHeight: 'calc(100vh - 64px)',
  backgroundColor: theme.palette.grey[50],
  paddingBottom: theme.spacing(10), // Space for activity feed tab
}));

const ContentWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  width: '100%',
  maxWidth: '1800px',
  margin: '0 auto',
  position: 'relative',
}));

const MainContent = styled(Box)(({ theme }) => ({
  flex: 1,
  maxWidth: '1200px',
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(3),
}));

const Sidebar = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'collapsed' && prop !== 'side',
})(({ collapsed, side, theme }) => ({
  position: 'fixed',
  top: 88, // Below navbar (64px) + padding
  [side]: collapsed ? -280 : 24, // Slide in/out from edge
  width: 280,
  height: 'calc(100vh - 112px)', // Full height minus navbar and padding
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.spacing(2),
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  overflow: 'hidden',
  transition: `${side} 0.3s ease-in-out`,
  zIndex: 10,
  [theme.breakpoints.down('lg')]: {
    display: 'none',
  },
}));

const SidebarHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(2),
  borderBottom: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
}));

const SidebarContent = styled(Box)(({ theme }) => ({
  flex: 1,
  padding: theme.spacing(2),
  overflowY: 'auto',
  '&::-webkit-scrollbar': {
    width: 6,
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: theme.palette.grey[300],
    borderRadius: 3,
  },
}));

const WidgetsGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gridTemplateRows: 'repeat(2, 190px)',
  gap: theme.spacing(2),
  height: 400,
  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: '1fr',
    gridTemplateRows: 'auto',
    height: 'auto',
  },
}));

// Floating toggle buttons with shadow (visible when sidebars collapsed)
const ToggleButton = styled(IconButton)(({ theme, side }) => ({
  position: 'fixed',
  top: '50%',
  transform: 'translateY(-50%)',
  [side]: 16,
  zIndex: 100,
  backgroundColor: theme.palette.background.paper,
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  width: 40,
  height: 40,
  '&:hover': {
    backgroundColor: theme.palette.primary.main,
    boxShadow: '0 6px 16px rgba(0, 0, 0, 0.25)',
    '& svg': {
      color: 'white',
    },
  },
  '& svg': {
    color: theme.palette.text.secondary,
  },
}));

const EscrowDetailCompact = () => {
  const { id } = useParams();
  const [escrow, setEscrow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sidebar collapse states (localStorage persistence)
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(() => {
    return localStorage.getItem('escrowDetail_leftSidebarCollapsed') === 'true';
  });
  const [rightSidebarCollapsed, setRightSidebarCollapsed] = useState(() => {
    return localStorage.getItem('escrowDetail_rightSidebarCollapsed') === 'true';
  });

  // Modal states
  const [financialsModalOpen, setFinancialsModalOpen] = useState(false);
  const [timelineModalOpen, setTimelineModalOpen] = useState(false);
  const [peopleModalOpen, setPeopleModalOpen] = useState(false);
  const [checklistsModalOpen, setChecklistsModalOpen] = useState(false);

  // Save sidebar states to localStorage
  useEffect(() => {
    localStorage.setItem('escrowDetail_leftSidebarCollapsed', leftSidebarCollapsed);
  }, [leftSidebarCollapsed]);

  useEffect(() => {
    localStorage.setItem('escrowDetail_rightSidebarCollapsed', rightSidebarCollapsed);
  }, [rightSidebarCollapsed]);

  // Fetch escrow data
  useEffect(() => {
    const fetchEscrow = async () => {
      try {
        setLoading(true);
        const response = await escrowsAPI.getById(id);
        if (response.success) {
          console.log('Escrow data received:', response.data);
          setEscrow(response.data);
        } else {
          setError('Failed to load escrow details');
        }
      } catch (err) {
        console.error('Error fetching escrow:', err);
        setError(err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchEscrow();
    }
  }, [id]);

  // WebSocket real-time updates
  const { connected } = useEscrowWebSocket(id, {
    onEscrowUpdate: (data) => {
      console.log('WebSocket escrow update:', data);
      if (escrow) {
        escrowsAPI.getById(id).then(response => {
          if (response.success) setEscrow(response.data);
        });
      }
    },
  });

  const handleUpdate = (updates) => {
    setEscrow(prev => ({ ...prev, ...updates }));
  };

  const handleActivityFeedClick = () => {
    console.log('Activity feed clicked - will implement in Phase 4');
  };

  if (loading) {
    return (
      <PageContainer>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <Alert severity="error">{error}</Alert>
      </PageContainer>
    );
  }

  if (!escrow) {
    return (
      <PageContainer>
        <Alert severity="warning">Escrow not found</Alert>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {/* Left Sidebar - Fixed position */}
      <Sidebar collapsed={leftSidebarCollapsed} side="left">
        <SidebarHeader>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <Typography variant="subtitle2" fontWeight="600" color="text.secondary">
              Quick Actions
            </Typography>
            <IconButton
              size="small"
              onClick={() => setLeftSidebarCollapsed(true)}
            >
              <CloseIcon size={18} />
            </IconButton>
          </Box>
        </SidebarHeader>
        <SidebarContent>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 4 }}>
            Coming Soon
          </Typography>
        </SidebarContent>
      </Sidebar>

      {/* Right Sidebar - Fixed position */}
      <Sidebar collapsed={rightSidebarCollapsed} side="right">
        <SidebarHeader>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <IconButton
              size="small"
              onClick={() => setRightSidebarCollapsed(true)}
            >
              <CloseIcon size={18} />
            </IconButton>
            <Typography variant="subtitle2" fontWeight="600" color="text.secondary">
              Smart Context
            </Typography>
          </Box>
        </SidebarHeader>
        <SidebarContent>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 4 }}>
            Coming Soon
          </Typography>
        </SidebarContent>
      </Sidebar>

      {/* Main Content - Centered */}
      <ContentWrapper>
        <MainContent>
          {/* New Hero */}
          <EscrowDetailHero
            escrow={escrow}
            onUpdate={handleUpdate}
          />

          {/* Phase 2: New White Card Widgets */}
          <WidgetsGrid>
            <TimelineWidget_White
              escrow={escrow}
              loading={false}
              onClick={() => setTimelineModalOpen(true)}
            />

            <FinancialsWidget_White
              escrow={escrow}
              loading={false}
              onClick={() => setFinancialsModalOpen(true)}
            />

            <PeopleWidget_White
              escrow={escrow}
              loading={false}
              onClick={() => setPeopleModalOpen(true)}
            />

            <ChecklistsWidget_White
              escrow={escrow}
              loading={false}
              onClick={() => setChecklistsModalOpen(true)}
            />
          </WidgetsGrid>

          {/* 5th Widget - Full Width Placeholder */}
          <Box sx={{ mt: 2 }}>
            <PlaceholderWidget />
          </Box>
        </MainContent>
      </ContentWrapper>

      {/* Floating toggle buttons */}
      {leftSidebarCollapsed && (
        <ToggleButton
          side="left"
          onClick={() => setLeftSidebarCollapsed(false)}
        >
          <ChevronRight size={20} />
        </ToggleButton>
      )}

      {rightSidebarCollapsed && (
        <ToggleButton
          side="right"
          onClick={() => setRightSidebarCollapsed(false)}
        >
          <ChevronLeft size={20} />
        </ToggleButton>
      )}

      {/* Activity Feed Bottom Tab */}
      <ActivityFeedBottomTab onClick={handleActivityFeedClick} />

      {/* Detail Modals (will update in Phase 3) */}
      <FinancialsModal
        open={financialsModalOpen}
        onClose={() => setFinancialsModalOpen(false)}
        escrow={escrow}
        onUpdate={handleUpdate}
      />

      <TimelineModal
        open={timelineModalOpen}
        onClose={() => setTimelineModalOpen(false)}
        escrow={escrow}
        onUpdate={handleUpdate}
      />

      <PeopleModal
        open={peopleModalOpen}
        onClose={() => setPeopleModalOpen(false)}
        escrow={escrow}
        onUpdate={handleUpdate}
      />

      <ChecklistsModal
        open={checklistsModalOpen}
        onClose={() => setChecklistsModalOpen(false)}
        escrow={escrow}
        onUpdate={handleUpdate}
      />
    </PageContainer>
  );
};

export default EscrowDetailCompact;
