/**
 * ClientStatusTabs.jsx
 *
 * Status tab configuration for clients dashboard navigation.
 * NOW USING CENTRALIZED STATUS CONFIGURATION SYSTEM.
 *
 * Tabs are automatically generated from:
 * /frontend/src/config/statuses/statusCategories.js
 *
 * Each tab includes a dropdown showing all statuses in that category.
 * Click tab when NOT selected: Switch to category
 * Click tab when ALREADY selected: Show dropdown to filter by specific status
 *
 * Usage: Imported into clients.config.js
 */

import { getEntityTabs } from '../../../../../config/statuses';

// Generate tabs from centralized status configuration
export const clientStatusTabs = getEntityTabs('clients');

// For backward compatibility (if needed elsewhere)
export default clientStatusTabs;
