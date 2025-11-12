/**
 * Escrow Dashboard Hero Section
 *
 * This is the main hero component that gets rendered at the top of the escrows dashboard.
 * It displays stat cards based on the selected tab (Active, Closed, Canceled, All).
 *
 * Stats cards are defined in the escrows.config.js and rendered by DashboardTemplate.
 */

// Export all stat card components
export {
  TotalEscrowsCard,
  TotalThisMonthCard,
  TotalVolumeCard,
  TotalCommissionCard
} from './stats';

/**
 * Note: The hero section itself is rendered by DashboardTemplate using the config.
 * The stats array in escrows.config.js defines which cards appear for which tabs:
 *
 * - Active tab: Shows active escrows, this month (by created_at), volume, commission
 * - Closed tab: Shows closed escrows, this month (by closing_date), volume, commission
 * - Canceled tab: Shows canceled escrows, this month (by created_at), volume, commission
 * - All tab: Shows all escrows, this month (by created_at), volume, commission
 *
 * Each stat card is a reusable component that accepts:
 * - data: Array of escrows to calculate stats from
 * - status: Which status filter to apply
 * - dateField: Which date field to use for "this month" calculations
 */
