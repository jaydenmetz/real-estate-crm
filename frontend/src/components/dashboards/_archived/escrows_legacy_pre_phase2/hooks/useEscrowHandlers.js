/**
 * useEscrowHandlers - Custom hook for escrow event handlers
 *
 * Provides all the event handler functions for escrow operations
 * Extracted from EscrowsDashboard.jsx during Phase 7 refactoring
 * @since 1.0.5
 */

import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { escrowsAPI } from '../../../../services/api.service';

export const useEscrowHandlers = ({
  escrows,
  setEscrows,
  archivedEscrows,
  setArchivedEscrows,
  setArchivedCount,
  selectedStatus,
  calculateStats,
  generateChartData,
  fetchEscrows,
}) => {
  const navigate = useNavigate();

  /**
   * Handle escrow click - navigate to detail page
   */
  const handleEscrowClick = useCallback((escrowId) => {
    navigate(`/escrows/${escrowId}`);
  }, [navigate]);

  /**
   * Handle new escrow success
   */
  const handleNewEscrowSuccess = useCallback((escrowId) => {
    // Refresh the escrows list
    fetchEscrows();
    // Navigate to the new escrow detail page
    navigate(`/escrows/${escrowId}`);
  }, [fetchEscrows, navigate]);

  /**
   * Handle checklist update
   */
  const handleChecklistUpdate = useCallback(async (escrowId, updatedChecklists) => {
    try {
      // Update the checklist via API
      await escrowsAPI.updateChecklist(escrowId, updatedChecklists);

      // Update local state to reflect the change
      setEscrows(prevEscrows =>
        prevEscrows.map(esc =>
          esc.id === escrowId
            ? { ...esc, checklists: updatedChecklists }
            : esc
        )
      );
    } catch (error) {
      console.error('Failed to update checklist:', error);
    }
  }, [setEscrows]);

  /**
   * Handle archive escrow
   */
  const handleArchive = useCallback(async (escrowId) => {
    try {
      const response = await escrowsAPI.archive(escrowId);

      if (response && response.success) {
        // Move escrow from active to archived
        const archivedEscrow = escrows.find(e => e.id === escrowId);

        if (archivedEscrow) {
          // Mark as archived
          archivedEscrow.deleted_at = new Date().toISOString();

          setEscrows(prev => prev.filter(e => e.id !== escrowId));
          setArchivedEscrows(prev => [...prev, archivedEscrow]);
          setArchivedCount(prev => prev + 1);

          // Recalculate stats with remaining active escrows
          const remainingEscrows = escrows.filter(e => e.id !== escrowId);
          calculateStats(remainingEscrows, selectedStatus);
          generateChartData(remainingEscrows);
        } else {
          console.error('Escrow not found in active escrows array');
        }
      } else {
        console.error('Archive failed - API returned success: false', response);
      }
    } catch (error) {
      const errorMessage = error?.message || error?.toString() || 'Unknown error';
      console.error('Failed to archive escrow:', errorMessage);
    }
  }, [escrows, setEscrows, setArchivedEscrows, setArchivedCount, selectedStatus, calculateStats, generateChartData]);

  /**
   * Handle restore escrow
   */
  const handleRestore = useCallback(async (escrowId) => {
    try {
      const response = await escrowsAPI.restore(escrowId);
      if (response.success) {
        // Move escrow from archived to active
        const restoredEscrow = archivedEscrows.find(e => e.id === escrowId);
        if (restoredEscrow) {
          // Remove archived marker
          delete restoredEscrow.deleted_at;
          delete restoredEscrow.deletedAt;

          setArchivedEscrows(prev => prev.filter(e => e.id !== escrowId));
          setEscrows(prev => [...prev, restoredEscrow]);
          setArchivedCount(prev => Math.max(0, prev - 1));

          // Recalculate stats with updated active escrows
          const updatedEscrows = [...escrows, restoredEscrow];
          calculateStats(updatedEscrows, selectedStatus);
          generateChartData(updatedEscrows);
        }
      }
    } catch (error) {
      console.error('Failed to restore escrow:', error);
    }
  }, [archivedEscrows, escrows, setArchivedEscrows, setEscrows, setArchivedCount, selectedStatus, calculateStats, generateChartData]);

  /**
   * Handle permanent delete
   */
  const handlePermanentDelete = useCallback(async (escrowId) => {
    if (!window.confirm('Are you sure you want to permanently delete this escrow? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await escrowsAPI.permanentDelete(escrowId);
      if (response.success) {
        setArchivedEscrows(prev => prev.filter(e => e.id !== escrowId));
        setArchivedCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Failed to permanently delete escrow:', error);
    }
  }, [setArchivedEscrows, setArchivedCount]);

  /**
   * Handle update escrow
   */
  const handleUpdateEscrow = useCallback(async (escrowId, updateData) => {
    try {
      // Normalize field names (convert snake_case to camelCase for consistency)
      const normalizedData = { ...updateData };
      if (updateData.escrow_status !== undefined) {
        normalizedData.escrowStatus = updateData.escrow_status;
      }
      if (updateData.purchase_price !== undefined) {
        normalizedData.purchasePrice = updateData.purchase_price;
      }
      if (updateData.my_commission !== undefined) {
        normalizedData.myCommission = updateData.my_commission;
      }
      if (updateData.closing_date !== undefined) {
        normalizedData.closingDate = updateData.closing_date;
      }
      if (updateData.acceptance_date !== undefined) {
        normalizedData.acceptanceDate = updateData.acceptance_date;
      }

      // Make API call to update the escrow
      const response = await escrowsAPI.update(escrowId, normalizedData);

      if (response.success) {
        // Update the escrow in local state
        const updateEscrowInList = (escrowsList) =>
          escrowsList.map(escrow =>
            escrow.id === escrowId
              ? { ...escrow, ...normalizedData, ...response.data }
              : escrow
          );

        // Check if escrow is in active or archived list
        const isInArchived = archivedEscrows.some(e => e.id === escrowId);

        if (isInArchived) {
          setArchivedEscrows(prev => updateEscrowInList(prev));
        } else {
          setEscrows(prev => updateEscrowInList(prev));

          // Recalculate stats for active escrows
          const updatedEscrows = updateEscrowInList(escrows);
          calculateStats(updatedEscrows, selectedStatus);
          generateChartData(updatedEscrows);
        }

        return { success: true };
      } else {
        throw new Error(response.error || 'Failed to update escrow');
      }
    } catch (error) {
      console.error('Failed to update escrow:', error);
      return { success: false, error: error.message };
    }
  }, [escrows, archivedEscrows, setEscrows, setArchivedEscrows, selectedStatus, calculateStats, generateChartData]);

  /**
   * Handle batch operations
   */
  const handleBatchDelete = useCallback(async (escrowIds) => {
    if (!window.confirm(`Are you sure you want to permanently delete ${escrowIds.length} escrow(s)? This action cannot be undone.`)) {
      return;
    }

    try {
      const deletePromises = escrowIds.map(id => escrowsAPI.permanentDelete(id));
      const results = await Promise.allSettled(deletePromises);

      const successCount = results.filter(r => r.status === 'fulfilled' && r.value?.success).length;
      const failCount = results.filter(r => r.status === 'rejected' || !r.value?.success).length;

      // Update state for successfully deleted escrows
      const deletedIds = escrowIds.slice(0, successCount);
      setArchivedEscrows(prev => prev.filter(e => !deletedIds.includes(e.id)));
      setArchivedCount(prev => Math.max(0, prev - deletedIds.length));

      if (failCount > 0) {
        console.error(`Failed to delete ${failCount} escrow(s)`);
      }

      return { successCount, failCount };
    } catch (error) {
      console.error('Failed to delete escrows:', error);
      return { successCount: 0, failCount: escrowIds.length };
    }
  }, [setArchivedEscrows, setArchivedCount]);

  return {
    handleEscrowClick,
    handleNewEscrowSuccess,
    handleChecklistUpdate,
    handleArchive,
    handleRestore,
    handlePermanentDelete,
    handleUpdateEscrow,
    handleBatchDelete,
  };
};