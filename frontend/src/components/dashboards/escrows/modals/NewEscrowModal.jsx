import React, { useState, useMemo } from 'react';
import {
  Dialog,
  Box,
  Fade,
  Typography,
} from '@mui/material';
import { CheckCircle } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { ModalStepPage } from '../../../common/ModalStepPage';
import { EditPropertyAddress } from '../editors/EditPropertyAddress';
import { EditClients } from '../editors/EditClients';
import { EditPurchasePrice } from '../editors/EditPurchasePrice';
import { EditCommission } from '../../../../templates/Dashboard/lib/editors/EditCommission';
import { EditAcceptanceDate } from '../editors/EditAcceptanceDate';
import { EditClosingDate } from '../editors/EditClosingDate';
import { escrowsAPI } from '../../../../services/api.service';

/**
 * NewEscrowModal - Quick-Add Flow
 * Step-based modal using existing editors with progress dots and arrow navigation
 */
const NewEscrowModal = ({ open, onClose, onSuccess }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Form data state
  const [formData, setFormData] = useState({
    // Property
    propertyAddress: '',
    displayAddress: '',
    city: '',
    state: '',
    zipCode: '',
    county: '',
    latitude: null,
    longitude: null,

    // Representation
    representationType: 'buyer', // 'buyer' | 'seller' | 'dual'

    // Clients (dynamic based on representation)
    buyerClients: [],
    sellerClients: [],

    // Financial
    purchasePrice: 0,

    // Commission (dual fields for dual agency)
    buyerCommission: 0,
    buyerCommissionPercentage: null,
    buyerCommissionType: 'percentage',

    sellerCommission: 0,
    sellerCommissionPercentage: null,
    sellerCommissionType: 'percentage',

    // Dates
    acceptanceDate: new Date().toISOString().split('T')[0],
    closeOfEscrowDate: calculateDefaultCOE(),
  });

  // Helper function to calculate COE date (30 days out, adjusting for weekends and holidays)
  function calculateDefaultCOE(acceptanceDate = new Date()) {
    const coeDate = new Date(acceptanceDate);
    coeDate.setDate(coeDate.getDate() + 30);

    while (true) {
      const dayOfWeek = coeDate.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      if (!isWeekend) {
        break;
      }

      coeDate.setDate(coeDate.getDate() + 1);
    }

    return coeDate.toISOString().split('T')[0];
  }

  // Dynamic step configuration based on representation type
  const steps = useMemo(() => {
    const baseSteps = [
      {
        id: 'property',
        label: 'Property Address',
        color: '#10b981',
        maxWidth: 500,
      },
      {
        id: 'representation-and-clients',
        label: 'Representation & Clients',
        color: '#3b82f6',
        maxWidth: 600,
      },
      {
        id: 'purchase-price',
        label: 'Purchase Price',
        color: '#10b981',
        maxWidth: 400,
      },
    ];

    // Add commission steps (dual agency gets two)
    if (formData.representationType === 'dual') {
      baseSteps.push(
        {
          id: 'buyer-commission',
          label: "Buyer's Commission",
          color: '#10b981',
          maxWidth: 450,
        },
        {
          id: 'seller-commission',
          label: 'Listing Commission',
          color: '#f59e0b',
          maxWidth: 450,
        }
      );
    } else {
      baseSteps.push({
        id: 'commission',
        label: 'Commission',
        color: '#10b981',
        maxWidth: 450,
      });
    }

    // Add date steps
    baseSteps.push(
      {
        id: 'acceptance-date',
        label: 'Acceptance Date',
        color: '#3b82f6',
        maxWidth: 400,
      },
      {
        id: 'closing-date',
        label: 'Closing Date',
        color: '#8b5cf6',
        maxWidth: 400,
      }
    );

    return baseSteps;
  }, [formData.representationType]);

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
        propertyAddress: '',
        displayAddress: '',
        city: '',
        state: 'CA',
        zipCode: '',
        county: '',
        latitude: null,
        longitude: null,
        representationType: 'buyer',
        buyerClients: [],
        sellerClients: [],
        purchasePrice: 0,
        buyerCommission: 0,
        buyerCommissionPercentage: null,
        buyerCommissionType: 'percentage',
        sellerCommission: 0,
        sellerCommissionPercentage: null,
        sellerCommissionType: 'percentage',
        acceptanceDate: new Date().toISOString().split('T')[0],
        closeOfEscrowDate: calculateDefaultCOE(),
      });
      setShowSuccess(false);
      onClose();
    }
  };

  // Step-specific save handlers
  const handlePropertyAddressSave = (addressData) => {
    setFormData({
      ...formData,
      propertyAddress: addressData.property_address || addressData.address,
      displayAddress: addressData.display_address || addressData.property_address,
      city: addressData.city || '',
      state: addressData.state || 'CA',
      zipCode: addressData.zip_code || '',
      county: addressData.county || '',
      latitude: addressData.latitude || null,
      longitude: addressData.longitude || null,
    });
    // Don't auto-advance - let user review selected address before clicking arrow
  };

  const handleRepresentationTypeChange = (type) => {
    setFormData({ ...formData, representationType: type });
  };

  const handleBuyerClientsChange = (clientIds) => {
    setFormData({ ...formData, buyerClients: clientIds });
  };

  const handleSellerClientsChange = (clientIds) => {
    setFormData({ ...formData, sellerClients: clientIds });
  };

  const handlePurchasePriceSave = (price) => {
    setFormData({ ...formData, purchasePrice: price });
    handleNext();
  };

  const handleCommissionSave = (updates) => {
    const stepId = steps[currentStep].id;

    if (stepId === 'buyer-commission') {
      setFormData({
        ...formData,
        buyerCommission: updates.my_commission,
        buyerCommissionPercentage: updates.commission_percentage,
        buyerCommissionType: updates.commission_type,
      });
    } else if (stepId === 'seller-commission') {
      setFormData({
        ...formData,
        sellerCommission: updates.my_commission,
        sellerCommissionPercentage: updates.commission_percentage,
        sellerCommissionType: updates.commission_type,
      });
    } else {
      // Single commission
      if (formData.representationType === 'buyer') {
        setFormData({
          ...formData,
          buyerCommission: updates.my_commission,
          buyerCommissionPercentage: updates.commission_percentage,
          buyerCommissionType: updates.commission_type,
        });
      } else {
        setFormData({
          ...formData,
          sellerCommission: updates.my_commission,
          sellerCommissionPercentage: updates.commission_percentage,
          sellerCommissionType: updates.commission_type,
        });
      }
    }
    handleNext();
  };

  const handleAcceptanceDateSave = (date) => {
    setFormData({
      ...formData,
      acceptanceDate: date,
      closeOfEscrowDate: calculateDefaultCOE(new Date(date)),
    });
    handleNext();
  };

  const handleClosingDateSave = (date) => {
    setFormData({ ...formData, closeOfEscrowDate: date });
    handleNext();
  };

  // Final submission
  const handleSubmit = async () => {
    setSaving(true);

    try {
      // Calculate total commission for dual agency
      const totalCommission = formData.representationType === 'dual'
        ? formData.buyerCommission + formData.sellerCommission
        : (formData.buyerCommission || formData.sellerCommission);

      // Prepare client IDs
      const clientIds = formData.representationType === 'dual'
        ? [...formData.buyerClients, ...formData.sellerClients]
        : [...formData.buyerClients, ...formData.sellerClients];

      const escrowData = {
        property_address: formData.propertyAddress,
        display_address: formData.displayAddress,
        city: formData.city,
        state: formData.state,
        zip_code: formData.zipCode,
        county: formData.county,
        latitude: formData.latitude,
        longitude: formData.longitude,
        purchase_price: formData.purchasePrice,
        my_commission: totalCommission,
        commission_percentage: formData.buyerCommissionPercentage || formData.sellerCommissionPercentage,
        commission_type: formData.buyerCommissionType || formData.sellerCommissionType,
        acceptance_date: formData.acceptanceDate,
        closing_date: formData.closeOfEscrowDate,
        escrow_status: 'active',
        representation_type: formData.representationType,
        // Add client IDs (will need backend support for multiple clients)
        client_id: clientIds[0] || null, // For now, use first client
      };

      const response = await escrowsAPI.create(escrowData);

      if (response.success) {
        // Show success animation
        setShowSuccess(true);

        // Auto-close after animation
        setTimeout(() => {
          if (onSuccess) {
            onSuccess(response.data.id);
          }
          handleClose();
        }, 1500);
      }
    } catch (error) {
      console.error('Error creating escrow:', error);
    } finally {
      setSaving(false);
    }
  };

  // Render current step
  const renderStep = () => {
    const stepId = currentStepConfig.id;

    switch (stepId) {
      case 'property':
        return (
          <EditPropertyAddress
            open={true}
            onClose={() => {}} // Don't close on backdrop click
            onSave={handlePropertyAddressSave}
            value={{
              property_address: formData.propertyAddress,
              display_address: formData.displayAddress,
              city: formData.city,
              state: formData.state,
              zip_code: formData.zipCode,
              county: formData.county,
            }}
            inline={true}
          />
        );

      case 'representation-and-clients':
        return (
          <EditClients
            open={true}
            onClose={() => {}}
            onSave={(data) => {
              setFormData({
                ...formData,
                representationType: data.representationType,
                buyerClients: data.buyerClients,
                sellerClients: data.sellerClients,
              });
            }}
            values={{
              representationType: formData.representationType,
              buyerClients: formData.buyerClients,
              sellerClients: formData.sellerClients,
            }}
            showRepresentationType={true}
            onRepresentationTypeChange={handleRepresentationTypeChange}
            inline={true}
          />
        );

      case 'purchase-price':
        return (
          <EditPurchasePrice
            open={true}
            onClose={() => {}}
            onSave={handlePurchasePriceSave}
            value={formData.purchasePrice}
          />
        );

      case 'commission':
      case 'buyer-commission':
      case 'seller-commission':
        const isBuyerCommission = stepId === 'buyer-commission' || stepId === 'commission';
        return (
          <EditCommission
            open={true}
            onClose={() => {}}
            onSave={handleCommissionSave}
            label={stepId === 'buyer-commission' ? "BUYER'S COMMISSION" : stepId === 'seller-commission' ? 'LISTING COMMISSION' : 'Commission'}
            value={isBuyerCommission ? formData.buyerCommission : formData.sellerCommission}
            commissionPercentage={isBuyerCommission ? formData.buyerCommissionPercentage : formData.sellerCommissionPercentage}
            commissionType={isBuyerCommission ? formData.buyerCommissionType : formData.sellerCommissionType}
            purchasePrice={formData.purchasePrice}
            color={currentStepConfig.color}
          />
        );

      case 'acceptance-date':
        return (
          <EditAcceptanceDate
            open={true}
            onClose={() => {}}
            onSave={handleAcceptanceDateSave}
            value={formData.acceptanceDate}
            inline={true}
          />
        );

      case 'closing-date':
        return (
          <EditClosingDate
            open={true}
            onClose={() => {}}
            onSave={handleClosingDateSave}
            value={formData.closeOfEscrowDate}
            inline={true}
          />
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
          maxWidth: currentStepConfig?.maxWidth || 400,
          width: '100%',
          transition: 'max-width 0.3s ease',
        },
      }}
    >
      {!showSuccess ? (
        <ModalStepPage
          color={currentStepConfig?.color || '#10b981'}
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
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
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
              Escrow Created!
            </Typography>
          </Box>
        </Fade>
      )}
    </Dialog>
  );
};

export { NewEscrowModal };
export default NewEscrowModal;
