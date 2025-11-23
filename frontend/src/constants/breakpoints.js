/**
 * Custom Breakpoint Constants
 *
 * Defines dashboard-specific breakpoints that extend MUI's standard breakpoints.
 * Use these with theme.breakpoints.up/down/between for consistency.
 *
 * MUI Standard Breakpoints:
 * - xs: 0px (mobile)
 * - sm: 600px (small tablets)
 * - md: 900px (tablets)
 * - lg: 1200px (desktop)
 * - xl: 1536px (large desktop)
 *
 * Custom Dashboard Breakpoints:
 * - tablet: 702px (stats grid 2×2 layout starts)
 * - desktop: 1017px (stats + AI side-by-side)
 * - wide: 1500px (stats 1×4 horizontal row)
 */

export const CUSTOM_BREAKPOINTS = {
  // Mobile-only layouts (< 702px)
  MOBILE_MAX: 701,

  // Stats grid 2×2 starts (≥ 702px)
  // Calculation: 225px (min card) × 2 + 24px gap + padding = ~522px minimum
  // 702px provides comfortable margin for 2×2 grid
  TABLET_MIN: 702,

  // Stats + AI side-by-side (≥ 1017px)
  // Calculation: (225px × 2 + 24px) × 2 cols + 300px AI + gaps = ~1024px minimum
  // Prevents cramping when AI assistant appears on right
  DESKTOP_MIN: 1017,

  // Stats 1×4 horizontal row (≥ 1500px)
  // Calculation: 225px × 4 + 72px gaps + 300px AI + padding = ~1500px
  // All 4 stat cards fit horizontally with AI assistant
  WIDE_MIN: 1500,
};

/**
 * Helper function to create media query strings
 * Use these for @media queries in sx prop
 */
export const mediaQueries = {
  // Mobile only (< 702px)
  mobileOnly: `@media (max-width: ${CUSTOM_BREAKPOINTS.MOBILE_MAX}px)`,

  // Tablet and up (≥ 702px)
  tabletUp: `@media (min-width: ${CUSTOM_BREAKPOINTS.TABLET_MIN}px)`,

  // Tablet only (702px - 1016px)
  tabletOnly: `@media (min-width: ${CUSTOM_BREAKPOINTS.TABLET_MIN}px) and (max-width: ${CUSTOM_BREAKPOINTS.DESKTOP_MIN - 1}px)`,

  // Desktop and up (≥ 1017px)
  desktopUp: `@media (min-width: ${CUSTOM_BREAKPOINTS.DESKTOP_MIN}px)`,

  // Desktop only (1017px - 1499px)
  desktopOnly: `@media (min-width: ${CUSTOM_BREAKPOINTS.DESKTOP_MIN}px) and (max-width: ${CUSTOM_BREAKPOINTS.WIDE_MIN - 1}px)`,

  // Wide screens (≥ 1500px)
  wideUp: `@media (min-width: ${CUSTOM_BREAKPOINTS.WIDE_MIN}px)`,
};

/**
 * Layout behavior documentation by breakpoint range
 *
 * < 702px (Mobile):
 * - Stats: 4×1 vertical stack (full width cards)
 * - AI assistant: Below stats (full width)
 * - Action buttons: Centered
 * - Navigation filters: Wrapped (2 rows)
 *
 * 702px - 1016px (Tablet):
 * - Stats: 2×2 grid (225-275px cards, centered)
 * - AI assistant: Below stats (full width)
 * - Action buttons: Centered
 * - Navigation filters: Single row
 *
 * 1017px - 1499px (Desktop):
 * - Stats: 2×2 grid (225-275px cards, centered)
 * - AI assistant: Right side (33.33% width)
 * - Stats area: 66.67% width
 * - Action buttons: Centered
 * - Navigation filters: Single row
 *
 * 1500px+ (Wide):
 * - Stats: 1×4 horizontal row (225-275px cards, left-aligned)
 * - AI assistant: Right side (25% width)
 * - Stats area: 75% width
 * - Action buttons: Left-aligned
 * - Navigation filters: Single row
 */

export default CUSTOM_BREAKPOINTS;
