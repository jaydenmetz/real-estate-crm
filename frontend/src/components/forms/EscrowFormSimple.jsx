import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Box,
  Typography,
  IconButton,
  InputAdornment,
} from '@mui/material';
import {
  Close,
  Home,
  AttachMoney,
  Person,
  CalendarToday,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useForm, Controller } from 'react-hook-form';
import { format, addDays } from 'date-fns';

const EscrowFormSimple = ({ open, onClose, onSubmit, loading = false }) => {
  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      propertyAddress: '',
      purchasePrice: '',
      buyerName: '',
      sellerName: '',
      acceptanceDate: new Date(),
      closingDate: addDays(new Date(), 30), // Default to 30 days from now
    }
  });

  // Reset form when dialog opens
  React.useEffect(() => {
    if (open) {
      reset();
    }
  }, [open, reset]);

  const handleFormSubmit = (data) => {
    // Format the data to match API requirements
    const formattedData = {
      propertyAddress: data.propertyAddress.trim(),
      purchasePrice: parseFloat(data.purchasePrice),
      buyers: [{
        name: data.buyerName.trim(),
        email: '',
        phone: ''
      }],
      sellers: [{
        name: data.sellerName.trim(),
        email: '',
        phone: ''
      }],
      acceptanceDate: format(new Date(data.acceptanceDate), 'yyyy-MM-dd'),
      closingDate: format(new Date(data.closingDate), 'yyyy-MM-dd'),
    };
    
    onSubmit(formattedData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            Create New Escrow
          </Typography>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Enter only the required information. Additional details can be added later.
          </Typography>
          
          <Grid container spacing={3}>
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
                    required
                    error={!!errors.propertyAddress}
                    helperText={errors.propertyAddress?.message}
                    placeholder="123 Main St, San Diego, CA 92101"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Home />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />
            </Grid>

            {/* Purchase Price */}
            <Grid item xs={12}>
              <Controller
                name="purchasePrice"
                control={control}
                rules={{ 
                  required: 'Purchase price is required',
                  min: { value: 1, message: 'Must be greater than 0' },
                  pattern: {
                    value: /^\d+(\.\d{0,2})?$/,
                    message: 'Enter a valid price'
                  }
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Purchase Price"
                    type="number"
                    fullWidth
                    required
                    error={!!errors.purchasePrice}
                    helperText={errors.purchasePrice?.message}
                    placeholder="500000"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <AttachMoney />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />
            </Grid>

            {/* Buyer Name */}
            <Grid item xs={12} sm={6}>
              <Controller
                name="buyerName"
                control={control}
                rules={{ required: 'Buyer name is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Buyer Name"
                    fullWidth
                    required
                    error={!!errors.buyerName}
                    helperText={errors.buyerName?.message}
                    placeholder="John Doe"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />
            </Grid>

            {/* Seller Name */}
            <Grid item xs={12} sm={6}>
              <Controller
                name="sellerName"
                control={control}
                rules={{ required: 'Seller name is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Seller Name"
                    fullWidth
                    required
                    error={!!errors.sellerName}
                    helperText={errors.sellerName?.message}
                    placeholder="Jane Smith"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />
            </Grid>

            {/* Acceptance Date */}
            <Grid item xs={12} sm={6}>
              <Controller
                name="acceptanceDate"
                control={control}
                rules={{ required: 'Acceptance date is required' }}
                render={({ field }) => (
                  <DatePicker
                    {...field}
                    label="Acceptance Date"
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        required: true,
                        error: !!errors.acceptanceDate,
                        helperText: errors.acceptanceDate?.message,
                        InputProps: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <CalendarToday />
                            </InputAdornment>
                          ),
                        },
                      },
                    }}
                  />
                )}
              />
            </Grid>

            {/* Closing Date */}
            <Grid item xs={12} sm={6}>
              <Controller
                name="closingDate"
                control={control}
                rules={{ required: 'Closing date is required' }}
                render={({ field }) => (
                  <DatePicker
                    {...field}
                    label="Closing Date"
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        required: true,
                        error: !!errors.closingDate,
                        helperText: errors.closingDate?.message || 'Typically 30-45 days from acceptance',
                        InputProps: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <CalendarToday />
                            </InputAdornment>
                          ),
                        },
                      },
                    }}
                  />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={loading}
            startIcon={loading ? null : <Home />}
          >
            {loading ? 'Creating...' : 'Create Escrow'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EscrowFormSimple;