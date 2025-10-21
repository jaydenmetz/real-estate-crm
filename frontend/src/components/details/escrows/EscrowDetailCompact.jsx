import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight
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
import FinancialsDetailModal from './modals/FinancialsDetailModal';
import TimelineDetailModal from './modals/TimelineDetailModal';
import PeopleDetailModal from './modals/PeopleDetailModal';
import DocumentsDetailModal from './modals/DocumentsDetailModal';

// PHASE 5: F-Pattern Layout (Left Sidebar | Hero + Widgets | Right Sidebar)
const PageContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  maxWidth: '100vw',
  padding: theme.spacing(2),
  height: 'calc(100vh - 64px)', // Account for header
  overflow: 'hidden',
  backgroundColor: theme.palette.grey[50],
}));

const FPatternGrid = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'leftCollapsed' && prop !== 'rightCollapsed',
})(({ leftCollapsed, rightCollapsed, theme }) => ({
  display: 'grid',
  gridTemplateColumns: `${leftCollapsed ? '0px' : '200px'} 1fr ${rightCollapsed ? '0px' : '200px'}`, // 200px sidebars for compact layout
  gap: theme.spacing(2),
  height: '100%',
  maxWidth: '2400px',
  margin: '0 auto',
  transition: 'grid-template-columns 0.3s ease-in-out',
  position: 'relative',
  [theme.breakpoints.down('lg')]: {
    gridTemplateColumns: `${leftCollapsed ? '0px' : '200px'} 1fr ${rightCollapsed ? '0px' : '200px'}`,
  },
  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: '1fr',
    overflowY: 'auto',
  },
}));

const MainContent = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1.5), // Tighter spacing for better fit
  overflowY: 'auto',
  paddingRight: theme.spacing(1),
  paddingTop: theme.spacing(0.5),
  paddingBottom: theme.spacing(1),
}));

const SidebarColumn = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'collapsed',
})(({ collapsed, theme }) => ({
  overflowY: 'auto',
  paddingRight: theme.spacing(1),
  width: collapsed ? 0 : 'auto',
  opacity: collapsed ? 0 : 1,
  transition: 'width 0.3s ease-in-out, opacity 0.3s ease-in-out',
  overflow: collapsed ? 'hidden' : 'auto',
  [theme.breakpoints.down('md')]: {
    display: 'none',
  },
}));

const SidebarToggle = styled(IconButton, {
  shouldForwardProp: (prop) => prop !== 'side',
})(({ theme, side }) => ({
  position: 'absolute',
  top: '50%',
  transform: 'translateY(-50%)',
  [side === 'left' ? 'left' : 'right']: side === 'left' ? -12 : -12,
  zIndex: 1300,
  backgroundColor: theme.palette.background.paper,
  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
  width: 24,
  height: 40,
  borderRadius: side === 'left' ? '0 8px 8px 0' : '8px 0 0 8px',
  '&:hover': {
    backgroundColor: theme.palette.primary.main,
    color: 'white',
  },
  [theme.breakpoints.down('md')]: {
    display: 'none',
  },
}));

const WidgetsGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)', // 2x2 grid for maximum information density
  gridTemplateRows: 'repeat(2, 190px)', // Fixed 190px height per widget
  gap: theme.spacing(2),
  height: 400, // Total height: 2 rows * 190px + 20px gap
  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: '1fr', // Stack on mobile
    gridTemplateRows: 'auto',
    height: 'auto',
  },
}));

const EscrowDetailCompact = () => {
  const { id } = useParams();
  const [escrow, setEscrow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sidebar collapse states (stored in localStorage)
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(() => {
    return localStorage.getItem('leftSidebarCollapsed') === 'true';
  });
  const [rightSidebarCollapsed, setRightSidebarCollapsed] = useState(() => {
    return localStorage.getItem('rightSidebarCollapsed') === 'true';
  });

  // Modal states
  const [financialsModalOpen, setFinancialsModalOpen] = useState(false);
  const [timelineModalOpen, setTimelineModalOpen] = useState(false);
  const [peopleModalOpen, setPeopleModalOpen] = useState(false);
  const [documentsModalOpen, setDocumentsModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Save sidebar state to localStorage
  useEffect(() => {
    localStorage.setItem('leftSidebarCollapsed', leftSidebarCollapsed);
  }, [leftSidebarCollapsed]);

  useEffect(() => {
    localStorage.setItem('rightSidebarCollapsed', rightSidebarCollapsed);
  }, [rightSidebarCollapsed]);

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
      // Refetch escrow data when update received
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

  const handleEmailParties = () => {
    const people = escrow?.people || {};
    const emails = Object.values(people)
      .filter(person => person?.email)
      .map(person => person.email)
      .join(',');

    const subject = `Escrow Update - ${escrow?.details?.propertyAddress || escrow?.property_address}`;
    window.location.href = `mailto:${emails}?subject=${encodeURIComponent(subject)}`;
  };

  const handleGenerateStatement = () => {
    alert('Statement generation coming in Phase 6');
  };

  const handleMoreActions = () => {
    alert('More actions coming in Phase 6');
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
      {/* F-Pattern Layout: Left | Main | Right */}
      <FPatternGrid leftCollapsed={leftSidebarCollapsed} rightCollapsed={rightSidebarCollapsed}>
        {/* Left Sidebar Toggle */}
        <Tooltip title={leftSidebarCollapsed ? "Show sidebar" : "Hide sidebar"} placement="right">
          <SidebarToggle
            side="left"
            onClick={() => setLeftSidebarCollapsed(!leftSidebarCollapsed)}
            sx={{ left: leftSidebarCollapsed ? 0 : 268 }}
          >
            {leftSidebarCollapsed ? <ChevronRight fontSize="small" /> : <ChevronLeft fontSize="small" />}
          </SidebarToggle>
        </Tooltip>

        {/* Left Sidebar (280px) - Quick Actions */}
        <SidebarColumn collapsed={leftSidebarCollapsed}>
          <LeftSidebar
            escrow={escrow}
            loading={loading}
            onUpdate={handleUpdate}
          />
        </SidebarColumn>

        {/* Main Content (flex-grow) - Hero + 4 Widgets */}
        <MainContent>
          {/* Hero Card (wider aspect ratio like dashboard cards) */}
          <EscrowHero
            escrow={escrow}
            onUpdate={handleUpdate}
          />

          {/* 4 Main Widgets (4 columns / 2x2 responsive) */}
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

        {/* Right Sidebar (320px) - Smart Context */}
        <SidebarColumn collapsed={rightSidebarCollapsed}>
          <RightSidebar
            escrow={escrow}
            loading={loading}
            onUpdate={handleUpdate}
          />
        </SidebarColumn>

        {/* Right Sidebar Toggle */}
        <Tooltip title={rightSidebarCollapsed ? "Show sidebar" : "Hide sidebar"} placement="left">
          <SidebarToggle
            side="right"
            onClick={() => setRightSidebarCollapsed(!rightSidebarCollapsed)}
            sx={{ right: rightSidebarCollapsed ? 0 : 308 }}
          >
            {rightSidebarCollapsed ? <ChevronLeft fontSize="small" /> : <ChevronRight fontSize="small" />}
          </SidebarToggle>
        </Tooltip>
      </FPatternGrid>

      {/* Phase 6: Detail Modals */}
      <FinancialsDetailModal
        open={financialsModalOpen}
        onClose={() => setFinancialsModalOpen(false)}
        escrow={escrow}
        onUpdate={handleUpdate}
      />

      <TimelineDetailModal
        open={timelineModalOpen}
        onClose={() => setTimelineModalOpen(false)}
        escrow={escrow}
        onUpdate={handleUpdate}
      />

      <PeopleDetailModal
        open={peopleModalOpen}
        onClose={() => {
          setPeopleModalOpen(false);
          setSelectedRole(null);
        }}
        escrow={escrow}
        selectedRole={selectedRole}
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

      {/* Phase 7: Draggable Activity Feed (Apple Maps-style Bottom Sheet) */}
      <ActivityFeed escrow={escrow} />
    </PageContainer>
  );
};

export default EscrowDetailCompact;
