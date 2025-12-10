import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  IconButton,
  Grid,
} from '@mui/material';
import { Close as CloseIcon, PersonAdd } from '@mui/icons-material';
import { contactsAPI } from '../../../../services/api.service';

/**
 * NewContactModal - Simple modal for creating new contacts
 */
export const NewContactModal = ({ open, onClose, onCreate }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    street_address: '',
    city: '',
    state: '',
    zip_code: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.first_name && !formData.last_name) {
      setError('Please enter at least a first or last name');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await contactsAPI.create(formData);
      if (response.success) {
        onCreate?.(response.data);
        handleClose();
      } else {
        setError(response.message || 'Failed to create contact');
      }
    } catch (err) {
      console.error('Error creating contact:', err);
      setError(err.message || 'Failed to create contact');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      street_address: '',
      city: '',
      state: '',
      zip_code: '',
      notes: '',
    });
    setError(null);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxHeight: '90vh',
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                bgcolor: 'rgba(139, 92, 246, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <PersonAdd sx={{ color: '#8B5CF6' }} />
            </Box>
            <Typography variant="h6" fontWeight={600}>
              Add New Contact
            </Typography>
          </Box>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        {error && (
          <Box sx={{ mb: 2, p: 1.5, bgcolor: 'error.light', borderRadius: 1 }}>
            <Typography color="error.dark" variant="body2">{error}</Typography>
          </Box>
        )}

        <Grid container spacing={2}>
          <Grid item xs={6}>
            <TextField
              label="First Name"
              value={formData.first_name}
              onChange={handleChange('first_name')}
              fullWidth
              autoFocus
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Last Name"
              value={formData.last_name}
              onChange={handleChange('last_name')}
              fullWidth
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Email"
              type="email"
              value={formData.email}
              onChange={handleChange('email')}
              fullWidth
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Phone"
              value={formData.phone}
              onChange={handleChange('phone')}
              fullWidth
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Street Address"
              value={formData.street_address}
              onChange={handleChange('street_address')}
              fullWidth
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="City"
              value={formData.city}
              onChange={handleChange('city')}
              fullWidth
            />
          </Grid>
          <Grid item xs={3}>
            <TextField
              label="State"
              value={formData.state}
              onChange={handleChange('state')}
              fullWidth
            />
          </Grid>
          <Grid item xs={3}>
            <TextField
              label="ZIP"
              value={formData.zip_code}
              onChange={handleChange('zip_code')}
              fullWidth
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Notes"
              value={formData.notes}
              onChange={handleChange('notes')}
              fullWidth
              multiline
              rows={3}
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          sx={{
            bgcolor: '#8B5CF6',
            '&:hover': { bgcolor: '#7C3AED' },
          }}
        >
          {loading ? 'Creating...' : 'Create Contact'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NewContactModal;
