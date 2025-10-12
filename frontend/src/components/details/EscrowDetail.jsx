import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as Sentry from '@sentry/react';
import {
  Container,
  Box,
  Grid,
  Typography,
  CircularProgress,
  Alert,
  Breadcrumbs,
  Link,
  Button,
  ToggleButtonGroup,
  ToggleButton,
  Tooltip
} from '@mui/material';
import {
  Home as HomeIcon,
  Dashboard as DashboardIcon,
  BugReport as BugIcon,
  ViewModule as ViewModuleIcon,
  ViewQuilt as ViewQuiltIcon,
  ViewAgenda as ViewAgendaIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useWebSocket } from '../../hooks/useWebSocket';

// Import API configuration
import { apiCall, API_BASE_URL } from '../../services/api.service';
import { testApiConnection, testEscrowEndpoint } from '../../utils/testApi';

// Import components
import EscrowHeroCard from '../escrow-widgets/EscrowHeroCard';
import PropertyWidget from '../escrow-widgets/PropertyWidget';
import FinancialWidget from '../escrow-widgets/FinancialWidget';
import PeopleWidget from '../escrow-widgets/PeopleWidget';
import TimelineWidget from '../escrow-widgets/TimelineWidget';
import ChecklistWidget from '../escrow-widgets/ChecklistWidget';
import DebugError from '../common/DebugError';
import DebugCard from '../common/DebugCard';

// Styled components
const PageContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  backgroundColor: '#f8f9fa',
  paddingTop: theme.spacing(3),
  paddingBottom: theme.spacing(4)
}));

const LoadingContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '60vh'
}));

const ViewModeToggle = styled(ToggleButtonGroup)(({ theme }) => ({
  backgroundColor: 'white',
  borderRadius: theme.spacing(1),
  boxShadow: '0 2px 4px rgba(118, 75, 162, 0.08)',
  marginBottom: theme.spacing(3),
  '& .MuiToggleButton-root': {
    textTransform: 'none',
    fontWeight: 600,
    border: 'none',
    color: theme.palette.grey[600],
    '&.Mui-selected': {
      color: 'white',
      backgroundColor: '#764ba2',
      '&:hover': {
        backgroundColor: '#5a3a80'
      }
    },
    '&:hover': {
      backgroundColor: 'rgba(118, 75, 162, 0.08)'
    }
  }
}));

// Helper function to transform database escrow to display format
const transformEscrowData = (dbData) => {
  if (!dbData) return null;
  
  // Check if data is already in the new structure
  if (dbData.details && dbData['property-details']) {
    // New structure - flatten it
    return {
      ...dbData.details,
      ...dbData['property-details'],
      people: dbData.people || {},
      timeline: dbData.timeline || {},
      financials: dbData.financials || {},
      checklists: dbData.checklists || {},
      documents: dbData.documents || []
    };
  }
  
  // Old structure - use as is
  return dbData;
};

function EscrowDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isConnected } = useWebSocket();
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('escrowDetailViewMode') || 'medium';
  });
  const [escrowData, setEscrowData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [errorDetails, setErrorDetails] = useState(null);

  // Save viewMode to localStorage
  useEffect(() => {
    localStorage.setItem('escrowDetailViewMode', viewMode);
  }, [viewMode]);

  // Fetch escrow data
  useEffect(() => {
    // Set Sentry context for this escrow
    if (id) {
      Sentry.setContext('escrow', {
        escrow_id: id,
        view_type: 'detail',
        timestamp: new Date().toISOString()
      });

      Sentry.addBreadcrumb({
        category: 'escrow',
        message: `Viewing escrow ${id}`,
        level: 'info',
        data: { escrow_id: id }
      });
    }

    fetchEscrowData();

    // Clean up context when component unmounts
    return () => {
      Sentry.setContext('escrow', null);
    };
  }, [id]);

  // WebSocket real-time updates
  useEffect(() => {
    if (!isConnected) return;

    const websocketService = require('../../services/websocket.service').default;

    const unsubscribe = websocketService.on('data:update', (data) => {
      if (data.entityType === 'escrow' && data.entityId === id) {
        console.log('🔄 Refetching escrow due to real-time update');
        fetchEscrowData();
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [isConnected, id]);

  const fetchEscrowData = async () => {
    try {
      setLoading(true);
      setError(null);
      setErrorDetails(null);
      
      console.log('Fetching escrow with ID:', id);
      console.log('API Base URL:', API_BASE_URL);
      console.log('Environment:', process.env.NODE_ENV);
      
      // Fetch main escrow data using the API configuration
      const result = await apiCall(`escrows/${id}`);
      
      console.log('Escrow data received:', result);
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to fetch escrow');
      }
      
      // Transform the data
      const transformedData = transformEscrowData(result.data);
      
      // Fetch additional endpoints in parallel for complete data
      const fetchEndpoint = async (endpoint) => {
        try {
          const res = await apiCall(`escrows/${id}/${endpoint}`);
          return res;
        } catch (error) {
          console.warn(`Failed to fetch /escrows/${id}/${endpoint}:`, error);
          return null;
        }
      };

      const [peopleRes, timelineRes, financialsRes, checklistsRes] = await Promise.all([
        fetchEndpoint('people'),
        fetchEndpoint('timeline'),
        fetchEndpoint('financials'),
        fetchEndpoint('checklists')
      ]);
      
      // Merge all data
      const completeData = {
        ...transformedData,
        people: peopleRes?.data || transformedData.people || {},
        timeline: timelineRes?.data || transformedData.timeline || {},
        financials: financialsRes?.data || transformedData.financials || {},
        checklists: checklistsRes?.data || transformedData.checklists || {}
      };
      
      setEscrowData(completeData);
    } catch (err) {
      console.error('Error fetching escrow:', err);
      setError(err);
      setErrorDetails({
        apiEndpoint: `/escrows/${id}`,
        errorMessage: err.message,
        errorStack: err.stack,
        timestamp: new Date().toISOString(),
        escrowId: id
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle field updates
  const handleFieldUpdate = async (field, value) => {
    try {
      const result = await apiCall(`escrows/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ [field]: value })
      });

      if (result.success) {
        // Optimistically update local state
        setEscrowData(prev => ({
          ...prev,
          [field]: value
        }));

        // Refetch to ensure sync
        fetchEscrowData();
      }
    } catch (err) {
      console.error('Error updating field:', err);
      throw err; // Re-throw so EditableField knows it failed
    }
  };

  // Handle checklist item toggle
  const handleChecklistToggle = async (category, item, value) => {
    try {
      const updatedChecklists = {
        ...escrowData.checklists,
        [category]: {
          ...escrowData.checklists?.[category],
          [item]: value
        }
      };

      const result = await apiCall(`escrows/${id}/checklists`, {
        method: 'PUT',
        body: JSON.stringify(updatedChecklists)
      });

      if (result.success) {
        // Optimistically update local state
        setEscrowData(prev => ({
          ...prev,
          checklists: updatedChecklists
        }));
      }
    } catch (err) {
      console.error('Error updating checklist:', err);
    }
  };

  const handleViewModeChange = (event, newViewMode) => {
    if (newViewMode !== null) {
      setViewMode(newViewMode);
    }
  };

  // Calculate grid columns based on viewMode
  const getGridColumns = () => {
    switch (viewMode) {
      case 'small':
        return { xs: 12, sm: 6, md: 4, xl: 3 };
      case 'medium':
        return { xs: 12, md: 6 };
      case 'large':
        return { xs: 12 };
      default:
        return { xs: 12, md: 6 };
    }
  };

  const gridCols = getGridColumns();

  if (loading) {
    return (
      <PageContainer>
        <Container maxWidth="xl">
          <LoadingContainer>
            <CircularProgress sx={{ color: '#764ba2' }} />
          </LoadingContainer>
        </Container>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <Container maxWidth="xl">
          <Box mb={2} display="flex" gap={2}>
            <Button
              variant="contained"
              startIcon={<BugIcon />}
              onClick={async () => {
                console.log('Running API diagnostics...');
                const healthTest = await testApiConnection();
                console.log('Health test result:', healthTest);
                const escrowTest = await testEscrowEndpoint(id);
                console.log('Escrow test result:', escrowTest);
              }}
              sx={{ 
                bgcolor: '#764ba2',
                '&:hover': { bgcolor: '#5a3a80' }
              }}
            >
              Run API Diagnostics
            </Button>
          </Box>
          <DebugError
            error={error}
            apiEndpoint={`/escrows/${id}`}
            additionalInfo={{
              ...errorDetails,
              apiBaseUrl: API_BASE_URL,
              environment: process.env.NODE_ENV,
              reactAppApiUrl: process.env.REACT_APP_API_URL
            }}
            onRetry={() => fetchEscrowData()}
          />
        </Container>
      </PageContainer>
    );
  }

  if (!escrowData) {
    return (
      <PageContainer>
        <Container maxWidth="xl">
          <Alert severity="warning" sx={{ mt: 4 }}>
            No escrow data found
          </Alert>
        </Container>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Container maxWidth="xl">
        {/* Breadcrumbs */}
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
          <Link
            underline="hover"
            color="inherit"
            href="/dashboard"
            onClick={(e) => {
              e.preventDefault();
              navigate('/');
            }}
            sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
          >
            <HomeIcon fontSize="small" />
            Dashboard
          </Link>
          <Link
            underline="hover"
            color="inherit"
            href="/escrows"
            onClick={(e) => {
              e.preventDefault();
              navigate('/escrows');
            }}
            sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
          >
            <DashboardIcon fontSize="small" />
            Escrows
          </Link>
          <Typography color="text.primary" sx={{ fontWeight: 600 }}>
            {escrowData.displayId || escrowData.display_id || escrowData.escrowNumber || escrowData.escrow_number}
          </Typography>
        </Breadcrumbs>

        {/* Hero Card */}
        <EscrowHeroCard escrow={escrowData} />

        {/* ViewMode Toggle */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <ViewModeToggle
            value={viewMode}
            exclusive
            onChange={handleViewModeChange}
            aria-label="view mode"
          >
            <ToggleButton value="small" aria-label="compact view">
              <Tooltip title="Compact View">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ViewModuleIcon />
                  <Typography variant="body2">Compact</Typography>
                </Box>
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="medium" aria-label="balanced view">
              <Tooltip title="Balanced View">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ViewQuiltIcon />
                  <Typography variant="body2">Balanced</Typography>
                </Box>
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="large" aria-label="detailed view">
              <Tooltip title="Detailed View">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ViewAgendaIcon />
                  <Typography variant="body2">Detailed</Typography>
                </Box>
              </Tooltip>
            </ToggleButton>
          </ViewModeToggle>
        </Box>

        {/* Category Widgets Grid */}
        <Grid container spacing={3}>
          {/* Property Details Widget */}
          <Grid item {...gridCols}>
            <PropertyWidget
              viewMode={viewMode}
              data={escrowData}
              onUpdate={handleFieldUpdate}
            />
          </Grid>

          {/* Financial Details Widget */}
          <Grid item {...gridCols}>
            <FinancialWidget
              viewMode={viewMode}
              data={escrowData.financials || escrowData}
              onUpdate={handleFieldUpdate}
            />
          </Grid>

          {/* People & Contacts Widget */}
          <Grid item {...gridCols}>
            <PeopleWidget
              viewMode={viewMode}
              data={escrowData.people || escrowData}
              onUpdate={handleFieldUpdate}
            />
          </Grid>

          {/* Timeline Widget */}
          <Grid item {...gridCols}>
            <TimelineWidget
              viewMode={viewMode}
              data={escrowData.timeline || escrowData}
              onUpdate={handleFieldUpdate}
            />
          </Grid>

          {/* Checklists Widget */}
          <Grid item {...gridCols}>
            <ChecklistWidget
              viewMode={viewMode}
              data={escrowData.checklists || {}}
              onToggleItem={handleChecklistToggle}
            />
          </Grid>
        </Grid>

        {/* System Admin Debug Panel - Bottom of page */}
        <Box sx={{ mt: 4 }}>
          <DebugCard
            pageType="escrow-detail"
            pageData={{
              id: escrowData?.id,
              display_id: escrowData?.display_id,
              property_address: escrowData?.property_address,
              purchase_price: escrowData?.purchase_price,
              escrow_status: escrowData?.escrow_status,
              buyer: escrowData?.buyer_name,
              seller: escrowData?.seller_name,
              closing_date: escrowData?.closing_date,
              viewMode: viewMode,
              loading,
              error: error?.message
            }}
          />
        </Box>
      </Container>
    </PageContainer>
  );
}

export default EscrowDetail;