/**
 * View Mode Templates
 *
 * Pure presentation templates for Card, List, and Table views.
 * Configuration-driven components that eliminate duplicate code.
 *
 * Structure:
 * - card/   - Grid/card view template
 * - list/   - Horizontal list view template  
 * - table/  - Compact table view template
 *
 * Usage:
 * import { CardTemplate, ListItemTemplate, TableRowTemplate } from '@/templates/Dashboard/view-modes';
 * import { escrowCardConfig } from './config/viewModeConfig';
 * 
 * <CardTemplate data={escrow} config={escrowCardConfig} onClick={handleClick} />
 */

// View templates
export { CardTemplate } from './card';
export { ListItemTemplate } from './list';
export { TableRowTemplate } from './table';
