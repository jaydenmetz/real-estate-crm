import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  alpha,
  useTheme,
} from '@mui/material';
import {
  MoreVert,
  Visibility,
  Archive,
  Delete,
  Home,
  Person,
  AttachMoney,
  CalendarToday,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

/**
 * EscrowListRow - Horizontal row layout for list view
 * Height: ~140px (medium density, key info spread horizontally)
 */
const EscrowListRow = ({ escrow, onArchive, onDelete, isArchived = false }) => {
  const navigate = useNavigate();
  const theme = useTheme();
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

  // Format currency
  const formatCurrency = (value) => {
    if (!value) return 'N/A';
    return `$${Number(value).toLocaleString()}`;
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return 'N/A';
    try {
      return format(new Date(date), 'MMM d, yyyy');
    } catch {
      return 'Invalid';
    }
  };

  // Get property image or fallback to icon
  const propertyImage = escrow.images?.[0] || escrow.property_images?.[0];

  return (
    <>
      <Card
        onClick={handleClick}
        elevation={0}
        sx={{
          display: 'flex',
          height: 140,
          cursor: 'pointer',
          border: `1px solid ${theme.palette.divider}`,
          transition: 'all 0.2s ease',
          '&:hover': {
            boxShadow: theme.shadows[4],
            borderColor: theme.palette.primary.main,
            transform: 'translateY(-2px)',
          },
        }}
      >
        {/* Left: Square Thumbnail (140x140px to match height) */}
        <Box
          sx={{
            width: 140,
            height: 140,
            flexShrink: 0,
            backgroundColor: alpha(theme.palette.primary.main, 0.1),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
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
            <Home sx={{ fontSize: 48, color: theme.palette.primary.main }} />
          )}

          {/* Status badge on image */}
          <Chip
            label={escrow.escrow_status || escrow.escrowStatus || 'Unknown'}
            color={getStatusColor(escrow.escrow_status || escrow.escrowStatus)}
            size="small"
            sx={{
              position: 'absolute',
              top: 8,
              left: 8,
              fontSize: '0.7rem',
              height: 22,
              fontWeight: 600,
            }}
          />
        </Box>

        {/* Right: Content Area */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 2 }}>
          {/* Top Row: Address + Action Menu */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem', lineHeight: 1.2 }}>
              {escrow.property_address || escrow.propertyAddress || 'No Address'}
            </Typography>
            <IconButton
              size="small"
              onClick={handleMenuOpen}
              sx={{ ml: 1 }}
            >
              <MoreVert />
            </IconButton>
          </Box>

          {/* Middle Row: Key Info in Grid */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: 2,
              flex: 1,
            }}
          >
            {/* Price */}
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Price
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '1rem', color: 'primary.main' }}>
                {formatCurrency(escrow.purchase_price || escrow.purchasePrice)}
              </Typography>
            </Box>

            {/* Commission */}
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Commission
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 700, fontSize: '1rem', color: 'success.main' }}>
                {formatCurrency(escrow.my_commission || escrow.myCommission)}
              </Typography>
            </Box>

            {/* Buyer */}
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Buyer
              </Typography>
              <Typography variant="body2" sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
                {escrow.buyer_name || escrow.buyerName || 'TBD'}
              </Typography>
            </Box>

            {/* Closing Date */}
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Closing Date
              </Typography>
              <Typography variant="body2" sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
                {formatDate(escrow.closing_date || escrow.closingDate)}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Card>

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

export default EscrowListRow;
