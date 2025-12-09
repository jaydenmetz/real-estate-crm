import React, { useState, useMemo, useEffect } from 'react';
import {
  Dialog,
  Box,
  Fade,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import { CheckCircle, Person } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { Percent, AttachMoney } from '@mui/icons-material';
import { ModalStepPage } from '../../../common/modals/ModalStepPage';
import { Phone } from '../../../common/setters/Phone';
import { Email } from '../../../common/setters/Email';
import { Currency } from '../../../common/setters/Currency';
import { DateSetter } from '../../../common/setters/Date';
import { CurrencyInput } from '../../../common/inputs/shared/CurrencyInput';
import { PercentageInput } from '../../../common/inputs/shared/PercentageInput';
import { LeadInput } from '../../../common/inputs/shared/LeadInput';
import ClientCard from '../view-modes/card/ClientCard';
import { clientsAPI, leadsAPI } from '../../../../services/api.service';
import NewLeadModal from '../../leads/modals/NewLeadModal';

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

  // NewLeadModal state
  const [showNewLeadModal, setShowNewLeadModal] = useState(false);
  const [newLeadSearchText, setNewLeadSearchText] = useState('');

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

    // Lead connection (step 1 - required to select lead first)
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
  // Step 1 requires selecting a lead (or creating new one) before proceeding
  const steps = useMemo(() => [
    { id: 'name', label: 'Select Lead' },       // Lead selection is now step 1
    { id: 'contact', label: 'Contact Info' },
    { id: 'target-price', label: 'Target Price' },
    { id: 'commission', label: 'Projected Commission' },
    { id: 'agreement-start', label: 'Agreement Start' },
    { id: 'agreement-end', label: 'Agreement Expiration' },
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
      setShowNewLeadModal(false);
      setNewLeadSearchText('');
      onClose();
    }
  };

  // Step-specific save handlers
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

  // Handle lead selection - this is now step 1, so also populate name/contact
  const handleLeadSelect = (lead) => {
    if (lead) {
      const firstName = lead.first_name || lead.firstName || '';
      const lastName = lead.last_name || lead.lastName || '';
      const displayName = `${firstName} ${lastName}`.trim();

      setFormData({
        ...formData,
        leadId: lead.id || lead.lead_id,
        selectedLead: lead,
        // Auto-populate from lead
        firstName,
        lastName,
        displayName,
        phone: lead.phone || lead.lead_phone || formData.phone,
        email: lead.email || lead.lead_email || formData.email,
      });
    } else {
      setFormData({
        ...formData,
        leadId: null,
        selectedLead: null,
        firstName: '',
        lastName: '',
        displayName: '',
      });
    }
  };

  // Handle "Add New Lead" from LeadInput
  const handleAddNewLead = (searchText) => {
    setNewLeadSearchText(searchText);
    setShowNewLeadModal(true);
  };

  // Handle successful lead creation from NewLeadModal
  const handleNewLeadCreated = async (leadId) => {
    try {
      const response = await leadsAPI.getById(leadId);
      if (response.success && response.data) {
        const lead = response.data;
        handleLeadSelect(lead);
      }
    } catch (error) {
      console.error('Error fetching newly created lead:', error);
    } finally {
      setShowNewLeadModal(false);
      setNewLeadSearchText('');
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
        // Map UI fields to database columns
        budget: parseFloat(formData.targetPrice) || null,
        commission: parseFloat(formData.projectedCommission) || null,
        commission_percentage: formData.commissionType === 'percentage' ? parseFloat(formData.commissionPercentage) || null : null,
        commission_type: formData.commissionType,
        // Agreement dates
        agreement_start_date: formData.agreementStartDate,
        agreement_end_date: formData.agreementEndDate,
        // Lead connection - backend expects lead_ids array
        lead_ids: formData.leadId ? [formData.leadId] : [],
        // Client type defaults to 'buyer' if not specified
        client_type: 'buyer',
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
          <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <Box sx={{ width: '100%', maxWidth: 500 }}>
              {/* Selected Lead Display - shown after selection */}
              {formData.selectedLead && (
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: 10,
                      fontWeight: 600,
                      color: 'rgba(255,255,255,0.7)',
                      mb: 0.5,
                      display: 'block',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    Selected Lead
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 0.75,
                      borderRadius: 1.5,
                      p: 0.75,
                      border: '2px solid rgba(255,255,255,0.3)',
                      backgroundColor: 'rgba(255,255,255,0.08)',
                    }}
                  >
                    <Person sx={{ color: 'white', mt: 0.25, fontSize: 20 }} />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        variant="body1"
                        sx={{
                          fontWeight: 700,
                          color: 'white',
                          fontSize: '0.9rem',
                          lineHeight: 1.3,
                          wordBreak: 'break-word',
                        }}
                      >
                        {formData.displayName}
                      </Typography>
                      {(formData.phone || formData.email) && (
                        <Typography
                          variant="caption"
                          sx={{
                            color: 'rgba(255,255,255,0.7)',
                            display: 'block',
                            mt: 0.25,
                            fontSize: '0.75rem',
                          }}
                        >
                          {[formData.phone, formData.email].filter(Boolean).join(' • ')}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Box>
              )}

              {/* LeadInput with dynamic labels */}
              <LeadInput
                value={formData.selectedLead}
                onChange={handleLeadSelect}
                initialLabel="Select Lead"
                selectedLabel="Client Name"
                placeholder="Search leads by name..."
                color="#3b82f6"
                onAddNew={handleAddNewLead}
                autoFocus
              />

              {!formData.selectedLead && (
                <Typography
                  variant="caption"
                  sx={{
                    color: 'rgba(255,255,255,0.5)',
                    display: 'block',
                    mt: 2,
                    textAlign: 'center',
                  }}
                >
                  Select a lead to create a client from, or add a new lead
                </Typography>
              )}
            </Box>
          </Box>
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
          canProceed={currentStep === 0 ? Boolean(formData.selectedLead) : true}
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

      {/* NewLeadModal for "Add New Lead" option */}
      <NewLeadModal
        open={showNewLeadModal}
        onClose={() => {
          setShowNewLeadModal(false);
          setNewLeadSearchText('');
        }}
        onSuccess={handleNewLeadCreated}
        initialData={{
          firstName: newLeadSearchText.split(' ')[0] || '',
          lastName: newLeadSearchText.split(' ').slice(1).join(' ') || '',
        }}
      />
    </Dialog>
  );
};

export { NewClientModal };
export default NewClientModal;
