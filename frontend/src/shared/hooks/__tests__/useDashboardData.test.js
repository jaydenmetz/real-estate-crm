import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { useDashboardData } from '../useDashboardData';

// Create a wrapper for React Query
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useDashboardData Hook', () => {
  const mockFetchFunction = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetchFunction.mockResolvedValue({
      items: [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' }
      ],
      stats: [{ label: 'Total', value: 2 }],
      totalPages: 1,
      totalItems: 2
    });
  });

  describe('Initialization', () => {
    it('should initialize with default values', async () => {
      const { result } = renderHook(
        () => useDashboardData(mockFetchFunction, {
          queryKey: 'test-data',
          defaultViewMode: 'grid',
          defaultRowsPerPage: 20
        }),
        { wrapper: createWrapper() }
      );

      expect(result.current.toolbar.viewMode).toBe('grid');
      expect(result.current.pagination.rowsPerPage).toBe(20);
      expect(result.current.pagination.page).toBe(1);

      await waitFor(() => {
        expect(result.current.data).toHaveLength(2);
      });
    });
  });

  describe('Search Functionality', () => {
    it('should debounce search term', async () => {
      const { result } = renderHook(
        () => useDashboardData(mockFetchFunction, {
          queryKey: 'test-data'
        }),
        { wrapper: createWrapper() }
      );

      act(() => {
        result.current.toolbar.onSearchChange('test');
      });

      // Search should not trigger immediately
      expect(mockFetchFunction).not.toHaveBeenCalledWith(
        expect.objectContaining({ search: 'test' })
      );

      // Wait for debounce
      await waitFor(() => {
        expect(mockFetchFunction).toHaveBeenCalledWith(
          expect.objectContaining({ search: 'test' })
        );
      }, { timeout: 500 });
    });

    it('should reset page to 1 when search changes', async () => {
      const { result } = renderHook(
        () => useDashboardData(mockFetchFunction, {
          queryKey: 'test-data'
        }),
        { wrapper: createWrapper() }
      );

      // Set page to 2
      act(() => {
        result.current.pagination.onPageChange(2);
      });

      expect(result.current.pagination.page).toBe(2);

      // Change search term
      act(() => {
        result.current.toolbar.onSearchChange('new search');
      });

      // Page should reset to 1
      await waitFor(() => {
        expect(result.current.pagination.page).toBe(1);
      });
    });
  });

  describe('Pagination', () => {
    it('should handle page changes', async () => {
      const { result } = renderHook(
        () => useDashboardData(mockFetchFunction, {
          queryKey: 'test-data'
        }),
        { wrapper: createWrapper() }
      );

      act(() => {
        result.current.pagination.onPageChange(3);
      });

      expect(result.current.pagination.page).toBe(3);
    });

    it('should handle rows per page changes and reset page', async () => {
      const { result } = renderHook(
        () => useDashboardData(mockFetchFunction, {
          queryKey: 'test-data'
        }),
        { wrapper: createWrapper() }
      );

      // Set page to 2
      act(() => {
        result.current.pagination.onPageChange(2);
      });

      // Change rows per page
      act(() => {
        result.current.pagination.onRowsPerPageChange(50);
      });

      expect(result.current.pagination.rowsPerPage).toBe(50);
      expect(result.current.pagination.page).toBe(1);
    });
  });

  describe('Filtering', () => {
    it('should handle filter changes', async () => {
      const { result } = renderHook(
        () => useDashboardData(mockFetchFunction, {
          queryKey: 'test-data'
        }),
        { wrapper: createWrapper() }
      );

      act(() => {
        result.current.toolbar.onFilterChange({ status: 'active' });
      });

      await waitFor(() => {
        expect(mockFetchFunction).toHaveBeenCalledWith(
          expect.objectContaining({ status: 'active' })
        );
      });
    });

    it('should clear filters', async () => {
      const { result } = renderHook(
        () => useDashboardData(mockFetchFunction, {
          queryKey: 'test-data',
          defaultFilters: { status: 'all' }
        }),
        { wrapper: createWrapper() }
      );

      // Set filters
      act(() => {
        result.current.toolbar.onFilterChange({ status: 'active' });
      });

      // Clear filters
      act(() => {
        result.current.clearFilters();
      });

      await waitFor(() => {
        expect(result.current.toolbar.filters).toEqual({ status: 'all' });
      });
    });
  });

  describe('View Mode', () => {
    it('should handle view mode changes', async () => {
      const { result } = renderHook(
        () => useDashboardData(mockFetchFunction, {
          queryKey: 'test-data',
          defaultViewMode: 'grid'
        }),
        { wrapper: createWrapper() }
      );

      act(() => {
        result.current.toolbar.onViewModeChange('list');
      });

      expect(result.current.toolbar.viewMode).toBe('list');
    });
  });

  describe('Selection', () => {
    it('should handle item selection', async () => {
      const { result } = renderHook(
        () => useDashboardData(mockFetchFunction, {
          queryKey: 'test-data'
        }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.data).toHaveLength(2);
      });

      act(() => {
        result.current.selection.onSelectItem(1, true);
      });

      expect(result.current.selection.selected).toEqual([1]);

      act(() => {
        result.current.selection.onSelectItem(1, false);
      });

      expect(result.current.selection.selected).toEqual([]);
    });

    it('should handle select all', async () => {
      const { result } = renderHook(
        () => useDashboardData(mockFetchFunction, {
          queryKey: 'test-data'
        }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.data).toHaveLength(2);
      });

      act(() => {
        result.current.selection.onSelectAll(true);
      });

      expect(result.current.selection.selected).toEqual([1, 2]);

      act(() => {
        result.current.selection.onSelectAll(false);
      });

      expect(result.current.selection.selected).toEqual([]);
    });
  });

  describe('Error Handling', () => {
    it('should handle fetch errors', async () => {
      const mockError = new Error('Fetch failed');
      mockFetchFunction.mockRejectedValue(mockError);

      const { result } = renderHook(
        () => useDashboardData(mockFetchFunction, {
          queryKey: 'test-data'
        }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });
    });
  });
});
