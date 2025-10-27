/**
 * useClientHandlers - Custom hook for client event handlers
 *
 * Provides all the event handler functions for client operations
 * Extracted from ClientsDashboard.jsx during refactoring
 */

import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { clientsAPI } from '../../../../services/api.service';

export const useClientHandlers = ({
  clients,
  setClients,
  archivedClients,
  setArchivedClients,
  setArchivedCount,
  selectedStatus,
  calculateStats,
  fetchClients,
  selectedArchivedIds,
  setSelectedArchivedIds,
  setBatchDeleting,
}) => {
  const navigate = useNavigate();

  /**
   * Handle client click - navigate to detail page
   */
  const handleClientClick = useCallback((clientId) => {
    navigate(`/clients/${clientId}`);
  }, [navigate]);

  /**
   * Handle select all archived clients
   */
  const handleSelectAll = useCallback((checked) => {
    if (checked) {
      setSelectedArchivedIds(archivedClients.map(c => c.id));
    } else {
      setSelectedArchivedIds([]);
    }
  }, [archivedClients, setSelectedArchivedIds]);

  /**
   * Handle batch delete archived clients
   */
  const handleBatchDelete = useCallback(async () => {
    if (selectedArchivedIds.length === 0) return;

    const count = selectedArchivedIds.length;
    if (!window.confirm(`Are you sure you want to permanently delete ${count} client${count > 1 ? 's' : ''}? This action cannot be undone.`)) {
      return;
    }

    setBatchDeleting(true);
    try {
      const response = await clientsAPI.batchDelete(selectedArchivedIds);
      if (response.success) {
        // Remove deleted clients from both lists locally
        const deletedIds = new Set(selectedArchivedIds);
        setArchivedClients(prev => prev.filter(c => !deletedIds.has(c.id)));
        setClients(prev => prev.filter(c => !deletedIds.has(c.id)));
        setArchivedCount(prev => Math.max(0, prev - selectedArchivedIds.length));
        setSelectedArchivedIds([]);

        // Recalculate stats with remaining active clients only
        const remainingClients = clients.filter(c => !deletedIds.has(c.id));
        calculateStats(remainingClients, selectedStatus);

        // // console.log(`Successfully permanently deleted ${response.data.deletedCount || selectedArchivedIds.length} clients`);
      }
    } catch (error) {
      console.error('Failed to batch delete clients:', error);
      alert('Failed to delete clients. Please try again.');
    } finally {
      setBatchDeleting(false);
    }
  }, [selectedArchivedIds, clients, setArchivedClients, setClients, setArchivedCount, setSelectedArchivedIds, selectedStatus, calculateStats, setBatchDeleting]);

  /**
   * Handle archive client
   */
  const handleArchive = useCallback(async (clientId) => {
    try {
      const response = await clientsAPI.archive(clientId);

      if (response && response.success) {
        // Move client from active to archived
        const archivedClient = clients.find(c => c.id === clientId);

        if (archivedClient) {
          // Mark as archived
          archivedClient.deleted_at = new Date().toISOString();

          setClients(prev => prev.filter(c => c.id !== clientId));
          setArchivedClients(prev => [...prev, archivedClient]);
          setArchivedCount(prev => prev + 1);

          // Recalculate stats with remaining active clients
          const remainingClients = clients.filter(c => c.id !== clientId);
          calculateStats(remainingClients, selectedStatus);
        } else {
          console.error('Client not found in active clients array');
        }
      } else {
        console.error('Archive failed - API returned success: false', response);
      }
    } catch (error) {
      const errorMessage = error?.message || error?.toString() || 'Unknown error';
      console.error('Failed to archive client:', errorMessage);
    }
  }, [clients, setClients, setArchivedClients, setArchivedCount, selectedStatus, calculateStats]);

  /**
   * Handle restore client from archive
   */
  const handleRestore = useCallback(async (clientId) => {
    try {
      const response = await clientsAPI.restore(clientId);

      if (response && response.success) {
        // Move client from archived to active
        const restoredClient = archivedClients.find(c => c.id === clientId);

        if (restoredClient) {
          // Remove deleted_at timestamp
          delete restoredClient.deleted_at;
          delete restoredClient.deletedAt;

          setArchivedClients(prev => prev.filter(c => c.id !== clientId));
          setClients(prev => [...prev, restoredClient]);
          setArchivedCount(prev => Math.max(0, prev - 1));

          // Recalculate stats with updated active clients
          const updatedClients = [...clients, restoredClient];
          calculateStats(updatedClients, selectedStatus);
        } else {
          console.error('Client not found in archived clients array');
        }
      } else {
        console.error('Restore failed - API returned success: false', response);
      }
    } catch (error) {
      const errorMessage = error?.message || error?.toString() || 'Unknown error';
      console.error('Failed to restore client:', errorMessage);
    }
  }, [archivedClients, clients, setArchivedClients, setClients, setArchivedCount, selectedStatus, calculateStats]);

  /**
   * Handle update client
   */
  const handleUpdateClient = useCallback((clientId, updatedData) => {
    setClients(prev => prev.map(c =>
      c.id === clientId ? { ...c, ...updatedData } : c
    ));
  }, [setClients]);

  return {
    handleClientClick,
    handleSelectAll,
    handleBatchDelete,
    handleArchive,
    handleRestore,
    handleUpdateClient,
  };
};
