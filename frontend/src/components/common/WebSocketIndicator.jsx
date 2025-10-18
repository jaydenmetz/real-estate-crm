import React, { useState, useEffect } from 'react';
import { Box, Tooltip, IconButton, Switch, FormControlLabel, Popover, Typography, Divider } from '@mui/material';
import { Wifi, WifiOff, Settings } from '@mui/icons-material';
import { styled, keyframes } from '@mui/material/styles';
import { io } from 'socket.io-client';

// Pulsing animation for connected state
const pulse = keyframes`
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.1);
  }
`;

const PulsingDot = styled(Box)(({ theme, connected }) => ({
  width: 12,
  height: 12,
  borderRadius: '50%',
  backgroundColor: connected ? theme.palette.success.main : theme.palette.grey[400],
  animation: connected ? `${pulse} 2s ease-in-out infinite` : 'none',
  marginRight: theme.spacing(0.5),
}));

const IndicatorContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  cursor: 'pointer',
  padding: theme.spacing(0.5, 1),
  borderRadius: theme.spacing(1),
  transition: 'background-color 0.2s',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

/**
 * WebSocket Indicator Component
 * Shows pulsing green dot when connected, gray when disconnected
 * Click to open settings popover with toggle for real-time updates
 */
const WebSocketIndicator = () => {
  const [connected, setConnected] = useState(false);
  const [enabled, setEnabled] = useState(() => {
    // Check localStorage for user preference (default: true)
    const saved = localStorage.getItem('websocket_enabled');
    return saved === null ? true : saved === 'true';
  });
  const [anchorEl, setAnchorEl] = useState(null);
  const [socket, setSocket] = useState(null);
  const [connectionCount, setConnectionCount] = useState(0);

  useEffect(() => {
    if (!enabled) {
      // User disabled WebSocket
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      setConnected(false);
      return;
    }

    // Initialize WebSocket connection
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';
    const token = localStorage.getItem('authToken');

    if (!token) {
      console.warn('No auth token found, WebSocket not connecting');
      return;
    }

    const newSocket = io(API_URL, {
      auth: {
        token,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on('connect', () => {
      console.log('✅ WebSocket connected');
      setConnected(true);
    });

    newSocket.on('connection', (data) => {
      console.log('WebSocket connection data:', data);
    });

    newSocket.on('disconnect', () => {
      console.log('❌ WebSocket disconnected');
      setConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      setConnected(false);
    });

    // Listen for escrow updates (will be used by useEscrowWebSocket hook)
    newSocket.on('escrow:updated', (data) => {
      console.log('📡 Escrow update received:', data);
      // This event will be handled by the useEscrowWebSocket hook in detail pages
    });

    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      newSocket.disconnect();
    };
  }, [enabled]);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleToggle = (event) => {
    const newEnabled = event.target.checked;
    setEnabled(newEnabled);
    localStorage.setItem('websocket_enabled', newEnabled.toString());

    if (!newEnabled && socket) {
      socket.disconnect();
      setSocket(null);
      setConnected(false);
    }
  };

  const open = Boolean(anchorEl);

  return (
    <>
      <Tooltip title={connected ? 'Real-time updates active' : enabled ? 'Connecting...' : 'Real-time updates disabled'}>
        <IndicatorContainer onClick={handleClick}>
          <PulsingDot connected={connected} />
          <Typography variant="caption" sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
            {connected ? 'Live' : 'Offline'}
          </Typography>
        </IndicatorContainer>
      </Tooltip>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        sx={{ mt: 1 }}
      >
        <Box sx={{ p: 2, minWidth: 280 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            {connected ? (
              <Wifi color="success" sx={{ mr: 1 }} />
            ) : (
              <WifiOff color="disabled" sx={{ mr: 1 }} />
            )}
            <Typography variant="subtitle1" fontWeight="600">
              Real-Time Updates
            </Typography>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {connected
              ? 'Connected - Changes will appear instantly across all tabs and devices.'
              : enabled
              ? 'Connecting to server...'
              : 'Disabled - Refresh the page to see updates.'}
          </Typography>

          <Divider sx={{ my: 2 }} />

          <FormControlLabel
            control={
              <Switch
                checked={enabled}
                onChange={handleToggle}
                color="primary"
              />
            }
            label={
              <Box>
                <Typography variant="body2">Enable Live Updates</Typography>
                <Typography variant="caption" color="text.secondary">
                  {enabled
                    ? 'Updates appear instantly'
                    : 'Manual refresh required'}
                </Typography>
              </Box>
            }
          />

          {connected && (
            <>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                  Connection Status
                </Typography>
                <Typography variant="caption" color="success.main" fontWeight="600">
                  Connected
                </Typography>
              </Box>
            </>
          )}

          <Box sx={{ mt: 2, p: 1, backgroundColor: 'info.light', borderRadius: 1 }}>
            <Typography variant="caption" color="info.dark">
              💡 Premium Feature: Real-time collaboration allows your team to see changes instantly without refreshing.
            </Typography>
          </Box>
        </Box>
      </Popover>
    </>
  );
};

export default WebSocketIndicator;
