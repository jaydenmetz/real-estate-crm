import React, { useState, useMemo, useEffect } from 'react';
import {
  Dialog,
  Box,
  Fade,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import { CheckCircle } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { Percent, AttachMoney } from '@mui/icons-material';
import { ModalStepPage } from '../../../common/modals/ModalStepPage';
import { EditClientName } from '../editors/EditClientName';
import { Phone } from '../../../common/setters/Phone';
import { Email } from '../../../common/setters/Email';
import { Currency } from '../../../common/setters/Currency';
import { DateSetter } from '../../../common/setters/Date';
import { CurrencyInput } from '../../../common/inputs/shared/CurrencyInput';
import { PercentageInput } from '../../../common/inputs/shared/PercentageInput';
import { LeadInput } from '../../../common/inputs/shared/LeadInput';
import ClientCard from '../view-modes/card/ClientCard';
import { clientsAPI } from '../../../../services/api.service';

/**
 * NewClientModal - Quick-Add Flow for Clients
 * Step-based modal using existing editors with progress dots and arrow navigation
 *
 * Steps:
 * 1. Client Name (with lead search for pre-fill)
 * 2. Contact Info (Phone + Email)
 * 3. Target Price
 * 4. Projected Commission
 * 5. Client Beginning Date
 * 6. Client Expiration Date
 * 7. Connect Lead from Database
 * 8. Preview & Confirm
 */
const NewClientModal = ({ open, onClose, onSuccess, initialData }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Form data state
  const [formData, setFormData] = useState({
    // Name (from lead or manual)
    firstName: '',
    lastName: '',
    displayName: '',

    // Contact Info
    phone: '',
    email: '',

    // Financial - renamed fields
    targetPrice: '', // was: budget
    projectedCommission: '', // was: commission
    commissionPercentage: '',
    commissionType: 'percentage', // 'percentage' | 'flat'

    // Agreement Dates
    agreementStartDate: null,
    agreementEndDate: null,

    // Lead connection
    leadId: null,
    selectedLead: null,
  });

  // Initialize form data from initialData when modal opens
  useEffect(() => {
    if (open && initialData) {
      const firstName = initialData.firstName || '';
      const lastName = initialData.lastName || '';
      const displayName = `${firstName} ${lastName}`.trim();

      setFormData(prev => ({
        ...prev,
        firstName,
        lastName,
        displayName,
      }));
    }
  }, [open, initialData]);

  // Step configuration - fixed order
  const steps = useMemo(() => [
    { id: 'name', label: 'Client Name' },
    { id: 'contact', label: 'Contact Info' },
    { id: 'target-price', label: 'Target Price' },
    { id: 'commission', label: 'Projected Commission' },
    { id: 'agreement-start', label: 'Agreement Start' },
    { id: 'agreement-end', label: 'Agreement Expiration' },
    { id: 'connect-lead', label: 'Connect Lead' },
    { id: 'preview', label: 'Preview & Confirm' },
  ], []);

  const currentStepConfig = steps[currentStep];
  const totalSteps = steps.length;
  const isLastStep = currentStep === totalSteps - 1;

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
        firstName: '',
        lastName: '',
        displayName: '',
        phone: '',
        email: '',
        targetPrice: '',
        projectedCommission: '',
        commissionPercentage: '',
        commissionType: 'percentage',
        agreementStartDate: null,
        agreementEndDate: null,
        leadId: null,
        selectedLead: null,
      });
      setShowSuccess(false);
      onClose();
    }
  };

  // Step-specific save handlers
  const handleNameSave = (nameData) => {
    setFormData({
      ...formData,
      firstName: nameData.first_name || '',
      lastName: nameData.last_name || '',
      displayName: nameData.display_name || `${nameData.first_name || ''} ${nameData.last_name || ''}`.trim(),
      // If lead selected from name editor, also grab contact info
      phone: nameData.phone || formData.phone,
      email: nameData.email || formData.email,
    });
  };

  const handleAgreementStartDate = (date) => {
    setFormData({ ...formData, agreementStartDate: date });
  };

  const handleAgreementEndDate = (date) => {
    setFormData({ ...formData, agreementEndDate: date });
  };

  const handlePhoneSave = (phone) => {
    setFormData({ ...formData, phone });
  };

  const handleEmailSave = (email) => {
    setFormData({ ...formData, email });
  };

  const handleTargetPriceSave = (targetPrice) => {
    // When target price changes, recalculate commission if type is percentage
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

  const handleLeadSelect = (lead) => {
    if (lead) {
      setFormData({
        ...formData,
        leadId: lead.id || lead.lead_id,
        selectedLead: lead,
      });
    } else {
      setFormData({
        ...formData,
        leadId: null,
        selectedLead: null,
      });
    }
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
        // Renamed fields - map to database columns
        target_price: parseFloat(formData.targetPrice) || 0,
        projected_commission: parseFloat(formData.projectedCommission) || 0,
        commission_percentage: formData.commissionType === 'percentage' ? parseFloat(formData.commissionPercentage) || null : null,
        commission_type: formData.commissionType,
        // Agreement dates
        agreement_start_date: formData.agreementStartDate,
        agreement_end_date: formData.agreementEndDate,
        // Lead connection
        lead_id: formData.leadId,
        client_status: 'active',
        stage: 'New',
      };

      const response = await clientsAPI.create(clientData);

      if (response.success) {
        // Show success animation
        setShowSuccess(true);

        // Auto-close after animation
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

  // Render current step
  const renderStep = () => {
    const stepId = currentStepConfig.id;

    switch (stepId) {
      case 'name':
        return (
          <EditClientName
            open={true}
            onClose={() => {}}
            onSave={handleNameSave}
            value={formData.displayName}
            data={{
              firstName: formData.firstName,
              lastName: formData.lastName,
              phone: formData.phone,
              email: formData.email,
            }}
            inline={true}
            color="#8b5cf6"
          />
        );

      case 'contact':
        return (
          <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <Box sx={{ width: '100%', maxWidth: 300, display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Phone
                label="Phone Number"
                value={formData.phone}
                onChange={handlePhoneSave}
                color="#8b5cf6"
                showCurrentValue={false}
              />
              <Email
                label="Email Address"
                value={formData.email}
                onChange={handleEmailSave}
                color="#8b5cf6"
                showCurrentValue={false}
              />
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
        // Calculate display value for commission
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
              {/* Label */}
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

              {/* Current Value Display */}
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

              {/* Commission Type Toggle */}
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

              {/* Edit Input */}
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

      case 'agreement-start':
        return (
          <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <Box sx={{ width: '100%', maxWidth: 300 }}>
              <DateSetter
                label="Client Beginning Date"
                value={formData.agreementStartDate}
                onChange={handleAgreementStartDate}
                color="#8b5cf6"
                showCurrentValue={false}
              />
            </Box>
          </Box>
        );

      case 'agreement-end':
        return (
          <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <Box sx={{ width: '100%', maxWidth: 300 }}>
              <DateSetter
                label="Client Expiration Date"
                value={formData.agreementEndDate}
                onChange={handleAgreementEndDate}
                color="#f59e0b"
                minDate={formData.agreementStartDate}
                showCurrentValue={false}
              />
            </Box>
          </Box>
        );

      case 'connect-lead':
        return (
          <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <Box sx={{ width: '100%', maxWidth: 400 }}>
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
                Connect Lead
              </Typography>

              <Typography
                variant="h5"
                sx={{
                  fontWeight: 900,
                  color: 'white',
                  mb: 1,
                  letterSpacing: '-0.5px',
                }}
              >
                {formData.selectedLead
                  ? `${formData.selectedLead.first_name || ''} ${formData.selectedLead.last_name || ''}`.trim() || 'Selected Lead'
                  : 'Search Leads'}
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  color: 'rgba(255,255,255,0.7)',
                  mb: 3,
                }}
              >
                Link this client to an existing lead in your database. You can skip this step if not applicable.
              </Typography>

              {/* Selected Lead Display */}
              {formData.selectedLead && (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    p: 1.5,
                    mb: 2,
                    borderRadius: 2,
                    border: '2px solid rgba(255,255,255,0.3)',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                  }}
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      backgroundColor: '#3b82f6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 600,
                      fontSize: '0.9rem',
                    }}
                  >
                    {(formData.selectedLead.first_name || 'L')[0].toUpperCase()}
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ color: 'white', fontWeight: 600, fontSize: '0.95rem' }}>
                      {`${formData.selectedLead.first_name || ''} ${formData.selectedLead.last_name || ''}`.trim()}
                    </Typography>
                    <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem' }}>
                      {formData.selectedLead.email || formData.selectedLead.phone || 'No contact info'}
                    </Typography>
                  </Box>
                </Box>
              )}

              <LeadInput
                value={formData.selectedLead}
                onChange={handleLeadSelect}
                placeholder="Search leads by name..."
                color="#3b82f6"
              />

              <Typography
                variant="caption"
                sx={{
                  color: 'rgba(255,255,255,0.5)',
                  display: 'block',
                  mt: 2,
                  textAlign: 'center',
                }}
              >
                Optional - you can connect a lead later
              </Typography>
            </Box>
          </Box>
        );

      case 'preview':
        // Build preview client object from formData
        const previewClient = {
          id: 'preview',
          first_name: formData.firstName,
          last_name: formData.lastName,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          email: formData.email,
          // Use new field names
          target_price: parseFloat(formData.targetPrice) || 0,
          targetPrice: parseFloat(formData.targetPrice) || 0,
          budget: parseFloat(formData.targetPrice) || 0, // Fallback for card display
          projected_commission: parseFloat(formData.projectedCommission) || 0,
          projectedCommission: parseFloat(formData.projectedCommission) || 0,
          commission: parseFloat(formData.projectedCommission) || 0, // Fallback for card display
          commission_percentage: formData.commissionType === 'percentage' ? parseFloat(formData.commissionPercentage) || null : null,
          commissionPercentage: formData.commissionType === 'percentage' ? parseFloat(formData.commissionPercentage) || null : null,
          commission_type: formData.commissionType,
          commissionType: formData.commissionType,
          agreementStartDate: formData.agreementStartDate,
          agreementEndDate: formData.agreementEndDate,
          agreement_start_date: formData.agreementStartDate,
          agreement_end_date: formData.agreementEndDate,
          lead_id: formData.leadId,
          client_status: 'active',
          stage: 'New',
          lifetime_value: parseFloat(formData.projectedCommission) || 0,
          leads: formData.selectedLead ? [formData.selectedLead] : [],
          is_preview: true,
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
                onUpdate={(updatedClient) => {
                  // Sync updates back to formData
                  const newFormData = { ...formData };

                  if (updatedClient.target_price !== undefined || updatedClient.budget !== undefined) {
                    newFormData.targetPrice = (updatedClient.target_price || updatedClient.budget || 0).toString();
                  }

                  if (updatedClient.projected_commission !== undefined || updatedClient.commission !== undefined) {
                    newFormData.projectedCommission = (updatedClient.projected_commission || updatedClient.commission || 0).toString();
                  }

                  if (updatedClient.agreement_start_date !== undefined) {
                    newFormData.agreementStartDate = updatedClient.agreement_start_date;
                  }

                  if (updatedClient.agreement_end_date !== undefined) {
                    newFormData.agreementEndDate = updatedClient.agreement_end_date;
                  }

                  if (updatedClient.first_name !== undefined) {
                    newFormData.firstName = updatedClient.first_name;
                    newFormData.lastName = updatedClient.last_name || '';
                    newFormData.displayName = `${updatedClient.first_name} ${updatedClient.last_name || ''}`.trim();
                  }

                  setFormData(newFormData);
                }}
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
          color="#8b5cf6" // Purple theme for clients
          currentStep={currentStep}
          totalSteps={totalSteps}
          onNext={handleNext}
          onBack={handleBack}
          onClose={handleClose}
          onStepClick={setCurrentStep}
          saving={saving}
          isLastStep={isLastStep}
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
        // Success Animation
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
