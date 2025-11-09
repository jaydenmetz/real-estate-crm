/**
 * useListingHandlers - Custom hook for listing event handlers
 *
 * Provides all the event handler functions for listing operations
 * Extracted from ListingsDashboard.jsx during refactoring
 */

import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { listingsAPI } from '../../../../services/api.service';

export const useListingHandlers = ({
  listings,
  setListings,
  archivedListings,
  setArchivedListings,
  setArchivedCount,
  selectedStatus,
  calculateStats,
  fetchListings,
  selectedArchivedIds,
  setSelectedArchivedIds,
  setBatchDeleting,
}) => {
  const navigate = useNavigate();

  /**
   * Handle listing click - navigate to detail page
   */
  const handleListingClick = useCallback((listingId) => {
    navigate(`/listings/${listingId}`);
  }, [navigate]);

  /**
   * Handle select all archived listings
   */
  const handleSelectAll = useCallback((checked) => {
    if (checked) {
      setSelectedArchivedIds(archivedListings.map(l => l.id));
    } else {
      setSelectedArchivedIds([]);
    }
  }, [archivedListings, setSelectedArchivedIds]);

  /**
   * Handle batch delete archived listings
   */
  const handleBatchDelete = useCallback(async () => {
    if (selectedArchivedIds.length === 0) return;

    const count = selectedArchivedIds.length;
    if (!window.confirm(`Are you sure you want to permanently delete ${count} listing${count > 1 ? 's' : ''}? This action cannot be undone.`)) {
      return;
    }

    setBatchDeleting(true);
    try {
      const response = await listingsAPI.batchDelete(selectedArchivedIds);
      if (response.success) {
        // Remove deleted listings from both lists locally
        const deletedIds = new Set(selectedArchivedIds);
        setArchivedListings(prev => prev.filter(l => !deletedIds.has(l.id)));
        setListings(prev => prev.filter(l => !deletedIds.has(l.id)));
        setArchivedCount(prev => Math.max(0, prev - selectedArchivedIds.length));
        setSelectedArchivedIds([]);

        // Recalculate stats with remaining active listings only
        const remainingListings = listings.filter(l => !deletedIds.has(l.id));
        calculateStats(remainingListings, selectedStatus);

        // // console.log(`Successfully permanently deleted ${response.data.deletedCount || selectedArchivedIds.length} listings`);
      }
    } catch (error) {
      console.error('Failed to batch delete listings:', error);
      alert('Failed to delete listings. Please try again.');
    } finally {
      setBatchDeleting(false);
    }
  }, [selectedArchivedIds, listings, setArchivedListings, setListings, setArchivedCount, setSelectedArchivedIds, selectedStatus, calculateStats, setBatchDeleting]);

  /**
   * Handle archive listing
   */
  const handleArchive = useCallback(async (listingId) => {
    try {
      const response = await listingsAPI.archive(listingId);

      if (response && response.success) {
        // Move listing from active to archived
        const archivedListing = listings.find(l => l.id === listingId);

        if (archivedListing) {
          // Mark as archived
          archivedListing.deleted_at = new Date().toISOString();

          setListings(prev => prev.filter(l => l.id !== listingId));
          setArchivedListings(prev => [...prev, archivedListing]);
          setArchivedCount(prev => prev + 1);

          // Recalculate stats with remaining active listings
          const remainingListings = listings.filter(l => l.id !== listingId);
          calculateStats(remainingListings, selectedStatus);
        } else {
          console.error('Listing not found in active listings array');
        }
      } else {
        console.error('Archive failed - API returned success: false', response);
      }
    } catch (error) {
      const errorMessage = error?.message || error?.toString() || 'Unknown error';
      console.error('Failed to archive listing:', errorMessage);
    }
  }, [listings, setListings, setArchivedListings, setArchivedCount, selectedStatus, calculateStats]);

  /**
   * Handle restore listing from archive
   */
  const handleRestore = useCallback(async (listingId) => {
    try {
      const response = await listingsAPI.restore(listingId);

      if (response && response.success) {
        // Move listing from archived to active
        const restoredListing = archivedListings.find(l => l.id === listingId);

        if (restoredListing) {
          // Remove deleted_at timestamp
          delete restoredListing.deleted_at;
          delete restoredListing.deletedAt;

          setArchivedListings(prev => prev.filter(l => l.id !== listingId));
          setListings(prev => [...prev, restoredListing]);
          setArchivedCount(prev => Math.max(0, prev - 1));

          // Recalculate stats with updated active listings
          const updatedListings = [...listings, restoredListing];
          calculateStats(updatedListings, selectedStatus);
        } else {
          console.error('Listing not found in archived listings array');
        }
      } else {
        console.error('Restore failed - API returned success: false', response);
      }
    } catch (error) {
      const errorMessage = error?.message || error?.toString() || 'Unknown error';
      console.error('Failed to restore listing:', errorMessage);
    }
  }, [archivedListings, listings, setArchivedListings, setListings, setArchivedCount, selectedStatus, calculateStats]);

  /**
   * Handle update listing
   */
  const handleUpdateListing = useCallback((listingId, updatedData) => {
    setListings(prev => prev.map(l =>
      l.id === listingId ? { ...l, ...updatedData } : l
    ));
  }, [setListings]);

  return {
    handleListingClick,
    handleSelectAll,
    handleBatchDelete,
    handleArchive,
    handleRestore,
    handleUpdateListing,
  };
};
