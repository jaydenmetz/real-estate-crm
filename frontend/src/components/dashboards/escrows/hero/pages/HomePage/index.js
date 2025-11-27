/**
 * HomePage Configuration - First page of hero carousel
 *
 * Desktop layout (matching screenshot):
 * - 4 stat cards in horizontal row
 * - AI Manager teaser widget on the right
 * - Action buttons at bottom
 *
 * This configuration is consumed by HeroCarousel to render Page 1.
 */

import {
  TotalEscrowsCard,
  TotalThisMonthCard,
  TotalVolumeCard,
  TotalCommissionCard,
} from '../../stats';
import AIManagerTeaser from './AIManagerTeaser';

export const homePageConfig = {
  id: 'home',
  title: 'Home',

  // Stats cards (4 cards in a row on desktop)
  stats: [
    {
      id: 'total_escrows',
      component: TotalEscrowsCard,
      props: {},
      gridProps: { xs: 12, sm: 6, md: 3 }, // 4 columns on desktop
    },
    {
      id: 'total_this_month',
      component: TotalThisMonthCard,
      props: {},
      gridProps: { xs: 12, sm: 6, md: 3 },
    },
    {
      id: 'total_volume',
      component: TotalVolumeCard,
      props: {},
      gridProps: { xs: 12, sm: 6, md: 3 },
    },
    {
      id: 'total_commission',
      component: TotalCommissionCard,
      props: {},
      gridProps: { xs: 12, sm: 6, md: 3 },
    },
  ],

  // Widget (AI Manager teaser - 300x300 slot)
  widget: {
    component: AIManagerTeaser,
    props: {},
  },

  // Action buttons at bottom
  showButtons: true,
};

export { AIManagerTeaser };
