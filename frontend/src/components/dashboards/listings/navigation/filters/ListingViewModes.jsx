/**
 * ListingViewModes.jsx
 *
 * View mode configuration for listings dashboard.
 * Defines available view modes (card/list/table) and default.
 *
 * Usage: Imported into listings.config.js
 */

import GridViewIcon from '@mui/icons-material/GridView';
import ViewListIcon from '@mui/icons-material/ViewList';
import TableChartIcon from '@mui/icons-material/TableChart';

export const listingViewModes = [
  {
    value: 'card',
    label: 'Card',
    icon: GridViewIcon  // CRITICAL FIX: Use component, not string
  },
  {
    value: 'list',
    label: 'List',
    icon: ViewListIcon  // CRITICAL FIX: Use component, not string
  },
  {
    value: 'table',
    label: 'Table',
    icon: TableChartIcon  // CRITICAL FIX: Use component, not string
  }
];

export const listingDefaultViewMode = 'card';
