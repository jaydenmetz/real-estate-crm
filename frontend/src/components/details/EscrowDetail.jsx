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
  Paper,
  Button
} from '@mui/material';
import {
  Home as HomeIcon,
  Dashboard as DashboardIcon,
  DataObject as DataIcon,
  BugReport as BugIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Import API configuration
import { apiCall, API_BASE_URL } from 'services/api';
import { testApiConnection, testEscrowEndpoint } from '../../utils/testApi';

// Import components
import HeroHeaderCompact from '../escrow-detail/HeroHeaderCompact';
import PropertyImageSection from '../escrow-detail/PropertyImageSection';
import PeopleWidgetCompact from '../escrow-detail/widgets/PeopleWidgetCompact';
import TimelineWidgetCompact from '../escrow-detail/widgets/TimelineWidgetCompact';
import FinancialsWidgetCompact from '../escrow-detail/widgets/FinancialsWidgetCompact';
import ChecklistWidgetCompact from '../escrow-detail/widgets/ChecklistWidgetCompact';
import AllDataEditor from '../escrow-detail/AllDataEditor';
import DebugError from '../common/DebugError';
import DebugCard from '../common/DebugCard';

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
  const [errorDetails, setErrorDetails] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch escrow data
  useEffect(() => {
    fetchEscrowData();
  }, [id]);

  const fetchEscrowData = async () => {
    try {
      setLoading(true);
      setError(null);
      setErrorDetails(null);
      
      console.log('Fetching escrow with ID:', id);
      console.log('API Base URL:', API_BASE_URL);
      console.log('Environment:', process.env.NODE_ENV);
      
      // Fetch main escrow data using the API configuration
      const result = await apiCall(`/v1/escrows/${id}`);
      
      console.log('Escrow data received:', result);
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to fetch escrow');
      }
      
      // Transform the data
      const transformedData = transformEscrowData(result.data);
      
      // Fetch additional endpoints in parallel for complete data
      const fetchEndpoint = async (endpoint) => {
        try {
          const res = await apiCall(`/v1/escrows/${id}/${endpoint}`);
          return res;
        } catch (error) {
          console.warn(`Failed to fetch /v1/escrows/${id}/${endpoint}:`, error);
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
        apiEndpoint: `/v1/escrows/${id}`,
        errorMessage: err.message,
        errorStack: err.stack,
        timestamp: new Date().toISOString(),
        escrowId: id
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle data updates from All Data tab
  const handleDataUpdate = async (endpoint, data) => {
    try {
      setIsSaving(true);
      
      const result = await apiCall(`/v1/escrows/${id}/${endpoint}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
      
      if (!result.success) {
        throw new Error(result.error?.message || `Failed to update ${endpoint}`);
      }
      
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
            apiEndpoint={`/v1/escrows/${id}`}
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
          tab: activeTab,
          loading,
          error: error?.message
        }}
      />
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
        <HeroHeaderCompact data={escrowData} />

        {/* Property Image Section */}
        <PropertyImageSection data={escrowData} />

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