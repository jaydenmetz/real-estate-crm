
import React, { useState } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  Tabs,
  Tab,
  Chip,
  IconButton,
  Tooltip,
  Avatar,
  Card,
  CardContent,
} from '@mui/material';
import {
  Add,
  FilterList,
  Download,
  Visibility,
  Edit,
  TrendingUp,
  TrendingDown,
  Home,
  RemoveRedEye,
  FavoriteBorder,
  DateRange,
  CameraAlt,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useSnackbar } from 'notistack';
import { format, differenceInDays } from 'date-fns';
import { listingsAPI } from '../../services/api';
import ListingForm from '../forms/ListingForm';
import StatsCard from '../common/StatsCard';

const ListingsDashboard = () => {
  const [tabValue, setTabValue] = useState(0);
  const [openForm, setOpenForm] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  // Filter listings based on tab
  const statusMap = ['all', 'Coming Soon', 'Active', 'Pending', 'Sold'];
  const currentStatus = statusMap[tabValue];

  const { data, isLoading } = useQuery(
    ['listings', currentStatus],
    () => {
      const params = currentStatus !== 'all' ? { listingStatus: currentStatus } : {};
      return listingsAPI.getAll(params).then(res => res.data);
    },
    {
      refetchInterval: 60000, // Refresh every minute for market updates
      keepPreviousData: true,
    }
  );

  // Update listing status mutation
  const updateStatusMutation = useMutation(
    ({ id, status }) => listingsAPI.updateStatus(id, status),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('listings');
        enqueueSnackbar('Listing status updated', { variant: 'success' });
      },
    }
  );

  const handleEdit = (listing) => {
    setSelectedListing(listing);
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setSelectedListing(null);
  };

  const getDaysOnMarket = (listDate) => {
    return differenceInDays(new Date(), new Date(listDate));
  };

  const getPriceChangeIndicator = (listing) => {
    if (!listing.priceHistory || listing.priceHistory.length < 2) return null;
    
    const currentPrice = listing.listPrice;
    const previousPrice = listing.priceHistory[listing.priceHistory.length - 2]?.price;
    
    if (currentPrice < previousPrice) {
      return { icon: <TrendingDown color="error" />, text: 'Reduced' };
    } else if (currentPrice > previousPrice) {
      return { icon: <TrendingUp color="success" />, text: 'Increased' };
    }
    return null;
  };

  const columns = [
    {
      field: 'photos',
      headerName: '',
      width: 60,
      renderCell: (params) => (
        <Avatar
          variant="rounded"
          src={params.row.photos?.[0]?.url}
          sx={{ width: 40, height: 40 }}
        >
          <Home />
        </Avatar>
      ),
    },
    {
      field: 'propertyAddress',
      headerName: 'Property',
      width: 250,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight={500}>
            {params.value}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {params.row.beds}bd / {params.row.baths}ba • {params.row.squareFeet?.toLocaleString()} sqft
          </Typography>
        </Box>
      ),
    },
    {
      field: 'listPrice',
      headerName: 'Price',
      width: 150,
      renderCell: (params) => {
        const priceChange = getPriceChangeIndicator(params.row);
        return (
          <Box>
            <Typography variant="body2" fontWeight={500}>
              ${params.value?.toLocaleString()}
            </Typography>
            {priceChange && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {priceChange.icon}
                <Typography variant="caption" color="text.secondary">
                  {priceChange.text}
                </Typography>
              </Box>
            )}
          </Box>
        );
      },
    },
    {
      field: 'listingStatus',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={
            params.value === 'Active' ? 'success' :
            params.value === 'Pending' ? 'warning' :
            params.value === 'Sold' ? 'default' :
            'primary'
          }
        />
      ),
    },
    {
      field: 'daysOnMarket',
      headerName: 'DOM',
      width: 80,
      valueGetter: (params) => getDaysOnMarket(params.row.listDate),
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          variant="outlined"
          color={params.value > 30 ? 'warning' : 'default'}
        />
      ),
    },
    {
      field: 'views',
      headerName: 'Activity',
      width: 150,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <RemoveRedEye sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="caption">{params.row.totalViews || 0}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <FavoriteBorder sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="caption">{params.row.totalSaves || 0}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <DateRange sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="caption">{params.row.totalShowings || 0}</Typography>
          </Box>
        </Box>
      ),
    },
    {
      field: 'listingAgent',
      headerName: 'Agent',
      width: 150,
      renderCell: (params) => (
        <Typography variant="body2">
          {params.value?.name || 'Unassigned'}
        </Typography>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <IconButton size="small" onClick={() => handleEdit(params.row)}>
            <Edit fontSize="small" />
          </IconButton>
          <IconButton size="small">
            <Visibility fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Listing Management</Typography>
        <Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setOpenForm(true)}
            sx={{ mr: 1 }}
          >
            New Listing
          </Button>
          <IconButton>
            <FilterList />
          </IconButton>
          <IconButton>
            <Download />
          </IconButton>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Active Listings"
            value={data?.stats?.active || 0}
            icon={<Home />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Total Views"
            value={(data?.stats?.totalViews || 0).toLocaleString()}
            icon={<RemoveRedEye />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Avg Days on Market"
            value={data?.stats?.avgDaysOnMarket || 0}
            icon={<DateRange />}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Sold This Month"
            value={data?.stats?.soldThisMonth || 0}
            icon={<TrendingUp />}
            color="info"
          />
        </Grid>
      </Grid>

      {/* Market Insights */}
      {data?.insights && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Hot Properties
                </Typography>
                {data.insights.hotProperties?.map((property, idx) => (
                  <Box key={idx} sx={{ mb: 1 }}>
                    <Typography variant="body2">
                      {property.address}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {property.views} views in 7 days
                    </Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Price Reductions
                </Typography>
                {data.insights.priceReductions?.map((property, idx) => (
                  <Box key={idx} sx={{ mb: 1 }}>
                    <Typography variant="body2">
                      {property.address}
                    </Typography>
                    <Typography variant="caption" color="error">
                      ${property.reduction.toLocaleString()} reduction
                    </Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Upcoming Open Houses
                </Typography>
                {data.insights.openHouses?.map((event, idx) => (
                  <Box key={idx} sx={{ mb: 1 }}>
                    <Typography variant="body2">
                      {event.address}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {format(new Date(event.date), 'MMM d, h:mm a')}
                    </Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Listings Table */}
      <Paper sx={{ width: '100%' }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
          <Tab label="All Listings" />
          <Tab label="Coming Soon" />
          <Tab label="Active" />
          <Tab label="Pending" />
          <Tab label="Sold" />
        </Tabs>
        <Box sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={data?.listings || []}
            columns={columns}
            pageSize={20}
            rowsPerPageOptions={[20, 50, 100]}
            loading={isLoading}
            disableSelectionOnClick
            checkboxSelection
            getRowId={(row) => row.id}
            sx={{
              '& .MuiDataGrid-row': {
                cursor: 'pointer',
              },
            }}
          />
        </Box>
      </Paper>

      {/* Form Dialog */}
      <ListingForm
        open={openForm}
        onClose={handleCloseForm}
        onSubmit={(data) => {
          const mutation = selectedListing 
            ? listingsAPI.update(selectedListing.id, data)
            : listingsAPI.create(data);
          
          mutation.then(() => {
            queryClient.invalidateQueries('listings');
            enqueueSnackbar(`Listing ${selectedListing ? 'updated' : 'created'}`, { variant: 'success' });
            handleCloseForm();
          });
        }}
        listing={selectedListing}
      />
    </Container>
  );
};

export default ListingsDashboard;