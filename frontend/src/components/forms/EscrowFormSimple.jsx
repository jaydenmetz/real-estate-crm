import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Box,
  Typography,
  IconButton,
  InputAdornment,
  MenuItem,
  Collapse,
  FormControlLabel,
  Switch,
  Divider,
  Chip,
} from '@mui/material';
import {
  Close,
  Home,
  AttachMoney,
  Person,
  CalendarToday,
  ExpandMore,
  Email,
  Phone,
  BusinessCenter,
  Percent,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useForm, Controller } from 'react-hook-form';
import { addDays } from 'date-fns';
import { safeFormatDate } from '../../utils/safeDateUtils';

const EscrowFormSimple = ({ open, onClose, onSubmit, loading = false }) => {
  const [showAdditionalDetails, setShowAdditionalDetails] = useState(false);
  
  const { control, handleSubmit, reset, watch, formState: { errors } } = useForm({
    defaultValues: {
      street: '',
      city: '',
      state: 'CA',
      zipCode: '',
      purchasePrice: '',
      buyerName: '',
      buyerEmail: '',
      buyerPhone: '',
      sellerName: '',
      sellerEmail: '',
      sellerPhone: '',
      acceptanceDate: new Date(),
      closingDate: addDays(new Date(), 30), // Default to 30 days from now
      // Additional Details with defaults
      earnestMoneyDeposit: '',
      downPaymentPercent: '20',
      commissionPercent: '2.5',
      escrowCompany: '',
      escrowOfficer: '',
      titleCompany: '',
      lender: '',
      listingAgentName: 'You',
      listingAgentEmail: '',
      listingAgentPhone: '',
      buyerAgentName: '',
      buyerAgentEmail: '',
      buyerAgentPhone: '',
      buyerAgentBrokerage: '',
    }
  });
  
  const purchasePrice = watch('purchasePrice');
  const downPaymentPercent = watch('downPaymentPercent');
  const commissionPercent = watch('commissionPercent');

  // Reset form when dialog opens
  React.useEffect(() => {
    if (open) {
      reset();
      setShowAdditionalDetails(false);
    }
  }, [open, reset]);

  const handleFormSubmit = (data) => {
    // Format the data to match API requirements
    const fullAddress = `${data.street.trim()}, ${data.city.trim()}, ${data.state.trim()} ${data.zipCode.trim()}`;
    
    // Calculate financial values with defaults
    const price = parseFloat(data.purchasePrice) || 0;
    const earnestMoney = data.earnestMoneyDeposit ? parseFloat(data.earnestMoneyDeposit) : price * 0.01;
    const downPaymentPct = parseFloat(data.downPaymentPercent) || 20;
    const downPayment = price * (downPaymentPct / 100);
    const loanAmount = price - downPayment;
    const commissionPct = parseFloat(data.commissionPercent) || 2.5;
    const grossCommission = price * (commissionPct / 100);
    const netCommission = grossCommission * 0.9; // 90% after broker split
    
    const formattedData = {
      propertyAddress: fullAddress,
      purchasePrice: price,
      buyers: [{
        name: data.buyerName.trim(),
        email: data.buyerEmail?.trim() || '',
        phone: data.buyerPhone?.trim() || ''
      }],
      sellers: [{
        name: data.sellerName.trim(),
        email: data.sellerEmail?.trim() || '',
        phone: data.sellerPhone?.trim() || ''
      }],
      acceptanceDate: safeFormatDate(data.acceptanceDate, 'yyyy-MM-dd'),
      closingDate: safeFormatDate(data.closingDate, 'yyyy-MM-dd'),
      // Include additional details if provided
      earnestMoneyDeposit: earnestMoney,
      downPayment: downPayment,
      loanAmount: loanAmount,
      commissionPercentage: commissionPct,
      grossCommission: grossCommission,
      netCommission: netCommission,
      escrowCompany: data.escrowCompany?.trim() || '',
      escrowOfficer: data.escrowOfficer?.trim() || '',
      titleCompany: data.titleCompany?.trim() || '',
      lender: data.lender?.trim() || '',
      listingAgent: {
        name: data.listingAgentName?.trim() || 'You',
        email: data.listingAgentEmail?.trim() || '',
        phone: data.listingAgentPhone?.trim() || '',
        commission: grossCommission * 0.5
      },
      buyerAgent: data.buyerAgentName ? {
        name: data.buyerAgentName.trim(),
        email: data.buyerAgentEmail?.trim() || '',
        phone: data.buyerAgentPhone?.trim() || '',
        brokerage: data.buyerAgentBrokerage?.trim() || '',
        commission: grossCommission * 0.5
      } : null
    };
    
    onSubmit(formattedData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            Create New Escrow
          </Typography>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Start with the basics. Toggle "Additional Details" below for financial calculations and agent information.
          </Typography>
          
          <Grid container spacing={3}>
            {/* Property Address Fields */}
            <Grid item xs={12}>
              <Controller
                name="street"
                control={control}
                rules={{ required: 'Street address is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Street Address"
                    fullWidth
                    required
                    error={!!errors.street}
                    helperText={errors.street?.message}
                    placeholder="123 Main St"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Home />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={5}>
              <Controller
                name="city"
                control={control}
                rules={{ required: 'City is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="City"
                    fullWidth
                    required
                    error={!!errors.city}
                    helperText={errors.city?.message}
                    placeholder="San Diego"
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={3}>
              <Controller
                name="state"
                control={control}
                rules={{ required: 'State is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="State"
                    fullWidth
                    required
                    select
                    error={!!errors.state}
                    helperText={errors.state?.message}
                  >
                    <MenuItem value="CA">CA</MenuItem>
                    <MenuItem value="AZ">AZ</MenuItem>
                    <MenuItem value="NV">NV</MenuItem>
                    <MenuItem value="OR">OR</MenuItem>
                    <MenuItem value="WA">WA</MenuItem>
                    <MenuItem value="TX">TX</MenuItem>
                    <MenuItem value="FL">FL</MenuItem>
                  </TextField>
                )}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <Controller
                name="zipCode"
                control={control}
                rules={{ 
                  required: 'ZIP code is required',
                  pattern: {
                    value: /^\d{5}(-\d{4})?$/,
                    message: 'Invalid ZIP code'
                  }
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="ZIP Code"
                    fullWidth
                    required
                    error={!!errors.zipCode}
                    helperText={errors.zipCode?.message}
                    placeholder="92101"
                  />
                )}
              />
            </Grid>

            {/* Purchase Price */}
            <Grid item xs={12}>
              <Controller
                name="purchasePrice"
                control={control}
                rules={{ 
                  required: 'Purchase price is required',
                  min: { value: 1, message: 'Must be greater than 0' },
                  pattern: {
                    value: /^\d+(\.\d{0,2})?$/,
                    message: 'Enter a valid price'
                  }
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Purchase Price"
                    type="number"
                    fullWidth
                    required
                    error={!!errors.purchasePrice}
                    helperText={errors.purchasePrice?.message}
                    placeholder="500000"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <AttachMoney />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />
            </Grid>

            {/* Buyer Section */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Buyer Information</Typography>
            </Grid>
            <Grid item xs={12} sm={showAdditionalDetails ? 4 : 6}>
              <Controller
                name="buyerName"
                control={control}
                rules={{ required: 'Buyer name is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Buyer Name"
                    fullWidth
                    required
                    error={!!errors.buyerName}
                    helperText={errors.buyerName?.message}
                    placeholder="John Doe"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />
            </Grid>
            
            {showAdditionalDetails && (
              <>
                <Grid item xs={12} sm={4}>
                  <Controller
                    name="buyerEmail"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Buyer Email"
                        fullWidth
                        placeholder="buyer@email.com"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Email />
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Controller
                    name="buyerPhone"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Buyer Phone"
                        fullWidth
                        placeholder="(555) 123-4567"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Phone />
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  />
                </Grid>
              </>
            )}

            {/* Seller Section */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Seller Information</Typography>
            </Grid>
            <Grid item xs={12} sm={showAdditionalDetails ? 4 : 6}>
              <Controller
                name="sellerName"
                control={control}
                rules={{ required: 'Seller name is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Seller Name"
                    fullWidth
                    required
                    error={!!errors.sellerName}
                    helperText={errors.sellerName?.message}
                    placeholder="Jane Smith"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />
            </Grid>
            
            {showAdditionalDetails && (
              <>
                <Grid item xs={12} sm={4}>
                  <Controller
                    name="sellerEmail"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Seller Email"
                        fullWidth
                        placeholder="seller@email.com"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Email />
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Controller
                    name="sellerPhone"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Seller Phone"
                        fullWidth
                        placeholder="(555) 987-6543"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Phone />
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  />
                </Grid>
              </>
            )}

            {/* Acceptance Date */}
            <Grid item xs={12} sm={6}>
              <Controller
                name="acceptanceDate"
                control={control}
                rules={{ required: 'Acceptance date is required' }}
                render={({ field }) => (
                  <DatePicker
                    {...field}
                    label="Acceptance Date"
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        required: true,
                        error: !!errors.acceptanceDate,
                        helperText: errors.acceptanceDate?.message,
                        InputProps: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <CalendarToday />
                            </InputAdornment>
                          ),
                        },
                      },
                    }}
                  />
                )}
              />
            </Grid>

            {/* Closing Date */}
            <Grid item xs={12} sm={6}>
              <Controller
                name="closingDate"
                control={control}
                rules={{ required: 'Closing date is required' }}
                render={({ field }) => (
                  <DatePicker
                    {...field}
                    label="Closing Date"
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        required: true,
                        error: !!errors.closingDate,
                        helperText: errors.closingDate?.message || 'Typically 30-45 days from acceptance',
                        InputProps: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <CalendarToday />
                            </InputAdornment>
                          ),
                        },
                      },
                    }}
                  />
                )}
              />
            </Grid>
            
            {/* Additional Details Toggle */}
            <Grid item xs={12}>
              <Box sx={{ mt: 2, mb: 1 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={showAdditionalDetails}
                      onChange={(e) => setShowAdditionalDetails(e.target.checked)}
                      color="primary"
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography>Additional Details</Typography>
                      <Chip 
                        label="Optional" 
                        size="small" 
                        variant="outlined"
                        color="primary"
                      />
                    </Box>
                  }
                />
              </Box>
            </Grid>
            
            {/* Additional Details Section */}
            <Collapse in={showAdditionalDetails} sx={{ width: '100%' }}>
              <Grid container spacing={3} sx={{ mt: 0 }}>
                <Grid item xs={12}>
                  <Divider sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Financial Details
                    </Typography>
                  </Divider>
                </Grid>
                
                {/* Financial Fields */}
                <Grid item xs={12} sm={4}>
                  <Controller
                    name="earnestMoneyDeposit"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Earnest Money"
                        type="number"
                        fullWidth
                        placeholder={purchasePrice ? (parseFloat(purchasePrice) * 0.01).toFixed(0) : '5000'}
                        helperText="Default: 1% of purchase price"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <AttachMoney />
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  />
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <Controller
                    name="downPaymentPercent"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Down Payment %"
                        type="number"
                        fullWidth
                        helperText={purchasePrice && downPaymentPercent ? 
                          `$${(parseFloat(purchasePrice) * parseFloat(downPaymentPercent) / 100).toLocaleString()}` : 
                          'Default: 20%'
                        }
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Percent />
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  />
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <Controller
                    name="commissionPercent"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Commission %"
                        type="number"
                        fullWidth
                        helperText={purchasePrice && commissionPercent ? 
                          `$${(parseFloat(purchasePrice) * parseFloat(commissionPercent) / 100).toLocaleString()} total` : 
                          'Default: 2.5%'
                        }
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Percent />
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Divider sx={{ mb: 2, mt: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Professional Contacts
                    </Typography>
                  </Divider>
                </Grid>
                
                {/* Professional Contacts */}
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="escrowCompany"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Escrow Company"
                        fullWidth
                        placeholder="ABC Escrow Services"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <BusinessCenter />
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="escrowOfficer"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Escrow Officer"
                        fullWidth
                        placeholder="Linda Thompson"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Person />
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="titleCompany"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Title Company"
                        fullWidth
                        placeholder="First American Title"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <BusinessCenter />
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="lender"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Lender"
                        fullWidth
                        placeholder="Wells Fargo Home Mortgage"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <BusinessCenter />
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Divider sx={{ mb: 2, mt: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Agent Information
                    </Typography>
                  </Divider>
                </Grid>
                
                {/* Listing Agent (You) */}
                <Grid item xs={12}>
                  <Typography variant="body2" sx={{ mb: 1 }}>Listing Agent (You)</Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Controller
                    name="listingAgentName"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Your Name"
                        fullWidth
                        placeholder="Your name"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Person />
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Controller
                    name="listingAgentEmail"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Your Email"
                        fullWidth
                        placeholder="you@realestate.com"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Email />
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Controller
                    name="listingAgentPhone"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Your Phone"
                        fullWidth
                        placeholder="(555) 123-4567"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Phone />
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  />
                </Grid>
                
                {/* Buyer's Agent */}
                <Grid item xs={12}>
                  <Typography variant="body2" sx={{ mb: 1 }}>Buyer's Agent</Typography>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Controller
                    name="buyerAgentName"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Agent Name"
                        fullWidth
                        placeholder="Agent name"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Person />
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Controller
                    name="buyerAgentEmail"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Agent Email"
                        fullWidth
                        placeholder="agent@email.com"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Email />
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Controller
                    name="buyerAgentPhone"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Agent Phone"
                        fullWidth
                        placeholder="(555) 987-6543"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Phone />
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Controller
                    name="buyerAgentBrokerage"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Brokerage"
                        fullWidth
                        placeholder="RE/MAX"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <BusinessCenter />
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </Collapse>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={loading}
            startIcon={loading ? null : <Home />}
          >
            {loading ? 'Creating...' : 'Create Escrow'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EscrowFormSimple;