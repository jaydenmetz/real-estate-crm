import React, { useEffect, useState } from 'react';
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
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useForm, Controller } from 'react-hook-form';
import { useQuery } from 'react-query';
import { api } from '../../services/api';

const EscrowForm = ({ open, onClose, onSubmit, escrow, loading }) => {
  const { control, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      propertyAddress: '',
      escrowStatus: 'Active',
      purchasePrice: '',
      earnestMoneyDeposit: '',
      downPayment: '',
      loanAmount: '',
      commissionPercentage: 2.5,
      acceptanceDate: null,
      closingDate: null,
      propertyType: 'Single Family',
      buyers: [],
      sellers: [],
      tags: [],
    },
  });

  const [clientOptions, setClientOptions] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const { data: clientsData } = useQuery(
    'clients',
    () => api.get('/clients').then(res => res.data),
    { enabled: open, onSuccess: data => setClientOptions(data.clients) }
  );

  // Reset form when escrow changes
  useEffect(() => {
    if (escrow) {
      reset({
        ...escrow,
        acceptanceDate: escrow.acceptanceDate ? new Date(escrow.acceptanceDate) : null,
        closingDate: escrow.closingDate ? new Date(escrow.closingDate) : null,
      });
    } else {
      reset();
    }
  }, [escrow, reset]);

  // Auto-calculate loan amount
  const purchasePrice = watch('purchasePrice');
  const downPayment = watch('downPayment');
  useEffect(() => {
    if (purchasePrice && downPayment) {
      setValue('loanAmount', purchasePrice - downPayment);
    }
  }, [purchasePrice, downPayment, setValue]);

  // Auto-calculate commissions
  const commissionPercentage = watch('commissionPercentage');
  useEffect(() => {
    if (purchasePrice && commissionPercentage) {
      const gross = purchasePrice * (commissionPercentage / 100);
      setValue('grossCommission', gross);
      setValue('netCommission', gross * 0.9); // Assuming 10% to broker
    }
  }, [purchasePrice, commissionPercentage, setValue]);

  const handleFormSubmit = (data) => {
    // Format dates
    const formattedData = {
      ...data,
      acceptanceDate: data.acceptanceDate ? data.acceptanceDate.toISOString().split('T')[0] : null,
      closingDate: data.closingDate ? data.closingDate.toISOString().split('T')[0] : null,
      buyers: data.buyers.map(b => b.id),
      sellers: data.sellers.map(s => s.id),
    };
    onSubmit(formattedData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogTitle>
          {escrow ? 'Edit Escrow' : 'New Escrow'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {/* Property Address */}
            <Grid item xs={12}>
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

            {/* Status and Type */}
            <Grid item xs={12} sm={6}>
              <Controller
                name="escrowStatus"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="Status"
                    fullWidth
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
                  </TextField>
                )}
              />
            </Grid>

            {/* Financial Details */}
            <Grid item xs={12} sm={6}>
              <Controller
                name="purchasePrice"
                control={control}
                rules={{ required: 'Purchase price is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Purchase Price"
                    type="number"
                    fullWidth
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
                    error={!!errors.purchasePrice}
                    helperText={errors.purchasePrice?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="earnestMoneyDeposit"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Earnest Money Deposit"
                    type="number"
                    fullWidth
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="downPayment"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Down Payment"
                    type="number"
                    fullWidth
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="loanAmount"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Loan Amount"
                    type="number"
                    fullWidth
                    disabled
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
                  />
                )}
              />
            </Grid>

            {/* Commission */}
            <Grid item xs={12} sm={4}>
              <Controller
                name="commissionPercentage"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Commission %"
                    type="number"
                    fullWidth
                    inputProps={{ step: 0.1 }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Controller
                name="grossCommission"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Gross Commission"
                    type="number"
                    fullWidth
                    disabled
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Controller
                name="netCommission"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Net Commission"
                    type="number"
                    fullWidth
                    disabled
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
                  />
                )}
              />
            </Grid>

            {/* Dates */}
            <Grid item xs={12} sm={6}>
              <Controller
                name="acceptanceDate"
                control={control}
                rules={{ required: 'Acceptance date is required' }}
                render={({ field }) => (
                  <DatePicker
                    {...field}
                    label="Acceptance Date"
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        error={!!errors.acceptanceDate}
                        helperText={errors.acceptanceDate?.message}
                      />
                    )}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="closingDate"
                control={control}
                rules={{ required: 'Closing date is required' }}
                render={({ field }) => (
                  <DatePicker
                    {...field}
                    label="Closing Date"
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        error={!!errors.closingDate}
                        helperText={errors.closingDate?.message}
                      />
                    )}
                  />
                )}
              />
            </Grid>

            {/* People */}
            <Grid item xs={12} sm={6}>
              <Controller
                name="buyers"
                control={control}
                rules={{ required: 'At least one buyer is required' }}
                render={({ field }) => {
                  return (
                    <Autocomplete
                      multiple
                      freeSolo
                      options={
                        (() => {
                          const opts = [...clientOptions];
                          const exists = clientOptions.some(c =>
                            `${c.firstName} ${c.lastName}`.toLowerCase() === inputValue.toLowerCase()
                          );
                          if (inputValue && !exists) {
                            opts.push({ inputValue, label: `Add "${inputValue}"`, isNew: true });
                          }
                          return opts;
                        })()
                      }
                      inputValue={inputValue}
                      onInputChange={(_, newVal) => setInputValue(newVal)}
                      getOptionLabel={option =>
                        typeof option === 'object' && option.isNew
                          ? option.label
                          : typeof option === 'string'
                          ? option
                          : `${option.firstName} ${option.lastName}`
                      }
                      filterOptions={opts => opts}
                      value={field.value || []}
                      onChange={async (_, value) => {
                        const resolved = await Promise.all(value.map(async v => {
                          if (v && typeof v === 'object' && v.isNew) {
                            const [firstName, ...rest] = v.inputValue.split(' ');
                            const lastName = rest.join(' ');
                            const res = await api.post('/clients', { firstName, lastName });
                            setClientOptions(opts => [...opts, res.data]);
                            return res.data;
                          }
                          return v;
                        }));
                        field.onChange(resolved);
                        setInputValue('');
                      }}
                      renderOption={(props, option) => (
                        <li {...props}>
                          {option.isNew ? <strong>{option.label}</strong> : `${option.firstName} ${option.lastName}`}
                        </li>
                      )}
                      renderInput={params => (
                        <TextField
                          {...params}
                          label="Buyers"
                          error={!!errors.buyers}
                          helperText={errors.buyers?.message}
                        />
                      )}
                    />
                  );
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="sellers"
                control={control}
                rules={{ required: 'At least one seller is required' }}
                render={({ field }) => {
                  return (
                    <Autocomplete
                      multiple
                      freeSolo
                      options={
                        (() => {
                          const opts = [...clientOptions];
                          const exists = clientOptions.some(c =>
                            `${c.firstName} ${c.lastName}`.toLowerCase() === inputValue.toLowerCase()
                          );
                          if (inputValue && !exists) {
                            opts.push({ inputValue, label: `Add "${inputValue}"`, isNew: true });
                          }
                          return opts;
                        })()
                      }
                      inputValue={inputValue}
                      onInputChange={(_, newVal) => setInputValue(newVal)}
                      getOptionLabel={option =>
                        typeof option === 'object' && option.isNew
                          ? option.label
                          : typeof option === 'string'
                          ? option
                          : `${option.firstName} ${option.lastName}`
                      }
                      filterOptions={opts => opts}
                      value={field.value || []}
                      onChange={async (_, value) => {
                        const resolved = await Promise.all(value.map(async v => {
                          if (v && typeof v === 'object' && v.isNew) {
                            const [firstName, ...rest] = v.inputValue.split(' ');
                            const lastName = rest.join(' ');
                            const res = await api.post('/clients', { firstName, lastName });
                            setClientOptions(opts => [...opts, res.data]);
                            return res.data;
                          }
                          return v;
                        }));
                        field.onChange(resolved);
                        setInputValue('');
                      }}
                      renderOption={(props, option) => (
                        <li {...props}>
                          {option.isNew ? <strong>{option.label}</strong> : `${option.firstName} ${option.lastName}`}
                        </li>
                      )}
                      renderInput={params => (
                        <TextField
                          {...params}
                          label="Sellers"
                          error={!!errors.sellers}
                          helperText={errors.sellers?.message}
                        />
                      )}
                    />
                  );
                }}
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
                    options={['first-time-buyer', 'va-loan', 'fha-loan', 'cash-buyer', 'investor']}
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

export default EscrowForm;