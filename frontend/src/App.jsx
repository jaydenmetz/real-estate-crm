// File: frontend/src/App.jsx
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
import EnhancedNavigation from './components/common/EnhancedNavigation';
import AlexQuickTaskBar from './components/ai/AlexQuickTaskBar';
import ErrorBoundary from './components/common/ErrorBoundary';

// Dashboard Components
import AIAgentsDashboardSimple from './components/dashboards/AIAgentsDashboardSimple';
import EscrowsDashboard from './components/dashboards/EscrowsDashboard';
import EscrowDetail from './components/details/EscrowDetail';
import ListingsDashboard from './components/dashboards/ListingsDashboard';
import ListingDetail from './components/details/ListingDetail';
import ClientsDashboard from './components/dashboards/ClientsDashboard';
import ClientDetail from './components/details/ClientDetail';
import AppointmentsDashboard from './components/dashboards/AppointmentsDashboard';
import AppointmentDetail from './components/details/AppointmentDetail';
import LeadsDashboard from './components/dashboards/LeadsDashboard';
import LeadDetail from './components/details/LeadDetail';

// System Components
import ActivityLog from './components/system/ActivityLog';
import AllNotes from './components/system/AllNotes';
// import Reports from './components/system/Reports';
// import Calendar from './components/system/Calendar';
// import Settings from './components/system/Settings';

// Services
import websocketService from './services/websocket';

// Create enhanced theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
      contrastText: '#fff',
    },
    secondary: {
      main: '#dc004e',
      light: '#e33371',
      dark: '#9a0036',
      contrastText: '#fff',
    },
    success: {
      main: '#4caf50',
    },
    warning: {
      main: '#ff9800',
    },
    error: {
      main: '#f44336',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    h1: { fontSize: '2.5rem', fontWeight: 600 },
    h2: { fontSize: '2rem', fontWeight: 600 },
    h3: { fontSize: '1.75rem', fontWeight: 600 },
    h4: { fontSize: '1.5rem', fontWeight: 600 },
    h5: { fontSize: '1.25rem', fontWeight: 600 },
    h6: { fontSize: '1rem', fontWeight: 600 },
  },
  shape: {
    borderRadius: 8,
  },
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: process.env.NODE_ENV === 'production',
      retry: process.env.NODE_ENV === 'production' ? 3 : false,
      staleTime: process.env.NODE_ENV === 'production' ? 30000 : false,
    },
    mutations: {
      retry: 1,
      onSuccess: (data, variables, context) => {
        if (context?.invalidateQueries) {
          context.invalidateQueries.forEach(queryKey => {
            queryClient.invalidateQueries(queryKey);
          });
        }
      },
    },
  },
});

function App() {
  useEffect(() => {
    let unsubscribe = null;
    
    const initializeWebSocket = async () => {
      try {
        if (!websocketService.isConnected) {
          console.log('🔌 Initializing WebSocket connection...');
          
          // Set up connection listener before connecting
          unsubscribe = websocketService.on('connection', (data) => {
            if (data.status === 'connected') {
              console.log('✅ WebSocket connected successfully');
              websocketService.send('ai:requestTeamStatus');
            } else if (data.status === 'failed') {
              console.error('❌ WebSocket connection failed:', data.error);
            }
          });
          
          // Try to connect with a timeout
          const connectPromise = websocketService.connect();
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('WebSocket connection timeout')), 10000)
          );
          
          await Promise.race([connectPromise, timeoutPromise]);
        }
      } catch (error) {
        console.error('WebSocket initialization error:', error.message);
        // Don't let WebSocket errors crash the app
        console.log('App will continue without WebSocket connection');
      }
    };

    initializeWebSocket();

    return () => {
      if (unsubscribe && typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <SnackbarProvider 
            maxSnack={3}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            autoHideDuration={4000}
            preventDuplicate
          >
            <CssBaseline />
            <Router>
              <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                {/* Navigation */}
                <EnhancedNavigation />
                
                {/* Alex Quick Task Bar - On every page */}
                <AlexQuickTaskBar />
                
                {/* Main Content */}
                <Box sx={{ flexGrow: 1, backgroundColor: '#f8f9fa' }}>
                  <Routes>
                    {/* Virtual Office as Home */}
                    <Route path="/" element={
                      <ErrorBoundary>
                        <AIAgentsDashboardSimple />
                      </ErrorBoundary>
                    } />
                    
                    {/* Main Features */}
                    <Route path="/escrows" element={<EscrowsDashboard />} />
                    <Route path="/escrows/:id" element={<EscrowDetail />} />
                    
                    <Route path="/listings" element={<ListingsDashboard />} />
                    <Route path="/listings/:id" element={<ListingDetail />} />
                    
                    <Route path="/clients" element={<ClientsDashboard />} />
                    <Route path="/clients/:id" element={<ClientDetail />} />
                    
                    <Route path="/appointments" element={<AppointmentsDashboard />} />
                    <Route path="/appointments/:id" element={<AppointmentDetail />} />
                    
                    <Route path="/leads" element={<LeadsDashboard />} />
                    <Route path="/leads/:id" element={<LeadDetail />} />
                    
                    {/* System Features */}
                    <Route path="/activity-log" element={<ActivityLog />} />
                    <Route path="/all-notes" element={<AllNotes />} />
                    {/* <Route path="/reports" element={<Reports />} />
                    <Route path="/calendar" element={<Calendar />} />
                    <Route path="/settings" element={<Settings />} /> */}
                    
                    {/* Catch all redirect */}
                    <Route path="*" element={<Navigate to="/" />} />
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
