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
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { escrowsAPI } from '../../services/api';
import { useSnackbar } from 'notistack';

const EscrowForm = ({ open, onClose, escrow, onSuccess }) => {
  const { enqueueSnackbar } = useSnackbar();
  
  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: escrow || {
      propertyAddress: '',
      purchasePrice: '',
      buyers: [],
      sellers: [],
      acceptanceDate: new Date(),
      closingDate: new Date(),
      status: 'Active',
      escrowNumber: '',
      titleCompany: '',
      lender: '',
      agent: '',
      commission: '',
    }
  });

  const onSubmit = async (data) => {
    try {
      if (escrow?.id) {
        await escrowsAPI.update(escrow.id, data);
        enqueueSnackbar('Escrow updated successfully', { variant: 'success' });
      } else {
        await escrowsAPI.create(data);
        enqueueSnackbar('Escrow created successfully', { variant: 'success' });
      }
      reset();
      onSuccess?.();
      onClose();
    } catch (error) {
      enqueueSnackbar(error.message || 'Failed to save escrow', { variant: 'error' });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>
          {escrow ? 'Edit Escrow' : 'Create New Escrow'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Controller
                name="propertyAddress"
                control={control}
                rules={{ required: 'Property address is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Property Address"
                    error={!!errors.propertyAddress}
                    helperText={errors.propertyAddress?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="purchasePrice"
                control={control}
                rules={{ required: 'Purchase price is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Purchase Price"
                    type="number"
                    InputProps={{ startAdornment: '$' }}
                    error={!!errors.purchasePrice}
                    helperText={errors.purchasePrice?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="escrowNumber"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Escrow Number"
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="acceptanceDate"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    label="Acceptance Date"
                    value={field.value}
                    onChange={field.onChange}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="closingDate"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    label="Closing Date"
                    value={field.value}
                    onChange={field.onChange}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
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
                    <MenuItem value="Active">Active</MenuItem>
                    <MenuItem value="Pending">Pending</MenuItem>
                    <MenuItem value="Closed">Closed</MenuItem>
                    <MenuItem value="Cancelled">Cancelled</MenuItem>
                  </TextField>
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="commission"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Commission"
                    type="number"
                    InputProps={{ startAdornment: '$' }}
                  />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            {escrow ? 'Update' : 'Create'} Escrow
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EscrowForm;