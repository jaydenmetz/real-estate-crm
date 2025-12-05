import React, { useState, useMemo } from 'react';
import {
  Dialog,
  Box,
  Fade,
  Typography,
} from '@mui/material';
import { CheckCircle } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { ModalStepPage } from '../../../common/modals/ModalStepPage';
import { EditPropertyAddress } from '../editors/EditPropertyAddress';
import { EditListedPrice } from '../editors/EditListedPrice';
import { EditListingCommission } from '../editors/EditListingCommission';
import { EditListingDate } from '../editors/EditListingDate';
import { EditExpirationDate } from '../editors/EditExpirationDate';
import { EditSellers } from '../editors/EditSellers';
import ListingCard from '../view-modes/card/ListingCard';
import { listingsAPI } from '../../../../services/api.service';

/**
 * NewListingModal - Quick-Add Flow for Listings
 * Step-based modal using existing editors with progress dots and arrow navigation
 *
 * Steps:
 * 1. Property Address
 * 2. List Price
 * 3. Commission
 * 4. Listing Date (Beginning)
 * 5. Expiration Date
 * 6. Sellers (Client Contacts)
 * 7. Preview & Confirm
 */
const NewListingModal = ({ open, onClose, onSuccess }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Form data state
  const [formData, setFormData] = useState({
    // Property Address
    propertyAddress: '',
    displayAddress: '',
    city: '',
    state: 'CA',
    zipCode: '',
    county: '',
    latitude: null,
    longitude: null,

    // Financial
    listPrice: 0,

    // Commission
    commission: 0,
    commissionPercentage: null,
    commissionType: 'percentage',

    // Dates
    listingDate: new Date().toISOString().split('T')[0],
    expirationDate: calculateDefaultExpiration(),

    // Sellers (Client Contacts)
    sellers: [],

    // Status
    listingStatus: 'Active',
  });

  // Helper function to calculate default expiration (6 months out)
  function calculateDefaultExpiration(listingDate = new Date()) {
    const expDate = new Date(listingDate);
    expDate.setMonth(expDate.getMonth() + 6);
    return expDate.toISOString().split('T')[0];
  }

  // Step configuration
  const steps = useMemo(() => [
    { id: 'property', label: 'Property Address' },
    { id: 'list-price', label: 'List Price' },
    { id: 'commission', label: 'Commission' },
    { id: 'listing-date', label: 'Listing Date' },
    { id: 'expiration-date', label: 'Expiration Date' },
    { id: 'sellers', label: 'Seller Contacts' },
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
        propertyAddress: '',
        displayAddress: '',
        city: '',
        state: 'CA',
        zipCode: '',
        county: '',
        latitude: null,
        longitude: null,
        listPrice: 0,
        commission: 0,
        commissionPercentage: null,
        commissionType: 'percentage',
        listingDate: new Date().toISOString().split('T')[0],
        expirationDate: calculateDefaultExpiration(),
        sellers: [],
        listingStatus: 'Active',
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
  };

  const handleListPriceSave = (price) => {
    setFormData({ ...formData, listPrice: price });
  };

  const handleCommissionSave = (updates) => {
    setFormData({
      ...formData,
      commission: updates.commission || updates.my_commission || 0,
      commissionPercentage: updates.commission_percentage,
      commissionType: updates.commission_type || 'percentage',
    });
  };

  const handleListingDateSave = (date) => {
    setFormData({
      ...formData,
      listingDate: date,
      expirationDate: calculateDefaultExpiration(new Date(date)),
    });
  };

  const handleExpirationDateSave = (date) => {
    setFormData({ ...formData, expirationDate: date });
  };

  const handleSellersSave = (sellers) => {
    setFormData({ ...formData, sellers: sellers });
  };

  // Final submission
  const handleSubmit = async () => {
    setSaving(true);

    try {
      // Extract seller IDs
      const sellerIds = formData.sellers.map(s => s.id || s.client_id);

      const listingData = {
        property_address: formData.propertyAddress,
        display_address: formData.displayAddress || formData.propertyAddress,
        city: formData.city,
        state: formData.state,
        zip_code: formData.zipCode,
        county: formData.county,
        latitude: formData.latitude,
        longitude: formData.longitude,
        list_price: parseFloat(formData.listPrice) || 0,
        total_commission: formData.commissionPercentage,
        commission_type: formData.commissionType,
        listing_date: formData.listingDate,
        expiration_date: formData.expirationDate,
        listing_status: formData.listingStatus,
        seller_ids: sellerIds,
      };

      const response = await listingsAPI.create(listingData);

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
      console.error('Error creating listing:', error);
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
            onClose={() => {}}
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
            color="#f59e0b"
          />
        );

      case 'list-price':
        return (
          <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <Box sx={{ width: '100%', maxWidth: 300 }}>
              <EditListedPrice
                open={true}
                onClose={() => {}}
                onSave={handleListPriceSave}
                value={formData.listPrice}
                inline={true}
              />
            </Box>
          </Box>
        );

      case 'commission':
        return (
          <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <Box sx={{ width: '100%', maxWidth: 300 }}>
              <EditListingCommission
                open={true}
                onClose={() => {}}
                onSave={handleCommissionSave}
                value={formData.commission}
                commissionPercentage={formData.commissionPercentage}
                commissionType={formData.commissionType}
                purchasePrice={formData.listPrice}
                inline={true}
              />
            </Box>
          </Box>
        );

      case 'listing-date':
        return (
          <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <Box sx={{ width: '100%', maxWidth: 500 }}>
              <EditListingDate
                open={true}
                onClose={() => {}}
                onSave={handleListingDateSave}
                value={formData.listingDate}
                inline={true}
              />
            </Box>
          </Box>
        );

      case 'expiration-date':
        return (
          <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <Box sx={{ width: '100%', maxWidth: 500 }}>
              <EditExpirationDate
                open={true}
                onClose={() => {}}
                onSave={handleExpirationDateSave}
                value={formData.expirationDate}
                minDate={formData.listingDate}
                inline={true}
              />
            </Box>
          </Box>
        );

      case 'sellers':
        return (
          <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <Box sx={{ width: '100%', maxWidth: 500 }}>
              <EditSellers
                open={true}
                onClose={() => {}}
                onSave={handleSellersSave}
                value={formData.sellers}
                inline={true}
              />
            </Box>
          </Box>
        );

      case 'preview':
        // Build preview listing object from formData
        const previewListing = {
          id: 'preview',
          property_address: formData.propertyAddress,
          display_address: formData.displayAddress || formData.propertyAddress,
          city: formData.city,
          state: formData.state,
          zip_code: formData.zipCode,
          county: formData.county,
          latitude: formData.latitude,
          longitude: formData.longitude,
          list_price: parseFloat(formData.listPrice) || 0,
          total_commission: formData.commissionPercentage,
          commission_type: formData.commissionType,
          listing_date: formData.listingDate,
          expiration_date: formData.expirationDate,
          listing_status: formData.listingStatus,
          sellers: formData.sellers,
          // Preview status
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
              Preview Your Listing
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <ListingCard
                listing={previewListing}
                onClick={() => {}}
                onUpdate={(updatedListing) => {
                  // Sync all updates back to formData
                  const newFormData = { ...formData };

                  if (updatedListing.list_price !== undefined) {
                    newFormData.listPrice = updatedListing.list_price;
                  }

                  if (updatedListing.listingCommission !== undefined) {
                    newFormData.commissionPercentage = updatedListing.listingCommission;
                  }

                  if (updatedListing.listing_date !== undefined) {
                    newFormData.listingDate = updatedListing.listing_date;
                  }

                  if (updatedListing.expiration_date !== undefined) {
                    newFormData.expirationDate = updatedListing.expiration_date;
                  }

                  if (updatedListing.sellers !== undefined) {
                    newFormData.sellers = updatedListing.sellers;
                  }

                  if (updatedListing.listing_status !== undefined) {
                    newFormData.listingStatus = updatedListing.listing_status;
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
          title="Create New Listing"
          color="#f59e0b"
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
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
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
              Listing Created!
            </Typography>
          </Box>
        </Fade>
      )}
    </Dialog>
  );
};

export { NewListingModal };
export default NewListingModal;
