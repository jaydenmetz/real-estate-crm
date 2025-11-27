/**
 * AIManagerPage Configuration - Second page of hero carousel
 *
 * Desktop layout:
 * - 4 locked/greyed-out stat cards showing AI Manager features
 * - Clickable teaser to open AIManagerModal
 * - Same horizontal layout as HomePage for consistency
 *
 * This configuration is consumed by HeroCarousel to render Page 2.
 */

import LockedStatCard from './LockedStatCard';

// Wrapper components for each locked stat
export const ManagedEscrowsCard = (props) => (
  <LockedStatCard
    icon="AutoAwesome"
    title="AI-MANAGED ESCROWS"
    subtitle="Automated tracking"
    color="#FFD700"
    {...props}
  />
);

export const DueIn48HCard = (props) => (
  <LockedStatCard
    icon="AccessTime"
    title="DUE IN 48H"
    subtitle="Smart alerts"
    color="#ff9800"
    {...props}
  />
);

export const DocsPendingCard = (props) => (
  <LockedStatCard
    icon="Description"
    title="DOCS PENDING"
    subtitle="Auto-reminders"
    color="#f44336"
    {...props}
  />
);

export const ComplianceScoreCard = (props) => (
  <LockedStatCard
    icon="VerifiedUser"
    title="COMPLIANCE SCORE"
    subtitle="Real-time monitoring"
    color="#4caf50"
    {...props}
  />
);

export const aiManagerPageConfig = {
  id: 'ai-manager',
  title: 'AI Manager',

  // Locked stat cards (4 cards in a row on desktop)
  stats: [
    {
      id: 'managed_escrows',
      component: ManagedEscrowsCard,
      props: {},
      gridProps: { xs: 12, sm: 6, md: 3 },
    },
    {
      id: 'due_in_48h',
      component: DueIn48HCard,
      props: {},
      gridProps: { xs: 12, sm: 6, md: 3 },
    },
    {
      id: 'docs_pending',
      component: DocsPendingCard,
      props: {},
      gridProps: { xs: 12, sm: 6, md: 3 },
    },
    {
      id: 'compliance_score',
      component: ComplianceScoreCard,
      props: {},
      gridProps: { xs: 12, sm: 6, md: 3 },
    },
  ],

  // Widget (simple clickable teaser)
  widget: {
    component: null, // Will use same AIManagerTeaser from HomePage
    props: {},
  },

  // Hide buttons on this page (focus on upsell)
  showButtons: false,
};
