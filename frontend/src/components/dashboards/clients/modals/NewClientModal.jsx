import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Dialog,
  Box,
  Fade,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  TextField,
  Autocomplete,
  CircularProgress,
} from '@mui/material';
import {
  CheckCircle,
  Home,
  Sell,
  SwapHoriz,
  Business,
} from '@mui/icons-material';
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
import ClientCard from '../view-modes/card/ClientCard';
import { clientsAPI, listingsAPI } from '../../../../services/api.service';
import debounce from 'lodash/debounce';

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
 * 5. Commission
 * 6. Agreement Dates (Start + End)
 * 7. Preview & Confirm
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
    leadId: null,

    // Client Type - 'buyer' | 'seller' | 'both'
    clientType: 'buyer',
    // For seller/both: are they also buying?
    alsoHelpingBuy: false,

    // Contact Info
    phone: '',
    email: '',

    // Financial
    budget: '',
    commission: '',
    commissionPercentage: '',
    commissionType: 'percentage', // 'percentage' | 'flat'

    // Buyer Agreement Dates (for buyer or both)
    buyerAgreementStartDate: null,
    buyerAgreementEndDate: null,

    // Listing Agreement Dates (for seller or both)
    listingAgreementStartDate: null,
    listingAgreementEndDate: null,

    // Listing (for seller/both - link to existing listing)
    listingId: null,
    selectedListing: null,
  });

  // State for listing search
  const [listingOptions, setListingOptions] = useState([]);
  const [loadingListings, setLoadingListings] = useState(false);
  const [listingSearchText, setListingSearchText] = useState('');

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

  // Determine if client is a seller (seller only or both)
  const isSeller = formData.clientType === 'seller' || formData.clientType === 'both';
  const isBuyer = formData.clientType === 'buyer' || formData.clientType === 'both';

  // Step configuration - dynamic based on client type
  const steps = useMemo(() => {
    const baseSteps = [
      { id: 'name', label: 'Client Name' },
      { id: 'client-type', label: 'Client Type' },
    ];

    // If seller selected, ask if also helping them buy
    if (formData.clientType === 'seller') {
      baseSteps.push({ id: 'also-buying', label: 'Also Buying?' });
    }

    // Contact info always comes next
    baseSteps.push({ id: 'contact', label: 'Contact Info' });

    // If seller or both, add listing selection
    if (isSeller) {
      baseSteps.push({ id: 'listing', label: 'Select Listing' });
      baseSteps.push({ id: 'listing-agreement-dates', label: 'Listing Agreement' });
    }

    // If buyer or both, add buyer agreement dates and budget
    if (isBuyer) {
      baseSteps.push({ id: 'buyer-agreement-dates', label: 'Buyer Agreement' });
      baseSteps.push({ id: 'budget', label: 'Budget' });
    }

    // Commission and preview always at the end
    baseSteps.push({ id: 'commission', label: 'Commission' });
    baseSteps.push({ id: 'preview', label: 'Preview & Confirm' });

    return baseSteps;
  }, [formData.clientType, isSeller, isBuyer]);

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
        alsoHelpingBuy: false,
        phone: '',
        email: '',
        budget: '',
        commission: '',
        commissionPercentage: '',
        commissionType: 'percentage',
        buyerAgreementStartDate: null,
        buyerAgreementEndDate: null,
        listingAgreementStartDate: null,
        listingAgreementEndDate: null,
        listingId: null,
        selectedListing: null,
      });
      setListingOptions([]);
      setListingSearchText('');
      setShowSuccess(false);
      onClose();
    }
  };

  // Debounced listing search
  const searchListingsDebounced = useCallback(
    debounce(async (searchText) => {
      if (!searchText || searchText.length < 2) {
        setListingOptions([]);
        return;
      }

      setLoadingListings(true);
      try {
        const response = await listingsAPI.getAll({
          search: searchText,
          limit: 10,
        });

        const results = response.success && response.data
          ? (response.data.listings || response.data || [])
          : [];

        setListingOptions(results);
      } catch (error) {
        console.error('Error searching listings:', error);
        setListingOptions([]);
      } finally {
        setLoadingListings(false);
      }
    }, 200),
    []
  );

  // Search listings when input changes
  useEffect(() => {
    if (listingSearchText) {
      searchListingsDebounced(listingSearchText);
    }
  }, [listingSearchText, searchListingsDebounced]);

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
      // If changing to 'both', it means they selected seller then said yes to also buying
      // If changing from seller to buyer, reset the also buying flag
      setFormData({
        ...formData,
        clientType: newType,
        // Reset also buying if switching away from seller
        alsoHelpingBuy: newType === 'both' ? true : false,
      });
    }
  };

  const handleAlsoBuyingChange = (event, value) => {
    if (value !== null) {
      if (value === 'yes') {
        // They are seller AND buyer
        setFormData({ ...formData, clientType: 'both', alsoHelpingBuy: true });
      } else {
        // They are seller only
        setFormData({ ...formData, alsoHelpingBuy: false });
      }
    }
  };

  const handleListingSelect = (event, listing) => {
    if (listing) {
      setFormData({
        ...formData,
        listingId: listing.id || listing.listing_id,
        selectedListing: listing,
      });
    } else {
      setFormData({
        ...formData,
        listingId: null,
        selectedListing: null,
      });
    }
  };

  const handleListingAgreementStartDate = (date) => {
    setFormData({ ...formData, listingAgreementStartDate: date });
  };

  const handleListingAgreementEndDate = (date) => {
    setFormData({ ...formData, listingAgreementEndDate: date });
  };

  const handleBuyerAgreementStartDate = (date) => {
    setFormData({ ...formData, buyerAgreementStartDate: date });
  };

  const handleBuyerAgreementEndDate = (date) => {
    setFormData({ ...formData, buyerAgreementEndDate: date });
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

  const handleCommissionValueChange = (value) => {
    if (formData.commissionType === 'percentage') {
      const budget = parseFloat(formData.budget) || 0;
      const percentage = parseFloat(value) || 0;
      const calculated = budget ? (budget * percentage) / 100 : 0;
      setFormData({
        ...formData,
        commissionPercentage: value,
        commission: calculated.toString(),
      });
    } else {
      setFormData({ ...formData, commission: value });
    }
  };

  const handleCommissionTypeChange = (e, newType) => {
    if (newType !== null) {
      setFormData({ ...formData, commissionType: newType });
    }
  };


  // Final submission
  const handleSubmit = async () => {
    setSaving(true);

    try {
      // Determine primary agreement dates based on client type
      // For dual clients, use buyer agreement as primary (since they're searching for a home)
      // For seller-only, use listing agreement as primary
      let agreementStartDate = null;
      let agreementEndDate = null;

      if (isBuyer) {
        agreementStartDate = formData.buyerAgreementStartDate;
        agreementEndDate = formData.buyerAgreementEndDate;
      } else if (isSeller) {
        agreementStartDate = formData.listingAgreementStartDate;
        agreementEndDate = formData.listingAgreementEndDate;
      }

      const clientData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        client_type: formData.clientType, // 'buyer', 'seller', or 'both'
        phone: formData.phone,
        email: formData.email,
        budget: parseFloat(formData.budget) || 0,
        commission: parseFloat(formData.commission) || 0,
        commission_percentage: formData.commissionType === 'percentage' ? parseFloat(formData.commissionPercentage) || null : null,
        commission_type: formData.commissionType,
        // Primary agreement dates (displayed on card)
        agreement_start_date: agreementStartDate,
        agreement_end_date: agreementEndDate,
        // Buyer-specific agreement dates
        buyer_agreement_start_date: formData.buyerAgreementStartDate,
        buyer_agreement_end_date: formData.buyerAgreementEndDate,
        // Listing/Seller-specific agreement dates
        listing_agreement_start_date: formData.listingAgreementStartDate,
        listing_agreement_end_date: formData.listingAgreementEndDate,
        // Link to listing if seller
        listing_id: formData.listingId,
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
        // Get display label for client type
        const getClientTypeLabel = () => {
          if (formData.clientType === 'both') return 'Buyer & Seller';
          if (formData.clientType === 'seller') return 'Seller';
          return 'Buyer';
        };

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
                Are you representing them as a...
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
                {getClientTypeLabel()}
              </Typography>

              <ToggleButtonGroup
                value={formData.clientType === 'both' ? 'seller' : formData.clientType}
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

      case 'also-buying':
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
                Are you also helping them buy?
              </Typography>

              <Typography
                variant="h4"
                sx={{
                  fontWeight: 900,
                  color: 'white',
                  mb: 1,
                  letterSpacing: '-1px',
                }}
              >
                {formData.alsoHelpingBuy ? 'Yes, Buyer & Seller' : 'No, Seller Only'}
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  color: 'rgba(255,255,255,0.7)',
                  mb: 3,
                }}
              >
                {formData.alsoHelpingBuy
                  ? 'We\'ll set up both a listing agreement and buyer agreement for this client.'
                  : 'We\'ll only set up a listing agreement for this client.'}
              </Typography>

              <ToggleButtonGroup
                value={formData.alsoHelpingBuy ? 'yes' : 'no'}
                exclusive
                onChange={handleAlsoBuyingChange}
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
                <ToggleButton value="yes">
                  <SwapHoriz sx={{ mr: 1, fontSize: 22 }} />
                  Yes, Also Buying
                </ToggleButton>
                <ToggleButton value="no">
                  <Sell sx={{ mr: 1, fontSize: 22 }} />
                  No, Seller Only
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

      case 'commission':
        // Calculate display value for commission
        const getCommissionDisplay = () => {
          if (formData.commissionType === 'percentage') {
            const budget = parseFloat(formData.budget) || 0;
            const percentage = parseFloat(formData.commissionPercentage) || 0;
            if (!budget) return `${percentage}% (set budget first)`;
            const amount = (budget * percentage) / 100;
            return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
          } else {
            const amount = parseFloat(formData.commission) || 0;
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
                Commission
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
                  value={formData.commission}
                  onChange={handleCommissionValueChange}
                  placeholder="2000"
                />
              )}
            </Box>
          </Box>
        );

      case 'listing':
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
                Link to Listing
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
                {formData.selectedListing
                  ? formData.selectedListing.property_address || formData.selectedListing.display_address || 'Selected Listing'
                  : 'Search Listings'}
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  color: 'rgba(255,255,255,0.7)',
                  mb: 3,
                }}
              >
                Link this seller client to their property listing. You can skip this step if the listing hasn't been created yet.
              </Typography>

              {/* Selected Listing Display */}
              {formData.selectedListing && (
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
                  <Business sx={{ color: 'white', fontSize: 28 }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ color: 'white', fontWeight: 600, fontSize: '0.95rem' }}>
                      {formData.selectedListing.property_address || formData.selectedListing.display_address}
                    </Typography>
                    <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem' }}>
                      {[
                        formData.selectedListing.city,
                        formData.selectedListing.state,
                        formData.selectedListing.zip_code
                      ].filter(Boolean).join(', ')}
                    </Typography>
                  </Box>
                </Box>
              )}

              <Autocomplete
                options={listingOptions}
                getOptionLabel={(option) => option.property_address || option.display_address || 'Unknown'}
                loading={loadingListings}
                inputValue={listingSearchText}
                onInputChange={(e, value) => setListingSearchText(value)}
                onChange={handleListingSelect}
                value={formData.selectedListing}
                isOptionEqualToValue={(option, value) => (option.id || option.listing_id) === (value.id || value.listing_id)}
                noOptionsText={listingSearchText?.length >= 2 ? "No listings found" : "Type to search listings..."}
                renderOption={(props, option) => {
                  const { key, ...otherProps } = props;
                  return (
                    <Box
                      component="li"
                      key={key}
                      {...otherProps}
                      sx={{ py: 1 }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Business sx={{ color: '#8b5cf6', fontSize: 24 }} />
                        <Box>
                          <Typography sx={{ fontWeight: 600, fontSize: '0.9rem' }}>
                            {option.property_address || option.display_address}
                          </Typography>
                          <Typography sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                            {[option.city, option.state].filter(Boolean).join(', ')}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  );
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Search by address..."
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {loadingListings ? <CircularProgress color="inherit" size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </>
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
                        '&::placeholder': { color: 'rgba(255,255,255,0.5)', opacity: 1 },
                      },
                    }}
                  />
                )}
                slotProps={{
                  paper: {
                    sx: {
                      backgroundColor: '#fff',
                      borderRadius: 2,
                      mt: 1,
                      boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                    },
                  },
                }}
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
                Optional - you can link a listing later
              </Typography>
            </Box>
          </Box>
        );

      case 'listing-agreement-dates':
        return (
          <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <Box sx={{ width: '100%', maxWidth: 300, display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Typography
                variant="caption"
                sx={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: 'rgba(255,255,255,0.9)',
                  mb: -2,
                  display: 'block',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  textAlign: 'center',
                }}
              >
                Listing Agreement Dates
              </Typography>
              <DateSetter
                label="Listing Agreement Start"
                value={formData.listingAgreementStartDate}
                onChange={handleListingAgreementStartDate}
                color="#f59e0b"
                showCurrentValue={false}
              />
              <DateSetter
                label="Listing Agreement Expiration"
                value={formData.listingAgreementEndDate}
                onChange={handleListingAgreementEndDate}
                color="#ef4444"
                minDate={formData.listingAgreementStartDate}
                showCurrentValue={false}
              />
            </Box>
          </Box>
        );

      case 'buyer-agreement-dates':
        return (
          <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <Box sx={{ width: '100%', maxWidth: 300, display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Typography
                variant="caption"
                sx={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: 'rgba(255,255,255,0.9)',
                  mb: -2,
                  display: 'block',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  textAlign: 'center',
                }}
              >
                Buyer Agreement Dates
              </Typography>
              <DateSetter
                label="Buyer Agreement Start"
                value={formData.buyerAgreementStartDate}
                onChange={handleBuyerAgreementStartDate}
                color="#8b5cf6"
                showCurrentValue={false}
              />
              <DateSetter
                label="Buyer Agreement Expiration"
                value={formData.buyerAgreementEndDate}
                onChange={handleBuyerAgreementEndDate}
                color="#f59e0b"
                minDate={formData.buyerAgreementStartDate}
                showCurrentValue={false}
              />
            </Box>
          </Box>
        );

      case 'preview':
        // Determine primary agreement dates for display
        const previewAgreementStart = isBuyer ? formData.buyerAgreementStartDate : formData.listingAgreementStartDate;
        const previewAgreementEnd = isBuyer ? formData.buyerAgreementEndDate : formData.listingAgreementEndDate;

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
          commission: parseFloat(formData.commission) || 0,
          commission_percentage: formData.commissionType === 'percentage' ? parseFloat(formData.commissionPercentage) || null : null,
          commissionPercentage: formData.commissionType === 'percentage' ? parseFloat(formData.commissionPercentage) || null : null,
          commission_type: formData.commissionType,
          commissionType: formData.commissionType,
          agreementStartDate: previewAgreementStart,
          agreementEndDate: previewAgreementEnd,
          agreement_start_date: previewAgreementStart,
          agreement_end_date: previewAgreementEnd,
          // Store all agreement dates
          buyer_agreement_start_date: formData.buyerAgreementStartDate,
          buyer_agreement_end_date: formData.buyerAgreementEndDate,
          listing_agreement_start_date: formData.listingAgreementStartDate,
          listing_agreement_end_date: formData.listingAgreementEndDate,
          listing_id: formData.listingId,
          client_status: 'active',
          stage: 'New',
          lifetime_value: parseFloat(formData.commission) || 0,
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

                  if (updatedClient.commission !== undefined) {
                    newFormData.commission = updatedClient.commission.toString();
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
