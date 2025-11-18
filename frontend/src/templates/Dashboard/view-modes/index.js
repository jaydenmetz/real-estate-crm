/**
 * View Mode Templates - Consolidated export
 *
 * Generic, configuration-driven view components that eliminate duplicate code
 * across all dashboard view modes (Card, List, Table).
 *
 * Organized structure:
 * - card/       - Card view template (grid layout)
 * - list/       - List view template (horizontal layout)
 * - table/      - Table view template (compact rows)
 * - editors/    - Generic inline editing components
 * - utils/      - Shared utilities and field renderers
 * - config/     - Example configurations
 *
 * Usage:
 * import { CardTemplate, ListItemTemplate, TableRowTemplate } from '@/templates/Dashboard/view-modes';
 * import { resolveField, formatFieldValue } from '@/templates/Dashboard/view-modes/utils';
 */

// View mode templates
export { CardTemplate } from './card';
export { ListItemTemplate } from './list';
export { TableRowTemplate } from './table';

// Editors
export * from './editors';

// Utilities
export * from './utils';
