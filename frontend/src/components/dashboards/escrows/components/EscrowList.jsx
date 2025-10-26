import React from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper,
  Typography,
  Box,
  Checkbox,
  Chip
} from '@mui/material';
import { Home, CalendarToday, AttachMoney } from '@mui/icons-material';
import { formatCurrency, formatDate } from '../../../../utils/formatters';

/**
 * EscrowList - List view for escrows
 * Displays escrows in a compact list format
 */
export const EscrowList = ({ escrows = [], onEscrowClick, onArchive, selection }) => {
  return (
    <Paper>
      <List>
        {escrows.map((escrow, index) => (
          <ListItem
            key={escrow.escrow_id}
            button
            onClick={() => onEscrowClick(escrow)}
            divider={index < escrows.length - 1}
            sx={{
              '&:hover': {
                bgcolor: 'action.hover'
              }
            }}
          >
            {/* Selection checkbox */}
            {selection && (
              <ListItemIcon>
                <Checkbox
                  checked={selection.selected.includes(escrow.escrow_id)}
                  onChange={(e) => {
                    e.stopPropagation();
                    selection.onSelectItem(escrow.escrow_id, e.target.checked);
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
              </ListItemIcon>
            )}

            {/* Icon */}
            <ListItemIcon>
              <Home color="primary" />
            </ListItemIcon>

            {/* Primary text */}
            <ListItemText
              primary={
                <Typography variant="subtitle1" fontWeight="medium">
                  {escrow.property_address || 'No Address'}
                </Typography>
              }
              secondary={
                <Box sx={{ display: 'flex', gap: 2, mt: 0.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <AttachMoney fontSize="small" />
                    <Typography variant="body2">
                      {formatCurrency(escrow.purchase_price)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <CalendarToday fontSize="small" />
                    <Typography variant="body2">
                      {formatDate(escrow.closing_date)}
                    </Typography>
                  </Box>
                </Box>
              }
            />

            {/* Status chip */}
            <Chip
              label={escrow.escrow_status}
              size="small"
              color={escrow.escrow_status === 'Active' ? 'success' : 'default'}
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default EscrowList;
