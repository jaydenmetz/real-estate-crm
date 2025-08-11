import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  MenuItem,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { appointmentsAPI } from '../../services/api.service.service.service';
import { useSnackbar } from 'notistack';

const AppointmentForm = ({ open, onClose, appointment, onSuccess }) => {
  const { enqueueSnackbar } = useSnackbar();
  
  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: appointment || {
      title: '',
      description: '',
      startTime: new Date(),
      endTime: new Date(),
      location: '',
      type: 'Showing',
      status: 'Scheduled',
      clientName: '',
      propertyAddress: '',
      notes: '',
    }
  });

  const onSubmit = async (data) => {
    try {
      if (appointment?.id) {
        await appointmentsAPI.update(appointment.id, data);
        enqueueSnackbar('Appointment updated successfully', { variant: 'success' });
      } else {
        await appointmentsAPI.create(data);
        enqueueSnackbar('Appointment created successfully', { variant: 'success' });
      }
      reset();
      onSuccess?.();
      onClose();
    } catch (error) {
      enqueueSnackbar(error.message || 'Failed to save appointment', { variant: 'error' });
    }
  };

  const appointmentTypes = [
    'Showing',
    'Consultation',
    'Inspection',
    'Closing',
    'Meeting',
    'Other',
  ];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>
          {appointment ? 'Edit Appointment' : 'Create New Appointment'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Controller
                name="title"
                control={control}
                rules={{ required: 'Title is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Title"
                    error={!!errors.title}
                    helperText={errors.title?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    select
                    label="Type"
                  >
                    {appointmentTypes.map(type => (
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
                    <MenuItem value="Scheduled">Scheduled</MenuItem>
                    <MenuItem value="Completed">Completed</MenuItem>
                    <MenuItem value="Cancelled">Cancelled</MenuItem>
                    <MenuItem value="Rescheduled">Rescheduled</MenuItem>
                  </TextField>
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="startTime"
                control={control}
                render={({ field }) => (
                  <DateTimePicker
                    label="Start Time"
                    value={field.value}
                    onChange={field.onChange}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="endTime"
                control={control}
                render={({ field }) => (
                  <DateTimePicker
                    label="End Time"
                    value={field.value}
                    onChange={field.onChange}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="location"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Location"
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="clientName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Client Name"
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="propertyAddress"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Property Address"
                  />
                )}
              />
            </Grid>

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
          <Button type="submit" variant="contained">
            {appointment ? 'Update' : 'Create'} Appointment
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AppointmentForm;