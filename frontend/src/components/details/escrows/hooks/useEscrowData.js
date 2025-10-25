import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { debounce } from 'lodash';
import { escrowsAPI } from '../../../../services/api.service';

export function useEscrowData(escrowId) {
  const queryClient = useQueryClient();
  const [unsavedChanges, setUnsavedChanges] = useState({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const originalDataRef = useRef(null);

  // Fetch escrow data
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['escrow-details', escrowId],
    queryFn: async () => {
      const response = await escrowsAPI.getById(escrowId);
      if (response.success) {
        originalDataRef.current = JSON.parse(JSON.stringify(response.data));
        return response.data;
      }
      throw new Error(response.error?.message || 'Failed to fetch escrow');
    },
    enabled: !!escrowId,
    staleTime: 30000, // Consider data stale after 30 seconds
    gcTime: 300000, // Keep in cache for 5 minutes (renamed from cacheTime in v5)
  });

  // Update mutation for each section
  const updateMutation = useMutation({
    mutationFn: async ({ section, changes }) => {
      // Map section names to API endpoints
      const endpointMap = {
        'details': 'update',
        'property-details': 'updatePropertyDetails',
        'people': 'updatePeople',
        'timeline': 'updateTimeline',
        'financials': 'updateFinancials',
        'checklist-loan': 'updateChecklists',
        'checklist-house': 'updateChecklists',
        'checklist-admin': 'updateChecklists',
      };

      const endpoint = endpointMap[section];
      
      // For checklists, we need to send all checklist data
      if (section.startsWith('checklist-')) {
        const checklistType = section.replace('checklist-', '');
        const allChecklists = {
          loan: data?.['checklist-loan'] || {},
          house: data?.['checklist-house'] || {},
          admin: data?.['checklist-admin'] || {},
        };
        allChecklists[checklistType] = { ...allChecklists[checklistType], ...changes };
        return await escrowsAPI[endpoint](escrowId, allChecklists);
      }

      return await escrowsAPI[endpoint](escrowId, changes);
    },
    onSuccess: (response, { section }) => {
      // Update cache with new data
      queryClient.setQueryData(['escrow-details', escrowId], (oldData) => ({
        ...oldData,
        [section]: { ...oldData[section], ...response.data },
      }));

      // Clear unsaved changes for this section
      setUnsavedChanges((prev) => {
        const updated = { ...prev };
        delete updated[section];
        return updated;
      });
    },
    onError: (error, { section }) => {
      console.error(`Failed to update ${section}:`, error);
      // You could show a toast notification here
    },
  });

  // Debounced update function
  const debouncedUpdate = useRef(
    debounce(async (section, changes) => {
      updateMutation.mutate({ section, changes });
    }, 500)
  ).current;

  // Update section with changes
  const updateSection = useCallback((section, changes) => {
    // Track unsaved changes
    setUnsavedChanges((prev) => ({
      ...prev,
      [section]: { ...(prev[section] || {}), ...changes },
    }));

    // Optimistically update the UI
    queryClient.setQueryData(['escrow-details', escrowId], (oldData) => ({
      ...oldData,
      [section]: { ...oldData[section], ...changes },
    }));

    // Trigger debounced API update
    debouncedUpdate(section, changes);
  }, [escrowId, queryClient, debouncedUpdate]);

  // Save all unsaved changes
  const saveAllChanges = useCallback(async () => {
    const promises = Object.entries(unsavedChanges).map(([section, changes]) => {
      return updateMutation.mutateAsync({ section, changes });
    });

    await Promise.all(promises);
    setUnsavedChanges({});
  }, [unsavedChanges, updateMutation]);

  // Check if there are unsaved changes
  useEffect(() => {
    setHasUnsavedChanges(Object.keys(unsavedChanges).length > 0);
  }, [unsavedChanges]);

  // Get changed fields for a section
  const getChangedFields = useCallback((section) => {
    if (!originalDataRef.current || !data) return {};
    
    const original = originalDataRef.current[section] || {};
    const current = data[section] || {};
    const changes = {};

    Object.keys(current).forEach((key) => {
      if (JSON.stringify(original[key]) !== JSON.stringify(current[key])) {
        changes[key] = current[key];
      }
    });

    return changes;
  }, [data]);

  // Calculate completion percentage
  const getCompletionPercentage = useCallback(() => {
    if (!data) return 0;

    let totalFields = 0;
    let completedFields = 0;

    // Count all non-null fields
    Object.values(data).forEach((section) => {
      if (typeof section === 'object' && section !== null) {
        Object.values(section).forEach((value) => {
          totalFields++;
          if (value !== null && value !== '' && value !== false) {
            completedFields++;
          }
        });
      }
    });

    return totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0;
  }, [data]);

  return {
    data,
    loading: isLoading,
    error,
    refetch,
    updateSection,
    hasUnsavedChanges,
    saveAllChanges,
    getChangedFields,
    getCompletionPercentage,
    isSaving: updateMutation.isLoading,
  };
}