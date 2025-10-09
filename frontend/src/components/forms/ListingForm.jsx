import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  MenuItem,
  Box,
  Typography,
  Chip,
  Stack,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { listingsAPI } from '../../services/api.service';
import { useSnackbar } from 'notistack';

const ListingForm = ({ open, onClose, listing, onSuccess }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  
  // Transform listing data to ensure dates are Date objects
  const getDefaultValues = () => {
    if (!listing) {
      return {
        address: '',
        listPrice: '',
        listDate: new Date(),
        status: 'Active',
        mlsNumber: '',
        bedrooms: '',
        bathrooms: '',
        squareFeet: '',
        yearBuilt: '',
        propertyType: 'Single Family',
        description: '',
        features: [],
        sellers: [],
      };
    }

    // Convert listDate string to Date object if needed
    const listDate = listing.listDate
      ? (listing.listDate instanceof Date
          ? listing.listDate
          : new Date(listing.listDate))
      : new Date();

    // Validate the date
    const validListDate = listDate instanceof Date && !isNaN(listDate.getTime())
      ? listDate
      : new Date();

    return {
      ...listing,
      listDate: validListDate
    };
  };

  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: getDefaultValues()
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      if (listing?.id) {
        await listingsAPI.update(listing.id, data);
        enqueueSnackbar('Listing updated successfully', { variant: 'success' });
      } else {
        await listingsAPI.create(data);
        enqueueSnackbar('Listing created successfully', { variant: 'success' });
      }
      reset();
      onSuccess?.();
      onClose();
    } catch (error) {
      enqueueSnackbar(error.message || 'Failed to save listing', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const propertyTypes = [
    'Single Family',
    'Condo',
    'Townhouse',
    'Multi-Family',
    'Land',
    'Commercial',
  ];

  const statusOptions = [
    'Active',
    'Pending',
    'Sold',
    'Withdrawn',
    'Expired',
  ];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>
          {listing ? 'Edit Listing' : 'Create New Listing'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            {/* Address */}
            <Grid item xs={12}>
              <Controller
                name="address"
                control={control}
                rules={{ required: 'Address is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Property Address"
                    error={!!errors.address}
                    helperText={errors.address?.message}
                  />
                )}
              />
            </Grid>

            {/* Price and MLS */}
            <Grid item xs={12} sm={6}>
              <Controller
                name="listPrice"
                control={control}
                rules={{ required: 'List price is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="List Price"
                    type="number"
                    InputProps={{ startAdornment: '$' }}
                    error={!!errors.listPrice}
                    helperText={errors.listPrice?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="mlsNumber"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="MLS Number"
                  />
                )}
              />
            </Grid>

            {/* Property Type and Status */}
            <Grid item xs={12} sm={6}>
              <Controller
                name="propertyType"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    select
                    label="Property Type"
                  >
                    {propertyTypes.map(type => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    select
                    label="Status"
                  >
                    {statusOptions.map(status => (
                      <MenuItem key={status} value={status}>
                        {status}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>

            {/* Property Details */}
            <Grid item xs={6} sm={3}>
              <Controller
                name="bedrooms"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Bedrooms"
                    type="number"
                  />
                )}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <Controller
                name="bathrooms"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Bathrooms"
                    type="number"
                    step="0.5"
                  />
                )}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <Controller
                name="squareFeet"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Square Feet"
                    type="number"
                  />
                )}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <Controller
                name="yearBuilt"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Year Built"
                    type="number"
                  />
                )}
              />
            </Grid>

            {/* List Date */}
            <Grid item xs={12} sm={6}>
              <Controller
                name="listDate"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    label="List Date"
                    value={field.value}
                    onChange={field.onChange}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                )}
              />
            </Grid>

            {/* Description */}
            <Grid item xs={12}>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    multiline
                    rows={4}
                    label="Description"
                  />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={loading}
          >
            {listing ? 'Update' : 'Create'} Listing
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ListingForm;