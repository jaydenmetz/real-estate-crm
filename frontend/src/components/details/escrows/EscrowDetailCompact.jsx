import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  CircularProgress,
  Alert
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { escrowsAPI } from '../../../services/api.service';
import { useEscrowWebSocket } from '../../../hooks/useEscrowWebSocket';

// Components
import EscrowHeroCard from './components/EscrowHeroCard';
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

const FPatternGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: '280px 1fr 320px', // Left sidebar | Main | Right sidebar
  gap: theme.spacing(2),
  height: '100%',
  maxWidth: '2400px', // Max width for ultra-wide screens
  margin: '0 auto',
  [theme.breakpoints.down('lg')]: {
    gridTemplateColumns: '240px 1fr 280px', // Smaller sidebars on medium screens
  },
  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: '1fr', // Stack on mobile
    overflowY: 'auto',
  },
}));

const MainContent = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  overflowY: 'auto',
  paddingRight: theme.spacing(1),
}));

const SidebarColumn = styled(Box)(({ theme }) => ({
  overflowY: 'auto',
  paddingRight: theme.spacing(1),
  [theme.breakpoints.down('md')]: {
    display: 'none', // Hide on mobile
  },
}));

const WidgetsGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: '1fr',
  },
}));

const EscrowDetailCompact = () => {
  const { id } = useParams();
  const [escrow, setEscrow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal states
  const [financialsModalOpen, setFinancialsModalOpen] = useState(false);
  const [timelineModalOpen, setTimelineModalOpen] = useState(false);
  const [peopleModalOpen, setPeopleModalOpen] = useState(false);
  const [documentsModalOpen, setDocumentsModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

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
      <FPatternGrid>
        {/* Left Sidebar (280px) - Quick Actions */}
        <SidebarColumn>
          <LeftSidebar
            escrow={escrow}
            loading={loading}
            onUpdate={handleUpdate}
          />
        </SidebarColumn>

        {/* Main Content (flex-grow) - Hero + 4 Widgets */}
        <MainContent>
          {/* Hero Card (100px height) */}
          <EscrowHeroCard
            escrow={escrow}
            onEmailParties={handleEmailParties}
            onGenerateStatement={handleGenerateStatement}
            onMoreActions={handleMoreActions}
          />

          {/* 4 Main Widgets (2x2 Grid) */}
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
        <SidebarColumn>
          <RightSidebar
            escrow={escrow}
            loading={loading}
            onUpdate={handleUpdate}
          />
        </SidebarColumn>
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
