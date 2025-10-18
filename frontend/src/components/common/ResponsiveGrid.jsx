import React from 'react';
import { Box } from '@mui/material';
import useResponsiveLayout from '../../hooks/useResponsiveLayout';

/**
 * ResponsiveGrid - Smart grid that prevents widget squishing
 *
 * Automatically wraps items to next row when they get too narrow.
 * No more crushed widgets or unreadable text!
 *
 * @param {string} variant - Layout preset: 'widgets', 'cards', 'stats', 'form'
 * @param {number} minWidth - Minimum width before wrapping (default: 300)
 * @param {React.ReactNode} children - Grid items
 * @param {object} sx - Additional MUI sx props
 *
 * @example
 * <ResponsiveGrid variant="widgets">
 *   <Widget1 />
 *   <Widget2 />
 *   <Widget3 />
 * </ResponsiveGrid>
 */
const ResponsiveGrid = ({
  variant = 'cards',
  minWidth = 300,
  children,
  sx = {},
  ...props
}) => {
  const { layouts, spacing } = useResponsiveLayout();

  // Layout presets
  const variantStyles = {
    // Widget grid (2×2 on desktop, auto-wrap on tablet)
    widgets: {
      display: 'grid',
      gap: spacing.gap,
      gridTemplateColumns: {
        xs: '1fr',
        sm: `repeat(auto-fit, minmax(${minWidth}px, 1fr))`,
        md: 'repeat(2, 1fr)',
      },
    },

    // Card grid (auto-fit at all sizes)
    cards: {
      display: 'grid',
      gap: spacing.gap,
      gridTemplateColumns: {
        xs: '1fr',
        sm: `repeat(auto-fit, minmax(${minWidth}px, 1fr))`,
      },
    },

    // Stats row (1-2-3-4 columns)
    stats: {
      display: 'grid',
      gap: spacing.gap,
      gridTemplateColumns: {
        xs: '1fr',
        sm: 'repeat(2, 1fr)',
        md: 'repeat(3, 1fr)',
        lg: 'repeat(4, 1fr)',
      },
    },

    // Form grid (1 column mobile, 2 columns desktop)
    form: {
      display: 'grid',
      gap: spacing.gap,
      gridTemplateColumns: {
        xs: '1fr',
        md: 'repeat(2, 1fr)',
      },
    },

    // Dense grid (more columns, smaller items)
    dense: {
      display: 'grid',
      gap: spacing.compact,
      gridTemplateColumns: {
        xs: 'repeat(2, 1fr)',
        sm: 'repeat(3, 1fr)',
        md: 'repeat(4, 1fr)',
        lg: 'repeat(6, 1fr)',
      },
    },

    // Masonry-style (auto-fill with variable widths)
    masonry: {
      display: 'grid',
      gap: spacing.gap,
      gridTemplateColumns: {
        xs: '1fr',
        sm: `repeat(auto-fill, minmax(${minWidth}px, 1fr))`,
      },
      gridAutoFlow: 'dense', // Fill gaps
    },
  };

  const gridStyles = variantStyles[variant] || variantStyles.cards;

  return (
    <Box
      sx={{
        ...gridStyles,
        ...sx,
      }}
      {...props}
    >
      {children}
    </Box>
  );
};

export default ResponsiveGrid;
