import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { BrowserRouter } from 'react-router-dom';
import DashboardLayout from '../DashboardLayout';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      {children}
    </BrowserRouter>
  </QueryClientProvider>
);

describe('DashboardLayout Component', () => {
  const mockStats = [
    {
      id: 'stat1',
      label: 'Active Items',
      value: 25,
      change: 12,
      format: 'number'
    },
    {
      id: 'stat2',
      label: 'Total Revenue',
      value: 125000,
      change: -5,
      format: 'currency'
    }
  ];

  const mockToolbar = {
    viewMode: 'grid',
    onViewModeChange: jest.fn(),
    searchTerm: '',
    onSearchChange: jest.fn(),
    onFilterClick: jest.fn(),
    onRefresh: jest.fn()
  };

  const mockPagination = {
    page: 1,
    totalPages: 5,
    totalItems: 100,
    rowsPerPage: 20,
    onPageChange: jest.fn(),
    onRowsPerPageChange: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render all sections when provided', () => {
      render(
        <DashboardLayout
          title="Test Dashboard"
          subtitle="Test subtitle"
          stats={mockStats}
          toolbar={mockToolbar}
          content={<div>Test Content</div>}
          pagination={mockPagination}
        />,
        { wrapper }
      );

      expect(screen.getByText('Test Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Test subtitle')).toBeInTheDocument();
      expect(screen.getByText('Active Items')).toBeInTheDocument();
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('should render without optional props', () => {
      render(
        <DashboardLayout
          title="Minimal Dashboard"
          content={<div>Content</div>}
        />,
        { wrapper }
      );

      expect(screen.getByText('Minimal Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Content')).toBeInTheDocument();
    });
  });

  describe('Loading States', () => {
    it('should display loading skeletons when loading', () => {
      const { container } = render(
        <DashboardLayout
          title="Loading Dashboard"
          stats={mockStats}
          loading={true}
        />,
        { wrapper }
      );

      const skeletons = container.querySelectorAll('.MuiSkeleton-root');
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    it('should display error state with retry option', () => {
      const mockRetry = jest.fn();
      const error = new Error('Failed to load data');

      render(
        <DashboardLayout
          title="Error Dashboard"
          error={error}
          toolbar={{ ...mockToolbar, onRefresh: mockRetry }}
        />,
        { wrapper }
      );

      expect(screen.getByText(/Failed to load data/)).toBeInTheDocument();

      const retryButton = screen.getByText('Retry');
      fireEvent.click(retryButton);
      expect(mockRetry).toHaveBeenCalled();
    });
  });

  describe('Interactions', () => {
    it('should handle search input', async () => {
      render(
        <DashboardLayout
          title="Test"
          toolbar={mockToolbar}
          content={<div>Content</div>}
        />,
        { wrapper }
      );

      const searchInput = screen.getByPlaceholderText(/search/i);
      fireEvent.change(searchInput, { target: { value: 'test search' } });

      await waitFor(() => {
        expect(mockToolbar.onSearchChange).toHaveBeenCalledWith('test search');
      });
    });
  });

  describe('Empty States', () => {
    it('should display empty message when no content', () => {
      render(
        <DashboardLayout
          title="Empty Dashboard"
          content={[]}
          toolbar={{
            ...mockToolbar,
            emptyMessage: 'No items found',
            emptyAction: {
              label: 'Create Item',
              onClick: jest.fn()
            }
          }}
        />,
        { wrapper }
      );

      expect(screen.getByText('No items found')).toBeInTheDocument();
      expect(screen.getByText('Create Item')).toBeInTheDocument();
    });
  });
});
