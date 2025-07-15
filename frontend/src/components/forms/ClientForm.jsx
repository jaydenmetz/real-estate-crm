import React, { useEffect } from 'react';
import { safeFormatDate, safeParseDate } from '../../utils/safeDateUtils';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  MenuItem,
  Autocomplete,
  Chip,
  Typography,
  Box,
  FormControlLabel,
  Switch
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useForm, Controller } from 'react-hook-form';

const ClientForm = ({ open, onClose, onSubmit, client, loading }) => {
  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      preferredName: '',
      clientStatus: 'Active',
      clientType: 'Buyer',
      email: '',
      phone: '',
      alternatePhone: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: ''
      },
      preferredContactMethod: 'Email',
      bestTimeToContact: '',
      demographics: {
        birthDate: null,
        anniversary: null,
        spouseName: '',
        occupation: '',
        employer: ''
      },
      preferences: {
        priceRangeMin: '',
        priceRangeMax: '',
        preferredAreas: [],
        propertyTypePreferences: [],
        motivationLevel: 'Warm',
        timeframe: ''
      },
      financial: {
        preApproved: false,
        preApprovalAmount: '',
        cashBuyer: false
      },
      leadInfo: {
        leadSource: '',
        leadDate: null
      },
      communication: {
        newsletterOptIn: true,
        marketUpdateOptIn: true,
        birthdayGreetingOptIn: true,
        holidayCardOptIn: true
      },
      tags: []
    }
  });

  // Reset form when client changes
  useEffect(() => {
    if (client) {
      reset({
        ...client,
        demographics: {
          ...client.demographics,
          birthDate: client.demographics?.birthDate ? new Date(client.demographics.birthDate) : null,
          anniversary: client.demographics?.anniversary ? new Date(client.demographics.anniversary) : null
        },
        leadInfo: {
          ...client.leadInfo,
          leadDate: client.leadInfo?.leadDate ? new Date(client.leadInfo.leadDate) : null
        }
      });
    } else {
      reset();
    }
  }, [client, reset]);

  const handleFormSubmit = (data) => {
    const formattedData = {
      ...data,
      demographics: {
        ...data.demographics,
        birthDate: data.demographics.birthDate ? 
          safeFormatDate(data.demographics.birthDate, 'yyyy-MM-dd') : null,
        anniversary: data.demographics.anniversary ? 
          safeFormatDate(data.demographics.anniversary, 'yyyy-MM-dd') : null
      },
      leadInfo: {
        ...data.leadInfo,
        leadDate: data.leadInfo.leadDate ? 
          safeFormatDate(data.leadInfo.leadDate, 'yyyy-MM-dd') : null
      }
    };
    onSubmit(formattedData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogTitle>
          {client ? 'Edit Client' : 'New Client'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Basic Information
              </Typography>
            </Grid>

            <Grid item xs={12} sm={4}>
              <Controller
                name="firstName"
                control={control}
                rules={{ required: 'First name is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="First Name"
                    fullWidth
                    error={!!errors.firstName}
                    helperText={errors.firstName?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <Controller
                name="lastName"
                control={control}
                rules={{ required: 'Last name is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Last Name"
                    fullWidth
                    error={!!errors.lastName}
                    helperText={errors.lastName?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <Controller
                name="preferredName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Preferred Name"
                    fullWidth
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="clientType"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="Client Type"
                    fullWidth
                  >
                    <MenuItem value="Buyer">Buyer</MenuItem>
                    <MenuItem value="Seller">Seller</MenuItem>
                    <MenuItem value="Both">Both</MenuItem>
                    <MenuItem value="Investor">Investor</MenuItem>
                    <MenuItem value="Referral">Referral</MenuItem>
                  </TextField>
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="clientStatus"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="Status"
                    fullWidth
                  >
                    <MenuItem value="Active">Active</MenuItem>
                    <MenuItem value="Past Client">Past Client</MenuItem>
                    <MenuItem value="Prospect">Prospect</MenuItem>
                    <MenuItem value="Archived">Archived</MenuItem>
                  </TextField>
                )}
              />
            </Grid>

            {/* Contact Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Contact Information
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="email"
                control={control}
                rules={{ 
                  required: 'Email is required',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Invalid email address'
                  }
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Email"
                    type="email"
                    fullWidth
                    error={!!errors.email}
                    helperText={errors.email?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Phone"
                    fullWidth
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="alternatePhone"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Alternate Phone"
                    fullWidth
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="preferredContactMethod"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="Preferred Contact Method"
                    fullWidth
                  >
                    <MenuItem value="Call">Call</MenuItem>
                    <MenuItem value="Text">Text</MenuItem>
                    <MenuItem value="Email">Email</MenuItem>
                  </TextField>
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="bestTimeToContact"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Best Time to Contact"
                    fullWidth
                    placeholder="e.g., Weekdays after 6pm"
                  />
                )}
              />
            </Grid>

            {/* Address */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Address
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="address.street"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Street Address"
                    fullWidth
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <Controller
                name="address.city"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="City"
                    fullWidth
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <Controller
                name="address.state"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="State"
                    fullWidth
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <Controller
                name="address.zipCode"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Zip Code"
                    fullWidth
                  />
                )}
              />
            </Grid>

            {/* Demographics */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Demographics
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="demographics.birthDate"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    {...field}
                    label="Birth Date"
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

            <Grid item xs={12} sm={6}>
              <Controller
                name="demographics.anniversary"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    {...field}
                    label="Anniversary"
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

            <Grid item xs={12} sm={6}>
              <Controller
                name="demographics.spouseName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Spouse Name"
                    fullWidth
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="demographics.occupation"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Occupation"
                    fullWidth
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="demographics.employer"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Employer"
                    fullWidth
                  />
                )}
              />
            </Grid>

            {/* Preferences (for buyers) */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Preferences
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="preferences.priceRangeMin"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Min Price Range"
                    type="number"
                    fullWidth
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="preferences.priceRangeMax"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Max Price Range"
                    type="number"
                    fullWidth
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="preferences.motivationLevel"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="Motivation Level"
                    fullWidth
                  >
                    <MenuItem value="Hot">Hot</MenuItem>
                    <MenuItem value="Warm">Warm</MenuItem>
                    <MenuItem value="Cool">Cool</MenuItem>
                    <MenuItem value="Cold">Cold</MenuItem>
                  </TextField>
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="preferences.timeframe"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Timeframe"
                    fullWidth
                    placeholder="e.g., 3-6 months"
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="preferences.preferredAreas"
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    {...field}
                    multiple
                    freeSolo
                    options={['Downtown', 'Suburbs', 'Waterfront', 'Hills']}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                      ))
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Preferred Areas"
                        placeholder="Add areas"
                      />
                    )}
                    onChange={(_, value) => field.onChange(value)}
                  />
                )}
              />
            </Grid>

            {/* Financial Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Financial Information
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Controller
                  name="financial.preApproved"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Switch {...field} checked={field.value} />}
                      label="Pre-Approved"
                    />
                  )}
                />
                <Controller
                  name="financial.cashBuyer"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Switch {...field} checked={field.value} />}
                      label="Cash Buyer"
                    />
                  )}
                />
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="financial.preApprovalAmount"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Pre-Approval Amount"
                    type="number"
                    fullWidth
                  />
                )}
              />
            </Grid>

            {/* Communication Preferences */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Communication Preferences
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Controller
                  name="communication.newsletterOptIn"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Switch {...field} checked={field.value} />}
                      label="Newsletter Opt-In"
                    />
                  )}
                />
                <Controller
                  name="communication.marketUpdateOptIn"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Switch {...field} checked={field.value} />}
                      label="Market Update Opt-In"
                    />
                  )}
                />
                <Controller
                  name="communication.birthdayGreetingOptIn"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Switch {...field} checked={field.value} />}
                      label="Birthday Greeting Opt-In"
                    />
                  )}
                />
                <Controller
                  name="communication.holidayCardOptIn"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Switch {...field} checked={field.value} />}
                      label="Holiday Card Opt-In"
                    />
                  )}
                />
              </Box>
            </Grid>

            {/* Lead Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Lead Information
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="leadInfo.leadSource"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Lead Source"
                    fullWidth
                    placeholder="e.g., Zillow, Referral"
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="leadInfo.leadDate"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    {...field}
                    label="Lead Date"
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
                    options={['first-time-buyer', 'investor', 'luxury-client', 'downsizing', 'relocating']}
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

export default ClientForm;