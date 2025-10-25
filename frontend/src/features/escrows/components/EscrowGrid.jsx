import React from 'react';
import { Grid, Card, CardContent, Typography, Box, Checkbox } from '@mui/material';
import { LocationOn, CalendarToday, AttachMoney } from '@mui/icons-material';
import { formatCurrency, formatDate } from '../../../utils/formatters';

/**
 * EscrowGrid - Grid view for escrows
 * Displays escrows in a responsive card grid
 */
export const EscrowGrid = ({ escrows = [], onEscrowClick, onArchive, selection }) => {
  return (
    <Grid container spacing={3}>
      {escrows.map((escrow) => (
        <Grid item xs={12} sm={6} md={4} key={escrow.escrow_id}>
          <Card
            sx={{
              cursor: 'pointer',
              transition: 'all 0.3s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 6
              }
            }}
            onClick={() => onEscrowClick(escrow)}
          >
            <CardContent>
              {/* Selection checkbox */}
              {selection && (
                <Checkbox
                  checked={selection.selected.includes(escrow.escrow_id)}
                  onChange={(e) => {
                    e.stopPropagation();
                    selection.onSelectItem(escrow.escrow_id, e.target.checked);
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
              )}

              {/* Property address */}
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 2 }}>
                <LocationOn color="primary" />
                <Typography variant="h6" component="div">
                  {escrow.property_address || 'No Address'}
                </Typography>
              </Box>

              {/* Price */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <AttachMoney fontSize="small" />
                <Typography variant="body1">
                  {formatCurrency(escrow.purchase_price)}
                </Typography>
              </Box>

              {/* Closing date */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <CalendarToday fontSize="small" />
                <Typography variant="body2" color="text.secondary">
                  Closes: {formatDate(escrow.closing_date)}
                </Typography>
              </Box>

              {/* Status */}
              <Box sx={{ mt: 2 }}>
                <Typography
                  variant="caption"
                  sx={{
                    px: 1,
                    py: 0.5,
                    borderRadius: 1,
                    bgcolor: escrow.escrow_status === 'Active' ? 'success.lighter' : 'grey.200',
                    color: escrow.escrow_status === 'Active' ? 'success.dark' : 'text.secondary'
                  }}
                >
                  {escrow.escrow_status}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default EscrowGrid;
