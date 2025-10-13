import React, { useState, useEffect } from 'react';
import {
  Box,
  Chip,
  Tooltip,
  Zoom,
  useTheme,
  alpha
} from '@mui/material';
import {
  Wifi,
  WifiOff,
  CloudDone,
  CloudOff
} from '@mui/icons-material';
import websocketService from '../../services/websocket.service';

/**
 * ConnectionStatus - Floating indicator showing WebSocket connection state
 *
 * PHASE 6: Real-time connection visibility
 * Shows green "Connected" when WebSocket is active, red "Disconnected" otherwise
 */
const ConnectionStatus = () => {
  const theme = useTheme();
  const [isConnected, setIsConnected] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [connectedSince, setConnectedSince] = useState(null);
  const [lastDisconnectReason, setLastDisconnectReason] = useState(null);

  useEffect(() => {
    // Initialize with current connection status
    setIsConnected(websocketService.isConnected);
    if (websocketService.isConnected) {
      setConnectedSince(new Date());
    }

    // Listen for connection events
    const unsubscribe = websocketService.on('connection', (data) => {
      if (data.status === 'connected') {
        setIsConnected(true);
        setConnectedSince(new Date());
        setReconnectAttempts(0);
        setLastDisconnectReason(null);
      } else if (data.status === 'disconnected') {
        setIsConnected(false);
        setConnectedSince(null);
        setLastDisconnectReason(data.reason || 'Unknown');
      }
    });

    // Listen for reconnection attempts
    const reconnectUnsubscribe = websocketService.on('reconnecting', (data) => {
      setReconnectAttempts(data.attempt || 0);
    });

    return () => {
      if (unsubscribe) unsubscribe();
      if (reconnectUnsubscribe) reconnectUnsubscribe();
    };
  }, []);

  // Calculate uptime
  const getUptime = () => {
    if (!connectedSince) return 'Disconnected';

    const now = new Date();
    const diff = Math.floor((now - connectedSince) / 1000); // seconds

    if (diff < 60) return `${diff}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ${Math.floor((diff % 3600) / 60)}m`;
    return `${Math.floor(diff / 86400)}d ${Math.floor((diff % 86400) / 3600)}h`;
  };

  // Tooltip content with connection details
  const tooltipContent = isConnected ? (
    <Box sx={{ p: 0.5 }}>
      <Box sx={{ fontWeight: 600, mb: 0.5 }}>WebSocket Connected</Box>
      <Box sx={{ fontSize: '0.75rem', opacity: 0.9 }}>
        Uptime: {getUptime()}
      </Box>
      <Box sx={{ fontSize: '0.75rem', opacity: 0.7, mt: 0.5 }}>
        Real-time updates enabled
      </Box>
    </Box>
  ) : (
    <Box sx={{ p: 0.5 }}>
      <Box sx={{ fontWeight: 600, mb: 0.5 }}>WebSocket Disconnected</Box>
      {lastDisconnectReason && (
        <Box sx={{ fontSize: '0.75rem', opacity: 0.9, mb: 0.5 }}>
          Reason: {lastDisconnectReason}
        </Box>
      )}
      {reconnectAttempts > 0 && (
        <Box sx={{ fontSize: '0.75rem', opacity: 0.9 }}>
          Reconnecting... (Attempt {reconnectAttempts})
        </Box>
      )}
      <Box sx={{ fontSize: '0.75rem', opacity: 0.7, mt: 0.5 }}>
        Data may not update in real-time
      </Box>
    </Box>
  );

  return (
    <Zoom in timeout={300}>
      <Box
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          zIndex: 1200, // Below modals (1300) but above everything else
        }}
      >
        <Tooltip
          title={tooltipContent}
          placement="top-end"
          arrow
          TransitionComponent={Zoom}
        >
          <Chip
            icon={isConnected ? <Wifi /> : <WifiOff />}
            label={isConnected ? 'Connected' : (reconnectAttempts > 0 ? 'Reconnecting...' : 'Disconnected')}
            size="small"
            sx={{
              backgroundColor: isConnected
                ? alpha(theme.palette.success.main, 0.1)
                : alpha(theme.palette.error.main, 0.1),
              borderColor: isConnected
                ? theme.palette.success.main
                : theme.palette.error.main,
              border: '1px solid',
              color: isConnected
                ? theme.palette.success.main
                : theme.palette.error.main,
              fontWeight: 500,
              fontSize: '0.75rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: isConnected
                  ? alpha(theme.palette.success.main, 0.2)
                  : alpha(theme.palette.error.main, 0.2),
                transform: 'scale(1.05)',
              },
              '& .MuiChip-icon': {
                color: isConnected
                  ? theme.palette.success.main
                  : theme.palette.error.main,
                fontSize: '1rem',
              },
              // Pulse animation when reconnecting
              ...(reconnectAttempts > 0 && {
                animation: 'pulse 1.5s ease-in-out infinite',
                '@keyframes pulse': {
                  '0%': {
                    boxShadow: `0 0 0 0 ${alpha(theme.palette.warning.main, 0.7)}`,
                  },
                  '70%': {
                    boxShadow: `0 0 0 6px ${alpha(theme.palette.warning.main, 0)}`,
                  },
                  '100%': {
                    boxShadow: `0 0 0 0 ${alpha(theme.palette.warning.main, 0)}`,
                  },
                },
              }),
            }}
          />
        </Tooltip>
      </Box>
    </Zoom>
  );
};

export default ConnectionStatus;
