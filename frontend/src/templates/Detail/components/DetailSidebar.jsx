import React from 'react';
import { Typography } from '@mui/material';

/**
 * DetailSidebar Component
 *
 * Renders sidebar content based on config
 * Used for both left (Quick Actions) and right (Smart Context) sidebars
 */
export const DetailSidebar = ({ config, entity }) => {
  if (!config) return null;

  // If custom component provided, render it
  if (config.component) {
    const SidebarComponent = config.component;
    return <SidebarComponent entity={entity} config={config} />;
  }

  // Default: "Coming Soon" placeholder
  return (
    <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 4 }}>
      Coming Soon
    </Typography>
  );
};
