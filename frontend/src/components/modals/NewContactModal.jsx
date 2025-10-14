import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  MenuItem,
  Chip,
  alpha,
} from '@mui/material';
import { PersonAdd, Save, Close } from '@mui/icons-material';

/**
 * New Contact Modal
 * Create a new contact with pre-selected role type
 */
export const NewContactModal = ({
  open,
  onClose,
  onSave,
  roleType,
  roleConfig = { primary: '#6366f1', secondary: '#8b5cf6' },
}) => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    company_name: '',
    role: roleType || '',
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (field) => (event) => {
    setFormData({ ...formData, [field]: event.target.value });
  };

  const handleSubmit = async () => {
    if (!formData.full_name) {
      return; // Validation
    }

    setSaving(true);
    try {
      // Create contact object
      const newContact = {
        id: `temp-${Date.now()}`, // Temporary ID
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        company_name: formData.company_name,
        roles: [{ type: formData.role }],
      };

      await onSave(newContact);

      // Reset form
      setFormData({
        full_name: '',
        email: '',
        phone: '',
        company_name: '',
        role: roleType || '',
      });
    } catch (error) {
      console.error('Failed to create contact:', error);
    } finally {
      setSaving(false);
    }
  };

  const getRoleLabel = (roleType) => {
    const labels = {
      buyer: 'Buyer',
      seller: 'Seller',
      buyer_agent: 'Buyer Agent',
      listing_agent: 'Listing Agent',
      seller_agent: 'Listing Agent',
      lender: 'Lender',
      escrow_officer: 'Escrow Officer',
    };
    return labels[roleType] || roleType?.replace(/_/g, ' ');
  };

  const roleOptions = [
    { value: 'buyer', label: 'Buyer' },
    { value: 'seller', label: 'Seller' },
    { value: 'buyer_agent', label: 'Buyer Agent' },
    { value: 'listing_agent', label: 'Listing Agent' },
    { value: 'lender', label: 'Lender' },
    { value: 'escrow_officer', label: 'Escrow Officer' },
  ];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PersonAdd sx={{ color: roleConfig.primary }} />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Create New Contact
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Role Type - Pre-selected */}
          <Box>
            <TextField
              select
              fullWidth
              label="Role"
              value={formData.role}
              onChange={handleChange('role')}
              required
              InputProps={{
                startAdornment: formData.role && (
                  <Chip
                    label={getRoleLabel(formData.role)}
                    size="small"
                    sx={{
                      mr: 1,
                      background: `linear-gradient(135deg, ${roleConfig.primary} 0%, ${roleConfig.secondary} 100%)`,
                      color: 'white',
                      fontWeight: 600,
                    }}
                  />
                ),
              }}
            >
              {roleOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          {/* Full Name */}
          <TextField
            fullWidth
            label="Full Name"
            value={formData.full_name}
            onChange={handleChange('full_name')}
            required
            placeholder="John Doe"
          />

          {/* Email */}
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={formData.email}
            onChange={handleChange('email')}
            placeholder="john.doe@example.com"
          />

          {/* Phone */}
          <TextField
            fullWidth
            label="Phone"
            value={formData.phone}
            onChange={handleChange('phone')}
            placeholder="(555) 123-4567"
          />

          {/* Company */}
          <TextField
            fullWidth
            label="Company"
            value={formData.company_name}
            onChange={handleChange('company_name')}
            placeholder="ABC Realty"
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} startIcon={<Close />}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!formData.full_name || saving}
          startIcon={<Save />}
          sx={{
            background: `linear-gradient(135deg, ${roleConfig.primary} 0%, ${roleConfig.secondary} 100%)`,
            '&:hover': {
              background: `linear-gradient(135deg, ${alpha(roleConfig.primary, 0.9)} 0%, ${alpha(roleConfig.secondary, 0.9)} 100%)`,
            },
          }}
        >
          {saving ? 'Creating...' : 'Create Contact'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
