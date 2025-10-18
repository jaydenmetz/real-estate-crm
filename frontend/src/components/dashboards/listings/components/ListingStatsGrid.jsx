import React from 'react';
import { Grid, Box, Button } from '@mui/material';
import {
  Home,
  Schedule,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  AttachMoney,
  Cancel,
  Archive as ArchiveIcon,
  Storage,
  Add,
  Assessment,
} from '@mui/icons-material';
import ListingStatCard from './ListingStatCard';

const ListingStatsGrid = ({
  selectedStatus,
  stats,
  archivedCount,
  maxArchivedLimit = 100,
  setNewListingModalOpen,
}) => {
  return (
    <Box sx={{
      display: 'flex',
      gap: 3,
      alignItems: 'stretch',
      flexDirection: { xs: 'column', md: 'row' },
      height: '100%',
    }}>
      {/* Left container: Stats Grid */}
      <Box sx={{
        flex: '1 1 auto',
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
      }}>
        {/* Stats Grid - White Cards - Dynamic based on selected tab */}
        <Grid container spacing={2}>
          {(() => {
            switch(selectedStatus) {
              case 'active':
                return (
                  <>
                    <Grid item xs={12} sm={6} md={6} xl={3}>
                      <ListingStatCard
                        icon={Home}
                        title="Total Active Listings"
                        value={stats.activeListings || 0}
                        color="#ffffff"
                        delay={0}
                        goal={50}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={6} xl={3}>
                      <ListingStatCard
                        icon={Schedule}
                        title="This Week"
                        value={stats.thisWeek || 0}
                        color="#ffffff"
                        delay={1}
                        goal={10}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={6} xl={3}>
                      <ListingStatCard
                        icon={AttachMoney}
                        title="Total Value"
                        value={stats.totalValue || 0}
                        prefix="$"
                        color="#ffffff"
                        delay={2}
                        goal={5000000}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={6} xl={3}>
                      <ListingStatCard
                        icon={Assessment}
                        title="Avg Days on Market"
                        value={stats.avgDaysOnMarket || 0}
                        suffix=" days"
                        color="#ffffff"
                        delay={3}
                        goal={30}
                      />
                    </Grid>
                  </>
                );

              case 'pending':
                return (
                  <>
                    <Grid item xs={12} sm={6} md={6} xl={3}>
                      <ListingStatCard
                        icon={Schedule}
                        title="Total Pending"
                        value={stats.pendingListings || 0}
                        color="#ffffff"
                        delay={0}
                        goal={25}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={6} xl={3}>
                      <ListingStatCard
                        icon={TrendingUp}
                        title="Pending Rate"
                        value={stats.pendingRate || 0}
                        suffix="%"
                        color="#ffffff"
                        delay={1}
                        goal={50}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={6} xl={3}>
                      <ListingStatCard
                        icon={Assessment}
                        title="Avg Time to Pending"
                        value={stats.avgTimeToPending || 0}
                        suffix=" days"
                        color="#ffffff"
                        delay={2}
                        goal={21}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={6} xl={3}>
                      <ListingStatCard
                        icon={AttachMoney}
                        title="Total Pending Value"
                        value={stats.pendingValue || 0}
                        prefix="$"
                        color="#ffffff"
                        delay={3}
                        goal={3000000}
                      />
                    </Grid>
                  </>
                );

              case 'sold':
                return (
                  <>
                    <Grid item xs={12} sm={6} md={6} xl={3}>
                      <ListingStatCard
                        icon={CheckCircle}
                        title="Total Sold"
                        value={stats.soldListings || 0}
                        color="#ffffff"
                        delay={0}
                        goal={15}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={6} xl={3}>
                      <ListingStatCard
                        icon={TrendingUp}
                        title="Sale Rate"
                        value={stats.saleRate || 0}
                        suffix="%"
                        color="#ffffff"
                        delay={1}
                        goal={80}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={6} xl={3}>
                      <ListingStatCard
                        icon={Assessment}
                        title="Avg Days to Sell"
                        value={stats.avgDaysToSell || 0}
                        suffix=" days"
                        color="#ffffff"
                        delay={2}
                        goal={45}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={6} xl={3}>
                      <ListingStatCard
                        icon={AttachMoney}
                        title="Total Sales Volume"
                        value={stats.totalSalesVolume || 0}
                        prefix="$"
                        color="#ffffff"
                        delay={3}
                        goal={10000000}
                      />
                    </Grid>
                  </>
                );

              case 'expired':
                return (
                  <>
                    <Grid item xs={12} sm={6} md={6} xl={3}>
                      <ListingStatCard
                        icon={Cancel}
                        title="Total Expired"
                        value={stats.expiredListings || 0}
                        color="#ffffff"
                        delay={0}
                        goal={5}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={6} xl={3}>
                      <ListingStatCard
                        icon={TrendingDown}
                        title="Expiration Rate"
                        value={stats.expirationRate || 0}
                        suffix="%"
                        color="#ffffff"
                        delay={1}
                        goal={10}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={6} xl={3}>
                      <ListingStatCard
                        icon={AttachMoney}
                        title="Lost Value"
                        value={stats.expiredValue || 0}
                        prefix="$"
                        color="#ffffff"
                        delay={2}
                        goal={500000}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={6} xl={3}>
                      <ListingStatCard
                        icon={Assessment}
                        title="Top Expiration Reason"
                        value={stats.topExpirationReason || 'N/A'}
                        color="#ffffff"
                        delay={3}
                      />
                    </Grid>
                  </>
                );

              case 'archived':
                return (
                  <>
                    <Grid item xs={12} sm={6} md={6} xl={3}>
                      <ListingStatCard
                        icon={ArchiveIcon}
                        title="Total Archived Listings"
                        value={archivedCount || 0}
                        color="#ffffff"
                        delay={0}
                        goal={100}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={6} xl={3}>
                      <ListingStatCard
                        icon={Storage}
                        title="Max Archived"
                        value={archivedCount || 0}
                        suffix={` / ${maxArchivedLimit}`}
                        color="#ffffff"
                        delay={1}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={6} xl={3}>
                      <ListingStatCard
                        icon={CheckCircle}
                        title="Sold Listings"
                        value={stats.soldListings || 0}
                        color="#ffffff"
                        delay={2}
                        goal={15}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={6} xl={3}>
                      <ListingStatCard
                        icon={AttachMoney}
                        title="Total Value"
                        value={stats.totalValue || 0}
                        prefix="$"
                        color="#ffffff"
                        delay={3}
                        goal={10000000}
                      />
                    </Grid>
                  </>
                );

              default: // 'all'
                return (
                  <>
                    <Grid item xs={12} sm={6} md={6} xl={3}>
                      <ListingStatCard
                        icon={Home}
                        title="Total Listings"
                        value={stats.totalListings || 0}
                        color="#ffffff"
                        delay={0}
                        goal={100}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={6} xl={3}>
                      <ListingStatCard
                        icon={CheckCircle}
                        title="Active Listings"
                        value={stats.activeListings || 0}
                        color="#ffffff"
                        delay={1}
                        goal={50}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={6} xl={3}>
                      <ListingStatCard
                        icon={TrendingUp}
                        title="Sale Rate"
                        value={stats.saleRate || 0}
                        suffix="%"
                        color="#ffffff"
                        delay={2}
                        goal={80}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={6} xl={3}>
                      <ListingStatCard
                        icon={AttachMoney}
                        title="Total Portfolio Value"
                        value={stats.totalPortfolioValue || 0}
                        prefix="$"
                        color="#ffffff"
                        delay={3}
                        goal={20000000}
                      />
                    </Grid>
                  </>
                );
            }
          })()}
        </Grid>
      </Box>

      {/* Right container: AI Assistant (always visible) */}
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        minWidth: { xs: '100%', md: 280 },
        maxWidth: { xs: '100%', md: 350 },
        flexShrink: 0,
      }}>
        <Box
          sx={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.08) 100%)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 2,
            p: 3,
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            height: { xs: 'auto', md: '100%' },
            minHeight: { md: 200 },
          }}
        >
          <Box>
            <Box sx={{ fontSize: '2rem', mb: 1 }}>🏡</Box>
            <Box sx={{ fontSize: '1.125rem', fontWeight: 600, mb: 1 }}>
              Listing AI Manager
            </Box>
            <Box sx={{ fontSize: '0.875rem', opacity: 0.9, mb: 2 }}>
              AI-powered property insights, smart pricing recommendations, and market analytics
            </Box>
          </Box>

          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setNewListingModalOpen(true)}
            sx={{
              mt: 'auto',
              backgroundColor: 'rgba(255,255,255,0.2)',
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.3)',
              },
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            Create New Listing
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default ListingStatsGrid;
