import React from 'react';
import { TableRowTemplate } from '../../../../../templates/Dashboard/view-modes';
import { escrowTableConfig } from '../../config/viewModeConfig';

/**
 * EscrowTableRow - Compact table view for escrows dashboard
 *
 * Now uses TableRowTemplate with configuration-driven column mapping and editing.
 *
 * Reduced from 374 lines to ~40 lines by moving all logic to:
 * - TableRowTemplate: Generic template with editing support (460 lines, reusable)
 * - escrowTableConfig: Escrow-specific configuration (162 lines)
 * - Hooks: useEscrowCalculations for computed values
 *
 * Features preserved:
 * - Grid layout with 8 columns (Property, Status, Price, Commission, Acceptance, Closing, Progress, Actions)
 * - Inline editors: address, price, commission (with toggle), dates, status
 * - Commission toggle: show/hide with privacy masking
 * - Status menu: 3 status options with icons
 * - Click vs drag: text selection support
 * - Hover effects and transitions
 * - QuickActionsMenu
 */
const EscrowTableRow = React.memo(({
  escrow,
  onClick,
  onUpdate,
  onArchive,
  onDelete,
  onRestore,
  isArchived = false,
}) => {
  return (
    <TableRowTemplate
      data={escrow}
      config={escrowTableConfig}
      onClick={onClick}
      onUpdate={onUpdate}
      onArchive={onArchive}
      onDelete={onDelete}
      onRestore={onRestore}
      isArchived={isArchived}
    />
  );
});

EscrowTableRow.displayName = 'EscrowTableRow';

export default EscrowTableRow;
