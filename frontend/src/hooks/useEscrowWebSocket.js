import { useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';

/**
 * useEscrowWebSocket Hook
 * Listens for real-time escrow updates and triggers callbacks
 *
 * @param {string} escrowId - The escrow ID to listen for
 * @param {object} callbacks - Event callbacks
 * @param {function} callbacks.onEscrowUpdate - Called when any escrow update occurs
 * @param {function} callbacks.onPeopleUpdate - Called when people are updated
 * @param {function} callbacks.onTimelineUpdate - Called when timeline is updated
 * @param {function} callbacks.onFinancialsUpdate - Called when financials are updated
 * @param {function} callbacks.onChecklistUpdate - Called when checklist is updated
 * @param {function} callbacks.onDocumentsUpdate - Called when documents are updated
 * @param {number} pollingInterval - Fallback REST polling interval in ms (default: 30000)
 * @returns {object} { connected, enabled }
 */
export const useEscrowWebSocket = (escrowId, callbacks = {}, pollingInterval = 30000) => {
  const socketRef = useRef(null);
  const pollingRef = useRef(null);
  const enabledRef = useRef(true);

  // Check if WebSocket is enabled in localStorage
  const isWebSocketEnabled = () => {
    const saved = localStorage.getItem('websocket_enabled');
    return saved === null ? true : saved === 'true';
  };

  // Handle escrow update event
  const handleEscrowUpdate = useCallback((data) => {
    // Filter by escrowId (only process updates for this escrow)
    if (data.escrowId !== escrowId) {
      return;
    }

    console.log('📡 Escrow update received:', data);

    // Call the generic update callback
    if (callbacks.onEscrowUpdate) {
      callbacks.onEscrowUpdate(data);
    }

    // Call specific callbacks based on update type
    switch (data.type) {
      case 'people:updated':
        if (callbacks.onPeopleUpdate) {
          callbacks.onPeopleUpdate(data.data);
        }
        break;
      case 'timeline:updated':
        if (callbacks.onTimelineUpdate) {
          callbacks.onTimelineUpdate(data.data);
        }
        break;
      case 'financials:updated':
        if (callbacks.onFinancialsUpdate) {
          callbacks.onFinancialsUpdate(data.data);
        }
        break;
      case 'checklist:updated':
        if (callbacks.onChecklistUpdate) {
          callbacks.onChecklistUpdate(data.data, data.category);
        }
        break;
      case 'documents:added':
      case 'documents:deleted':
        if (callbacks.onDocumentsUpdate) {
          callbacks.onDocumentsUpdate(data.data || data.documentId, data.type);
        }
        break;
      default:
        console.warn('Unknown escrow update type:', data.type);
    }
  }, [escrowId, callbacks]);

  // Start REST polling as fallback
  const startPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
    }

    pollingRef.current = setInterval(() => {
      console.log('🔄 Polling escrow data (WebSocket disabled or disconnected)');
      if (callbacks.onEscrowUpdate) {
        // Trigger a generic update to refetch data
        callbacks.onEscrowUpdate({ type: 'polling', escrowId });
      }
    }, pollingInterval);
  }, [escrowId, callbacks, pollingInterval]);

  // Stop REST polling
  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!escrowId) {
      console.warn('useEscrowWebSocket: No escrowId provided');
      return;
    }

    enabledRef.current = isWebSocketEnabled();

    if (!enabledRef.current) {
      console.log('WebSocket disabled, using REST polling');
      startPolling();
      return () => stopPolling();
    }

    // Initialize WebSocket connection
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';
    const token = localStorage.getItem('authToken');

    if (!token) {
      console.warn('No auth token found, falling back to REST polling');
      startPolling();
      return () => stopPolling();
    }

    const socket = io(API_URL, {
      auth: {
        token,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log(`✅ WebSocket connected for escrow ${escrowId}`);
      stopPolling(); // Stop polling when WebSocket connects
    });

    socket.on('disconnect', () => {
      console.log('❌ WebSocket disconnected, falling back to REST polling');
      startPolling(); // Start polling when WebSocket disconnects
    });

    socket.on('escrow:updated', handleEscrowUpdate);

    socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      startPolling(); // Start polling on connection error
    });

    // Cleanup
    return () => {
      if (socket) {
        socket.off('escrow:updated', handleEscrowUpdate);
        socket.disconnect();
      }
      stopPolling();
    };
  }, [escrowId, handleEscrowUpdate, startPolling, stopPolling]);

  // Listen for localStorage changes (user toggling WebSocket in another tab)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'websocket_enabled') {
        const newEnabled = e.newValue === 'true';
        enabledRef.current = newEnabled;

        if (!newEnabled && socketRef.current) {
          console.log('WebSocket disabled by user, disconnecting...');
          socketRef.current.disconnect();
          startPolling();
        } else if (newEnabled && !socketRef.current?.connected) {
          console.log('WebSocket enabled by user, reconnecting...');
          // Will reconnect on next effect run
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [startPolling]);

  return {
    connected: socketRef.current?.connected || false,
    enabled: enabledRef.current,
  };
};
