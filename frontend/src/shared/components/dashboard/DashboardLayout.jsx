import React from 'react';
import { Container, Box, Alert, Button } from '@mui/material';
import { Refresh } from '@mui/icons-material';
import DashboardHeader from './DashboardHeader';
import DashboardStats from './DashboardStats';
import DashboardToolbar from './DashboardToolbar';
import DashboardContent from './DashboardContent';
import DashboardPagination from './DashboardPagination';
import DashboardError from './DashboardError';
import { useTheme } from '@mui/material/styles';

/**
 * DashboardLayout - Master layout component for all dashboard views
 * Provides consistent structure while allowing customization
 */
const DashboardLayout = ({
  // Header props
  title,
  subtitle,
  breadcrumbs = [],

  // Statistics props
  stats = [],
  statsLoading = false,
  statsColor = 'primary',

  // Toolbar props
  toolbar = {},

  // Content props
  content,
  contentLoading = false,

  // Pagination props
  pagination = null,

  // State props
  loading = false,
  error = null,

  // Styling props
  maxWidth = 'xl',
  spacing = 4
}) => {
  const theme = useTheme();

  // Handle error state with retry capability
  if (error && !contentLoading) {
    return (
      <Container maxWidth={maxWidth} sx={{ mt: spacing, mb: spacing }}>
        <DashboardError
          error={error}
          onRetry={toolbar.onRefresh}
          title={title}
        />
      </Container>
    );
  }

  return (
    <Container maxWidth={maxWidth} sx={{ mt: spacing, mb: spacing }}>
      {/* Header Section */}
      <DashboardHeader
        title={title}
        subtitle={subtitle}
        breadcrumbs={breadcrumbs}
        actions={toolbar.headerActions}
        loading={loading}
      />

      {/* Statistics Cards */}
      {stats.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <DashboardStats
            stats={stats}
            color={statsColor}
            loading={statsLoading || loading}
          />
        </Box>
      )}

      {/* Toolbar with search, filters, and actions */}
      {toolbar && Object.keys(toolbar).length > 0 && (
        <Box sx={{ mb: 3 }}>
          <DashboardToolbar
            viewMode={toolbar.viewMode}
            onViewModeChange={toolbar.onViewModeChange}
            searchTerm={toolbar.searchTerm}
            onSearchChange={toolbar.onSearchChange}
            onFilterClick={toolbar.onFilterClick}
            actions={toolbar.actions}
            availableModes={toolbar.availableModes}
            searchPlaceholder={toolbar.searchPlaceholder}
            loading={loading}
          />
          {/* Custom filters section */}
          {toolbar.customFilters && (
            <Box sx={{ mt: 2 }}>
              {toolbar.customFilters}
            </Box>
          )}
        </Box>
      )}

      {/* Main Content Area */}
      <DashboardContent
        loading={contentLoading || loading}
        empty={!content || (Array.isArray(content) && content.length === 0)}
        emptyMessage={toolbar.emptyMessage || 'No data found'}
        emptyAction={toolbar.emptyAction}
        viewMode={toolbar.viewMode}
      >
        {content}
      </DashboardContent>

      {/* Pagination Controls */}
      {pagination && pagination.totalItems > 0 && (
        <Box sx={{ mt: 3 }}>
          <DashboardPagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            itemsPerPage={pagination.rowsPerPage}
            totalItems={pagination.totalItems}
            onPageChange={pagination.onPageChange}
            onItemsPerPageChange={pagination.onRowsPerPageChange}
          />
        </Box>
      )}
    </Container>
  );
};

export default DashboardLayout;
