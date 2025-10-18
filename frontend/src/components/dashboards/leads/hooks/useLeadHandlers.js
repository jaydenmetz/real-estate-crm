/**
 * useLeadHandlers - Custom hook for lead event handlers
 *
 * Provides all the event handler functions for lead operations
 * Extracted from LeadsDashboard.jsx during refactoring
 */

import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { leadsAPI } from '../../../../services/api.service';

export const useLeadHandlers = ({
  leads,
  setLeads,
  archivedLeads,
  setArchivedLeads,
  setArchivedCount,
  selectedStatus,
  calculateStats,
  fetchLeads,
  selectedArchivedIds,
  setSelectedArchivedIds,
  setBatchDeleting,
}) => {
  const navigate = useNavigate();

  /**
   * Handle lead click - navigate to detail page
   */
  const handleLeadClick = useCallback((leadId) => {
    navigate(`/leads/${leadId}`);
  }, [navigate]);

  /**
   * Handle select all archived leads
   */
  const handleSelectAll = useCallback((checked) => {
    if (checked) {
      setSelectedArchivedIds(archivedLeads.map(l => l.id));
    } else {
      setSelectedArchivedIds([]);
    }
  }, [archivedLeads, setSelectedArchivedIds]);

  /**
   * Handle batch delete archived leads
   */
  const handleBatchDelete = useCallback(async () => {
    if (selectedArchivedIds.length === 0) return;

    const count = selectedArchivedIds.length;
    if (!window.confirm(`Are you sure you want to permanently delete ${count} lead${count > 1 ? 's' : ''}? This action cannot be undone.`)) {
      return;
    }

    setBatchDeleting(true);
    try {
      const response = await leadsAPI.batchDelete(selectedArchivedIds);
      if (response.success) {
        // Remove deleted leads from both lists locally
        const deletedIds = new Set(selectedArchivedIds);
        setArchivedLeads(prev => prev.filter(l => !deletedIds.has(l.id)));
        setLeads(prev => prev.filter(l => !deletedIds.has(l.id)));
        setArchivedCount(prev => Math.max(0, prev - selectedArchivedIds.length));
        setSelectedArchivedIds([]);

        // Recalculate stats with remaining active leads only
        const remainingLeads = leads.filter(l => !deletedIds.has(l.id));
        calculateStats(remainingLeads, selectedStatus);
      }
    } catch (error) {
      console.error('Failed to batch delete leads:', error);
      alert('Failed to delete leads. Please try again.');
    } finally {
      setBatchDeleting(false);
    }
  }, [selectedArchivedIds, leads, setArchivedLeads, setLeads, setArchivedCount, setSelectedArchivedIds, selectedStatus, calculateStats, setBatchDeleting]);

  /**
   * Handle archive lead
   */
  const handleArchive = useCallback(async (leadId) => {
    try {
      const response = await leadsAPI.archive(leadId);

      if (response && response.success) {
        // Move lead from active to archived
        const archivedLead = leads.find(l => l.id === leadId);

        if (archivedLead) {
          // Mark as archived
          archivedLead.deleted_at = new Date().toISOString();

          setLeads(prev => prev.filter(l => l.id !== leadId));
          setArchivedLeads(prev => [...prev, archivedLead]);
          setArchivedCount(prev => prev + 1);

          // Recalculate stats with remaining active leads
          const remainingLeads = leads.filter(l => l.id !== leadId);
          calculateStats(remainingLeads, selectedStatus);
        } else {
          console.error('Lead not found in active leads array');
        }
      } else {
        console.error('Archive failed - API returned success: false', response);
      }
    } catch (error) {
      const errorMessage = error?.message || error?.toString() || 'Unknown error';
      console.error('Failed to archive lead:', errorMessage);
    }
  }, [leads, setLeads, setArchivedLeads, setArchivedCount, selectedStatus, calculateStats]);

  /**
   * Handle restore lead from archive
   */
  const handleRestore = useCallback(async (leadId) => {
    try {
      const response = await leadsAPI.restore(leadId);

      if (response && response.success) {
        // Move lead from archived to active
        const restoredLead = archivedLeads.find(l => l.id === leadId);

        if (restoredLead) {
          // Remove deleted_at timestamp
          delete restoredLead.deleted_at;
          delete restoredLead.deletedAt;

          setArchivedLeads(prev => prev.filter(l => l.id !== leadId));
          setLeads(prev => [...prev, restoredLead]);
          setArchivedCount(prev => Math.max(0, prev - 1));

          // Recalculate stats with updated active leads
          const updatedLeads = [...leads, restoredLead];
          calculateStats(updatedLeads, selectedStatus);
        } else {
          console.error('Lead not found in archived leads array');
        }
      } else {
        console.error('Restore failed - API returned success: false', response);
      }
    } catch (error) {
      const errorMessage = error?.message || error?.toString() || 'Unknown error';
      console.error('Failed to restore lead:', errorMessage);
    }
  }, [archivedLeads, leads, setArchivedLeads, setLeads, setArchivedCount, selectedStatus, calculateStats]);

  /**
   * Handle update lead
   */
  const handleUpdateLead = useCallback((leadId, updatedData) => {
    setLeads(prev => prev.map(l =>
      l.id === leadId ? { ...l, ...updatedData } : l
    ));
  }, [setLeads]);

  return {
    handleLeadClick,
    handleSelectAll,
    handleBatchDelete,
    handleArchive,
    handleRestore,
    handleUpdateLead,
  };
};
