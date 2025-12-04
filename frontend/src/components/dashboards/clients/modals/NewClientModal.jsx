import React, { useState, useMemo } from 'react';
import {
  Dialog,
  Box,
  Fade,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import {
  CheckCircle,
  Home,
  Sell,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { ModalStepPage } from '../../../common/modals/ModalStepPage';
import { EditClientName } from '../editors/EditClientName';
import { Phone } from '../../../common/setters/Phone';
import { Email } from '../../../common/setters/Email';
import { Currency } from '../../../common/setters/Currency';
import ClientCard from '../view-modes/card/ClientCard';
import { clientsAPI } from '../../../../services/api.service';

/**
 * NewClientModal - Quick-Add Flow for Clients
 * Step-based modal using existing editors with progress dots and arrow navigation
 * Matches NewEscrowModal pattern exactly
 *
 * Steps:
 * 1. Name (with lead search)
 * 2. Client Type (Buyer/Seller)
 * 3. Contact Info (Phone + Email)
 * 4. Budget
 * 5. Preview & Confirm
 */
const NewClientModal = ({ open, onClose, onSuccess }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Form data state
  const [formData, setFormData] = useState({
    // Name (from lead or manual)
    firstName: '',
    lastName: '',
    displayName: '',
    leadId: null,

    // Client Type
    clientType: 'buyer', // 'buyer' | 'seller'

    // Contact Info
    phone: '',
    email: '',

    // Financial
    budget: '',
  });

  // Step configuration
  const steps = useMemo(() => [
    { id: 'name', label: 'Client Name' },
    { id: 'client-type', label: 'Client Type' },
    { id: 'contact', label: 'Contact Info' },
    { id: 'budget', label: 'Budget' },
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
        leadId: null,
        clientType: 'buyer',
        phone: '',
        email: '',
        budget: '',
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
      leadId: nameData.lead_id || null,
      // If lead selected, also grab contact info
      phone: nameData.phone || formData.phone,
      email: nameData.email || formData.email,
    });
  };

  const handleClientTypeChange = (event, newType) => {
    if (newType !== null) {
      setFormData({ ...formData, clientType: newType });
    }
  };

  const handlePhoneSave = (phone) => {
    setFormData({ ...formData, phone });
  };

  const handleEmailSave = (email) => {
    setFormData({ ...formData, email });
  };

  const handleBudgetSave = (budget) => {
    setFormData({ ...formData, budget });
  };

  // Final submission
  const handleSubmit = async () => {
    setSaving(true);

    try {
      const clientData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        client_type: formData.clientType,
        phone: formData.phone,
        email: formData.email,
        budget: parseFloat(formData.budget) || 0,
        client_status: 'active',
        stage: 'New',
        // Link to lead if selected
        lead_id: formData.leadId,
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

      case 'client-type':
        return (
          <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <Box sx={{ width: '100%', maxWidth: 350 }}>
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
                Client Type
              </Typography>

              <Typography
                variant="h4"
                sx={{
                  fontWeight: 900,
                  color: 'white',
                  mb: 3,
                  letterSpacing: '-1px',
                  textTransform: 'capitalize',
                }}
              >
                {formData.clientType || 'Select Type'}
              </Typography>

              <ToggleButtonGroup
                value={formData.clientType}
                exclusive
                onChange={handleClientTypeChange}
                fullWidth
                sx={{
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  borderRadius: 2,
                  '& .MuiToggleButton-root': {
                    color: 'rgba(255,255,255,0.7)',
                    borderColor: 'rgba(255,255,255,0.3)',
                    fontWeight: 600,
                    py: 2,
                    fontSize: '1rem',
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
                  <Home sx={{ mr: 1, fontSize: 22 }} />
                  Buyer
                </ToggleButton>
                <ToggleButton value="seller">
                  <Sell sx={{ mr: 1, fontSize: 22 }} />
                  Seller
                </ToggleButton>
              </ToggleButtonGroup>
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

      case 'budget':
        return (
          <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <Box sx={{ width: '100%', maxWidth: 300 }}>
              <Currency
                label="Budget"
                value={formData.budget}
                onChange={handleBudgetSave}
                color="#8b5cf6"
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
          client_type: formData.clientType,
          clientType: formData.clientType,
          phone: formData.phone,
          email: formData.email,
          budget: parseFloat(formData.budget) || 0,
          client_status: 'active',
          stage: 'New',
          lifetime_value: 0,
          leads: [],
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

                  if (updatedClient.budget !== undefined) {
                    newFormData.budget = updatedClient.budget.toString();
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
