import React from 'react';
import { ListItemTemplate } from '../../../../../templates/Dashboard/view-modes';
import { escrowListConfig } from '../../config/viewModeConfig';

/**
 * EscrowListItem - Horizontal list view for escrows dashboard
 *
 * Now uses ListItemTemplate with configuration-driven field mapping and editing.
 *
 * Reduced from 495 lines to ~40 lines by moving all logic to:
 * - ListItemTemplate: Generic template with editing support (519 lines, reusable)
 * - escrowListConfig: Escrow-specific configuration (135 lines)
 * - Hooks: useEscrowCalculations for computed values
 *
 * Features preserved:
 * - Property image with progress bar overlay (200px wide)
 * - Inline editors: price, commission (with toggle), dates, address, status
 * - Commission toggle: show/hide with privacy masking
 * - Status menu: 3 status options with icons
 * - Click vs drag: text selection support
 * - Hover effects and transitions
 */
const EscrowListItem = React.memo(({
  escrow,
  onClick,
  onUpdate,
  onArchive,
  onDelete,
  onRestore,
  isArchived = false,
}) => {
  return (
    <ListItemTemplate
      data={escrow}
      config={escrowListConfig}
      onClick={onClick}
      onUpdate={onUpdate}
      onArchive={onArchive}
      onDelete={onDelete}
      onRestore={onRestore}
      isArchived={isArchived}
    />
  );
});

EscrowListItem.displayName = 'EscrowListItem';

export default EscrowListItem;
