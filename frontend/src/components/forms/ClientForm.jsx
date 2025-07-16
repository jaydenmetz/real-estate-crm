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
import { clientsAPI } from '../../services/api';
import { useSnackbar } from 'notistack';

const ClientForm = ({ open, onClose, client, onSuccess }) => {
  const { enqueueSnackbar } = useSnackbar();
  
  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: client || {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      clientType: 'Buyer',
      clientStatus: 'Active',
      preferredContact: 'Email',
      notes: '',
      tags: [],
    }
  });

  const onSubmit = async (data) => {
    try {
      if (client?.id) {
        await clientsAPI.update(client.id, data);
        enqueueSnackbar('Client updated successfully', { variant: 'success' });
      } else {
        await clientsAPI.create(data);
        enqueueSnackbar('Client created successfully', { variant: 'success' });
      }
      reset();
      onSuccess?.();
      onClose();
    } catch (error) {
      enqueueSnackbar(error.message || 'Failed to save client', { variant: 'error' });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>
          {client ? 'Edit Client' : 'Create New Client'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <Controller
                name="firstName"
                control={control}
                rules={{ required: 'First name is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="First Name"
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
                    fullWidth
                    label="Last Name"
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
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Email"
                    type="email"
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
                    fullWidth
                    label="Phone"
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
                    fullWidth
                    select
                    label="Client Type"
                  >
                    <MenuItem value="Buyer">Buyer</MenuItem>
                    <MenuItem value="Seller">Seller</MenuItem>
                    <MenuItem value="Both">Both</MenuItem>
                  </TextField>
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="preferredContact"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    select
                    label="Preferred Contact"
                  >
                    <MenuItem value="Email">Email</MenuItem>
                    <MenuItem value="Phone">Phone</MenuItem>
                    <MenuItem value="Text">Text</MenuItem>
                  </TextField>
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="notes"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    multiline
                    rows={4}
                    label="Notes"
                  />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            {client ? 'Update' : 'Create'} Client
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ClientForm;