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
  Menu as MenuIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { escrowsAPI } from '../../../services/api.service';
import { useEscrowWebSocket } from '../../../hooks/useEscrowWebSocket';

// Components
import EscrowHero from './components/EscrowHero';
import LeftSidebar from './components/LeftSidebar';
import RightSidebar from './components/RightSidebar';
import TimelineWidget from './components/TimelineWidget';
import FinancialsWidget from './components/FinancialsWidget';
import PeopleWidget from './components/PeopleWidget';
import DocumentsWidget from './components/DocumentsWidget';
import ActivityFeed from './components/ActivityFeed';

// Modals
import FinancialsModal from './components/FinancialsModal';
import TimelineModal from './components/TimelineModal';
import PeopleModal from './components/PeopleModal';
import DocumentsDetailModal from './modals/DocumentsDetailModal';

// BEST PRACTICE: F-Pattern Layout with integrated sidebar controls
const PageContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  maxWidth: '100vw',
  padding: theme.spacing(2),
  height: 'calc(100vh - 64px)',
  overflow: 'hidden',
  backgroundColor: theme.palette.grey[50],
}));

const FPatternGrid = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'leftCollapsed' && prop !== 'rightCollapsed' && prop !== 'activityCollapsed',
})(({ leftCollapsed, rightCollapsed, activityCollapsed, theme }) => ({
  display: 'grid',
  gridTemplateColumns: `${leftCollapsed ? '0px' : '240px'} 1fr ${rightCollapsed ? '0px' : '240px'} ${activityCollapsed ? '0px' : '320px'}`,
  gap: theme.spacing(2),
  height: '100%',
  maxWidth: '2400px',
  margin: '0 auto',
  transition: 'grid-template-columns 0.3s ease-in-out',
  [theme.breakpoints.down('xl')]: {
    gridTemplateColumns: `${leftCollapsed ? '0px' : '220px'} 1fr ${rightCollapsed ? '0px' : '220px'} ${activityCollapsed ? '0px' : '280px'}`,
  },
  [theme.breakpoints.down('lg')]: {
    gridTemplateColumns: `${leftCollapsed ? '0px' : '200px'} 1fr ${activityCollapsed ? '0px' : '280px'}`,
  },
  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: '1fr',
    overflowY: 'auto',
  },
}));

const MainContent = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1.5),
  overflowY: 'auto',
  paddingRight: theme.spacing(1),
  paddingTop: theme.spacing(0.5),
  paddingBottom: theme.spacing(1),
}));

// BEST PRACTICE: Sidebar with integrated header and collapse button
const SidebarColumn = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'collapsed',
})(({ collapsed, theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  width: collapsed ? 0 : 'auto',
  opacity: collapsed ? 0 : 1,
  transition: 'width 0.3s ease-in-out, opacity 0.3s ease-in-out',
  overflow: 'hidden',
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.spacing(1),
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  [theme.breakpoints.down('md')]: {
    display: 'none',
  },
}));

// BEST PRACTICE: Sidebar header with title and integrated collapse button
const SidebarHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(1.5, 2),
  borderBottom: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
  flexShrink: 0,
}));

const SidebarContent = styled(Box)(({ theme }) => ({
  flex: 1,
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

const EscrowDetailCompact = () => {
  const { id } = useParams();
  const [escrow, setEscrow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sidebar collapse states (localStorage persistence)
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(() => {
    return localStorage.getItem('leftSidebarCollapsed') === 'true';
  });
  const [rightSidebarCollapsed, setRightSidebarCollapsed] = useState(() => {
    return localStorage.getItem('rightSidebarCollapsed') === 'true';
  });
  const [activityCollapsed, setActivityCollapsed] = useState(() => {
    return localStorage.getItem('activityCollapsed') === 'true';
  });

  // Modal states
  const [financialsModalOpen, setFinancialsModalOpen] = useState(false);
  const [timelineModalOpen, setTimelineModalOpen] = useState(false);
  const [peopleModalOpen, setPeopleModalOpen] = useState(false);
  const [documentsModalOpen, setDocumentsModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Save sidebar states to localStorage
  useEffect(() => {
    localStorage.setItem('leftSidebarCollapsed', leftSidebarCollapsed);
  }, [leftSidebarCollapsed]);

  useEffect(() => {
    localStorage.setItem('rightSidebarCollapsed', rightSidebarCollapsed);
  }, [rightSidebarCollapsed]);

  useEffect(() => {
    localStorage.setItem('activityCollapsed', activityCollapsed);
  }, [activityCollapsed]);

  // Fetch escrow data
  useEffect(() => {
    const fetchEscrow = async () => {
      try {
        setLoading(true);
        const response = await escrowsAPI.getById(id);
        if (response.success) {
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
    onPeopleUpdate: (peopleData) => {
      setEscrow(prev => ({ ...prev, people: peopleData }));
    },
    onTimelineUpdate: (timelineData) => {
      setEscrow(prev => ({ ...prev, timeline: timelineData }));
    },
    onFinancialsUpdate: (financialsData) => {
      setEscrow(prev => ({ ...prev, financials: financialsData }));
    },
    onDocumentAdded: (doc) => {
      setEscrow(prev => ({
        ...prev,
        documents: [...(prev.documents || []), doc]
      }));
    },
  });

  const handleUpdate = (updates) => {
    setEscrow(prev => ({ ...prev, ...updates }));
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
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
      <FPatternGrid
        leftCollapsed={leftSidebarCollapsed}
        rightCollapsed={rightSidebarCollapsed}
        activityCollapsed={activityCollapsed}
      >
        {/* BEST PRACTICE: Left Sidebar with Header */}
        <SidebarColumn collapsed={leftSidebarCollapsed}>
          <SidebarHeader>
            <Typography variant="subtitle2" fontWeight="600" color="text.secondary">
              Quick Actions
            </Typography>
            <IconButton
              size="small"
              onClick={() => setLeftSidebarCollapsed(true)}
              sx={{ ml: 1 }}
            >
              <ChevronLeft fontSize="small" />
            </IconButton>
          </SidebarHeader>
          <SidebarContent>
            <LeftSidebar
              escrow={escrow}
              loading={loading}
              onUpdate={handleUpdate}
            />
          </SidebarContent>
        </SidebarColumn>

        {/* Main Content */}
        <MainContent>
          {/* Collapsed Left Sidebar Expand Button */}
          {leftSidebarCollapsed && (
            <IconButton
              size="small"
              onClick={() => setLeftSidebarCollapsed(false)}
              sx={{
                position: 'absolute',
                left: 8,
                top: 8,
                zIndex: 10,
                backgroundColor: 'background.paper',
                boxShadow: 1,
                '&:hover': {
                  backgroundColor: 'primary.main',
                  color: 'white',
                },
              }}
            >
              <MenuIcon fontSize="small" />
            </IconButton>
          )}

          <EscrowHero
            escrow={escrow}
            onUpdate={handleUpdate}
          />

          <WidgetsGrid>
            <TimelineWidget
              escrow={escrow}
              loading={false}
              onClick={() => setTimelineModalOpen(true)}
            />

            <FinancialsWidget
              escrow={escrow}
              loading={false}
              onClick={() => setFinancialsModalOpen(true)}
            />

            <PeopleWidget
              escrow={escrow}
              loading={false}
              onClick={() => setPeopleModalOpen(true)}
            />

            <DocumentsWidget
              escrow={escrow}
              loading={false}
              onClick={() => {
                setSelectedCategory('Purchase Agreement');
                setDocumentsModalOpen(true);
              }}
            />
          </WidgetsGrid>
        </MainContent>

        {/* BEST PRACTICE: Right Sidebar with Header */}
        <SidebarColumn collapsed={rightSidebarCollapsed}>
          <SidebarHeader>
            <Typography variant="subtitle2" fontWeight="600" color="text.secondary">
              Smart Context
            </Typography>
            <IconButton
              size="small"
              onClick={() => setRightSidebarCollapsed(true)}
              sx={{ ml: 1 }}
            >
              <ChevronRight fontSize="small" />
            </IconButton>
          </SidebarHeader>
          <SidebarContent>
            <RightSidebar
              escrow={escrow}
              loading={loading}
              onUpdate={handleUpdate}
            />
          </SidebarContent>
        </SidebarColumn>

        {/* BEST PRACTICE: Activity Feed as Right Panel (Desktop) */}
        <SidebarColumn collapsed={activityCollapsed}>
          <SidebarHeader>
            <Typography variant="subtitle2" fontWeight="600" color="text.secondary">
              Activity Feed
            </Typography>
            <IconButton
              size="small"
              onClick={() => setActivityCollapsed(true)}
              sx={{ ml: 1 }}
            >
              <ChevronRight fontSize="small" />
            </IconButton>
          </SidebarHeader>
          <SidebarContent>
            <ActivityFeed escrow={escrow} isPanel={true} />
          </SidebarContent>
        </SidebarColumn>

        {/* Collapsed Right/Activity Expand Buttons */}
        {(rightSidebarCollapsed || activityCollapsed) && (
          <Box
            sx={{
              position: 'fixed',
              right: 8,
              top: '50%',
              transform: 'translateY(-50%)',
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
              zIndex: 10,
            }}
          >
            {rightSidebarCollapsed && (
              <IconButton
                size="small"
                onClick={() => setRightSidebarCollapsed(false)}
                sx={{
                  backgroundColor: 'background.paper',
                  boxShadow: 1,
                  '&:hover': {
                    backgroundColor: 'primary.main',
                    color: 'white',
                  },
                }}
              >
                <ChevronLeft fontSize="small" />
              </IconButton>
            )}
            {activityCollapsed && (
              <IconButton
                size="small"
                onClick={() => setActivityCollapsed(false)}
                sx={{
                  backgroundColor: 'background.paper',
                  boxShadow: 1,
                  '&:hover': {
                    backgroundColor: 'primary.main',
                    color: 'white',
                  },
                }}
              >
                <ChevronLeft fontSize="small" />
              </IconButton>
            )}
          </Box>
        )}
      </FPatternGrid>

      {/* Detail Modals */}
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
        onClose={() => {
          setPeopleModalOpen(false);
          setSelectedRole(null);
        }}
        escrow={escrow}
        onUpdate={handleUpdate}
      />

      <DocumentsDetailModal
        open={documentsModalOpen}
        onClose={() => {
          setDocumentsModalOpen(false);
          setSelectedCategory(null);
        }}
        escrow={escrow}
        category={selectedCategory}
        onUpdate={handleUpdate}
      />
    </PageContainer>
  );
};

export default EscrowDetailCompact;
