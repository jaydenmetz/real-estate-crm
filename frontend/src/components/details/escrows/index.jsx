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
import ActivityFeedSheet from './components/ActivityFeedSheet';

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
  minHeight: 'calc(100vh - 64px)',
  backgroundColor: theme.palette.grey[50],
  paddingBottom: theme.spacing(10), // Space for activity feed tab
}));

const LayoutContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(3),
  maxWidth: '1800px',
  margin: '0 auto',
  paddingTop: theme.spacing(3), // Top padding to match hero
  paddingBottom: theme.spacing(3), // Bottom padding
  paddingLeft: theme.spacing(8), // Extra padding for left toggle button space
  paddingRight: theme.spacing(8), // Extra padding for right toggle button space
  position: 'relative',
  [theme.breakpoints.down('lg')]: {
    flexDirection: 'column',
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3),
  },
}));

const Sidebar = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isOpen',
})(({ isOpen, theme }) => ({
  width: isOpen ? 280 : 0,
  opacity: isOpen ? 1 : 0,
  overflow: 'hidden',
  transition: 'all 0.3s ease-in-out',
  flexShrink: 0,
  alignSelf: 'stretch', // Stretch to match container height
  [theme.breakpoints.down('lg')]: {
    display: 'none',
  },
}));

const SidebarInner = styled(Box)(({ theme }) => ({
  width: 280,
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.spacing(2),
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  display: 'flex',
  flexDirection: 'column',
  height: '100%', // Match parent height (full content area)
}));

const MainContent = styled(Box)(({ theme }) => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(3),
  minWidth: 0, // Allow flex shrinking
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
  gridTemplateRows: 'auto auto', // Auto height rows to fit content
  gap: theme.spacing(2),
  alignItems: 'start', // Align widgets to top of their grid cell
  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: '1fr',
    gridTemplateRows: 'auto',
  },
}));

// Toggle buttons centered in margin space (visible when sidebars collapsed)
const ToggleButton = styled(IconButton)(({ theme, side }) => ({
  position: 'fixed',
  top: '50%',
  transform: 'translateY(-50%)',
  // Calculate position: viewport edge + half of margin space - half of button width
  // Margin space is 64px (theme.spacing(8)), button is 36px wide
  // So center point is at: edge + 32px (half margin) - 18px (half button) = edge + 14px
  [side]: 'calc((100vw - 1800px) / 2 + 32px - 18px)', // Centered in margin for max-width screens
  '@media (max-width: 1864px)': {
    // For screens smaller than maxWidth + margins
    [side]: 14, // edge + (64/2) - (36/2) = 14px from edge
  },
  zIndex: 100,
  backgroundColor: theme.palette.background.paper,
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  width: 36,
  height: 44,
  borderRadius: theme.spacing(1),
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
  [theme.breakpoints.down('lg')]: {
    display: 'none',
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

  // Activity feed state (Phase 4)
  const [activityFeedOpen, setActivityFeedOpen] = useState(false);

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
    setActivityFeedOpen(true);
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
      {/* Main Layout with Sidebars - Includes Hero and Widgets */}
      <LayoutContainer>
        {/* Left Sidebar */}
        <Sidebar isOpen={!leftSidebarCollapsed}>
          <SidebarInner>
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
          </SidebarInner>
        </Sidebar>

        {/* Main Content - Hero + Widgets */}
        <MainContent>
          {/* Hero Card */}
          <EscrowDetailHero
            escrow={escrow}
            onUpdate={handleUpdate}
          />

          {/* Phase 2: New White Card Widgets */}
          <WidgetsGrid>
            {/* Top Row: Timeline (left) | Checklists (right) */}
            <TimelineWidget_White
              escrow={escrow}
              loading={false}
              onClick={() => setTimelineModalOpen(true)}
            />

            <ChecklistsWidget_White
              escrow={escrow}
              loading={false}
              onClick={() => setChecklistsModalOpen(true)}
            />

            {/* Bottom Row: People (left) | Financials (right) */}
            <PeopleWidget_White
              escrow={escrow}
              loading={false}
              onClick={() => setPeopleModalOpen(true)}
              onUpdate={handleUpdate}
            />

            <FinancialsWidget_White
              escrow={escrow}
              loading={false}
              onClick={() => setFinancialsModalOpen(true)}
            />
          </WidgetsGrid>

          {/* 5th Widget - Full Width Placeholder */}
          <PlaceholderWidget />
        </MainContent>

        {/* Right Sidebar */}
        <Sidebar isOpen={!rightSidebarCollapsed}>
          <SidebarInner>
            <SidebarHeader>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <Typography variant="subtitle2" fontWeight="600" color="text.secondary">
                  Smart Context
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => setRightSidebarCollapsed(true)}
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
          </SidebarInner>
        </Sidebar>
      </LayoutContainer>

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

      {/* Activity Feed Bottom Tab - Full Width */}
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

      {/* Phase 4: Activity Feed Sheet */}
      <ActivityFeedSheet
        open={activityFeedOpen}
        onClose={() => setActivityFeedOpen(false)}
        escrow={escrow}
      />
    </PageContainer>
  );
};

export default EscrowDetailCompact;
