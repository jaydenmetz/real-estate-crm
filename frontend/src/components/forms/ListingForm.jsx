import React, { useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  MenuItem,
  InputAdornment,
  Autocomplete,
  Chip,
  FormControlLabel,
  Checkbox,
  Box,
  Typography
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useForm, Controller } from 'react-hook-form';
import { useQuery } from 'react-query';
import { api } from '../../services/api';

const ListingForm = ({ open, onClose, onSubmit, listing, loading }) => {
  const { control, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      propertyAddress: '',
      mlsNumber: '',
      listingStatus: 'Active',
      listPrice: '',
      originalListPrice: '',
      propertyType: 'Single Family',
      bedrooms: '',
      bathrooms: '',
      squareFootage: '',
      lotSize: '',
      yearBuilt: '',
      garage: '',
      pool: false,
      listingDate: null,
      expirationDate: null,
      marketingBudget: '',
      virtualTourLink: '',
      professionalPhotos: false,
      dronePhotos: false,
      videoWalkthrough: false,
      listingCommission: 3.0,
      buyerAgentCommission: 2.5,
      sellers: [],
      tags: []
    }
  });

  // Fetch clients for sellers selection
  const { data: clients } = useQuery(
    'clients',
    () => api.get('/clients', { params: { type: 'Seller' } }).then(res => res.data),
    { enabled: open }
  );

  // Reset form when listing changes
  useEffect(() => {
    if (listing) {
      reset({
        ...listing,
        listingDate: listing.listingDate ? new Date(listing.listingDate) : null,
        expirationDate: listing.expirationDate ? new Date(listing.expirationDate) : null
      });
    } else {
      reset();
    }
  }, [listing, reset]);

  // Auto-calculate price per sqft
  const listPrice = watch('listPrice');
  const squareFootage = watch('squareFootage');
  useEffect(() => {
    if (listPrice && squareFootage) {
      setValue('pricePerSqft', (listPrice / squareFootage).toFixed(2));
    }
  }, [listPrice, squareFootage, setValue]);

  // Set original list price on first entry
  useEffect(() => {
    if (listPrice && !listing) {
      setValue('originalListPrice', listPrice);
    }
  }, [listPrice, listing, setValue]);

  const handleFormSubmit = (data) => {
    const formattedData = {
      ...data,
      listingDate: data.listingDate ? data.listingDate.toISOString().split('T')[0] : null,
      expirationDate: data.expirationDate ? data.expirationDate.toISOString().split('T')[0] : null,
      sellers: data.sellers.map(s => s.id),
      pricePerSqft: data.listPrice && data.squareFootage ? 
        (data.listPrice / data.squareFootage).toFixed(2) : null
    };
    onSubmit(formattedData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogTitle>
          {listing ? 'Edit Listing' : 'New Listing'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {/* Property Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Property Information
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={8}>
              <Controller
                name="propertyAddress"
                control={control}
                rules={{ required: 'Property address is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Property Address"
                    fullWidth
                    error={!!errors.propertyAddress}
                    helperText={errors.propertyAddress?.message}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Controller
                name="mlsNumber"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="MLS Number"
                    fullWidth
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Controller
                name="propertyType"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="Property Type"
                    fullWidth
                  >
                    <MenuItem value="Single Family">Single Family</MenuItem>
                    <MenuItem value="Condo">Condo</MenuItem>
                    <MenuItem value="Townhouse">Townhouse</MenuItem>
                    <MenuItem value="Multi-Family">Multi-Family</MenuItem>
                    <MenuItem value="Land">Land</MenuItem>
                    <MenuItem value="Commercial">Commercial</MenuItem>
                  </TextField>
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Controller
                name="listingStatus"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="Status"
                    fullWidth
                  >
                    <MenuItem value="Coming Soon">Coming Soon</MenuItem>
                    <MenuItem value="Active">Active</MenuItem>
                    <MenuItem value="Pending">Pending</MenuItem>
                    <MenuItem value="Sold">Sold</MenuItem>
                    <MenuItem value="Expired">Expired</MenuItem>
                    <MenuItem value="Withdrawn">Withdrawn</MenuItem>
                    <MenuItem value="Cancelled">Cancelled</MenuItem>
                  </TextField>
                )}
              />
            </Grid>

            <Grid item xs={6} md={3}>
              <Controller
                name="bedrooms"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Bedrooms"
                    type="number"
                    fullWidth
                    inputProps={{ min: 0, max: 20 }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={6} md={3}>
              <Controller
                name="bathrooms"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Bathrooms"
                    type="number"
                    fullWidth
                    inputProps={{ min: 0, max: 20, step: 0.5 }}
                  />
                )}
              />
            </Grid>

            {/* Property Details */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Property Details
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Controller
                name="squareFootage"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Square Footage"
                    type="number"
                    fullWidth
                    InputProps={{
                      endAdornment: <InputAdornment position="end">sq ft</InputAdornment>
                    }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Controller
                name="lotSize"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Lot Size"
                    type="number"
                    fullWidth
                    InputProps={{
                      endAdornment: <InputAdornment position="end">acres</InputAdornment>
                    }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Controller
                name="yearBuilt"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Year Built"
                    type="number"
                    fullWidth
                    inputProps={{ min: 1800, max: new Date().getFullYear() + 2 }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Controller
                name="garage"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Garage Spaces"
                    type="number"
                    fullWidth
                    inputProps={{ min: 0, max: 10 }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="pool"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Checkbox {...field} checked={field.value} />}
                    label="Pool"
                  />
                )}
              />
            </Grid>

            {/* Pricing */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Pricing Information
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Controller
                name="listPrice"
                control={control}
                rules={{ required: 'List price is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="List Price"
                    type="number"
                    fullWidth
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>
                    }}
                    error={!!errors.listPrice}
                    helperText={errors.listPrice?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Controller
                name="originalListPrice"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Original List Price"
                    type="number"
                    fullWidth
                    disabled
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>
                    }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Controller
                name="pricePerSqft"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Price per Sq Ft"
                    type="number"
                    fullWidth
                    disabled
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>
                    }}
                  />
                )}
              />
            </Grid>

            {/* Dates */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Important Dates
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="listingDate"
                control={control}
                rules={{ required: 'Listing date is required' }}
                render={({ field }) => (
                  <DatePicker
                    {...field}
                    label="Listing Date"
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        error={!!errors.listingDate}
                        helperText={errors.listingDate?.message}
                      />
                    )}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="expirationDate"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    {...field}
                    label="Expiration Date"
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                      />
                    )}
                  />
                )}
              />
            </Grid>

            {/* Commission */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Commission Structure
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="listingCommission"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Listing Commission"
                    type="number"
                    fullWidth
                    InputProps={{
                      endAdornment: <InputAdornment position="end">%</InputAdornment>
                    }}
                    inputProps={{ step: 0.25, min: 0, max: 10 }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="buyerAgentCommission"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Buyer Agent Commission"
                    type="number"
                    fullWidth
                    InputProps={{
                      endAdornment: <InputAdornment position="end">%</InputAdornment>
                    }}
                    inputProps={{ step: 0.25, min: 0, max: 10 }}
                  />
                )}
              />
            </Grid>

            {/* Marketing */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Marketing & Media
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="marketingBudget"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Marketing Budget"
                    type="number"
                    fullWidth
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>
                    }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="virtualTourLink"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Virtual Tour Link"
                    fullWidth
                    placeholder="https://..."
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Controller
                  name="professionalPhotos"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Checkbox {...field} checked={field.value} />}
                      label="Professional Photos"
                    />
                  )}
                />
                <Controller
                  name="dronePhotos"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Checkbox {...field} checked={field.value} />}
                      label="Drone Photos"
                    />
                  )}
                />
                <Controller
                  name="videoWalkthrough"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Checkbox {...field} checked={field.value} />}
                      label="Video Walkthrough"
                    />
                  )}
                />
              </Box>
            </Grid>

            {/* Sellers */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Seller Information
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="sellers"
                control={control}
                rules={{ required: 'At least one seller is required' }}
                render={({ field }) => (
                  <Autocomplete
                    {...field}
                    multiple
                    options={clients?.clients || []}
                    getOptionLabel={(option) => `${option.firstName} ${option.lastName}`}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Sellers"
                        error={!!errors.sellers}
                        helperText={errors.sellers?.message}
                      />
                    )}
                    onChange={(_, value) => field.onChange(value)}
                  />
                )}
              />
            </Grid>

            {/* Tags */}
            <Grid item xs={12}>
              <Controller
                name="tags"
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    {...field}
                    multiple
                    freeSolo
                    options={['luxury', 'waterfront', 'new-construction', 'fixer-upper', 'investment']}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                      ))
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Tags"
                        placeholder="Add tags"
                      />
                    )}
                    onChange={(_, value) => field.onChange(value)}
                  />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ListingForm;