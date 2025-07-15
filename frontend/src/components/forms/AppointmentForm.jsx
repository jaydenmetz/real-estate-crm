import React, { useEffect } from 'react';
import { safeFormatDate } from '../../utils/safeDateUtils';
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
  FormControlLabel,
  Switch
} from '@mui/material';
import { DatePicker, TimePicker } from '@mui/x-date-pickers';
import { useForm, Controller } from 'react-hook-form';
import { useQuery } from 'react-query';
import { api } from '../../services/api';

const AppointmentForm = ({ open, onClose, onSubmit, appointment, loading }) => {
  const { control, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      title: '',
      appointmentType: 'Buyer Consultation',
      status: 'Scheduled',
      date: null,
      startTime: null,
      endTime: null,
      duration: 60,
      location: {
        type: 'office',
        address: '',
        notes: ''
      },
      virtualMeetingLink: '',
      propertyAddress: '',
      clients: [],
      preparationChecklist: [],
      notes: {
        preparation: '',
        meeting: '',
        internal: ''
      },
      reminders: {
        email24h: true,
        sms1h: true,
        email1h: false
      }
    }
  });

  // Fetch clients for attendee selection
  const { data: clients } = useQuery(
    'clients',
    () => api.get('/clients').then(res => res.data),
    { enabled: open }
  );

  // Auto-calculate end time based on start time and duration
  const startTime = watch('startTime');
  const duration = watch('duration');
  useEffect(() => {
    if (startTime && duration) {
      try {
        const start = new Date(startTime);
        if (!isNaN(start.getTime())) {
          const end = new Date(start.getTime() + duration * 60000);
          setValue('endTime', end);
        }
      } catch (error) {
        console.warn('Error calculating end time:', error);
      }
    }
  }, [startTime, duration, setValue]);

  // Reset form when appointment changes
  useEffect(() => {
    if (appointment) {
      reset({
        ...appointment,
        date: appointment.date ? new Date(appointment.date) : null,
        startTime: appointment.startTime ? new Date(`1970-01-01T${appointment.startTime}`) : null,
        endTime: appointment.endTime ? new Date(`1970-01-01T${appointment.endTime}`) : null
      });
    } else {
      reset();
    }
  }, [appointment, reset]);

  const handleFormSubmit = (data) => {
    const formattedData = {
      ...data,
      date: data.date ? safeFormatDate(data.date, 'yyyy-MM-dd') : null,
      startTime: data.startTime ? (data.startTime instanceof Date ? data.startTime.toTimeString().split(' ')[0].substring(0, 5) : data.startTime) : null,
      endTime: data.endTime ? (data.endTime instanceof Date ? data.endTime.toTimeString().split(' ')[0].substring(0, 5) : data.endTime) : null,
      clients: data.clients.map(c => c.id)
    };
    onSubmit(formattedData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogTitle>
          {appointment ? 'Edit Appointment' : 'New Appointment'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Controller
                name="title"
                control={control}
                rules={{ required: 'Title is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Appointment Title"
                    fullWidth
                    error={!!errors.title}
                    helperText={errors.title?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="appointmentType"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="Appointment Type"
                    fullWidth
                  >
                    <MenuItem value="Listing Presentation">Listing Presentation</MenuItem>
                    <MenuItem value="Buyer Consultation">Buyer Consultation</MenuItem>
                    <MenuItem value="Property Showing">Property Showing</MenuItem>
                    <MenuItem value="Open House">Open House</MenuItem>
                    <MenuItem value="Closing">Closing</MenuItem>
                    <MenuItem value="Inspection">Inspection</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
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
                    select
                    label="Status"
                    fullWidth
                  >
                    <MenuItem value="Scheduled">Scheduled</MenuItem>
                    <MenuItem value="Confirmed">Confirmed</MenuItem>
                    <MenuItem value="Completed">Completed</MenuItem>
                    <MenuItem value="Cancelled">Cancelled</MenuItem>
                    <MenuItem value="No Show">No Show</MenuItem>
                  </TextField>
                )}
              />
            </Grid>

            {/* Date and Time */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Date & Time
              </Typography>
            </Grid>

            <Grid item xs={12} sm={4}>
              <Controller
                name="date"
                control={control}
                rules={{ required: 'Date is required' }}
                render={({ field }) => (
                  <DatePicker
                    {...field}
                    label="Date"
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        error={!!errors.date}
                        helperText={errors.date?.message}
                      />
                    )}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <Controller
                name="startTime"
                control={control}
                rules={{ required: 'Start time is required' }}
                render={({ field }) => (
                  <TimePicker
                    {...field}
                    label="Start Time"
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        error={!!errors.startTime}
                        helperText={errors.startTime?.message}
                      />
                    )}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <Controller
                name="duration"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="Duration (minutes)"
                    fullWidth
                  >
                    <MenuItem value={15}>15 minutes</MenuItem>
                    <MenuItem value={30}>30 minutes</MenuItem>
                    <MenuItem value={60}>1 hour</MenuItem>
                    <MenuItem value={90}>1.5 hours</MenuItem>
                    <MenuItem value={120}>2 hours</MenuItem>
                    <MenuItem value={180}>3 hours</MenuItem>
                  </TextField>
                )}
              />
            </Grid>

            {/* Location */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Location
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="location.type"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="Location Type"
                    fullWidth
                  >
                    <MenuItem value="office">Office</MenuItem>
                    <MenuItem value="property">Property</MenuItem>
                    <MenuItem value="client_home">Client's Home</MenuItem>
                    <MenuItem value="virtual">Virtual</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </TextField>
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="virtualMeetingLink"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Virtual Meeting Link"
                    fullWidth
                    placeholder="https://zoom.us/..."
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="location.address"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Address"
                    fullWidth
                    placeholder="Meeting location address"
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="propertyAddress"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Property Address (if applicable)"
                    fullWidth
                    placeholder="Property being shown or discussed"
                  />
                )}
              />
            </Grid>

            {/* Attendees */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Attendees
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="clients"
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    {...field}
                    multiple
                    options={clients?.clients || []}
                    getOptionLabel={(option) => `${option.firstName} ${option.lastName}`}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Clients"
                        placeholder="Select clients attending"
                      />
                    )}
                    onChange={(_, value) => field.onChange(value)}
                  />
                )}
              />
            </Grid>

            {/* Preparation */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Preparation & Notes
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="preparationChecklist"
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    {...field}
                    multiple
                    freeSolo
                    options={[
                      'Prepare market analysis',
                      'Print contracts',
                      'Review property details',
                      'Prepare listing presentation',
                      'Confirm showings',
                      'Schedule inspections'
                    ]}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                      ))
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Preparation Checklist"
                        placeholder="Add preparation tasks"
                      />
                    )}
                    onChange={(_, value) => field.onChange(value)}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="notes.preparation"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Preparation Notes"
                    multiline
                    rows={3}
                    fullWidth
                    placeholder="Notes for appointment preparation"
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="notes.internal"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Internal Notes"
                    multiline
                    rows={2}
                    fullWidth
                    placeholder="Internal notes (not shared with clients)"
                  />
                )}
              />
            </Grid>

            {/* Reminders */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Reminders
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="reminders.email24h"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Switch {...field} checked={field.value} />}
                    label="Email reminder 24 hours before"
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="reminders.sms1h"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Switch {...field} checked={field.value} />}
                    label="SMS reminder 1 hour before"
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="reminders.email1h"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Switch {...field} checked={field.value} />}
                    label="Email reminder 1 hour before"
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

export default AppointmentForm;