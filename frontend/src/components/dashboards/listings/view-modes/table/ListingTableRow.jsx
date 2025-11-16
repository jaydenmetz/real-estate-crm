import React from 'react';
import { TableRow, TableCell, Typography, Chip, Box, alpha, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getStatusConfig } from '../../../../../constants/listingConfig';
import { formatCurrency, formatDate as formatDateUtil } from '../../../../../utils/formatters';
import { QuickActionsMenu } from '../../../../common/QuickActionsMenu';

/**
 * ListingTableRow - Compact table view
 *
 * Simplified version focusing on essential listing data.
 * Custom implementation due to unique grid layout and commission masking.
 */
const ListingTableRow = ({ listing, onUpdate, onDelete, onArchive, onRestore, isArchived = false }) => {
  const navigate = useNavigate();
  const theme = useTheme();

  const {
    id,
    property_address,
    city,
    state,
    zip_code,
    list_price,
    listing_status,
    mls_number,
    bedrooms,
    bathrooms,
    listing_date,
    days_on_market,
    listing_commission = 0,
    buyer_commission = 0,
  } = listing;

  const totalCommission = parseFloat(listing_commission || 0) + parseFloat(buyer_commission || 0);
  const listPrice = parseFloat(list_price || 0);
  const statusConfig = getStatusConfig(listing_status);
  const address = property_address || 'No Address';

  // Calculate commission as dollar amount if percentages
  const commissionAmount = totalCommission > 0 && totalCommission < 100
    ? (listPrice * totalCommission / 100)
    : totalCommission;

  const handleRowClick = () => navigate(`/listings/${id}`);

  return (
    <TableRow
      hover
      onClick={handleRowClick}
      sx={{
        cursor: 'pointer',
        borderLeft: `3px solid ${statusConfig.color}`,
        '&:hover': {
          backgroundColor: alpha(statusConfig.color, 0.03),
        },
      }}
    >
      {/* Property Address + Location */}
      <TableCell>
        <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.9rem' }}>
          {address}
        </Typography>
        <Typography variant="caption" sx={{ color: theme.palette.text.secondary, fontSize: '0.75rem' }}>
          {city && state ? `${city}, ${state}${zip_code ? ' ' + zip_code : ''}` : 'Location TBD'}
        </Typography>
      </TableCell>

      {/* Status */}
      <TableCell align="center" width={120}>
        <Chip
          label={statusConfig.label}
          size="small"
          sx={{
            fontWeight: 600,
            fontSize: 10,
            height: 24,
            background: statusConfig.bg,
            color: 'white',
          }}
        />
      </TableCell>

      {/* List Price */}
      <TableCell align="right" width={140}>
        <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.875rem', color: '#10b981' }}>
          {formatCurrency(listPrice)}
        </Typography>
      </TableCell>

      {/* Commission */}
      <TableCell align="right" width={120}>
        {commissionAmount > 0 ? (
          <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.875rem', color: '#6366f1' }}>
            {formatCurrency(commissionAmount)}
          </Typography>
        ) : (
          <Typography variant="body2" sx={{ fontSize: '0.85rem', color: theme.palette.text.disabled }}>
            —
          </Typography>
        )}
      </TableCell>

      {/* MLS Number */}
      <TableCell align="center" width={100}>
        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.85rem' }}>
          {mls_number || '—'}
        </Typography>
      </TableCell>

      {/* Beds/Baths */}
      <TableCell align="center" width={100}>
        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.85rem' }}>
          {bedrooms && bathrooms ? `${bedrooms}/${bathrooms}` : '—'}
        </Typography>
      </TableCell>

      {/* DOM / Listed Date */}
      <TableCell align="center" width={80}>
        {days_on_market !== null && days_on_market !== undefined && listing_status === 'Active' ? (
          <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.85rem', color: statusConfig.color }}>
            {days_on_market}d
          </Typography>
        ) : listing_date ? (
          <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.85rem', color: theme.palette.text.secondary }}>
            {formatDateUtil(listing_date, 'MMM d')}
          </Typography>
        ) : (
          <Typography variant="body2" sx={{ fontSize: '0.85rem', color: theme.palette.text.disabled }}>
            —
          </Typography>
        )}
      </TableCell>

      {/* Actions */}
      <TableCell align="right" width={60}>
        <QuickActionsMenu
          item={listing}
          onView={() => navigate(`/listings/${id}`)}
          onShare={null}
          onArchive={onArchive}
          onRestore={onRestore}
          onDelete={onDelete}
          isArchived={isArchived}
          color={theme.palette.text.secondary}
        />
      </TableCell>
    </TableRow>
  );
};

export default ListingTableRow;
