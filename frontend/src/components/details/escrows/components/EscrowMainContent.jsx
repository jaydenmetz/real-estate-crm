import React from 'react';
import { Box } from '@mui/material';

// Import responsive utilities
import ResponsiveGrid from '../../../common/ResponsiveGrid';
import useResponsiveLayout from '../../../../hooks/useResponsiveLayout';

// Import widgets
import TimelineWidgetHorizontal from './TimelineWidgetHorizontal';
import PeopleWidget from './PeopleWidget';
import FinancialsWidget from './FinancialsWidget';
import DocumentsWidget from './DocumentsWidget';
import ActivityFeed from './ActivityFeed';

/**
 * EscrowMainContent - Main content area with new layout
 *
 * NEW LAYOUT:
 * - Horizontal Timeline (full-width at top)
 * - 3 widgets below in responsive grid:
 *   - People (left)
 *   - Financials (middle)
 *   - Documents (right)
 * - Activity Feed (full-width below)
 */
const EscrowMainContent = ({
  data,
  expandedWidget,
  onWidgetExpand,
  onUpdateSection,
}) => {
  const { spacing } = useResponsiveLayout();

  return (
    <Box flex={1} p={spacing.container}>
      {/* Horizontal Timeline - Full Width at Top */}
      <TimelineWidgetHorizontal
        data={data?.timeline}
        onUpdate={(changes) => onUpdateSection('timeline', changes)}
      />

      {/* 3 Main Widgets - Smart Responsive Grid (People, Financials, Documents) */}
      <ResponsiveGrid variant="widgets" minWidth={320} sx={{ pb: spacing.section }}>
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

        {/* Documents Widget - NEW */}
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
