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
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        },
      },
    },
  },
});

// Create a query client instance
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
    const initializeWebSocket = async () => {
      try {
        if (!websocketService.isConnected) {
          console.log('🔌 Initializing WebSocket connection...');
          await websocketService.connect();
          
          const unsubscribe = websocketService.on('connection', (data) => {
            if (data.status === 'connected') {
              console.log('✅ WebSocket connected successfully');
              websocketService.send('ai:requestTeamStatus');
            } else if (data.status === 'failed') {
              console.error('❌ WebSocket connection failed:', data.error);
            }
          });

          return unsubscribe;
        }
      } catch (error) {
        console.error('Failed to initialize WebSocket:', error);
      }
    };

    const cleanup = initializeWebSocket();

    return () => {
      if (cleanup && typeof cleanup === 'function') {
        cleanup();
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
                <Navigation />
                
                {/* Main Content */}
                <Box sx={{ flexGrow: 1, backgroundColor: '#f8f9fa' }}>
                  <Routes>
                    <Route path="/" element={<HomeDashboard />} />
                    <Route path="/escrows" element={<EscrowsDashboard />} />
                    <Route path="/listings" element={<ListingsDashboard />} />
                    <Route path="/clients" element={<ClientsDashboard />} />
                    <Route path="/appointments" element={<AppointmentsDashboard />} />
                    <Route path="/leads" element={<LeadsDashboard />} />
                    <Route path="/virtual-office" element={<VirtualOfficeDashboard />} />
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