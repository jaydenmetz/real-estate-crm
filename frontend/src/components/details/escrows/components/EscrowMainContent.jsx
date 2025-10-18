import React from 'react';
import { Box, useTheme, useMediaQuery } from '@mui/material';
import { styled } from '@mui/material/styles';

// Import widgets
import DetailsWidget from './DetailsWidget';
import PropertyWidget from './PropertyWidget';
import PeopleWidget from './PeopleWidget';
import TimelineWidget from './TimelineWidget';
import FinancialsWidget from './FinancialsWidget';
import ChecklistWidget from './ChecklistWidget';
import ActivityFeed from './ActivityFeed';

const WidgetGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(3),
  paddingBottom: theme.spacing(3),
  [theme.breakpoints.up('xs')]: {
    gridTemplateColumns: '1fr',
  },
  [theme.breakpoints.up('md')]: {
    gridTemplateColumns: 'repeat(2, 1fr)',
  },
}));

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
  return (
    <Box flex={1} p={3} sx={{ backgroundColor: '#f9fafb' }}>
      {/* Main 4 Widgets - 2×2 Grid */}
      <WidgetGrid>
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
      </WidgetGrid>

      {/* Activity Feed - Full Width Below */}
      <Box mt={3}>
        <ActivityFeed />
      </Box>
    </Box>
  );
};

export default EscrowMainContent;
