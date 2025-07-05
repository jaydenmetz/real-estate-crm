import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { SnackbarProvider } from 'notistack';
import { QueryClient, QueryClientProvider } from 'react-query';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// Components
import Navigation from './components/common/Navigation';
import HomeDashboard from './components/dashboards/HomeDashboard';
import EscrowsDashboard from './components/dashboards/EscrowsDashboard';
import ListingsDashboard from './components/dashboards/ListingsDashboard';
import ClientsDashboard from './components/dashboards/ClientsDashboard';
import AppointmentsDashboard from './components/dashboards/AppointmentsDashboard';
import LeadsDashboard from './components/dashboards/LeadsDashboard';
import AITeamDashboard from './components/dashboards/AITeamDashboard';

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
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
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <SnackbarProvider maxSnack={3}>
            <CssBaseline />
            <Router>
              <Navigation />
              <Routes>
                <Route path="/" element={<HomeDashboard />} />
                <Route path="/escrows" element={<EscrowsDashboard />} />
                <Route path="/listings" element={<ListingsDashboard />} />
                <Route path="/clients" element={<ClientsDashboard />} />
                <Route path="/appointments" element={<AppointmentsDashboard />} />
                <Route path="/leads" element={<LeadsDashboard />} />
                <Route path="/ai-team" element={<AITeamDashboard />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </Router>
          </SnackbarProvider>
        </LocalizationProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;