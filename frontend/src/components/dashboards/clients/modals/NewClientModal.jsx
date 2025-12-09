import React, { useState, useMemo, useEffect } from 'react';
import {
  Dialog,
  Box,
  Fade,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  CheckCircle,
  Person,
  Business,
  AccountBalance,
  Gavel,
  Description,
  Percent,
  AttachMoney,
  Home,
  Email as EmailIcon,
  Phone as PhoneIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { ModalStepPage } from '../../../common/modals/ModalStepPage';
import { Phone } from '../../../common/setters/Phone';
import { Email } from '../../../common/setters/Email';
import { Currency } from '../../../common/setters/Currency';
import { DateSetter } from '../../../common/setters/Date';
import { CurrencyInput } from '../../../common/inputs/shared/CurrencyInput';
import { PercentageInput } from '../../../common/inputs/shared/PercentageInput';
import { AddressInput } from '../../../common/inputs/shared/AddressInput';
import ClientCard from '../view-modes/card/ClientCard';
import { clientsAPI } from '../../../../services/api.service';

/**
 * Entity Type Configuration
 * Defines the fields and labels for each entity type
 */
const ENTITY_TYPES = {
  individual: {
    value: 'individual',
    label: 'Individual',
    icon: Person,
    description: 'A person buying/selling in their own name',
    fields: ['firstName', 'lastName', 'email', 'phone', 'mailingAddress'],
    representativeTitles: [], // No representative for individual
  },
  trust: {
    value: 'trust',
    label: 'Trust',
    icon: AccountBalance,
    description: 'A trust entity (e.g., "Smith Family Trust")',
    fields: ['entityName', 'firstName', 'lastName', 'representativeTitle', 'email', 'phone', 'mailingAddress'],
    representativeTitles: ['Trustee', 'Co-Trustee', 'Successor Trustee'],
    entityNameLabel: 'Trust Name',
    entityNamePlaceholder: 'e.g., Smith Family Trust',
  },
  corporation: {
    value: 'corporation',
    label: 'Corporation',
    icon: Business,
    description: 'A corporation (e.g., "ABC Corp")',
    fields: ['entityName', 'firstName', 'lastName', 'representativeTitle', 'email', 'phone', 'mailingAddress'],
    representativeTitles: ['President', 'Vice President', 'Secretary', 'Treasurer', 'CEO', 'CFO', 'Director', 'Authorized Agent'],
    entityNameLabel: 'Corporation Name',
    entityNamePlaceholder: 'e.g., ABC Corporation',
  },
  llc: {
    value: 'llc',
    label: 'LLC',
    icon: Business,
    description: 'A limited liability company',
    fields: ['entityName', 'firstName', 'lastName', 'representativeTitle', 'email', 'phone', 'mailingAddress'],
    representativeTitles: ['Managing Member', 'Member', 'Manager', 'Authorized Agent'],
    entityNameLabel: 'LLC Name',
    entityNamePlaceholder: 'e.g., 123 Main Street LLC',
  },
  partnership: {
    value: 'partnership',
    label: 'Partnership',
    icon: Business,
    description: 'A partnership entity',
    fields: ['entityName', 'firstName', 'lastName', 'representativeTitle', 'email', 'phone', 'mailingAddress'],
    representativeTitles: ['General Partner', 'Limited Partner', 'Managing Partner', 'Partner', 'Authorized Agent'],
    entityNameLabel: 'Partnership Name',
    entityNamePlaceholder: 'e.g., Smith & Jones Partners',
  },
  estate: {
    value: 'estate',
    label: 'Estate',
    icon: Description,
    description: 'An estate (e.g., "Estate of John Smith")',
    fields: ['entityName', 'firstName', 'lastName', 'representativeTitle', 'email', 'phone', 'mailingAddress'],
    representativeTitles: ['Executor', 'Executrix', 'Administrator', 'Administratrix', 'Personal Representative'],
    entityNameLabel: 'Estate Name',
    entityNamePlaceholder: 'e.g., Estate of John Smith',
  },
  power_of_attorney: {
    value: 'power_of_attorney',
    label: 'Power of Attorney',
    icon: Gavel,
    description: 'Someone acting under power of attorney',
    fields: ['entityName', 'firstName', 'lastName', 'representativeTitle', 'email', 'phone', 'mailingAddress'],
    representativeTitles: ['Attorney-in-Fact', 'Agent'],
    entityNameLabel: 'Principal Name',
    entityNamePlaceholder: 'e.g., John Smith (the person granting POA)',
  },
};

/**
 * NewClientModal - Quick-Add Flow for Clients with Entity Type Support
 *
 * Steps:
 * 1. Client Type (Buyer/Seller) + Entity Type
 * 2. Entity/Contact Details (dynamic based on entity type)
 * 3. Contact Info (Phone + Email)
 * 4. Mailing Address
 * 5. Target Price
 * 6. Projected Commission
 * 7. Agreement Dates
 * 8. Preview & Confirm
 */
const NewClientModal = ({ open, onClose, onSuccess, initialData }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Form data state
  const [formData, setFormData] = useState({
    // Client Type (Buyer/Seller)
    clientType: 'buyer',

    // Entity Type
    entityType: 'individual',
    entityName: '',

    // Contact/Representative Info
    firstName: '',
    lastName: '',
    representativeTitle: '',

    // Contact Info
    phone: '',
    email: '',

    // Mailing Address
    mailingAddress: null, // Will be structured address object

    // Financial
    targetPrice: '',
    projectedCommission: '',
    commissionPercentage: '',
    commissionType: 'percentage',

    // Agreement Dates
    agreementStartDate: null,
    agreementEndDate: null,
  });

  // Get current entity config
  const entityConfig = ENTITY_TYPES[formData.entityType] || ENTITY_TYPES.individual;

  // Initialize form data from initialData when modal opens
  useEffect(() => {
    if (open && initialData) {
      setFormData(prev => ({
        ...prev,
        firstName: initialData.firstName || '',
        lastName: initialData.lastName || '',
      }));
    }
  }, [open, initialData]);

  // Step configuration - changes based on entity type
  const steps = useMemo(() => {
    const baseSteps = [
      { id: 'client-type', label: 'Client Type' },
      { id: 'entity-details', label: formData.entityType === 'individual' ? 'Contact Details' : 'Entity Details' },
      { id: 'contact-info', label: 'Contact Info' },
      { id: 'mailing-address', label: 'Mailing Address' },
      { id: 'target-price', label: 'Target Price' },
      { id: 'commission', label: 'Commission' },
      { id: 'agreement-dates', label: 'Agreement Dates' },
      { id: 'preview', label: 'Preview' },
    ];
    return baseSteps;
  }, [formData.entityType]);

  const currentStepConfig = steps[currentStep];
  const totalSteps = steps.length;
  const isLastStep = currentStep === totalSteps - 1;

  // Compute display name for the client
  const getDisplayName = () => {
    if (formData.entityType === 'individual') {
      return `${formData.firstName} ${formData.lastName}`.trim() || 'New Client';
    }
    return formData.entityName || 'New Entity';
  };

  // Navigation handlers
  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    if (!saving) {
      setCurrentStep(0);
      setFormData({
        clientType: 'buyer',
        entityType: 'individual',
        entityName: '',
        firstName: '',
        lastName: '',
        representativeTitle: '',
        phone: '',
        email: '',
        mailingAddress: null,
        targetPrice: '',
        projectedCommission: '',
        commissionPercentage: '',
        commissionType: 'percentage',
        agreementStartDate: null,
        agreementEndDate: null,
      });
      setShowSuccess(false);
      onClose();
    }
  };

  // Form handlers
  const handleClientTypeChange = (e, newType) => {
    if (newType !== null) {
      setFormData({ ...formData, clientType: newType });
    }
  };

  const handleEntityTypeChange = (e, newType) => {
    if (newType !== null) {
      setFormData({
        ...formData,
        entityType: newType,
        representativeTitle: '', // Reset representative title when entity type changes
        entityName: '', // Reset entity name
      });
    }
  };

  const handleTargetPriceSave = (targetPrice) => {
    const newFormData = { ...formData, targetPrice };
    if (formData.commissionType === 'percentage' && formData.commissionPercentage) {
      const price = parseFloat(targetPrice) || 0;
      const percentage = parseFloat(formData.commissionPercentage) || 0;
      newFormData.projectedCommission = ((price * percentage) / 100).toString();
    }
    setFormData(newFormData);
  };

  const handleCommissionValueChange = (value) => {
    if (formData.commissionType === 'percentage') {
      const targetPrice = parseFloat(formData.targetPrice) || 0;
      const percentage = parseFloat(value) || 0;
      const calculated = targetPrice ? (targetPrice * percentage) / 100 : 0;
      setFormData({
        ...formData,
        commissionPercentage: value,
        projectedCommission: calculated.toString(),
      });
    } else {
      setFormData({ ...formData, projectedCommission: value });
    }
  };

  const handleCommissionTypeChange = (e, newType) => {
    if (newType !== null) {
      setFormData({ ...formData, commissionType: newType });
    }
  };

  const handleAddressChange = (addressData) => {
    setFormData({ ...formData, mailingAddress: addressData });
  };

  // Helper to format date for backend (YYYY-MM-DD)
  const formatDateForBackend = (date) => {
    if (!date) return null;
    if (typeof date === 'string') return date;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Final submission
  const handleSubmit = async () => {
    setSaving(true);

    try {
      const clientData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone,
        email: formData.email,
        client_type: formData.clientType,
        entity_type: formData.entityType,
        entity_name: formData.entityType !== 'individual' ? formData.entityName : null,
        representative_title: formData.entityType !== 'individual' ? formData.representativeTitle : null,
        // Mailing address fields
        address_street: formData.mailingAddress?.property_address || '',
        address_city: formData.mailingAddress?.city || '',
        address_state: formData.mailingAddress?.state || '',
        address_zip: formData.mailingAddress?.zip_code || '',
        // Financial fields
        budget: parseFloat(formData.targetPrice) || null,
        commission: parseFloat(formData.projectedCommission) || null,
        commission_percentage: formData.commissionType === 'percentage' ? parseFloat(formData.commissionPercentage) || null : null,
        commission_type: formData.commissionType,
        // Agreement dates
        agreement_start_date: formatDateForBackend(formData.agreementStartDate),
        agreement_end_date: formatDateForBackend(formData.agreementEndDate),
      };

      const response = await clientsAPI.create(clientData);

      if (response.success) {
        setShowSuccess(true);
        setTimeout(() => {
          if (onSuccess) {
            onSuccess(response.data.id || response.data.client_id);
          }
          handleClose();
        }, 1500);
      }
    } catch (error) {
      console.error('Error creating client:', error);
    } finally {
      setSaving(false);
    }
  };

  // Check if current step can proceed
  const canProceed = useMemo(() => {
    switch (currentStepConfig?.id) {
      case 'client-type':
        return formData.clientType && formData.entityType;
      case 'entity-details':
        if (formData.entityType === 'individual') {
          return formData.firstName.trim() || formData.lastName.trim();
        }
        return formData.entityName.trim() && (formData.firstName.trim() || formData.lastName.trim());
      default:
        return true;
    }
  }, [currentStepConfig, formData]);

  // Render current step
  const renderStep = () => {
    const stepId = currentStepConfig?.id;

    switch (stepId) {
      case 'client-type':
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, width: '100%', maxWidth: 500, mx: 'auto' }}>
            {/* Client Type Selection */}
            <Box>
              <Typography
                variant="caption"
                sx={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: 'rgba(255,255,255,0.9)',
                  mb: 1.5,
                  display: 'block',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                }}
              >
                Client Type
              </Typography>
              <ToggleButtonGroup
                value={formData.clientType}
                exclusive
                onChange={handleClientTypeChange}
                fullWidth
                sx={{
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  '& .MuiToggleButton-root': {
                    color: 'rgba(255,255,255,0.7)',
                    borderColor: 'rgba(255,255,255,0.3)',
                    fontWeight: 600,
                    py: 1.5,
                    '&.Mui-selected': {
                      backgroundColor: 'rgba(255,255,255,0.25)',
                      color: 'white',
                      borderColor: 'rgba(255,255,255,0.5)',
                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255,0.35)',
                      },
                    },
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.15)',
                    },
                  },
                }}
              >
                <ToggleButton value="buyer">
                  <Home sx={{ mr: 1 }} />
                  Buyer
                </ToggleButton>
                <ToggleButton value="seller">
                  <AttachMoney sx={{ mr: 1 }} />
                  Seller
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>

            {/* Entity Type Selection */}
            <Box>
              <Typography
                variant="caption"
                sx={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: 'rgba(255,255,255,0.9)',
                  mb: 1.5,
                  display: 'block',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                }}
              >
                Entity Type
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1.5 }}>
                {Object.values(ENTITY_TYPES).map((entity) => {
                  const Icon = entity.icon;
                  const isSelected = formData.entityType === entity.value;
                  return (
                    <Box
                      key={entity.value}
                      onClick={() => handleEntityTypeChange(null, entity.value)}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        border: '2px solid',
                        borderColor: isSelected ? 'white' : 'rgba(255,255,255,0.3)',
                        backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.05)',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        '&:hover': {
                          backgroundColor: 'rgba(255,255,255,0.15)',
                          borderColor: 'rgba(255,255,255,0.5)',
                        },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Icon sx={{ color: isSelected ? 'white' : 'rgba(255,255,255,0.7)', fontSize: 24 }} />
                        <Box>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 600,
                              color: isSelected ? 'white' : 'rgba(255,255,255,0.9)',
                            }}
                          >
                            {entity.label}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          </Box>
        );

      case 'entity-details':
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, width: '100%', maxWidth: 400, mx: 'auto' }}>
            {/* Entity Name (for non-individuals) */}
            {formData.entityType !== 'individual' && (
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: 'rgba(255,255,255,0.7)',
                    mb: 0.5,
                    display: 'block',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  {entityConfig.entityNameLabel}
                </Typography>
                <TextField
                  fullWidth
                  value={formData.entityName}
                  onChange={(e) => setFormData({ ...formData, entityName: e.target.value })}
                  placeholder={entityConfig.entityNamePlaceholder}
                  autoFocus
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Business sx={{ color: 'white', fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'rgba(255,255,255,0.15)',
                      borderRadius: 2,
                      '& fieldset': { borderColor: 'rgba(255,255,255,0.3)', borderWidth: 2 },
                      '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                      '&.Mui-focused fieldset': { borderColor: 'white' },
                    },
                    '& .MuiInputBase-input': {
                      color: 'white',
                      fontSize: '1rem',
                      fontWeight: 600,
                      '&::placeholder': { color: 'rgba(255,255,255,0.4)', opacity: 1 },
                    },
                  }}
                />
              </Box>
            )}

            {/* Contact/Representative Name */}
            <Box>
              <Typography
                variant="caption"
                sx={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: 'rgba(255,255,255,0.7)',
                  mb: 0.5,
                  display: 'block',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                {formData.entityType === 'individual' ? 'Full Name' : 'Representative Name'}
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  fullWidth
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="First Name"
                  autoFocus={formData.entityType === 'individual'}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person sx={{ color: 'white', fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'rgba(255,255,255,0.15)',
                      borderRadius: 2,
                      '& fieldset': { borderColor: 'rgba(255,255,255,0.3)', borderWidth: 2 },
                      '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                      '&.Mui-focused fieldset': { borderColor: 'white' },
                    },
                    '& .MuiInputBase-input': {
                      color: 'white',
                      fontSize: '1rem',
                      fontWeight: 600,
                      '&::placeholder': { color: 'rgba(255,255,255,0.4)', opacity: 1 },
                    },
                  }}
                />
                <TextField
                  fullWidth
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="Last Name"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'rgba(255,255,255,0.15)',
                      borderRadius: 2,
                      '& fieldset': { borderColor: 'rgba(255,255,255,0.3)', borderWidth: 2 },
                      '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                      '&.Mui-focused fieldset': { borderColor: 'white' },
                    },
                    '& .MuiInputBase-input': {
                      color: 'white',
                      fontSize: '1rem',
                      fontWeight: 600,
                      '&::placeholder': { color: 'rgba(255,255,255,0.4)', opacity: 1 },
                    },
                  }}
                />
              </Box>
            </Box>

            {/* Representative Title (for non-individuals) */}
            {formData.entityType !== 'individual' && entityConfig.representativeTitles.length > 0 && (
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: 'rgba(255,255,255,0.7)',
                    mb: 0.5,
                    display: 'block',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  Title / Role
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {entityConfig.representativeTitles.map((title) => {
                    const isSelected = formData.representativeTitle === title;
                    return (
                      <Box
                        key={title}
                        onClick={() => setFormData({ ...formData, representativeTitle: title })}
                        sx={{
                          px: 2,
                          py: 1,
                          borderRadius: 2,
                          border: '2px solid',
                          borderColor: isSelected ? 'white' : 'rgba(255,255,255,0.3)',
                          backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.05)',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          '&:hover': {
                            backgroundColor: 'rgba(255,255,255,0.15)',
                            borderColor: 'rgba(255,255,255,0.5)',
                          },
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            color: isSelected ? 'white' : 'rgba(255,255,255,0.8)',
                            fontSize: '0.85rem',
                          }}
                        >
                          {title}
                        </Typography>
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            )}
          </Box>
        );

      case 'contact-info':
        return (
          <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <Box sx={{ width: '100%', maxWidth: 300, display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Phone
                label="Phone Number"
                value={formData.phone}
                onChange={(phone) => setFormData({ ...formData, phone })}
                color="#8b5cf6"
                showCurrentValue={false}
              />
              <Email
                label="Email Address"
                value={formData.email}
                onChange={(email) => setFormData({ ...formData, email })}
                color="#8b5cf6"
                showCurrentValue={false}
              />
            </Box>
          </Box>
        );

      case 'mailing-address':
        return (
          <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <Box sx={{ width: '100%', maxWidth: 500 }}>
              <Typography
                variant="caption"
                sx={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: 'rgba(255,255,255,0.9)',
                  mb: 1.5,
                  display: 'block',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                }}
              >
                Mailing Address
              </Typography>
              <AddressInput
                value={formData.mailingAddress?.property_address || ''}
                onChange={handleAddressChange}
                placeholder="Enter mailing address"
                color="#8b5cf6"
                hideLabel
              />
              {formData.mailingAddress && (
                <Typography
                  variant="caption"
                  sx={{
                    color: 'rgba(255,255,255,0.6)',
                    display: 'block',
                    mt: 1,
                    fontSize: '0.8rem',
                  }}
                >
                  {[
                    formData.mailingAddress.city,
                    formData.mailingAddress.state,
                    formData.mailingAddress.zip_code,
                  ].filter(Boolean).join(', ')}
                </Typography>
              )}
            </Box>
          </Box>
        );

      case 'target-price':
        return (
          <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <Box sx={{ width: '100%', maxWidth: 300 }}>
              <Currency
                label="Target Price"
                value={formData.targetPrice}
                onChange={handleTargetPriceSave}
                color="#8b5cf6"
                showCurrentValue={false}
              />
            </Box>
          </Box>
        );

      case 'commission':
        const getCommissionDisplay = () => {
          if (formData.commissionType === 'percentage') {
            const targetPrice = parseFloat(formData.targetPrice) || 0;
            const percentage = parseFloat(formData.commissionPercentage) || 0;
            if (!targetPrice) return `${percentage}% (set target price first)`;
            const amount = (targetPrice * percentage) / 100;
            return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
          } else {
            const amount = parseFloat(formData.projectedCommission) || 0;
            return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
          }
        };

        return (
          <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <Box sx={{ width: '100%', maxWidth: 300 }}>
              <Typography
                variant="caption"
                sx={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: 'rgba(255,255,255,0.9)',
                  mb: 1,
                  display: 'block',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                }}
              >
                Projected Commission
              </Typography>

              <Typography
                variant="h4"
                sx={{
                  fontWeight: 900,
                  color: 'white',
                  mb: 3,
                  letterSpacing: '-1px',
                }}
              >
                {getCommissionDisplay()}
              </Typography>

              <Box sx={{ mb: 3 }}>
                <ToggleButtonGroup
                  value={formData.commissionType}
                  exclusive
                  onChange={handleCommissionTypeChange}
                  fullWidth
                  sx={{
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    '& .MuiToggleButton-root': {
                      color: 'rgba(255,255,255,0.7)',
                      borderColor: 'rgba(255,255,255,0.3)',
                      fontWeight: 600,
                      '&.Mui-selected': {
                        backgroundColor: 'rgba(255,255,255,0.25)',
                        color: 'white',
                        borderColor: 'rgba(255,255,255,0.5)',
                        '&:hover': {
                          backgroundColor: 'rgba(255,255,255,0.35)',
                        },
                      },
                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255,0.15)',
                      },
                    },
                  }}
                >
                  <ToggleButton value="percentage">
                    <Percent sx={{ mr: 1, fontSize: 18 }} />
                    Percentage
                  </ToggleButton>
                  <ToggleButton value="flat">
                    <AttachMoney sx={{ mr: 1, fontSize: 18 }} />
                    Flat
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>

              {formData.commissionType === 'percentage' ? (
                <PercentageInput
                  value={formData.commissionPercentage}
                  onChange={handleCommissionValueChange}
                  placeholder="3"
                />
              ) : (
                <CurrencyInput
                  value={formData.projectedCommission}
                  onChange={handleCommissionValueChange}
                  placeholder="2000"
                />
              )}
            </Box>
          </Box>
        );

      case 'agreement-dates':
        return (
          <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <Box sx={{ width: '100%', maxWidth: 300, display: 'flex', flexDirection: 'column', gap: 3 }}>
              <DateSetter
                label="Agreement Start Date"
                value={formData.agreementStartDate}
                onChange={(date) => setFormData({ ...formData, agreementStartDate: date })}
                color="#8b5cf6"
                showCurrentValue={false}
              />
              <DateSetter
                label="Agreement End Date"
                value={formData.agreementEndDate}
                onChange={(date) => setFormData({ ...formData, agreementEndDate: date })}
                color="#f59e0b"
                minDate={formData.agreementStartDate}
                showCurrentValue={false}
              />
            </Box>
          </Box>
        );

      case 'preview':
        const previewClient = {
          id: 'preview',
          first_name: formData.firstName,
          last_name: formData.lastName,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          email: formData.email,
          client_type: formData.clientType,
          entity_type: formData.entityType,
          entity_name: formData.entityName,
          representative_title: formData.representativeTitle,
          target_price: parseFloat(formData.targetPrice) || 0,
          targetPrice: parseFloat(formData.targetPrice) || 0,
          budget: parseFloat(formData.targetPrice) || 0,
          projected_commission: parseFloat(formData.projectedCommission) || 0,
          projectedCommission: parseFloat(formData.projectedCommission) || 0,
          commission: parseFloat(formData.projectedCommission) || 0,
          commission_percentage: formData.commissionType === 'percentage' ? parseFloat(formData.commissionPercentage) || null : null,
          commissionPercentage: formData.commissionType === 'percentage' ? parseFloat(formData.commissionPercentage) || null : null,
          commission_type: formData.commissionType,
          commissionType: formData.commissionType,
          agreementStartDate: formData.agreementStartDate,
          agreementEndDate: formData.agreementEndDate,
          agreement_start_date: formData.agreementStartDate,
          agreement_end_date: formData.agreementEndDate,
          client_status: 'active',
          stage: 'New',
          lifetime_value: parseFloat(formData.projectedCommission) || 0,
          is_preview: true,
          // Display name logic
          display_name: getDisplayName(),
        };

        return (
          <Box>
            <Typography
              variant="h6"
              sx={{
                color: 'white',
                mb: 2,
                fontWeight: 600,
                textAlign: 'center',
              }}
            >
              Preview Your Client
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <ClientCard
                client={previewClient}
                onClick={() => {}}
                onUpdate={() => {}}
              />
            </Box>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth={false}
      PaperProps={{
        sx: {
          borderRadius: 3,
          background: 'transparent',
          boxShadow: 'none',
        },
      }}
    >
      {!showSuccess ? (
        <ModalStepPage
          title="Create New Client"
          color="#8b5cf6"
          currentStep={currentStep}
          totalSteps={totalSteps}
          onNext={handleNext}
          onBack={handleBack}
          onClose={handleClose}
          onStepClick={setCurrentStep}
          saving={saving}
          isLastStep={isLastStep}
          canProceed={canProceed}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </ModalStepPage>
      ) : (
        <Fade in timeout={500}>
          <Box
            sx={{
              p: 6,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
              borderRadius: 3,
              minHeight: 300,
            }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            >
              <CheckCircle sx={{ fontSize: 80, color: 'white', mb: 2 }} />
            </motion.div>
            <Typography
              variant="h4"
              sx={{
                color: 'white',
                fontWeight: 700,
                textAlign: 'center',
              }}
            >
              Client Created!
            </Typography>
          </Box>
        </Fade>
      )}
    </Dialog>
  );
};

export { NewClientModal };
export default NewClientModal;
