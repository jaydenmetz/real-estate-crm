import React from 'react';
import { Box } from '@mui/material';

// Import responsive utilities
import ResponsiveGrid from '../../../common/ResponsiveGrid';
import useResponsiveLayout from '../../../../hooks/useResponsiveLayout';

// Import widgets
import PeopleWidget from './PeopleWidget';
import FinancialsWidget from './FinancialsWidget';
import DocumentsWidget from './DocumentsWidget';
import ActivityFeed from './ActivityFeed';

/**
 * EscrowMainContent - Main content area with widget grid
 *
 * LAYOUT:
 * - 3 widgets in responsive grid:
 *   - People (left)
 *   - Financials (middle)
 *   - Documents (right)
 * - Activity Feed (full-width below)
 *
 * NOTE: Timeline is now at top level in index.jsx (above sidebars)
 */
const EscrowMainContent = ({
  data,
  expandedWidget,
  onWidgetExpand,
  onUpdateSection,
}) => {
  const { spacing } = useResponsiveLayout();

  return (
    <Box flex={1} p={1.5}>
      {/* 3 Main Widgets - Smart Responsive Grid (People, Financials, Documents) */}
      <ResponsiveGrid variant="widgets" minWidth={320} sx={{ pb: 1 }}>
        {/* People Widget */}
        <PeopleWidget
          data={data?.people}
          expanded={expandedWidget === 'people'}
          onExpand={() => onWidgetExpand('people')}
          onUpdate={(changes) => onUpdateSection('people', changes)}
        />

        {/* Financials Widget */}
        <FinancialsWidget
          data={data?.financials}
          expanded={expandedWidget === 'financials'}
          onExpand={() => onWidgetExpand('financials')}
          onUpdate={(changes) => onUpdateSection('financials', changes)}
        />

        {/* Documents Widget */}
        <DocumentsWidget
          data={data?.documents}
          expanded={expandedWidget === 'documents'}
          onExpand={() => onWidgetExpand('documents')}
          onUpdate={(changes) => onUpdateSection('documents', changes)}
        />
      </ResponsiveGrid>

      {/* Activity Feed - Full Width Below */}
      <ActivityFeed />
    </Box>
  );
};

export default EscrowMainContent;
