import React from 'react';
import { CardTemplate } from '../../../../../templates/ViewModes';
import { escrowCardConfig } from '../../config/viewModeConfig';

/**
 * EscrowCard - Card view for escrows dashboard
 *
 * Now uses CardTemplate with configuration-driven field mapping and editing.
 *
 * Reduced from 820 lines to ~40 lines by moving all logic to:
 * - CardTemplate: Generic template with editing support (686 lines, reusable)
 * - escrowCardConfig: Escrow-specific configuration (250 lines)
 * - Hooks: useEscrowCalculations for computed values
 *
 * Features preserved:
 * - Inline editors: price, commission, dates, address, status
 * - Commission toggle: show/hide with privacy masking
 * - Status menu: 3 status options with icons
 * - Click vs drag: text selection support
 * - Quick actions: view, archive, restore, delete
 * - Progress bar: checklist completion percentage
 */
const EscrowCard = React.memo(({
  escrow,
  onClick,
  onUpdate,
  onArchive,
  onDelete,
  onRestore,
  isArchived = false,
}) => {
  return (
    <CardTemplate
      data={escrow}
      config={escrowCardConfig}
      onClick={onClick}
      onUpdate={onUpdate}
      onArchive={onArchive}
      onDelete={onDelete}
      onRestore={onRestore}
      isArchived={isArchived}
    />
  );
});

EscrowCard.displayName = 'EscrowCard';

export default EscrowCard;
