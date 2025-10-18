import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
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
import FinancialsDetailModal from './modals/FinancialsDetailModal';

// PHASE 5: F-Pattern Layout (Left Sidebar | Hero + Widgets | Right Sidebar)
const PageContainer = styled(Container)(({ theme }) => ({
  padding: theme.spacing(3),
  maxWidth: 1440,
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(2),
  },
}));

const FPatternGrid = styled(Grid)(({ theme }) => ({
  gap: theme.spacing(2),
}));

const WidgetsGrid = styled(Grid)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: theme.spacing(2),
  marginTop: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: '1fr',
  },
}));

const EscrowDetailCompact = () => {
  const { id } = useParams();
  const [escrow, setEscrow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [financialsModalOpen, setFinancialsModalOpen] = useState(false);

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
      <FPatternGrid container spacing={2}>
        {/* Left Sidebar (200px) - Quick Actions */}
        <Grid item xs={12} md={2}>
          <LeftSidebar
            escrow={escrow}
            loading={loading}
            onUpdate={handleUpdate}
          />
        </Grid>

        {/* Main Content (flex-grow) - Hero + 4 Widgets */}
        <Grid item xs={12} md={8}>
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
              onClick={() => alert('Timeline modal coming in Phase 6')}
            />

            <FinancialsWidget
              escrow={escrow}
              loading={false}
              onClick={() => setFinancialsModalOpen(true)}
            />

            <PeopleWidget
              escrow={escrow}
              loading={false}
              onClick={() => alert('People modal coming in Phase 6')}
            />

            <DocumentsWidget
              escrow={escrow}
              loading={false}
              onClick={() => alert('Documents modal coming in Phase 6')}
            />
          </WidgetsGrid>
        </Grid>

        {/* Right Sidebar (200px) - Smart Context */}
        <Grid item xs={12} md={2}>
          <RightSidebar
            escrow={escrow}
            loading={loading}
            onUpdate={handleUpdate}
          />
        </Grid>
      </FPatternGrid>

      {/* Modals */}
      <FinancialsDetailModal
        open={financialsModalOpen}
        onClose={() => setFinancialsModalOpen(false)}
        escrow={escrow}
      />

      {/* Activity Feed (Draggable Bottom Sheet) - Phase 7 */}
      {/* Will be implemented in Phase 7 */}
    </PageContainer>
  );
};

export default EscrowDetailCompact;
