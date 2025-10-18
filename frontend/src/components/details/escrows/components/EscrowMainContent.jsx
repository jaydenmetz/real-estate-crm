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

const WidgetGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(3),
  padding: theme.spacing(3),
  [theme.breakpoints.up('xs')]: {
    gridTemplateColumns: '1fr',
  },
  [theme.breakpoints.up('sm')]: {
    gridTemplateColumns: 'repeat(2, 1fr)',
  },
  [theme.breakpoints.up('md')]: {
    gridTemplateColumns: 'repeat(3, 1fr)',
  },
  [theme.breakpoints.up('lg')]: {
    gridTemplateColumns: 'repeat(4, 1fr)',
  },
}));

/**
 * EscrowMainContent - Main content area with widget grid
 *
 * Displays all escrow widgets in a responsive grid layout:
 * - Details, Property (full width on mobile, 2 cols on desktop)
 * - People, Timeline (1 col each)
 * - Financials (full width on mobile, 2 cols on desktop)
 * - Checklists: Loan, House, Admin (1 col each)
 */
const EscrowMainContent = ({
  data,
  expandedWidget,
  onWidgetExpand,
  onUpdateSection,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box flex={1}>
      <WidgetGrid>
        {/* Details Widget */}
        <Box gridColumn={isMobile ? 'span 1' : 'span 2'}>
          <DetailsWidget
            data={data?.details}
            expanded={expandedWidget === 'details'}
            onExpand={() => onWidgetExpand('details')}
            onUpdate={(changes) => onUpdateSection('details', changes)}
          />
        </Box>

        {/* Property Widget */}
        <Box gridColumn={isMobile ? 'span 1' : 'span 2'}>
          <PropertyWidget
            data={data?.['property-details']}
            expanded={expandedWidget === 'property'}
            onExpand={() => onWidgetExpand('property')}
            onUpdate={(changes) => onUpdateSection('property-details', changes)}
          />
        </Box>

        {/* People Widget */}
        <PeopleWidget
          data={data?.people}
          expanded={expandedWidget === 'people'}
          onExpand={() => onWidgetExpand('people')}
          onUpdate={(changes) => onUpdateSection('people', changes)}
        />

        {/* Timeline Widget */}
        <TimelineWidget
          data={data?.timeline}
          expanded={expandedWidget === 'timeline'}
          onExpand={() => onWidgetExpand('timeline')}
          onUpdate={(changes) => onUpdateSection('timeline', changes)}
        />

        {/* Financials Widget */}
        <Box gridColumn={isMobile ? 'span 1' : 'span 2'}>
          <FinancialsWidget
            data={data?.financials}
            expanded={expandedWidget === 'financial'}
            onExpand={() => onWidgetExpand('financials')}
            onUpdate={(changes) => onUpdateSection('financials', changes)}
          />
        </Box>

        {/* Checklist Widgets */}
        <ChecklistWidget
          title="Loan Checklist"
          data={data?.['checklist-loan']}
          type="loan"
          expanded={expandedWidget === 'checklist-loan'}
          onExpand={() => onWidgetExpand('checklist-loan')}
          onUpdate={(changes) => onUpdateSection('checklist-loan', changes)}
        />

        <ChecklistWidget
          title="House Checklist"
          data={data?.['checklist-house']}
          type="house"
          expanded={expandedWidget === 'checklist-house'}
          onExpand={() => onWidgetExpand('checklist-house')}
          onUpdate={(changes) => onUpdateSection('checklist-house', changes)}
        />

        <ChecklistWidget
          title="Admin Checklist"
          data={data?.['checklist-admin']}
          type="admin"
          expanded={expandedWidget === 'checklist-admin'}
          onExpand={() => onWidgetExpand('checklist-admin')}
          onUpdate={(changes) => onUpdateSection('checklist-admin', changes)}
        />
      </WidgetGrid>
    </Box>
  );
};

export default EscrowMainContent;
