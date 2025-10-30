import React, { useState, useEffect } from 'react';
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
  CircularProgress,
  Alert,
  Autocomplete,
} from '@mui/material';
import { PersonAdd, Save, Close } from '@mui/icons-material';
import { contactsAPI, contactRolesAPI } from '../../services/api.service';

/**
 * New Contact Modal - Multi-Role Support
 * Dynamic field validation based on selected role's requirements
 */
export const NewContactModal = ({
  open,
  onClose,
  onSave,
  roleType = null, // Pre-selected role (optional)
  roleConfig = { primary: '#6366f1', secondary: '#8b5cf6' },
}) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    company: '',
    license_number: '',
    // Lead-specific fields
    source: '',
    lead_type: '',
    budget: '',
    property_type: '',
    timeline: '',
    pre_approved: '',
    notes: '',
  });
  const [selectedRole, setSelectedRole] = useState(null);
  const [availableRoles, setAvailableRoles] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Fetch available roles on mount
  useEffect(() => {
    const fetchRoles = async () => {
      setLoadingRoles(true);
      try {
        const response = await contactRolesAPI.getAll({ active_only: 'true' });
        if (response.success && response.data) {
          setAvailableRoles(response.data);

          // Auto-select role if roleType provided
          if (roleType) {
            const matchingRole = response.data.find(r => r.role_name === roleType);
            if (matchingRole) {
              setSelectedRole(matchingRole);
            }
          }
        }
      } catch (err) {
        console.error('Failed to fetch roles:', err);
        setError('Failed to load contact roles');
      } finally {
        setLoadingRoles(false);
      }
    };

    if (open) {
      fetchRoles();
    }
  }, [open, roleType]);

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        company: '',
        license_number: '',
        source: '',
        lead_type: '',
        budget: '',
        property_type: '',
        timeline: '',
        pre_approved: '',
        notes: '',
      });
      setError('');
    }
  }, [open]);

  const handleChange = (field) => (event) => {
    setFormData({ ...formData, [field]: event.target.value });
  };

  const handleRoleChange = (event, newValue) => {
    setSelectedRole(newValue);
  };

  // Check if a field is required based on selected role
  const isFieldRequired = (fieldName) => {
    if (!selectedRole) return false;
    return selectedRole.required_fields?.includes(fieldName) || false;
  };

  // Check if a field should be hidden based on selected role
  const isFieldHidden = (fieldName) => {
    if (!selectedRole) return false;
    return selectedRole.hidden_fields?.includes(fieldName) || false;
  };

  // Check if a field is optional (shown but not required)
  const isFieldOptional = (fieldName) => {
    if (!selectedRole) return true;
    return selectedRole.optional_fields?.includes(fieldName) || false;
  };

  // Validate form
  const validateForm = () => {
    if (!selectedRole) {
      setError('Please select a contact role');
      return false;
    }

    if (!formData.first_name && !formData.last_name) {
      setError('Please enter at least a first or last name');
      return false;
    }

    // Check all required fields
    const requiredFields = selectedRole.required_fields || [];
    for (const field of requiredFields) {
      if (!formData[field]) {
        const fieldLabels = {
          source: 'Lead Source',
          lead_type: 'Lead Type',
          company: 'Company',
          license_number: 'License Number',
        };
        setError(`${fieldLabels[field] || field} is required for ${selectedRole.display_name}`);
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setSaving(true);
    setError('');

    try {
      // Step 1: Create contact
      const contactData = {
        first_name: formData.first_name || null,
        last_name: formData.last_name || null,
        email: formData.email || null,
        phone: formData.phone || null,
        company: formData.company || null,
        license_number: formData.license_number || null,
        notes: formData.notes || null,
        contact_type: selectedRole.role_name, // REQUIRED: Backend validation needs this
      };

      const contactResponse = await contactsAPI.create(contactData);

      if (!contactResponse.success || !contactResponse.data) {
        throw new Error('Failed to create contact');
      }

      const newContact = contactResponse.data;

      // Step 2: Add role to contact
      const roleData = {
        role_id: selectedRole.id,
        is_primary: true, // First role is always primary
        role_metadata: {
          // Lead-specific metadata
          ...(formData.source && { source: formData.source }),
          ...(formData.lead_type && { lead_type: formData.lead_type }),
          ...(formData.budget && { budget: formData.budget }),
          ...(formData.property_type && { property_type: formData.property_type }),
          ...(formData.timeline && { timeline: formData.timeline }),
          ...(formData.pre_approved && { pre_approved: formData.pre_approved }),
        },
      };

      await contactsAPI.addRole(newContact.id, roleData);

      // Step 3: Return contact with role info for parent component
      const contactWithRole = {
        ...newContact,
        roles: [{
          id: selectedRole.id,
          role_name: selectedRole.role_name,
          display_name: selectedRole.display_name,
          icon: selectedRole.icon,
          color: selectedRole.color,
          is_primary: true,
        }],
      };

      await onSave(contactWithRole);
      onClose();

    } catch (err) {
      console.error('Failed to create contact:', err);
      setError(err.response?.data?.error?.message || 'Failed to create contact. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const leadSourceOptions = [
    'Referral - Past Client',
    'Referral - Agent',
    'Referral - Friend/Family',
    'Online Lead (Zillow, Realtor.com, etc.)',
    'Social Media',
    'Open House',
    'Direct Mail',
    'Website',
    'Walk-In',
    'Cold Call',
    'Networking Event',
    'Other',
  ];

  const leadTypeOptions = [
    { value: 'buyer', label: 'Buyer' },
    { value: 'seller', label: 'Seller' },
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
          {error && (
            <Alert severity="error" onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {/* Role Selection */}
          {loadingRoles ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
              <CircularProgress size={24} />
            </Box>
          ) : (
            <Autocomplete
              value={selectedRole}
              onChange={handleRoleChange}
              options={availableRoles}
              getOptionLabel={(option) => option.display_name}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Role *"
                  placeholder="Select contact role"
                  required
                />
              )}
              renderOption={(props, option) => (
                <li {...props}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                    <Chip
                      label={option.display_name}
                      size="small"
                      sx={{
                        backgroundColor: option.color || '#6366f1',
                        color: 'white',
                        fontWeight: 600,
                      }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      {option.description}
                    </Typography>
                  </Box>
                </li>
              )}
            />
          )}

          {/* Name Fields */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              fullWidth
              label="First Name"
              value={formData.first_name}
              onChange={handleChange('first_name')}
              placeholder="John"
            />
            <TextField
              fullWidth
              label="Last Name"
              value={formData.last_name}
              onChange={handleChange('last_name')}
              placeholder="Doe"
            />
          </Box>

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

          {/* Company - Show if required or optional, hide if hidden */}
          {!isFieldHidden('company') && (
            <TextField
              fullWidth
              label="Company"
              value={formData.company}
              onChange={handleChange('company')}
              placeholder="ABC Realty"
              required={isFieldRequired('company')}
            />
          )}

          {/* License Number - Show if required or optional */}
          {!isFieldHidden('license_number') && (isFieldRequired('license_number') || isFieldOptional('license_number')) && (
            <TextField
              fullWidth
              label="License Number"
              value={formData.license_number}
              onChange={handleChange('license_number')}
              placeholder="01234567"
              required={isFieldRequired('license_number')}
            />
          )}

          {/* Lead Source - Required for leads */}
          {!isFieldHidden('source') && (isFieldRequired('source') || isFieldOptional('source')) && (
            <Autocomplete
              value={formData.source}
              onChange={(event, newValue) => {
                setFormData({ ...formData, source: newValue });
              }}
              options={leadSourceOptions}
              freeSolo
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Lead Source"
                  placeholder="How did you find this lead?"
                  required={isFieldRequired('source')}
                />
              )}
            />
          )}

          {/* Lead Type - Required for leads */}
          {!isFieldHidden('lead_type') && (isFieldRequired('lead_type') || isFieldOptional('lead_type')) && (
            <TextField
              select
              fullWidth
              label="Lead Type"
              value={formData.lead_type}
              onChange={handleChange('lead_type')}
              required={isFieldRequired('lead_type')}
            >
              {leadTypeOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          )}

          {/* Budget - Optional for buyer leads */}
          {!isFieldHidden('budget') && isFieldOptional('budget') && (
            <TextField
              fullWidth
              label="Budget"
              value={formData.budget}
              onChange={handleChange('budget')}
              placeholder="$250,000 - $350,000"
            />
          )}

          {/* Property Type - Optional for leads */}
          {!isFieldHidden('property_type') && isFieldOptional('property_type') && (
            <TextField
              fullWidth
              label="Property Type"
              value={formData.property_type}
              onChange={handleChange('property_type')}
              placeholder="Single Family, Condo, etc."
            />
          )}

          {/* Timeline - Optional for leads */}
          {!isFieldHidden('timeline') && isFieldOptional('timeline') && (
            <TextField
              fullWidth
              label="Timeline"
              value={formData.timeline}
              onChange={handleChange('timeline')}
              placeholder="1-3 months, 3-6 months, etc."
            />
          )}

          {/* Pre-Approved - Optional for buyer leads */}
          {!isFieldHidden('pre_approved') && isFieldOptional('pre_approved') && (
            <TextField
              select
              fullWidth
              label="Pre-Approved"
              value={formData.pre_approved}
              onChange={handleChange('pre_approved')}
            >
              <MenuItem value="">Not Sure</MenuItem>
              <MenuItem value="yes">Yes</MenuItem>
              <MenuItem value="no">No</MenuItem>
              <MenuItem value="in_progress">In Progress</MenuItem>
            </TextField>
          )}

          {/* Notes */}
          <TextField
            fullWidth
            label="Notes"
            value={formData.notes}
            onChange={handleChange('notes')}
            placeholder="Additional information..."
            multiline
            rows={3}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} startIcon={<Close />} disabled={saving}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!selectedRole || saving}
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
