import React, { useState } from 'react';
import {
  TableRow,
  TableCell,
  Chip,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  alpha,
} from '@mui/material';
import {
  MoreVert,
  Visibility,
  Archive,
  Delete,
  Home,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { formatCurrency, formatDate } from '../../../utils/formatters';

/**
 * EscrowTableRow - Dense table row for Excel-like table view
 * Height: ~60px (very compact)
 */
const EscrowTableRow = ({ escrow, onArchive, onDelete, isArchived = false }) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = () => {
    navigate(`/escrows/${escrow.id}`);
  };

  const handleMenuOpen = (e) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Get status color
  const getStatusColor = (status) => {
    const statusLower = (status || '').toLowerCase();
    if (statusLower.includes('active') || statusLower.includes('pending')) return 'success';
    if (statusLower.includes('closed') || statusLower.includes('completed')) return 'primary';
    if (statusLower.includes('cancelled') || statusLower.includes('withdrawn')) return 'error';
    return 'default';
  };

  // Get property image or fallback to icon
  const propertyImage = escrow.images?.[0] || escrow.property_images?.[0];

  return (
    <>
      <TableRow
        onClick={handleClick}
        sx={{
          cursor: 'pointer',
          height: 60,
          '&:hover': {
            backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.04),
          },
          transition: 'background-color 0.2s',
        }}
      >
        {/* Tiny Image */}
        <TableCell sx={{ width: 60, p: 1 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 1,
              overflow: 'hidden',
              backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {propertyImage ? (
              <img
                src={propertyImage}
                alt="Property"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            ) : (
              <Home sx={{ fontSize: 20, color: 'primary.main' }} />
            )}
          </Box>
        </TableCell>

        {/* Address */}
        <TableCell sx={{ minWidth: 200 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
            {escrow.property_address || escrow.propertyAddress || 'No Address'}
          </Typography>
        </TableCell>

        {/* Status */}
        <TableCell sx={{ width: 140 }}>
          <Chip
            label={escrow.escrow_status || escrow.escrowStatus || 'Unknown'}
            color={getStatusColor(escrow.escrow_status || escrow.escrowStatus)}
            size="small"
            sx={{ fontSize: '0.75rem', height: 24 }}
          />
        </TableCell>

        {/* Buyer */}
        <TableCell sx={{ minWidth: 150 }}>
          <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
            {escrow.buyer_name || escrow.buyerName || 'TBD'}
          </Typography>
        </TableCell>

        {/* Seller */}
        <TableCell sx={{ minWidth: 150 }}>
          <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
            {escrow.seller_name || escrow.sellerName || 'TBD'}
          </Typography>
        </TableCell>

        {/* Buyer's Agent */}
        <TableCell sx={{ minWidth: 150 }}>
          <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
            {escrow.buyer_agent_name || escrow.buyerAgentName || 'TBD'}
          </Typography>
        </TableCell>

        {/* Listing Agent */}
        <TableCell sx={{ minWidth: 150 }}>
          <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
            {escrow.listing_agent_name || escrow.listingAgentName || 'TBD'}
          </Typography>
        </TableCell>

        {/* Price */}
        <TableCell sx={{ width: 130, textAlign: 'right' }}>
          <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
            {formatCurrency(escrow.purchase_price || escrow.purchasePrice) || 'N/A'}
          </Typography>
        </TableCell>

        {/* Commission */}
        <TableCell sx={{ width: 120, textAlign: 'right' }}>
          <Typography variant="body2" sx={{ fontSize: '0.875rem', color: 'success.main' }}>
            {formatCurrency(escrow.my_commission || escrow.myCommission) || 'N/A'}
          </Typography>
        </TableCell>

        {/* Closing Date */}
        <TableCell sx={{ width: 130 }}>
          <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
            {formatDate(escrow.closing_date || escrow.closingDate) || 'N/A'}
          </Typography>
        </TableCell>

        {/* Actions */}
        <TableCell sx={{ width: 60, p: 1 }}>
          <IconButton
            size="small"
            onClick={handleMenuOpen}
            sx={{ width: 32, height: 32 }}
          >
            <MoreVert sx={{ fontSize: 18 }} />
          </IconButton>
        </TableCell>
      </TableRow>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={() => { handleMenuClose(); handleClick(); }}>
          <ListItemIcon><Visibility fontSize="small" /></ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
        {!isArchived && onArchive && (
          <MenuItem onClick={() => { handleMenuClose(); onArchive(escrow.id); }}>
            <ListItemIcon><Archive fontSize="small" /></ListItemIcon>
            <ListItemText>Archive</ListItemText>
          </MenuItem>
        )}
        {isArchived && onDelete && (
          <MenuItem onClick={() => { handleMenuClose(); onDelete(escrow.id); }}>
            <ListItemIcon><Delete fontSize="small" color="error" /></ListItemIcon>
            <ListItemText>Delete Permanently</ListItemText>
          </MenuItem>
        )}
      </Menu>
    </>
  );
};

export default EscrowTableRow;
