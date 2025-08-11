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
  Autocomplete,
  Chip,
  Typography,
  Box,
  Rating,
  Slider
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useForm, Controller } from 'react-hook-form';

const LeadForm = ({ open, onClose, onSubmit, lead, loading }) => {
  const { control, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      leadSource: '',
      leadType: 'Buyer',
      leadStatus: 'New',
      leadScore: 0,
      leadTemperature: 'Cool',
      qualification: {
        timeframe: '',
        motivation: '',
        priceRange: '',
        preApproved: false,
        currentSituation: ''
      },
      propertyInterests: {
        location: [],
        propertyType: [],
        features: []
      },
      campaignInfo: {
        campaignSource: '',
        adGroup: '',
        keyword: ''
      },
      assignedAgent: '',
      notes: '',
      tags: []
    }
  });

  // Reset form when lead changes
  useEffect(() => {
    if (lead) {
      reset(lead);
    } else {
      reset();
    }
  }, [lead, reset]);

  // Auto-calculate lead score based on qualification
  const qualification = watch('qualification');
  const leadTemperature = watch('leadTemperature');
  useEffect(() => {
    let score = 0;
    
    // Temperature scoring
    const temperatureScores = { Hot: 30, Warm: 20, Cool: 10, Cold: 5 };
    score += temperatureScores[leadTemperature] || 0;
    
    // Timeframe scoring
    const timeframeScores = { 
      'immediate': 25, 
      '1-3months': 20, 
      '3-6months': 15, 
      '6-12months': 10, 
      '12+months': 5 
    };
    score += timeframeScores[qualification?.timeframe] || 0;
    
    // Motivation scoring
    const motivationScores = { high: 20, medium: 10, low: 5 };
    score += motivationScores[qualification?.motivation] || 0;
    
    // Pre-approval bonus
    if (qualification?.preApproved) score += 20;
    
    setValue('leadScore', Math.min(score, 100));
  }, [qualification, leadTemperature, setValue]);

  const handleFormSubmit = (data) => {
    onSubmit(data);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogTitle>
          {lead ? 'Edit Lead' : 'New Lead'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Basic Information
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
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

            <Grid item xs={12} sm={6}>
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

            <Grid item xs={12} sm={6}>
              <Controller
                name="email"
                control={control}
                rules={{ 
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

            {/* Lead Classification */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Lead Classification
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="leadSource"
                control={control}
                rules={{ required: 'Lead source is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="Lead Source"
                    fullWidth
                    error={!!errors.leadSource}
                    helperText={errors.leadSource?.message}
                  >
                    <MenuItem value="Zillow">Zillow</MenuItem>
                    <MenuItem value="Realtor.com">Realtor.com</MenuItem>
                    <MenuItem value="Facebook">Facebook</MenuItem>
                    <MenuItem value="Google Ads">Google Ads</MenuItem>
                    <MenuItem value="Referral">Referral</MenuItem>
                    <MenuItem value="Open House">Open House</MenuItem>
                    <MenuItem value="Website">Website</MenuItem>
                    <MenuItem value="Cold Call">Cold Call</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </TextField>
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="leadType"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="Lead Type"
                    fullWidth
                  >
                    <MenuItem value="Buyer">Buyer</MenuItem>
                    <MenuItem value="Seller">Seller</MenuItem>
                    <MenuItem value="Both">Both</MenuItem>
                    <MenuItem value="Investor">Investor</MenuItem>
                  </TextField>
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="leadStatus"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="Lead Status"
                    fullWidth
                  >
                    <MenuItem value="New">New</MenuItem>
                    <MenuItem value="Contacted">Contacted</MenuItem>
                    <MenuItem value="Qualified">Qualified</MenuItem>
                    <MenuItem value="Nurture">Nurture</MenuItem>
                    <MenuItem value="Appointment Set">Appointment Set</MenuItem>
                    <MenuItem value="Met">Met</MenuItem>
                    <MenuItem value="Converted">Converted</MenuItem>
                    <MenuItem value="Lost">Lost</MenuItem>
                  </TextField>
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="leadTemperature"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="Lead Temperature"
                    fullWidth
                  >
                    <MenuItem value="Hot">🔥 Hot</MenuItem>
                    <MenuItem value="Warm">🌡️ Warm</MenuItem>
                    <MenuItem value="Cool">❄️ Cool</MenuItem>
                    <MenuItem value="Cold">🧊 Cold</MenuItem>
                  </TextField>
                )}
              />
            </Grid>

            {/* Lead Score */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                Lead Score: <strong>{watch('leadScore')}/100</strong>
              </Typography>
              <Box sx={{ px: 2 }}>
                <Slider
                  value={watch('leadScore')}
                  disabled
                  min={0}
                  max={100}
                  marks={[
                    { value: 0, label: '0' },
                    { value: 25, label: '25' },
                    { value: 50, label: '50' },
                    { value: 75, label: '75' },
                    { value: 100, label: '100' }
                  ]}
                  sx={{
                    color: watch('leadScore') >= 75 ? 'success.main' : 
                           watch('leadScore') >= 50 ? 'warning.main' : 'error.main'
                  }}
                />
              </Box>
            </Grid>

            {/* Qualification (LPMAMA) */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Qualification (LPMAMA)
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="qualification.timeframe"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="Timeframe"
                    fullWidth
                  >
                    <MenuItem value="immediate">Immediate (0-30 days)</MenuItem>
                    <MenuItem value="1-3months">1-3 months</MenuItem>
                    <MenuItem value="3-6months">3-6 months</MenuItem>
                    <MenuItem value="6-12months">6-12 months</MenuItem>
                    <MenuItem value="12+months">12+ months</MenuItem>
                  </TextField>
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="qualification.motivation"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="Motivation Level"
                    fullWidth
                  >
                    <MenuItem value="high">High</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="low">Low</MenuItem>
                  </TextField>
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="qualification.priceRange"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Price Range"
                    fullWidth
                    placeholder="e.g., $300,000 - $500,000"
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="qualification.currentSituation"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Current Situation"
                    multiline
                    rows={3}
                    fullWidth
                    placeholder="Describe their current housing situation and motivation"
                  />
                )}
              />
            </Grid>

            {/* Property Interests */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Property Interests
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="propertyInterests.location"
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    {...field}
                    multiple
                    freeSolo
                    options={['Downtown', 'Suburbs', 'Waterfront', 'Mountains', 'Rural']}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                      ))
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Preferred Locations"
                        placeholder="Add locations"
                      />
                    )}
                    onChange={(_, value) => field.onChange(value)}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="propertyInterests.propertyType"
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    {...field}
                    multiple
                    options={['Single Family', 'Condo', 'Townhouse', 'Multi-Family', 'Land']}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                      ))
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Property Types"
                        placeholder="Select property types"
                      />
                    )}
                    onChange={(_, value) => field.onChange(value)}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="propertyInterests.features"
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    {...field}
                    multiple
                    freeSolo
                    options={['Pool', 'Garage', 'Fireplace', 'Hardwood Floors', 'Updated Kitchen', 'Large Yard']}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                      ))
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Desired Features"
                        placeholder="Add desired features"
                      />
                    )}
                    onChange={(_, value) => field.onChange(value)}
                  />
                )}
              />
            </Grid>

            {/* Campaign Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Campaign Information
              </Typography>
            </Grid>

            <Grid item xs={12} sm={4}>
              <Controller
                name="campaignInfo.campaignSource"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Campaign Source"
                    fullWidth
                    placeholder="e.g., Google Ads, Facebook"
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <Controller
                name="campaignInfo.adGroup"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Ad Group"
                    fullWidth
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <Controller
                name="campaignInfo.keyword"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Keyword"
                    fullWidth
                  />
                )}
              />
            </Grid>

            {/* Notes */}
            <Grid item xs={12}>
              <Controller
                name="notes"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Notes"
                    multiline
                    rows={4}
                    fullWidth
                    placeholder="Additional notes about this lead"
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
                    options={['first-time-buyer', 'investor', 'urgent', 'high-value', 'follow-up-needed']}
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

export default LeadForm;