import React from 'react';
import { Box } from '@mui/material';

// Import responsive utilities
import ResponsiveGrid from '../../../common/ResponsiveGrid';
import useResponsiveLayout from '../../../../hooks/useResponsiveLayout';

// Import widgets
import DetailsWidget from './DetailsWidget';
import PropertyWidget from './PropertyWidget';
import PeopleWidget from './PeopleWidget';
import TimelineWidget from './TimelineWidget';
import FinancialsWidget from './FinancialsWidget';
import ChecklistWidget from './ChecklistWidget';
import ActivityFeed from './ActivityFeed';

/**
 * EscrowMainContent - Main content area with widget grid
 *
 * Displays 4 main widgets in 2×2 grid + Activity Feed below:
 * - Timeline & Deadlines (top-left)
 * - Financials (top-right)
 * - People (bottom-left)
 * - Progress (bottom-right)
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
      {/* Main 4 Widgets - Smart 2×2 Grid that wraps gracefully */}
      <ResponsiveGrid variant="widgets" minWidth={320} sx={{ pb: spacing.section }}>
        {/* Timeline Widget */}
        <TimelineWidget
          data={data?.timeline}
          expanded={expandedWidget === 'timeline'}
          onExpand={() => onWidgetExpand('timeline')}
          onUpdate={(changes) => onUpdateSection('timeline', changes)}
        />

        {/* Financials Widget */}
        <FinancialsWidget
          data={data?.financials}
          expanded={expandedWidget === 'financials'}
          onExpand={() => onWidgetExpand('financials')}
          onUpdate={(changes) => onUpdateSection('financials', changes)}
        />

        {/* People Widget */}
        <PeopleWidget
          data={data?.people}
          expanded={expandedWidget === 'people'}
          onExpand={() => onWidgetExpand('people')}
          onUpdate={(changes) => onUpdateSection('people', changes)}
        />

        {/* Progress Widget (using checklist as progress for now) */}
        <ChecklistWidget
          title="Progress"
          data={data?.['checklist-loan']}
          type="progress"
          expanded={expandedWidget === 'progress'}
          onExpand={() => onWidgetExpand('progress')}
          onUpdate={(changes) => onUpdateSection('checklist-loan', changes)}
        />
      </ResponsiveGrid>

      {/* Activity Feed - Full Width Below */}
      <ActivityFeed />
    </Box>
  );
};

export default EscrowMainContent;
