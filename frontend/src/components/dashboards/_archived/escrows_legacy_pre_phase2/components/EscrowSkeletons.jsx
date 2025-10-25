import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Skeleton,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  alpha,
} from '@mui/material';

/**
 * EscrowSkeletons - Loading skeleton placeholders for different view modes
 *
 * Provides smooth loading states for:
 * - Grid view (320x386px cards)
 * - List view (horizontal rows with 140px height)
 * - Table view (dense Excel-like rows)
 *
 * Escrow blue theme: #3b82f6 (lighter blue instead of navy)
 *
 * @since 1.0.6
 */

// Escrow blue color for skeletons
const ESCROW_BLUE = '#3b82f6';

// Grid View Skeleton (320x386px card)
export const EscrowGridSkeleton = () => (
  <Card
    sx={{
      width: 320,
      borderRadius: 4,
      overflow: 'hidden',
      boxShadow: (theme) => `0 8px 32px ${alpha(ESCROW_BLUE, 0.08)}`,
    }}
  >
    {/* Image skeleton - 3:2 aspect ratio */}
    <Skeleton
      variant="rectangular"
      animation="wave"
      sx={{
        aspectRatio: '3 / 2',
        width: '100%',
        bgcolor: alpha(ESCROW_BLUE, 0.08),
      }}
    />

    {/* Content skeleton */}
    <CardContent sx={{ p: 1.25 }}>
      {/* Address */}
      <Skeleton variant="text" animation="wave" width="90%" height={24} sx={{ mb: 1, bgcolor: alpha(ESCROW_BLUE, 0.08) }} />

      {/* Metrics Grid (Price + Commission) */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1, mb: 1 }}>
        <Box sx={{ p: 0.75, borderRadius: 1.5, bgcolor: alpha(ESCROW_BLUE, 0.06) }}>
          <Skeleton variant="text" animation="wave" width="50%" height={12} sx={{ mb: 0.5, bgcolor: alpha(ESCROW_BLUE, 0.08) }} />
          <Skeleton variant="text" animation="wave" width="70%" height={20} sx={{ bgcolor: alpha(ESCROW_BLUE, 0.08) }} />
        </Box>
        <Box sx={{ p: 0.75, borderRadius: 1.5, bgcolor: alpha(ESCROW_BLUE, 0.06) }}>
          <Skeleton variant="text" animation="wave" width="60%" height={12} sx={{ mb: 0.5, bgcolor: alpha(ESCROW_BLUE, 0.08) }} />
          <Skeleton variant="text" animation="wave" width="65%" height={20} sx={{ bgcolor: alpha(ESCROW_BLUE, 0.08) }} />
        </Box>
      </Box>

      {/* Footer */}
      <Box sx={{ display: 'flex', gap: 1, mt: 1, pt: 1, borderTop: (theme) => `1px solid ${alpha(ESCROW_BLUE, 0.1)}` }}>
        <Box sx={{ flex: 1 }}>
          <Skeleton variant="text" animation="wave" width="60%" height={12} sx={{ mb: 0.25, bgcolor: alpha(ESCROW_BLUE, 0.08) }} />
          <Skeleton variant="text" animation="wave" width="50%" height={16} sx={{ bgcolor: alpha(ESCROW_BLUE, 0.08) }} />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Skeleton variant="text" animation="wave" width="50%" height={12} sx={{ mb: 0.25, bgcolor: alpha(ESCROW_BLUE, 0.08) }} />
          <Skeleton variant="text" animation="wave" width="55%" height={16} sx={{ bgcolor: alpha(ESCROW_BLUE, 0.08) }} />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Skeleton variant="text" animation="wave" width="40%" height={12} sx={{ mb: 0.25, bgcolor: alpha(ESCROW_BLUE, 0.08) }} />
          <Skeleton variant="text" animation="wave" width="45%" height={16} sx={{ bgcolor: alpha(ESCROW_BLUE, 0.08) }} />
        </Box>
      </Box>
    </CardContent>
  </Card>
);

// List View Skeleton (horizontal row, 140px height)
export const EscrowListSkeleton = () => (
  <Card
    elevation={0}
    sx={{
      display: 'flex',
      height: 140,
      border: `1px solid ${alpha(ESCROW_BLUE, 0.12)}`,
      borderRadius: 2,
      overflow: 'hidden',
    }}
  >
    {/* Left: Square Thumbnail 140x140px */}
    <Skeleton
      variant="rectangular"
      animation="wave"
      sx={{
        width: 140,
        height: 140,
        flexShrink: 0,
        bgcolor: alpha(ESCROW_BLUE, 0.08),
      }}
    />

    {/* Right: Content Area */}
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 2 }}>
      {/* Address */}
      <Skeleton variant="text" animation="wave" width="60%" height={28} sx={{ mb: 1, bgcolor: alpha(ESCROW_BLUE, 0.08) }} />

      {/* Info Grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 2 }}>
        <Box>
          <Skeleton variant="text" animation="wave" width="40%" height={14} sx={{ mb: 0.5, bgcolor: alpha(ESCROW_BLUE, 0.08) }} />
          <Skeleton variant="text" animation="wave" width="70%" height={20} sx={{ bgcolor: alpha(ESCROW_BLUE, 0.08) }} />
        </Box>
        <Box>
          <Skeleton variant="text" animation="wave" width="50%" height={14} sx={{ mb: 0.5, bgcolor: alpha(ESCROW_BLUE, 0.08) }} />
          <Skeleton variant="text" animation="wave" width="65%" height={20} sx={{ bgcolor: alpha(ESCROW_BLUE, 0.08) }} />
        </Box>
        <Box>
          <Skeleton variant="text" animation="wave" width="45%" height={14} sx={{ mb: 0.5, bgcolor: alpha(ESCROW_BLUE, 0.08) }} />
          <Skeleton variant="text" animation="wave" width="60%" height={20} sx={{ bgcolor: alpha(ESCROW_BLUE, 0.08) }} />
        </Box>
        <Box>
          <Skeleton variant="text" animation="wave" width="55%" height={14} sx={{ mb: 0.5, bgcolor: alpha(ESCROW_BLUE, 0.08) }} />
          <Skeleton variant="text" animation="wave" width="50%" height={20} sx={{ bgcolor: alpha(ESCROW_BLUE, 0.08) }} />
        </Box>
      </Box>
    </Box>
  </Card>
);

// Table View Skeleton (dense rows)
export const EscrowTableSkeleton = ({ rows = 10 }) => (
  <TableContainer component={Paper} sx={{ gridColumn: '1 / -1', width: '100%' }}>
    <Table size="small" sx={{ minWidth: 900 }}>
      <TableHead>
        <TableRow sx={{ backgroundColor: alpha(ESCROW_BLUE, 0.05) }}>
          <TableCell sx={{ width: 60, fontWeight: 700 }}>Image</TableCell>
          <TableCell sx={{ fontWeight: 700 }}>Address</TableCell>
          <TableCell sx={{ width: 140, fontWeight: 700 }}>Status</TableCell>
          <TableCell sx={{ fontWeight: 700 }}>Buyer</TableCell>
          <TableCell sx={{ width: 130, fontWeight: 700, textAlign: 'right' }}>Price</TableCell>
          <TableCell sx={{ width: 120, fontWeight: 700, textAlign: 'right' }}>Commission</TableCell>
          <TableCell sx={{ width: 130, fontWeight: 700 }}>Closing Date</TableCell>
          <TableCell sx={{ width: 60, fontWeight: 700 }}>Actions</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {Array.from({ length: rows }).map((_, index) => (
          <TableRow key={index} sx={{ height: 60 }}>
            <TableCell sx={{ width: 60, p: 1 }}>
              <Skeleton variant="rectangular" animation="wave" width={40} height={40} sx={{ borderRadius: 1, bgcolor: alpha(ESCROW_BLUE, 0.08) }} />
            </TableCell>
            <TableCell>
              <Skeleton variant="text" animation="wave" width="80%" height={20} sx={{ bgcolor: alpha(ESCROW_BLUE, 0.08) }} />
            </TableCell>
            <TableCell sx={{ width: 140 }}>
              <Skeleton variant="rectangular" animation="wave" width={100} height={24} sx={{ borderRadius: 2, bgcolor: alpha(ESCROW_BLUE, 0.08) }} />
            </TableCell>
            <TableCell>
              <Skeleton variant="text" animation="wave" width="70%" height={20} sx={{ bgcolor: alpha(ESCROW_BLUE, 0.08) }} />
            </TableCell>
            <TableCell sx={{ width: 130, textAlign: 'right' }}>
              <Skeleton variant="text" animation="wave" width="80%" height={20} sx={{ ml: 'auto', bgcolor: alpha(ESCROW_BLUE, 0.08) }} />
            </TableCell>
            <TableCell sx={{ width: 120, textAlign: 'right' }}>
              <Skeleton variant="text" animation="wave" width="75%" height={20} sx={{ ml: 'auto', bgcolor: alpha(ESCROW_BLUE, 0.08) }} />
            </TableCell>
            <TableCell sx={{ width: 130 }}>
              <Skeleton variant="text" animation="wave" width="65%" height={20} sx={{ bgcolor: alpha(ESCROW_BLUE, 0.08) }} />
            </TableCell>
            <TableCell sx={{ width: 60 }}>
              <Skeleton variant="circular" animation="wave" width={32} height={32} sx={{ bgcolor: alpha(ESCROW_BLUE, 0.08) }} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
);

// Container component for multiple skeletons based on view mode
export const EscrowSkeletonsContainer = ({ viewMode = 'grid', count = 8 }) => {
  if (viewMode === 'table') {
    return <EscrowTableSkeleton rows={count} />;
  }

  if (viewMode === 'list') {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
        {Array.from({ length: count }).map((_, index) => (
          <EscrowListSkeleton key={index} />
        ))}
      </Box>
    );
  }

  // Grid view (default)
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr', // Mobile: 1 column
          sm: 'repeat(2, 1fr)', // Tablet: 2 columns
          md: 'repeat(2, 1fr)', // Medium: 2 columns
          lg: 'repeat(4, 1fr)', // Desktop: 4 columns
        },
        gap: 3,
        width: '100%',
      }}
    >
      {Array.from({ length: count }).map((_, index) => (
        <EscrowGridSkeleton key={index} />
      ))}
    </Box>
  );
};

export default EscrowSkeletonsContainer;
