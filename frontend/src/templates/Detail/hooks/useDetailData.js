import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';

/**
 * useDetailData Hook
 *
 * Centralized data fetching hook for detail pages
 * Uses entity config to determine API calls and query keys
 *
 * @param {Object} config - Entity configuration object
 * @returns {Object} - Query data, mutations, and helper functions
 */
export const useDetailData = (config) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const entityName = config.entity.name;
  const entityNamePlural = config.entity.namePlural;

  // Fetch main entity data
  const {
    data: entity,
    isLoading,
    error,
    isError,
    refetch
  } = useQuery({
    queryKey: [entityName, id],
    queryFn: async () => {
      try {
        const response = await config.api.getById(id);
        return response.data || response;
      } catch (err) {
        console.error(`Error fetching ${entityName}:`, err);
        throw err;
      }
    },
    refetchInterval: config.detail?.refetchInterval || 30000,
    retry: 1,
    enabled: !!id,
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data) => {
      return await config.api.update(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [entityName, id] });
      queryClient.invalidateQueries({ queryKey: [entityNamePlural] });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      return await config.api.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [entityNamePlural] });
      navigate(`/${entityNamePlural}`);
    },
  });

  // Archive mutation
  const archiveMutation = useMutation({
    mutationFn: async () => {
      return await config.api.archive(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [entityName, id] });
      queryClient.invalidateQueries({ queryKey: [entityNamePlural] });
    },
  });

  // Restore mutation
  const restoreMutation = useMutation({
    mutationFn: async () => {
      return await config.api.restore(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [entityName, id] });
      queryClient.invalidateQueries({ queryKey: [entityNamePlural] });
    },
  });

  // Helper functions
  const handleUpdate = async (data) => {
    try {
      await updateMutation.mutateAsync(data);
      return { success: true };
    } catch (error) {
      console.error(`Error updating ${entityName}:`, error);
      return { success: false, error };
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync();
      return { success: true };
    } catch (error) {
      console.error(`Error deleting ${entityName}:`, error);
      return { success: false, error };
    }
  };

  const handleArchive = async () => {
    try {
      await archiveMutation.mutateAsync();
      return { success: true };
    } catch (error) {
      console.error(`Error archiving ${entityName}:`, error);
      return { success: false, error };
    }
  };

  const handleRestore = async () => {
    try {
      await restoreMutation.mutateAsync();
      return { success: true };
    } catch (error) {
      console.error(`Error restoring ${entityName}:`, error);
      return { success: false, error };
    }
  };

  return {
    // Data
    entity,
    isLoading,
    error,
    isError,
    id,

    // Mutations
    updateMutation,
    deleteMutation,
    archiveMutation,
    restoreMutation,

    // Helper functions
    handleUpdate,
    handleDelete,
    handleArchive,
    handleRestore,
    refetch,

    // Navigation
    navigate,
    navigateToList: () => navigate(`/${entityNamePlural}`),
  };
};
