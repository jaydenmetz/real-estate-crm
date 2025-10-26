import React from 'react';
import { Grid } from '@mui/material';
import EscrowCard from '../../../common/widgets/EscrowCard';

/**
 * EscrowGrid - Grid view for escrows using beautiful EscrowCard with photo-on-top
 * Displays escrows in a responsive card grid with inline editing
 */
export const EscrowGrid = ({
  escrows = [],
  onEscrowClick,
  onArchive,
  onRestore,
  onDelete,
  onUpdate,
  selection,
  isArchived = false,
  viewMode = 'small' // 'small' or 'large'
}) => {
  // If no escrows, show empty state
  if (!escrows || escrows.length === 0) {
    return (
      <Grid container spacing={3} sx={{ py: 4, textAlign: 'center' }}>
        <Grid item xs={12}>
          <p>No escrows found</p>
        </Grid>
      </Grid>
    );
  }

  return (
    <Grid container spacing={3}>
      {escrows.map((escrow, index) => (
        <Grid
          item
          xs={12}
          sm={viewMode === 'small' ? 6 : 12}
          md={viewMode === 'small' ? 4 : 6}
          lg={viewMode === 'small' ? 3 : 4}
          key={escrow.escrow_id}
        >
          <EscrowCard
            escrow={escrow}
            viewMode={viewMode}
            index={index}
            onArchive={onArchive}
            onDelete={onDelete}
            onRestore={onRestore}
            onUpdate={onUpdate}
            isArchived={isArchived}
            animationType="spring"
            animationDuration={1}
            animationIntensity={1}
          />
        </Grid>
      ))}
    </Grid>
  );
};

export default EscrowGrid;
