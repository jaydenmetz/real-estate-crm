import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Grid,
  MenuItem,
  Alert,
  CircularProgress,
  InputAdornment,
  Divider,
  IconButton,
  Typography,
  Autocomplete,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  Close,
  Home,
  AttachMoney,
  CalendarToday,
  Person,
  BusinessCenter,
  AccountBalance,
  Groups,
  LocationOn,
  Add,
} from '@mui/icons-material';
import { escrowsAPI } from '../../services/api.service.service.service';
import { debounce } from 'lodash';

const NewEscrowModal = ({ open, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeStep, setActiveStep] = useState(0);
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [loadingAddress, setLoadingAddress] = useState(false);
  const addressInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    // Property Info
    propertyAddress: '',
    city: '',
    state: 'CA',
    zipCode: '',
    county: '',
    purchasePrice: '',
    myCommission: '',
    acceptanceDate: new Date(),
    scheduledCoeDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    escrowStatus: 'Active',
    myRole: 'Listing Agent',
    
    // Buyer Side
    buyerName: '',
    buyerEmail: '',
    buyerPhone: '',
    buyerAgentName: '',
    buyerAgentEmail: '',
    buyerAgentPhone: '',
    buyerAgentBrokerage: '',
    
    // Seller Side
    sellerName: '',
    sellerEmail: '',
    sellerPhone: '',
    sellerAgentName: '',
    sellerAgentEmail: '',
    sellerAgentPhone: '',
    sellerAgentBrokerage: '',
    
    // Lender
    lenderName: '',
    lenderCompany: '',
    lenderEmail: '',
    lenderPhone: '',
    
    // Escrow Officer
    escrowOfficerName: '',
    escrowCompany: '',
    escrowOfficerEmail: '',
    escrowOfficerPhone: '',
    escrowNumber: '',
    
    // Vendors
    vendors: [],
  });

  const steps = ['Property & Parties', 'Lender & Escrow'];

  const handleChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.value,
    });
  };

  // Fetch address suggestions from Nominatim
  const fetchAddressSuggestions = debounce(async (input) => {
    if (input.length < 3) {
      setAddressSuggestions([]);
      return;
    }

    setLoadingAddress(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
        `q=${encodeURIComponent(input)}&` +
        `format=json&` +
        `countrycodes=us&` +
        `limit=5&` +
        `addressdetails=1`
      );
      
      const data = await response.json();
      const suggestions = data.map(item => ({
        label: item.display_name,
        value: {
          address: item.address?.house_number ? 
            `${item.address.house_number} ${item.address.road || ''}`.trim() : 
            item.address?.road || '',
          city: item.address?.city || item.address?.town || item.address?.village || '',
          state: item.address?.state || 'CA',
          zipCode: item.address?.postcode || '',
          county: item.address?.county || '',
          lat: item.lat,
          lon: item.lon,
        }
      }));
      
      setAddressSuggestions(suggestions);
    } catch (error) {
      console.error('Error fetching address suggestions:', error);
    } finally {
      setLoadingAddress(false);
    }
  }, 300);

  const handleAddressSelect = (event, value) => {
    if (value && value.value) {
      setFormData({
        ...formData,
        propertyAddress: value.value.address,
        city: value.value.city,
        state: value.value.state,
        zipCode: value.value.zipCode,
        county: value.value.county,
      });
    }
  };

  const addVendor = () => {
    setFormData({
      ...formData,
      vendors: [
        ...formData.vendors,
        { name: '', company: '', email: '', phone: '', type: 'Inspector' }
      ]
    });
  };

  const updateVendor = (index, field, value) => {
    const updatedVendors = [...formData.vendors];
    updatedVendors[index][field] = value;
    setFormData({ ...formData, vendors: updatedVendors });
  };

  const removeVendor = (index) => {
    const updatedVendors = formData.vendors.filter((_, i) => i !== index);
    setFormData({ ...formData, vendors: updatedVendors });
  };

  const handleDateChange = (field) => (date) => {
    setFormData({
      ...formData,
      [field]: date,
    });
  };

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Calculate commission if not provided
      const commission = formData.myCommission || (parseFloat(formData.purchasePrice) * 0.025);

      const escrowData = {
        // Property
        propertyAddress: formData.propertyAddress,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        county: formData.county,
        purchasePrice: parseFloat(formData.purchasePrice),
        myCommission: parseFloat(commission),
        acceptanceDate: formData.acceptanceDate.toISOString(),
        scheduledCoeDate: formData.scheduledCoeDate.toISOString(),
        escrowStatus: formData.escrowStatus,
        myRole: formData.myRole,
        
        // Parties
        buyer: {
          name: formData.buyerName,
          email: formData.buyerEmail,
          phone: formData.buyerPhone,
        },
        buyerAgent: {
          name: formData.buyerAgentName,
          email: formData.buyerAgentEmail,
          phone: formData.buyerAgentPhone,
          brokerage: formData.buyerAgentBrokerage,
        },
        seller: {
          name: formData.sellerName,
          email: formData.sellerEmail,
          phone: formData.sellerPhone,
        },
        sellerAgent: {
          name: formData.sellerAgentName,
          email: formData.sellerAgentEmail,
          phone: formData.sellerAgentPhone,
          brokerage: formData.sellerAgentBrokerage,
        },
        
        // Lender & Escrow
        lender: {
          name: formData.lenderName,
          company: formData.lenderCompany,
          email: formData.lenderEmail,
          phone: formData.lenderPhone,
        },
        escrowOfficer: {
          name: formData.escrowOfficerName,
          company: formData.escrowCompany,
          email: formData.escrowOfficerEmail,
          phone: formData.escrowOfficerPhone,
          escrowNumber: formData.escrowNumber,
        },
        vendors: formData.vendors,
      };

      const response = await escrowsAPI.create(escrowData);

      if (response.success) {
        // Call success callback with the new escrow ID
        if (onSuccess) {
          onSuccess(response.data.id);
        }
        handleClose();
      } else {
        setError(response.error?.message || 'Failed to create escrow');
      }
    } catch (err) {
      console.error('Error creating escrow:', err);
      setError('An error occurred while creating the escrow');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      // Reset form
      setFormData({
        propertyAddress: '',
        city: '',
        state: 'CA',
        zipCode: '',
        county: '',
        purchasePrice: '',
        myCommission: '',
        acceptanceDate: new Date(),
        scheduledCoeDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        escrowStatus: 'Active',
        myRole: 'Listing Agent',
        buyerName: '',
        buyerEmail: '',
        buyerPhone: '',
        buyerAgentName: '',
        buyerAgentEmail: '',
        buyerAgentPhone: '',
        buyerAgentBrokerage: '',
        sellerName: '',
        sellerEmail: '',
        sellerPhone: '',
        sellerAgentName: '',
        sellerAgentEmail: '',
        sellerAgentPhone: '',
        sellerAgentBrokerage: '',
        lenderName: '',
        lenderCompany: '',
        lenderEmail: '',
        lenderPhone: '',
        escrowOfficerName: '',
        escrowCompany: '',
        escrowOfficerEmail: '',
        escrowOfficerPhone: '',
        escrowNumber: '',
        vendors: [],
      });
      setError('');
      setActiveStep(0);
      onClose();
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Grid container spacing={3}>
            {/* Property Address with Autofill */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOn color="primary" />
                Property Address
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12}>
              <Autocomplete
                freeSolo
                options={addressSuggestions}
                loading={loadingAddress}
                onInputChange={(event, value) => {
                  setFormData({ ...formData, propertyAddress: value });
                  fetchAddressSuggestions(value);
                }}
                onChange={handleAddressSelect}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Start typing property address..."
                    fullWidth
                    required
                    placeholder="123 Main St, Los Angeles, CA 90001"
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {loadingAddress ? <CircularProgress color="inherit" size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="City"
                value={formData.city}
                onChange={handleChange('city')}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="State"
                value={formData.state}
                onChange={handleChange('state')}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="ZIP Code"
                value={formData.zipCode}
                onChange={handleChange('zipCode')}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="County"
                value={formData.county}
                onChange={handleChange('county')}
              />
            </Grid>

            {/* Transaction Details */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                <AttachMoney color="primary" />
                Transaction Details
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                required
                label="Purchase Price"
                type="number"
                value={formData.purchasePrice}
                onChange={handleChange('purchasePrice')}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="My Commission"
                type="number"
                value={formData.myCommission}
                onChange={handleChange('myCommission')}
                helperText="Leave blank for 2.5%"
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <DatePicker
                label="Acceptance Date"
                value={formData.acceptanceDate}
                onChange={handleDateChange('acceptanceDate')}
                renderInput={(params) => <TextField {...params} fullWidth required />}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <DatePicker
                label="COE Date"
                value={formData.scheduledCoeDate}
                onChange={handleDateChange('scheduledCoeDate')}
                renderInput={(params) => <TextField {...params} fullWidth required />}
              />
            </Grid>

            {/* Two Column Layout for Buyer and Seller */}
            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Person color="primary" />
                    Buyer Side
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Buyer Information
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Buyer Name"
                        value={formData.buyerName}
                        onChange={handleChange('buyerName')}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Email"
                        type="email"
                        value={formData.buyerEmail}
                        onChange={handleChange('buyerEmail')}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Phone"
                        value={formData.buyerPhone}
                        onChange={handleChange('buyerPhone')}
                        size="small"
                      />
                    </Grid>
                    
                    <Grid item xs={12} sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Buyer's Agent
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Agent Name"
                        value={formData.buyerAgentName}
                        onChange={handleChange('buyerAgentName')}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Brokerage"
                        value={formData.buyerAgentBrokerage}
                        onChange={handleChange('buyerAgentBrokerage')}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Email"
                        type="email"
                        value={formData.buyerAgentEmail}
                        onChange={handleChange('buyerAgentEmail')}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Phone"
                        value={formData.buyerAgentPhone}
                        onChange={handleChange('buyerAgentPhone')}
                        size="small"
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Person color="primary" />
                    Seller Side
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Seller Information
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Seller Name"
                        value={formData.sellerName}
                        onChange={handleChange('sellerName')}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Email"
                        type="email"
                        value={formData.sellerEmail}
                        onChange={handleChange('sellerEmail')}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Phone"
                        value={formData.sellerPhone}
                        onChange={handleChange('sellerPhone')}
                        size="small"
                      />
                    </Grid>
                    
                    <Grid item xs={12} sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Seller's Agent (Listing)
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Agent Name"
                        value={formData.sellerAgentName}
                        onChange={handleChange('sellerAgentName')}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Brokerage"
                        value={formData.sellerAgentBrokerage}
                        onChange={handleChange('sellerAgentBrokerage')}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Email"
                        type="email"
                        value={formData.sellerAgentEmail}
                        onChange={handleChange('sellerAgentEmail')}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Phone"
                        value={formData.sellerAgentPhone}
                        onChange={handleChange('sellerAgentPhone')}
                        size="small"
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            {/* Lender Information */}
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AccountBalance color="primary" />
                    Lender Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Lender Name"
                        value={formData.lenderName}
                        onChange={handleChange('lenderName')}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Lender Company"
                        value={formData.lenderCompany}
                        onChange={handleChange('lenderCompany')}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Email"
                        type="email"
                        value={formData.lenderEmail}
                        onChange={handleChange('lenderEmail')}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Phone"
                        value={formData.lenderPhone}
                        onChange={handleChange('lenderPhone')}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Escrow Officer Information */}
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <BusinessCenter color="primary" />
                    Escrow Officer
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Escrow Officer Name"
                        value={formData.escrowOfficerName}
                        onChange={handleChange('escrowOfficerName')}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Escrow Company"
                        value={formData.escrowCompany}
                        onChange={handleChange('escrowCompany')}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Email"
                        type="email"
                        value={formData.escrowOfficerEmail}
                        onChange={handleChange('escrowOfficerEmail')}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Phone"
                        value={formData.escrowOfficerPhone}
                        onChange={handleChange('escrowOfficerPhone')}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Escrow Number"
                        value={formData.escrowNumber}
                        onChange={handleChange('escrowNumber')}
                        placeholder="FTKE-3012500795SAM"
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Vendors */}
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Groups color="primary" />
                      Vendors
                    </Typography>
                    <Button
                      startIcon={<Add />}
                      onClick={addVendor}
                      variant="outlined"
                      size="small"
                    >
                      Add Vendor
                    </Button>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  
                  {formData.vendors.length === 0 ? (
                    <Typography color="text.secondary" align="center" sx={{ py: 3 }}>
                      No vendors added yet. Click "Add Vendor" to add inspectors, appraisers, etc.
                    </Typography>
                  ) : (
                    <Grid container spacing={2}>
                      {formData.vendors.map((vendor, index) => (
                        <Grid item xs={12} key={index}>
                          <Card variant="outlined" sx={{ p: 2 }}>
                            <Grid container spacing={2} alignItems="center">
                              <Grid item xs={12} md={2}>
                                <TextField
                                  fullWidth
                                  select
                                  label="Type"
                                  value={vendor.type}
                                  onChange={(e) => updateVendor(index, 'type', e.target.value)}
                                  size="small"
                                >
                                  <MenuItem value="Inspector">Inspector</MenuItem>
                                  <MenuItem value="Appraiser">Appraiser</MenuItem>
                                  <MenuItem value="Contractor">Contractor</MenuItem>
                                  <MenuItem value="Other">Other</MenuItem>
                                </TextField>
                              </Grid>
                              <Grid item xs={12} md={3}>
                                <TextField
                                  fullWidth
                                  label="Name"
                                  value={vendor.name}
                                  onChange={(e) => updateVendor(index, 'name', e.target.value)}
                                  size="small"
                                />
                              </Grid>
                              <Grid item xs={12} md={3}>
                                <TextField
                                  fullWidth
                                  label="Company"
                                  value={vendor.company}
                                  onChange={(e) => updateVendor(index, 'company', e.target.value)}
                                  size="small"
                                />
                              </Grid>
                              <Grid item xs={12} md={2}>
                                <TextField
                                  fullWidth
                                  label="Email"
                                  type="email"
                                  value={vendor.email}
                                  onChange={(e) => updateVendor(index, 'email', e.target.value)}
                                  size="small"
                                />
                              </Grid>
                              <Grid item xs={12} md={2}>
                                <TextField
                                  fullWidth
                                  label="Phone"
                                  value={vendor.phone}
                                  onChange={(e) => updateVendor(index, 'phone', e.target.value)}
                                  size="small"
                                />
                              </Grid>
                              <Grid item xs="auto">
                                <IconButton
                                  onClick={() => removeVendor(index)}
                                  size="small"
                                  color="error"
                                >
                                  <Close />
                                </IconButton>
                              </Grid>
                            </Grid>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        );

      default:
        return null;
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            maxHeight: '90vh',
          },
        }}
      >
        <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h5" fontWeight="600">
            Create New Escrow
          </Typography>
          <IconButton
            aria-label="close"
            onClick={handleClose}
            disabled={loading}
            sx={{
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>

        <form onSubmit={handleSubmit}>
          <DialogContent dividers sx={{ p: 3 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
                {error}
              </Alert>
            )}

            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {renderStepContent()}
          </DialogContent>

          <DialogActions sx={{ p: 2.5, gap: 1 }}>
            <Button
              variant="outlined"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            {activeStep > 0 && (
              <Button
                onClick={handleBack}
                disabled={loading}
              >
                Back
              </Button>
            )}
            {activeStep < steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleNext}
              >
                Next
              </Button>
            ) : (
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : null}
              >
                {loading ? 'Creating...' : 'Create Escrow'}
              </Button>
            )}
          </DialogActions>
        </form>
      </Dialog>
    </LocalizationProvider>
  );
};

export default NewEscrowModal;