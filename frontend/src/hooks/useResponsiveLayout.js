import { useTheme, useMediaQuery } from '@mui/material';
import { useMemo } from 'react';

/**
 * useResponsiveLayout - The Ultimate Responsive Design Hook
 *
 * Provides comprehensive responsive design utilities including:
 * - Current breakpoint detection
 * - Device type detection
 * - Adaptive spacing/sizing
 * - Touch target sizing
 * - Fluid typography helpers
 *
 * @returns {Object} Responsive layout utilities
 *
 * @example
 * const { isMobile, isTablet, isDesktop, spacing, gridColumns } = useResponsiveLayout();
 *
 * // Use in component
 * <Box sx={{
 *   padding: spacing.container,
 *   gridTemplateColumns: gridColumns(1, 2, 3, 4)
 * }}>
 */
const useResponsiveLayout = () => {
  const theme = useTheme();

  // Breakpoint detection
  const isXs = useMediaQuery(theme.breakpoints.only('xs')); // 0-600px
  const isSm = useMediaQuery(theme.breakpoints.only('sm')); // 600-900px
  const isMd = useMediaQuery(theme.breakpoints.only('md')); // 900-1200px
  const isLg = useMediaQuery(theme.breakpoints.only('lg')); // 1200-1536px
  const isXl = useMediaQuery(theme.breakpoints.only('xl')); // 1536px+

  // Range queries (up to breakpoint)
  const upXs = useMediaQuery(theme.breakpoints.up('xs'));
  const upSm = useMediaQuery(theme.breakpoints.up('sm'));
  const upMd = useMediaQuery(theme.breakpoints.up('md'));
  const upLg = useMediaQuery(theme.breakpoints.up('lg'));
  const upXl = useMediaQuery(theme.breakpoints.up('xl'));

  // Range queries (down from breakpoint)
  const downSm = useMediaQuery(theme.breakpoints.down('sm'));
  const downMd = useMediaQuery(theme.breakpoints.down('md'));
  const downLg = useMediaQuery(theme.breakpoints.down('lg'));
  const downXl = useMediaQuery(theme.breakpoints.down('xl'));

  // Device categories
  const isMobile = isXs; // 0-600px
  const isTablet = isSm || isMd; // 600-1200px
  const isDesktop = isLg || isXl; // 1200px+
  const isMobileOrTablet = downMd; // 0-900px
  const isTabletOrDesktop = upSm; // 600px+

  // Current breakpoint name
  const breakpoint = useMemo(() => {
    if (isXs) return 'xs';
    if (isSm) return 'sm';
    if (isMd) return 'md';
    if (isLg) return 'lg';
    if (isXl) return 'xl';
    return 'md'; // fallback
  }, [isXs, isSm, isMd, isLg, isXl]);

  // Adaptive spacing (in theme.spacing units, multiply by 8 for px)
  const spacing = useMemo(() => ({
    // Gap between grid items
    gap: isXs ? 2 : isSm ? 2.5 : isMd ? 3 : isLg ? 4 : 5, // 16px → 40px

    // Container padding
    container: isXs ? 2 : isSm ? 3 : isMd ? 4 : isLg ? 5 : 6, // 16px → 48px

    // Section spacing (vertical rhythm)
    section: isXs ? 3 : isSm ? 4 : isMd ? 5 : isLg ? 6 : 8, // 24px → 64px

    // Card padding
    card: isXs ? 2 : isSm ? 2.5 : isMd ? 3 : isLg ? 3.5 : 4, // 16px → 32px

    // Compact spacing (for dense layouts)
    compact: isXs ? 1 : isSm ? 1.5 : isMd ? 2 : 2.5, // 8px → 20px
  }), [breakpoint]);

  // Adaptive sizing
  const sizing = useMemo(() => ({
    // Minimum widget width to prevent squishing
    minWidgetWidth: isXs ? '100%' : isSm ? 280 : isMd ? 300 : 320,

    // Touch targets (buttons, icons)
    touchTarget: isMobile ? 48 : 40,

    // Icon sizes
    iconSmall: isMobile ? 20 : 18,
    iconMedium: isMobile ? 24 : 20,
    iconLarge: isMobile ? 32 : 28,

    // Avatar sizes
    avatarSmall: isMobile ? 40 : 32,
    avatarMedium: isMobile ? 56 : 48,
    avatarLarge: isMobile ? 80 : 64,

    // Border radius
    borderRadius: isXs ? 12 : isSm ? 16 : isMd ? 20 : 24,
  }), [breakpoint, isMobile]);

  // Typography helpers (returns CSS clamp values)
  const typography = useMemo(() => ({
    // Body text
    body: 'clamp(14px, 2vw, 16px)',
    bodySmall: 'clamp(12px, 1.5vw, 14px)',
    bodyLarge: 'clamp(16px, 2.5vw, 18px)',

    // Headings
    h1: 'clamp(28px, 5vw, 48px)',
    h2: 'clamp(24px, 4vw, 36px)',
    h3: 'clamp(20px, 3.5vw, 28px)',
    h4: 'clamp(18px, 3vw, 24px)',
    h5: 'clamp(16px, 2.5vw, 20px)',
    h6: 'clamp(14px, 2vw, 18px)',

    // Display (hero text)
    display: 'clamp(36px, 6vw, 64px)',

    // Caption/label
    caption: 'clamp(11px, 1.2vw, 12px)',
  }), []);

  // Grid column helper
  const gridColumns = (xs = 1, sm = 2, md = 3, lg = 4, xl = 4) => ({
    xs: `repeat(${xs}, 1fr)`,
    sm: `repeat(${sm}, 1fr)`,
    md: `repeat(${md}, 1fr)`,
    lg: `repeat(${lg}, 1fr)`,
    xl: `repeat(${xl}, 1fr)`,
  });

  // Responsive grid with auto-wrapping (prevents squishing)
  const autoFitGrid = (minWidth = 300) => ({
    xs: '1fr',
    sm: `repeat(auto-fit, minmax(${minWidth}px, 1fr))`,
  });

  // Flex direction helper
  const flexDirection = (mobileVertical = true) => ({
    xs: mobileVertical ? 'column' : 'row',
    md: mobileVertical ? 'row' : 'column',
  });

  // Show/hide helpers
  const show = useMemo(() => ({
    onMobile: { xs: 'block', md: 'none' },
    onTablet: { xs: 'none', sm: 'block', lg: 'none' },
    onDesktop: { xs: 'none', lg: 'block' },
    onMobileAndTablet: { xs: 'block', lg: 'none' },
    onTabletAndDesktop: { xs: 'none', sm: 'block' },
  }), []);

  const hide = useMemo(() => ({
    onMobile: { xs: 'none', md: 'block' },
    onTablet: { xs: 'block', sm: 'none', lg: 'block' },
    onDesktop: { xs: 'block', lg: 'none' },
    onMobileAndTablet: { xs: 'none', lg: 'block' },
    onTabletAndDesktop: { xs: 'block', sm: 'none' },
  }), []);

  // Layout presets for common patterns
  const layouts = useMemo(() => ({
    // Dashboard card grid
    cardGrid: {
      display: 'grid',
      gap: spacing.gap,
      gridTemplateColumns: autoFitGrid(320),
    },

    // Widget grid (2×2 on desktop, stacked on mobile)
    widgetGrid: {
      display: 'grid',
      gap: spacing.gap,
      gridTemplateColumns: {
        xs: '1fr',
        sm: 'repeat(auto-fit, minmax(300px, 1fr))',
        md: 'repeat(2, 1fr)',
      },
    },

    // Sidebar layout (hide sidebar on mobile)
    sidebarLayout: {
      display: 'flex',
      gap: spacing.gap,
      flexDirection: { xs: 'column', lg: 'row' },
    },

    // Stats row (wrap on mobile)
    statsRow: {
      display: 'grid',
      gap: spacing.gap,
      gridTemplateColumns: {
        xs: '1fr',
        sm: 'repeat(2, 1fr)',
        md: 'repeat(3, 1fr)',
        lg: 'repeat(4, 1fr)',
      },
    },

    // Form layout (2 columns on desktop)
    formGrid: {
      display: 'grid',
      gap: spacing.gap,
      gridTemplateColumns: {
        xs: '1fr',
        md: 'repeat(2, 1fr)',
      },
    },
  }), [spacing]);

  return {
    // Breakpoint detection
    breakpoint,
    isXs,
    isSm,
    isMd,
    isLg,
    isXl,

    // Range queries
    upSm,
    upMd,
    upLg,
    upXl,
    downSm,
    downMd,
    downLg,
    downXl,

    // Device categories
    isMobile,
    isTablet,
    isDesktop,
    isMobileOrTablet,
    isTabletOrDesktop,

    // Adaptive values
    spacing,
    sizing,
    typography,

    // Helpers
    gridColumns,
    autoFitGrid,
    flexDirection,
    show,
    hide,
    layouts,

    // Theme access
    theme,
  };
};

export default useResponsiveLayout;
