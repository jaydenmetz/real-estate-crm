import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as Sentry from '@sentry/react';
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
  Button,
  Stack
} from '@mui/material';
import {
  Home as HomeIcon,
  Dashboard as DashboardIcon,
  DataObject as DataIcon,
  BugReport as BugIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Import API configuration
import { apiCall, API_BASE_URL } from '../../services/api.service';
import { testApiConnection, testEscrowEndpoint } from '../../utils/testApi';

// Import components
import EscrowCardOptimized from '../common/EscrowCardOptimized';
import PropertyHeroWidget from '../escrow-detail/PropertyHeroWidget';
import PeopleWidget from '../escrow-detail/PeopleWidget';
import TimelineWidget from '../escrow-detail/TimelineWidget';
import FinancialsWidget from '../escrow-detail/FinancialsWidget';
import ChecklistsWidget from '../escrow-detail/ChecklistsWidget';
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

  // Handle data updates from All Data tab
  const handleDataUpdate = async (endpoint, data) => {
    try {
      setIsSaving(true);
      
      const result = await apiCall(`escrows/${id}/${endpoint}`, {
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

        {/* Escrow Card Header */}
        <Box sx={{ mb: 3 }}>
          <EscrowCardOptimized 
            escrow={escrowData} 
            showCommission={false}
            onQuickAction={(action) => {
              if (action === 'edit') {
                setActiveTab(1); // Switch to All Data tab
              }
            }}
          />
        </Box>

        {/* Property Hero Widget */}
        <PropertyHeroWidget data={escrowData} />

        {/* Tabs */}
        <StyledTabs value={activeTab} onChange={handleTabChange}>
          <Tab icon={<DashboardIcon />} label="Overview" />
          <Tab icon={<DataIcon />} label="All Data" />
        </StyledTabs>

        {/* Tab Panels */}
        <TabPanel value={activeTab} index={0}>
          <Stack spacing={3}>
            {/* People Widget */}
            <PeopleWidget 
              data={escrowData.people || escrowData} 
              onEdit={(section) => handleDataUpdate(section, escrowData[section])}
            />

            {/* Timeline Widget */}
            <TimelineWidget 
              data={escrowData.timeline || escrowData} 
              onEdit={(section) => handleDataUpdate(section, escrowData[section])}
            />

            {/* Financials Widget */}
            <FinancialsWidget 
              data={escrowData.financials || escrowData} 
              onEdit={(section) => handleDataUpdate(section, escrowData[section])}
            />

            {/* Checklists Widget */}
            <ChecklistsWidget 
              data={escrowData.checklists || escrowData} 
              onEdit={(section) => handleDataUpdate(section, escrowData[section])}
              onToggleItem={async (category, item, value) => {
                const updatedChecklists = {
                  ...escrowData.checklists,
                  [category]: {
                    ...escrowData.checklists?.[category],
                    [item]: value
                  }
                };
                await handleDataUpdate('checklists', updatedChecklists);
              }}
            />
          </Stack>
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