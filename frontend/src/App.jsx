import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { SnackbarProvider } from 'notistack';
import { QueryClient, QueryClientProvider } from 'react-query';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Box } from '@mui/material';

// Components
import Navigation from './components/common/Navigation';
import HomeDashboard from './components/dashboards/HomeDashboard';
import EscrowsDashboard from './components/dashboards/EscrowsDashboard';
import ListingsDashboard from './components/dashboards/ListingsDashboard';
import ClientsDashboard from './components/dashboards/ClientsDashboard';
import AppointmentsDashboard from './components/dashboards/AppointmentsDashboard';
import LeadsDashboard from './components/dashboards/LeadsDashboard';
import VirtualOfficeDashboard from './components/dashboards/VirtualOfficeDashboard';
import OtherDataDashboard from './components/dashboards/OtherDataDashboard';
import AnalyticsDashboard from './components/dashboards/AnalyticsDashboard';

// Detail Pages
import EscrowDetail from './components/details/EscrowDetail';
import ListingDetail from './components/details/ListingDetail';
import ClientDetail from './components/details/ClientDetail';
import AppointmentDetail from './components/details/AppointmentDetail';
import LeadDetail from './components/details/LeadDetail';

// Other Data Pages
import CommissionTracking from './components/financial/CommissionTracking';
import ExpenseManagement from './components/financial/ExpenseManagement';
import Invoices from './components/financial/Invoices';
import MarketingCampaigns from './components/marketing/MarketingCampaigns';
import SocialMediaPosts from './components/marketing/SocialMediaPosts';
import EmailTemplates from './components/marketing/EmailTemplates';
import VendorsPartners from './components/contacts/VendorsPartners';
import ReferralSources from './components/contacts/ReferralSources';
import NeighborhoodData from './components/contacts/NeighborhoodData';
import DocumentLibrary from './components/system/DocumentLibrary';
import ContractTemplates from './components/system/ContractTemplates';
import AllNotes from './components/system/AllNotes';
import ActivityLog from './components/system/ActivityLog';
import Webhooks from './components/system/Webhooks';
import DeletionRequests from './components/system/DeletionRequests';
import ComplianceReports from './components/system/ComplianceReports';
import Settings from './components/Settings';

// Forms
import EscrowForm from './components/forms/EscrowForm';
import ListingForm from './components/forms/ListingForm';

// Services
import websocketService from './services/websocket';

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

// Create query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  useEffect(() => {
    // Initialize WebSocket connection
    websocketService.connect();
    
    return () => {
      websocketService.disconnect();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <SnackbarProvider maxSnack={3}>
            <CssBaseline />
            <Router>
              <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                <Navigation />
                <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                  <Routes>
                    {/* Dashboard Routes */}
                    <Route path="/" element={<HomeDashboard />} />
                    <Route path="/escrows" element={<EscrowsDashboard />} />
                    <Route path="/listings" element={<ListingsDashboard />} />
                    <Route path="/clients" element={<ClientsDashboard />} />
                    <Route path="/appointments" element={<AppointmentsDashboard />} />
                    <Route path="/leads" element={<LeadsDashboard />} />
                    <Route path="/virtual-office" element={<VirtualOfficeDashboard />} />
                    <Route path="/other-data" element={<OtherDataDashboard />} />
                    <Route path="/analytics" element={<AnalyticsDashboard />} />
                    
                    {/* Detail Routes */}
                    <Route path="/escrows/:id" element={<EscrowDetail />} />
                    <Route path="/listings/:id" element={<ListingDetail />} />
                    <Route path="/clients/:id" element={<ClientDetail />} />
                    <Route path="/appointments/:id" element={<AppointmentDetail />} />
                    <Route path="/leads/:id" element={<LeadDetail />} />
                    
                    {/* Form Routes */}
                    <Route path="/escrows/new" element={<EscrowForm />} />
                    <Route path="/escrows/:id/edit" element={<EscrowForm />} />
                    <Route path="/listings/new" element={<ListingForm />} />
                    <Route path="/listings/:id/edit" element={<ListingForm />} />
                    
                    {/* Financial Routes */}
                    <Route path="/commissions" element={<CommissionTracking />} />
                    <Route path="/expenses" element={<ExpenseManagement />} />
                    <Route path="/invoices" element={<Invoices />} />
                    
                    {/* Marketing Routes */}
                    <Route path="/campaigns" element={<MarketingCampaigns />} />
                    <Route path="/social-media" element={<SocialMediaPosts />} />
                    <Route path="/email-templates" element={<EmailTemplates />} />
                    
                    {/* Contacts Routes */}
                    <Route path="/vendors" element={<VendorsPartners />} />
                    <Route path="/referral-sources" element={<ReferralSources />} />
                    <Route path="/neighborhoods" element={<NeighborhoodData />} />
                    
                    {/* System Routes */}
                    <Route path="/documents" element={<DocumentLibrary />} />
                    <Route path="/templates" element={<ContractTemplates />} />
                    <Route path="/notes" element={<AllNotes />} />
                    <Route path="/activities" element={<ActivityLog />} />
                    <Route path="/webhooks" element={<Webhooks />} />
                    <Route path="/deletion-requests" element={<DeletionRequests />} />
                    <Route path="/compliance" element={<ComplianceReports />} />
                    
                    {/* Settings */}
                    <Route path="/settings" element={<Settings />} />
                    
                    {/* Catch all - redirect to home */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </Box>
              </Box>
            </Router>
          </SnackbarProvider>
        </LocalizationProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;