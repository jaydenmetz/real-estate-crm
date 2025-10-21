import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  InputAdornment,
  MenuItem,
  Autocomplete,
  CircularProgress,
} from '@mui/material';
import {
  Close,
  ArrowForward,
  ArrowBack,
  Home,
  AttachMoney,
  People,
  Schedule,
  TrendingUp,
  CheckCircle,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { DatePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { escrowsAPI } from '../../services/api.service';

// Modern, clean modal design (inspired by Linear/Stripe)
const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: theme.spacing(2),
    maxWidth: 600,
    width: '100%',
    maxHeight: '90vh',
  },
}));

const Header = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3, 3, 2),
  borderBottom: `1px solid ${theme.palette.divider}`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
}));

const Content = styled(Box)(({ theme }) => ({
  padding: theme.spacing(4),
  minHeight: 400,
  display: 'flex',
  flexDirection: 'column',
}));

const Footer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2, 3),
  borderTop: `1px solid ${theme.palette.divider}`,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}));

const StepIcon = styled(Box)(({ theme, active }) => ({
  width: 40,
  height: 40,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: active ? theme.palette.primary.main : theme.palette.grey[200],
  color: active ? 'white' : theme.palette.text.secondary,
  marginBottom: theme.spacing(2),
}));

const STEPS = [
  { label: 'Property', icon: Home },
  { label: 'Details', icon: AttachMoney },
  { label: 'People', icon: People },
  { label: 'Timeline', icon: Schedule },
  { label: 'Commission', icon: TrendingUp },
];

const NewEscrowModal = ({ open, onClose, onSuccess }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [addressLoading, setAddressLoading] = useState(false);
  const [addressOptions, setAddressOptions] = useState([]);

  // Form data
  const [formData, setFormData] = useState({
    // Step 1: Property
    propertyAddress: '',
    city: '',
    state: 'CA',
    zipCode: '',

    // Step 2: Details
    purchasePrice: '',
    closingDate: null,
    escrowNumber: '',
    side: 'buyer', // buyer or listing

    // Step 3: People
    buyerName: '',
    buyerEmail: '',
    buyerPhone: '',
    sellerName: '',
    sellerEmail: '',
    sellerPhone: '',

    // Step 4: Timeline
    acceptanceDate: null,
    homeInspectionDate: null,
    appraisalDate: null,

    // Step 5: Commission
    commissionRate: 3.0,
    splitPercentage: 80,
  });

  // Google Places Autocomplete simulation (you can integrate real Google Places API)
  const handleAddressSearch = async (value) => {
    if (value.length < 3) {
      setAddressOptions([]);
      return;
    }

    setAddressLoading(true);

    // TODO: Integrate real Google Places API
    // For now, mock some addresses
    setTimeout(() => {
      setAddressOptions([
        { address: '123 Main St, Bakersfield, CA 93301' },
        { address: '456 Oak Ave, Bakersfield, CA 93304' },
        { address: '789 Pine Rd, Tehachapi, CA 93561' },
      ]);
      setAddressLoading(false);
    }, 500);
  };

  const handleAddressSelect = (value) => {
    if (value) {
      const parts = value.split(', ');
      setFormData({
        ...formData,
        propertyAddress: parts[0] || '',
        city: parts[1] || '',
        state: parts[2]?.split(' ')[0] || 'CA',
        zipCode: parts[2]?.split(' ')[1] || '',
      });
    }
  };

  const handleNext = () => {
    if (activeStep < STEPS.length - 1) {
      setActiveStep(activeStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const escrowData = {
        property_address: formData.propertyAddress,
        city: formData.city,
        state: formData.state,
        zip_code: formData.zipCode,
        purchase_price: parseFloat(formData.purchasePrice),
        closing_date: formData.closingDate,
        escrow_number: formData.escrowNumber || `ESC-${Date.now()}`,
        escrow_status: 'pending',
        side: formData.side,

        // People
        people: {
          buyer: {
            name: formData.buyerName,
            email: formData.buyerEmail,
            phone: formData.buyerPhone,
          },
          seller: {
            name: formData.sellerName,
            email: formData.sellerEmail,
            phone: formData.sellerPhone,
          },
        },

        // Timeline
        timeline: {
          acceptanceDate: formData.acceptanceDate,
          homeInspectionDate: formData.homeInspectionDate,
          appraisalDate: formData.appraisalDate,
          coeDate: formData.closingDate,
        },

        // Financials
        financials: {
          commissionRate: formData.commissionRate,
          splitPercentage: formData.splitPercentage,
          grossCommission: parseFloat(formData.purchasePrice) * (formData.commissionRate / 100),
        },
      };

      const response = await escrowsAPI.create(escrowData);

      if (response.success) {
        onSuccess(response.data);
        onClose();
        // Reset form
        setActiveStep(0);
        setFormData({
          propertyAddress: '',
          city: '',
          state: 'CA',
          zipCode: '',
          purchasePrice: '',
          closingDate: null,
          escrowNumber: '',
          side: 'buyer',
          buyerName: '',
          buyerEmail: '',
          buyerPhone: '',
          sellerName: '',
          sellerEmail: '',
          sellerPhone: '',
          acceptanceDate: null,
          homeInspectionDate: null,
          appraisalDate: null,
          commissionRate: 3.0,
          splitPercentage: 80,
        });
      }
    } catch (error) {
      console.error('Error creating escrow:', error);
      alert('Failed to create escrow. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isStepValid = () => {
    switch (activeStep) {
      case 0: // Property
        return formData.propertyAddress && formData.city && formData.zipCode;
      case 1: // Details
        return formData.purchasePrice && formData.closingDate;
      case 2: // People
        return formData.buyerName && formData.sellerName;
      case 3: // Timeline
        return formData.acceptanceDate;
      case 4: // Commission
        return formData.commissionRate > 0;
      default:
        return false;
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0: // Property Address
        return (
          <Box>
            <StepIcon active>
              <Home />
            </StepIcon>
            <Typography variant="h5" fontWeight="700" gutterBottom>
              Where's the property?
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
              Start typing the address and we'll help you autocomplete
            </Typography>

            <Autocomplete
              freeSolo
              options={addressOptions.map(opt => opt.address)}
              loading={addressLoading}
              onInputChange={(e, value) => handleAddressSearch(value)}
              onChange={(e, value) => handleAddressSelect(value)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Property Address"
                  placeholder="123 Main St, Bakersfield, CA 93301"
                  fullWidth
                  autoFocus
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {addressLoading ? <CircularProgress size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                  sx={{ mb: 3 }}
                />
              )}
            />

            <Box display="grid" gridTemplateColumns="2fr 1fr 1fr" gap={2}>
              <TextField
                label="City"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                fullWidth
              />
              <TextField
                label="State"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                fullWidth
              />
              <TextField
                label="ZIP"
                value={formData.zipCode}
                onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                fullWidth
              />
            </Box>
          </Box>
        );

      case 1: // Basic Details
        return (
          <Box>
            <StepIcon active>
              <AttachMoney />
            </StepIcon>
            <Typography variant="h5" fontWeight="700" gutterBottom>
              Deal Details
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
              Just the essentials to get started
            </Typography>

            <TextField
              label="Purchase Price"
              value={formData.purchasePrice}
              onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
              fullWidth
              type="number"
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
              sx={{ mb: 3 }}
            />

            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Closing Date"
                value={formData.closingDate}
                onChange={(date) => setFormData({ ...formData, closingDate: date })}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    sx: { mb: 3 },
                  },
                }}
              />
            </LocalizationProvider>

            <TextField
              label="Escrow Number (Optional)"
              value={formData.escrowNumber}
              onChange={(e) => setFormData({ ...formData, escrowNumber: e.target.value })}
              placeholder="Auto-generated if left blank"
              fullWidth
              sx={{ mb: 3 }}
            />

            <TextField
              label="Which side are you on?"
              value={formData.side}
              onChange={(e) => setFormData({ ...formData, side: e.target.value })}
              select
              fullWidth
            >
              <MenuItem value="buyer">Buyer's Agent</MenuItem>
              <MenuItem value="listing">Listing Agent</MenuItem>
            </TextField>
          </Box>
        );

      case 2: // People
        return (
          <Box>
            <StepIcon active>
              <People />
            </StepIcon>
            <Typography variant="h5" fontWeight="700" gutterBottom>
              Key Contacts
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
              Add the buyer and seller (you can add more people later)
            </Typography>

            <Typography variant="subtitle2" fontWeight="600" sx={{ mb: 2 }}>
              Buyer
            </Typography>
            <TextField
              label="Buyer Name"
              value={formData.buyerName}
              onChange={(e) => setFormData({ ...formData, buyerName: e.target.value })}
              fullWidth
              sx={{ mb: 2 }}
            />
            <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2} mb={4}>
              <TextField
                label="Email (Optional)"
                value={formData.buyerEmail}
                onChange={(e) => setFormData({ ...formData, buyerEmail: e.target.value })}
                type="email"
              />
              <TextField
                label="Phone (Optional)"
                value={formData.buyerPhone}
                onChange={(e) => setFormData({ ...formData, buyerPhone: e.target.value })}
                type="tel"
              />
            </Box>

            <Typography variant="subtitle2" fontWeight="600" sx={{ mb: 2 }}>
              Seller
            </Typography>
            <TextField
              label="Seller Name"
              value={formData.sellerName}
              onChange={(e) => setFormData({ ...formData, sellerName: e.target.value })}
              fullWidth
              sx={{ mb: 2 }}
            />
            <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
              <TextField
                label="Email (Optional)"
                value={formData.sellerEmail}
                onChange={(e) => setFormData({ ...formData, sellerEmail: e.target.value })}
                type="email"
              />
              <TextField
                label="Phone (Optional)"
                value={formData.sellerPhone}
                onChange={(e) => setFormData({ ...formData, sellerPhone: e.target.value })}
                type="tel"
              />
            </Box>
          </Box>
        );

      case 3: // Timeline
        return (
          <Box>
            <StepIcon active>
              <Schedule />
            </StepIcon>
            <Typography variant="h5" fontWeight="700" gutterBottom>
              Key Dates
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
              Set the critical milestones (you can add more later)
            </Typography>

            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Acceptance Date *"
                value={formData.acceptanceDate}
                onChange={(date) => setFormData({ ...formData, acceptanceDate: date })}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    sx: { mb: 3 },
                  },
                }}
              />

              <DatePicker
                label="Home Inspection (Optional)"
                value={formData.homeInspectionDate}
                onChange={(date) => setFormData({ ...formData, homeInspectionDate: date })}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    sx: { mb: 3 },
                  },
                }}
              />

              <DatePicker
                label="Appraisal (Optional)"
                value={formData.appraisalDate}
                onChange={(date) => setFormData({ ...formData, appraisalDate: date })}
                slotProps={{
                  textField: {
                    fullWidth: true,
                  },
                }}
              />
            </LocalizationProvider>
          </Box>
        );

      case 4: // Commission
        return (
          <Box>
            <StepIcon active>
              <TrendingUp />
            </StepIcon>
            <Typography variant="h5" fontWeight="700" gutterBottom>
              Commission Setup
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
              We'll calculate your net income automatically
            </Typography>

            <TextField
              label="Commission Rate"
              value={formData.commissionRate}
              onChange={(e) => setFormData({ ...formData, commissionRate: parseFloat(e.target.value) })}
              fullWidth
              type="number"
              InputProps={{
                endAdornment: <InputAdornment position="end">%</InputAdornment>,
              }}
              sx={{ mb: 3 }}
            />

            <TextField
              label="Your Split Percentage"
              value={formData.splitPercentage}
              onChange={(e) => setFormData({ ...formData, splitPercentage: parseFloat(e.target.value) })}
              fullWidth
              type="number"
              InputProps={{
                endAdornment: <InputAdornment position="end">%</InputAdornment>,
              }}
              helperText="How much of the commission do you keep?"
              sx={{ mb: 3 }}
            />

            {formData.purchasePrice && formData.commissionRate && (
              <Box
                sx={{
                  p: 3,
                  backgroundColor: 'success.main',
                  color: 'white',
                  borderRadius: 2,
                }}
              >
                <Typography variant="caption" sx={{ opacity: 0.9 }}>
                  Estimated Net Income
                </Typography>
                <Typography variant="h4" fontWeight="700">
                  $
                  {(
                    (parseFloat(formData.purchasePrice) *
                      (formData.commissionRate / 100) *
                      (formData.splitPercentage / 100)) -
                    285 -
                    250
                  ).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8, mt: 1, display: 'block' }}>
                  After transaction fees ($285) and TC fee ($250)
                </Typography>
              </Box>
            )}
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <StyledDialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <Header>
        <Box>
          <Typography variant="h6" fontWeight="700">
            New Escrow
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Step {activeStep + 1} of {STEPS.length}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </Header>

      <DialogContent sx={{ p: 0 }}>
        {/* Progress Stepper */}
        <Box sx={{ px: 3, pt: 3, pb: 1 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {STEPS.map((step, index) => (
              <Step key={step.label}>
                <StepLabel>{step.label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        {/* Step Content */}
        <Content>{renderStepContent()}</Content>
      </DialogContent>

      <Footer>
        <Button
          onClick={handleBack}
          disabled={activeStep === 0}
          startIcon={<ArrowBack />}
        >
          Back
        </Button>

        <Button
          variant="contained"
          onClick={handleNext}
          disabled={!isStepValid() || loading}
          endIcon={activeStep === STEPS.length - 1 ? <CheckCircle /> : <ArrowForward />}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : activeStep === STEPS.length - 1 ? (
            'Create Escrow'
          ) : (
            'Next'
          )}
        </Button>
      </Footer>
    </StyledDialog>
  );
};

export default NewEscrowModal;
