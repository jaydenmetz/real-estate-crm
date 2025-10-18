import { useEffect, useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import websocketService from '../services/websocket.service';

export const useWebSocket = () => {
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [lastMessage, setLastMessage] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    // Initialize WebSocket connection
    // console.log('🔌 Initializing WebSocket connection...');
    websocketService.connect().then(() => {
      // console.log('✅ WebSocket connected successfully');
    }).catch((error) => {
      console.error('❌ WebSocket connection failed:', error);
    });

    const unsubscribeConnection = websocketService.on('connection', (data) => {
      // console.log('WebSocket connection status changed:', data.status);
      setConnectionStatus(data.status);
    });

    const unsubscribeDataUpdate = websocketService.on('data:update', (data) => {
      const { entityType, entityId, action } = data;
      
      const queriesToInvalidate = [];
      
      switch (entityType) {
        case 'escrow':
          queriesToInvalidate.push(['escrows'], ['dashboardStats']);
          break;
        case 'listing':
          queriesToInvalidate.push(['listings'], ['dashboardStats']);
          break;
        case 'client':
          queriesToInvalidate.push(['clients'], ['dashboardStats']);
          break;
        case 'appointment':
          queriesToInvalidate.push(['appointments'], ['todaySchedule']);
          break;
        case 'lead':
          queriesToInvalidate.push(['leads'], ['dashboardStats']);
          break;
        default:
          queriesToInvalidate.push(['dashboardStats']);
      }

      queriesToInvalidate.forEach(queryKey => {
        queryClient.invalidateQueries(queryKey);
      });
    });

    const unsubscribeNotification = websocketService.on('notification', (data) => {
      setLastMessage(data);
    });

    return () => {
      // console.log('🔌 Cleaning up WebSocket connection...');
      unsubscribeConnection();
      unsubscribeDataUpdate();
      unsubscribeNotification();
      websocketService.disconnect();
    };
  }, [queryClient]);

  const sendMessage = useCallback((event, data) => {
    websocketService.send(event, data);
  }, []);

  const sendToAlex = useCallback((message) => {
    websocketService.sendToAlex(message);
  }, []);

  const sendToAgent = useCallback((agentId, message) => {
    websocketService.sendToAgent(agentId, message);
  }, []);

  return {
    connectionStatus,
    lastMessage,
    sendMessage,
    sendToAlex,
    sendToAgent,
    isConnected: connectionStatus === 'connected',
  };
};