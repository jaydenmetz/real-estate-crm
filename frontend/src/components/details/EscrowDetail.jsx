import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Tabs,
  Tab,
  Grid,
  Typography,
  CircularProgress,
  Alert,
  Breadcrumbs,
  Link,
  Paper
} from '@mui/material';
import {
  Home as HomeIcon,
  Dashboard as DashboardIcon,
  DataObject as DataIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Import components
import HeroHeader from '../escrow-detail/HeroHeader';
import PeopleWidgetCompact from '../escrow-detail/widgets/PeopleWidgetCompact';
import TimelineWidgetCompact from '../escrow-detail/widgets/TimelineWidgetCompact';
import FinancialsWidgetCompact from '../escrow-detail/widgets/FinancialsWidgetCompact';
import ChecklistWidgetCompact from '../escrow-detail/widgets/ChecklistWidgetCompact';
import AllDataEditor from '../escrow-detail/AllDataEditor';

// Styled components
const PageContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  backgroundColor: '#f8f9fa',
  paddingTop: theme.spacing(3),
  paddingBottom: theme.spacing(4)
}));

const StyledTabs = styled(Tabs)(({ theme }) => ({
  backgroundColor: 'white',
  borderRadius: theme.spacing(1),
  marginBottom: theme.spacing(2),
  boxShadow: '0 2px 4px rgba(118, 75, 162, 0.08)',
  '& .MuiTab-root': {
    textTransform: 'none',
    fontWeight: 600,
    color: theme.palette.grey[600],
    '&.Mui-selected': {
      color: '#764ba2'
    }
  },
  '& .MuiTabs-indicator': {
    backgroundColor: '#764ba2',
    height: 3
  }
}));

const LoadingContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '60vh'
}));

// Tab panel component
function TabPanel({ children, value, index }) {
  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      id={`escrow-tabpanel-${index}`}
      aria-labelledby={`escrow-tab-${index}`}
    >
      {value === index && children}
    </Box>
  );
}

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
  const [activeTab, setActiveTab] = useState(0);
  const [escrowData, setEscrowData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch escrow data
  useEffect(() => {
    fetchEscrowData();
  }, [id]);

  const fetchEscrowData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch main escrow data
      const response = await fetch(`/v1/escrows/${id}`);
      if (!response.ok) throw new Error('Failed to fetch escrow');
      
      const result = await response.json();
      if (!result.success) throw new Error(result.error?.message || 'Failed to fetch escrow');
      
      // Transform the data
      const transformedData = transformEscrowData(result.data);
      
      // Fetch additional endpoints in parallel for complete data
      const [peopleRes, timelineRes, financialsRes, checklistsRes] = await Promise.all([
        fetch(`/v1/escrows/${id}/people`).then(r => r.json()).catch(() => null),
        fetch(`/v1/escrows/${id}/timeline`).then(r => r.json()).catch(() => null),
        fetch(`/v1/escrows/${id}/financials`).then(r => r.json()).catch(() => null),
        fetch(`/v1/escrows/${id}/checklists`).then(r => r.json()).catch(() => null)
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
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle data updates from All Data tab
  const handleDataUpdate = async (endpoint, data) => {
    try {
      setIsSaving(true);
      
      const response = await fetch(`/v1/escrows/${id}/${endpoint}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) throw new Error(`Failed to update ${endpoint}`);
      
      const result = await response.json();
      if (!result.success) throw new Error(result.error?.message || `Failed to update ${endpoint}`);
      
      // Refresh data after successful update
      await fetchEscrowData();
      
      return { success: true };
    } catch (err) {
      console.error(`Error updating ${endpoint}:`, err);
      return { success: false, error: err.message };
    } finally {
      setIsSaving(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

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
          <Alert severity="error" sx={{ mt: 4 }}>
            {error}
          </Alert>
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
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
          <Link
            underline="hover"
            color="inherit"
            href="/dashboard"
            onClick={(e) => {
              e.preventDefault();
              navigate('/dashboard');
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
            {escrowData.displayId || escrowData.display_id || escrowData.escrowNumber}
          </Typography>
        </Breadcrumbs>

        {/* Hero Header */}
        <HeroHeader data={escrowData} onUpdate={handleDataUpdate} />

        {/* Tabs */}
        <StyledTabs value={activeTab} onChange={handleTabChange}>
          <Tab icon={<DashboardIcon />} label="Overview" />
          <Tab icon={<DataIcon />} label="All Data" />
        </StyledTabs>

        {/* Tab Panels */}
        <TabPanel value={activeTab} index={0}>
          <Grid container spacing={2}>
            {/* People Widget */}
            <Grid item xs={12}>
              <PeopleWidgetCompact data={escrowData.people} />
            </Grid>

            {/* Timeline Widget */}
            <Grid item xs={12}>
              <TimelineWidgetCompact data={escrowData.timeline || escrowData} />
            </Grid>

            {/* Financials Widget */}
            <Grid item xs={12}>
              <FinancialsWidgetCompact data={escrowData.financials || escrowData} />
            </Grid>

            {/* Checklist Widget */}
            <Grid item xs={12}>
              <ChecklistWidgetCompact data={escrowData.checklists} />
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <AllDataEditor 
            data={escrowData} 
            onUpdate={handleDataUpdate}
            isSaving={isSaving}
          />
        </TabPanel>
      </Container>
    </PageContainer>
  );
}

export default EscrowDetail;