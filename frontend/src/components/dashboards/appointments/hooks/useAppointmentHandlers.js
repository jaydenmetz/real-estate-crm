/**
 * useAppointmentHandlers - Custom hook for appointment event handlers
 *
 * Provides all the event handler functions for appointment operations
 * Extracted from AppointmentsDashboard.jsx during refactoring
 */

import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { appointmentsAPI } from '../../../../services/api.service';

export const useAppointmentHandlers = ({
  appointments,
  setAppointments,
  archivedAppointments,
  setArchivedAppointments,
  setArchivedCount,
  selectedStatus,
  calculateStats,
  fetchAppointments,
  selectedArchivedIds,
  setSelectedArchivedIds,
  setBatchDeleting,
}) => {
  const navigate = useNavigate();

  /**
   * Handle appointment click - navigate to detail page
   */
  const handleAppointmentClick = useCallback((appointmentId) => {
    navigate(`/appointments/${appointmentId}`);
  }, [navigate]);

  /**
   * Handle select all archived appointments
   */
  const handleSelectAll = useCallback((checked) => {
    if (checked) {
      setSelectedArchivedIds(archivedAppointments.map(l => l.id));
    } else {
      setSelectedArchivedIds([]);
    }
  }, [archivedAppointments, setSelectedArchivedIds]);

  /**
   * Handle batch delete archived appointments
   */
  const handleBatchDelete = useCallback(async () => {
    if (selectedArchivedIds.length === 0) return;

    const count = selectedArchivedIds.length;
    if (!window.confirm(`Are you sure you want to permanently delete ${count} appointment${count > 1 ? 's' : ''}? This action cannot be undone.`)) {
      return;
    }

    setBatchDeleting(true);
    try {
      const response = await appointmentsAPI.batchDelete(selectedArchivedIds);
      if (response.success) {
        // Remove deleted appointments from both lists locally
        const deletedIds = new Set(selectedArchivedIds);
        setArchivedAppointments(prev => prev.filter(l => !deletedIds.has(l.id)));
        setAppointments(prev => prev.filter(l => !deletedIds.has(l.id)));
        setArchivedCount(prev => Math.max(0, prev - selectedArchivedIds.length));
        setSelectedArchivedIds([]);

        // Recalculate stats with remaining active appointments only
        const remainingAppointments = appointments.filter(l => !deletedIds.has(l.id));
        calculateStats(remainingAppointments, selectedStatus);

        // console.log(`Successfully permanently deleted ${response.data.deletedCount || selectedArchivedIds.length} appointments`);
      }
    } catch (error) {
      console.error('Failed to batch delete appointments:', error);
      alert('Failed to delete appointments. Please try again.');
    } finally {
      setBatchDeleting(false);
    }
  }, [selectedArchivedIds, appointments, setArchivedAppointments, setAppointments, setArchivedCount, setSelectedArchivedIds, selectedStatus, calculateStats, setBatchDeleting]);

  /**
   * Handle archive appointment
   */
  const handleArchive = useCallback(async (appointmentId) => {
    try {
      const response = await appointmentsAPI.archive(appointmentId);

      if (response && response.success) {
        // Move appointment from active to archived
        const archivedAppointment = appointments.find(l => l.id === appointmentId);

        if (archivedAppointment) {
          // Mark as archived
          archivedAppointment.deleted_at = new Date().toISOString();

          setAppointments(prev => prev.filter(l => l.id !== appointmentId));
          setArchivedAppointments(prev => [...prev, archivedAppointment]);
          setArchivedCount(prev => prev + 1);

          // Recalculate stats with remaining active appointments
          const remainingAppointments = appointments.filter(l => l.id !== appointmentId);
          calculateStats(remainingAppointments, selectedStatus);
        } else {
          console.error('Appointment not found in active appointments array');
        }
      } else {
        console.error('Archive failed - API returned success: false', response);
      }
    } catch (error) {
      const errorMessage = error?.message || error?.toString() || 'Unknown error';
      console.error('Failed to archive appointment:', errorMessage);
    }
  }, [appointments, setAppointments, setArchivedAppointments, setArchivedCount, selectedStatus, calculateStats]);

  /**
   * Handle restore appointment from archive
   */
  const handleRestore = useCallback(async (appointmentId) => {
    try {
      const response = await appointmentsAPI.restore(appointmentId);

      if (response && response.success) {
        // Move appointment from archived to active
        const restoredAppointment = archivedAppointments.find(l => l.id === appointmentId);

        if (restoredAppointment) {
          // Remove deleted_at timestamp
          delete restoredAppointment.deleted_at;
          delete restoredAppointment.deletedAt;

          setArchivedAppointments(prev => prev.filter(l => l.id !== appointmentId));
          setAppointments(prev => [...prev, restoredAppointment]);
          setArchivedCount(prev => Math.max(0, prev - 1));

          // Recalculate stats with updated active appointments
          const updatedAppointments = [...appointments, restoredAppointment];
          calculateStats(updatedAppointments, selectedStatus);
        } else {
          console.error('Appointment not found in archived appointments array');
        }
      } else {
        console.error('Restore failed - API returned success: false', response);
      }
    } catch (error) {
      const errorMessage = error?.message || error?.toString() || 'Unknown error';
      console.error('Failed to restore appointment:', errorMessage);
    }
  }, [archivedAppointments, appointments, setArchivedAppointments, setAppointments, setArchivedCount, selectedStatus, calculateStats]);

  /**
   * Handle update appointment
   */
  const handleUpdateAppointment = useCallback((appointmentId, updatedData) => {
    setAppointments(prev => prev.map(l =>
      l.id === appointmentId ? { ...l, ...updatedData } : l
    ));
  }, [setAppointments]);

  return {
    handleAppointmentClick,
    handleSelectAll,
    handleBatchDelete,
    handleArchive,
    handleRestore,
    handleUpdateAppointment,
  };
};
