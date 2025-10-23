import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  IconButton,
  Typography,
  Autocomplete,
} from '@mui/material';
import {
  Close,
  PersonAdd,
} from '@mui/icons-material';
import { clientsAPI, leadsAPI } from '../../../../services/api.service';
import PrivacyControl from '../../../common/PrivacyControl';

const NewClientModal = ({ open, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [leads, setLeads] = useState([]);
  const [loadingLeads, setLoadingLeads] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    linkedLeadId: null,
    isPrivate: false, // Phase 6: Privacy control
    accessLevel: 'team', // Phase 6: Default to team sharing
  });

  // Fetch leads when modal opens
  useEffect(() => {
    if (open) {
      fetchLeads();
    }
  }, [open]);

  const fetchLeads = async () => {
    setLoadingLeads(true);
    try {
      const response = await leadsAPI.getAll();
      if (response.success) {
        setLeads(response.data || []);
      }
    } catch (err) {
      console.error('Error fetching leads:', err);
    } finally {
      setLoadingLeads(false);
    }
  };

  // Phone formatting: (XXX) XXX-XXXX
  const formatPhone = (value) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length === 0) return '';
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 6) return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
  };

  const handlePhoneChange = (e) => {
    const formatted = formatPhone(e.target.value);
    setFormData({ ...formData, phone: formatted });
  };

  // Handle lead selection - populate fields with lead data
  const handleLeadSelect = (event, value) => {
    if (value) {
      setFormData({
        firstName: value.firstName || '',
        lastName: value.lastName || '',
        phone: value.phone || '',
        email: value.email || '',
        linkedLeadId: value.id,
      });
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        linkedLeadId: null,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.firstName || !formData.lastName || !formData.phone || !formData.email) {
      setError('Please fill in all required fields');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    // Validate phone (must be 10 digits)
    const phoneDigits = formData.phone.replace(/\D/g, '');
    if (phoneDigits.length !== 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const clientData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: formData.phone,
        email: formData.email.trim().toLowerCase(),
        status: 'active', // Default status
        isPrivate: formData.isPrivate, // Phase 6: Privacy control
        accessLevel: formData.accessLevel, // Phase 6: Sharing level
      };

      // Add linked lead if selected
      if (formData.linkedLeadId) {
        clientData.leadId = formData.linkedLeadId;
      }

      const response = await clientsAPI.create(clientData);

      if (response.success) {
        if (onSuccess) {
          onSuccess(response.data.id);
        }
        handleClose();
      } else {
        setError(response.error?.message || 'Failed to create client');
      }
    } catch (err) {
      console.error('Error creating client:', err);
      setError('An error occurred while creating the client');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        linkedLeadId: null,
      });
      setError('');
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PersonAdd color="primary" />
          <Typography variant="h6" fontWeight="600">
            Create New Client
          </Typography>
        </Box>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          disabled={loading}
          sx={{
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <Close />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent dividers sx={{ p: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
              Enter the contact information for this client.
            </Typography>

            <Autocomplete
              options={leads}
              loading={loadingLeads}
              getOptionLabel={(option) => `${option.firstName} ${option.lastName} - ${option.email}`}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Convert from Lead (optional)"
                  placeholder="Select a lead to convert"
                  helperText="Select a lead to auto-fill contact information"
                  autoFocus
                />
              )}
              onChange={handleLeadSelect}
            />

            <TextField
              fullWidth
              label="First Name"
              placeholder="John"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              required
            />

            <TextField
              fullWidth
              label="Last Name"
              placeholder="Doe"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              required
            />

            <TextField
              fullWidth
              label="Phone"
              placeholder="(555) 555-5555"
              value={formData.phone}
              onChange={handlePhoneChange}
              required
              helperText="10-digit phone number"
            />

            <TextField
              fullWidth
              label="Email"
              type="email"
              placeholder="john.doe@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              helperText="Valid email address"
            />

            {/* Phase 6: Privacy and Sharing Controls */}
            <PrivacyControl
              isPrivate={formData.isPrivate}
              accessLevel={formData.accessLevel}
              onPrivateChange={(value) => setFormData({ ...formData, isPrivate: value })}
              onAccessLevelChange={(value) => setFormData({ ...formData, accessLevel: value })}
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button
            variant="outlined"
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || !formData.firstName || !formData.lastName || !formData.phone || !formData.email}
            startIcon={loading ? <CircularProgress size={20} /> : <PersonAdd />}
          >
            {loading ? 'Creating...' : 'Create Client'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default NewClientModal;
