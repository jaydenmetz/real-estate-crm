import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Chip,
  Box,
  Typography,
  InputAdornment,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  IconButton,
  Alert,
  Switch,
} from '@mui/material';
import {
  Home,
  AttachMoney,
  CalendarToday,
  Person,
  Business,
  Add,
  Remove,
  Close,
  Upload,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { format, addDays } from 'date-fns';
import SimpleRPAParser from './SimpleRPAParser';

const EscrowForm = ({ open, onClose, onSubmit, escrow = null, loading = false, mode = 'full' }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formMode, setFormMode] = useState(mode);
  const [showRPAParser, setShowRPAParser] = useState(false);
  
  const { control, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm({
    defaultValues: {
      // Required core fields
      propertyAddress: '',
      purchasePrice: '',
      acceptanceDate: new Date(),
      closingDate: addDays(new Date(), 30),
      buyers: [{ name: '', email: '', phone: '', lender: '', preApproved: false }],
      sellers: [{ name: '', email: '', phone: '' }],
      
      // Optional fields (AI can fill later)
      propertyType: 'Single Family',
      transactionType: 'Purchase',
      escrowCompany: '',
      escrowOfficer: '',
      titleCompany: '',
      lender: '',
      earnestMoneyDeposit: '',
      downPayment: '',
      loanAmount: '',
      commissionPercentage: 2.5,
      listingAgent: {
        name: 'You',
        email: '',
        phone: '',
        commission: ''
      },
      buyerAgent: {
        name: '',
        email: '',
        phone: '',
        brokerage: '',
        commission: ''
      },
      inspectionDeadline: addDays(new Date(), 10),
      appraisalDeadline: addDays(new Date(), 15),
      loanContingencyDeadline: addDays(new Date(), 21),
      notes: ''
    }
  });

  const {
    fields: buyerFields,
    append: appendBuyer,
    remove: removeBuyer
  } = useFieldArray({ control, name: 'buyers' });

  const {
    fields: sellerFields,
    append: appendSeller,
    remove: removeSeller
  } = useFieldArray({ control, name: 'sellers' });

  const watchPurchasePrice = watch('purchasePrice');
  const watchCommissionPercentage = watch('commissionPercentage');

  // Calculate derived values
  useEffect(() => {
    if (watchPurchasePrice && watchCommissionPercentage) {
      const price = parseFloat(watchPurchasePrice);
      const commissionRate = parseFloat(watchCommissionPercentage) / 100;
      const totalCommission = price * commissionRate;
      const agentCommission = totalCommission / 2;
      
      setValue('listingAgent.commission', agentCommission.toString());
      setValue('buyerAgent.commission', agentCommission.toString());
    }
  }, [watchPurchasePrice, watchCommissionPercentage, setValue]);

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      if (escrow) {
        // Edit mode - populate with existing data
        reset(escrow);
      } else {
        // Create mode - reset to defaults
        reset();
      }
      setCurrentStep(0);
      setFormMode(mode);
    }
  }, [open, escrow, mode, reset]);

  const handleFormSubmit = (data) => {
    // Process the form data
    const formattedData = {
      ...data,
      purchasePrice: parseFloat(data.purchasePrice),
      earnestMoneyDeposit: data.earnestMoneyDeposit ? parseFloat(data.earnestMoneyDeposit) : null,
      downPayment: data.downPayment ? parseFloat(data.downPayment) : null,
      loanAmount: data.loanAmount ? parseFloat(data.loanAmount) : null,
      commissionPercentage: parseFloat(data.commissionPercentage),
      acceptanceDate: format(new Date(data.acceptanceDate), 'yyyy-MM-dd'),
      closingDate: format(new Date(data.closingDate), 'yyyy-MM-dd'),
      inspectionDeadline: data.inspectionDeadline ? format(new Date(data.inspectionDeadline), 'yyyy-MM-dd') : null,
      appraisalDeadline: data.appraisalDeadline ? format(new Date(data.appraisalDeadline), 'yyyy-MM-dd') : null,
      loanContingencyDeadline: data.loanContingencyDeadline ? format(new Date(data.loanContingencyDeadline), 'yyyy-MM-dd') : null,
    };
    
    onSubmit(formattedData);
  };

  const handleNext = () => {
    setCurrentStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleStepClick = (stepIndex) => {
    setCurrentStep(stepIndex);
  };

  const toggleMode = () => {
    setFormMode(formMode === 'quick' ? 'full' : 'quick');
    setCurrentStep(0);
  };

  const handleRPADataExtracted = (extractedData) => {
    // Populate form fields with extracted data
    Object.keys(extractedData).forEach(key => {
      if (extractedData[key] !== null && extractedData[key] !== '' && extractedData[key] !== undefined) {
        setValue(key, extractedData[key]);
      }
    });

    // Handle special cases for arrays
    if (extractedData.buyers && extractedData.buyers.length > 0) {
      // Clear existing buyers and set new ones
      extractedData.buyers.forEach((buyer, index) => {
        setValue(`buyers.${index}`, buyer);
      });
    }

    if (extractedData.sellers && extractedData.sellers.length > 0) {
      // Clear existing sellers and set new ones  
      extractedData.sellers.forEach((seller, index) => {
        setValue(`sellers.${index}`, seller);
      });
    }

    // Close the RPA parser
    setShowRPAParser(false);
    
    // Optionally go to first step to review the populated data
    setCurrentStep(0);
  };

  const propertyTypes = [
    'Single Family',
    'Condo',
    'Townhouse',
    'Multi-Family',
    'Land',
    'Commercial',
    'Other'
  ];

  const steps = formMode === 'quick' ? 
    ['Basic Info', 'Parties'] : 
    ['Property Details', 'Financial Info', 'Parties', 'Professionals', 'Deadlines'];

  // Function to check if a step is completed (all required fields filled)
  const isStepCompleted = (stepIndex) => {
    const formValues = watch();
    
    if (formMode === 'quick') {
      switch (stepIndex) {
        case 0: // Basic Info
          return formValues.propertyAddress && 
                 formValues.purchasePrice && 
                 formValues.acceptanceDate && 
                 formValues.closingDate;
        case 1: // Parties
          return formValues.buyers?.[0]?.name && 
                 formValues.sellers?.[0]?.name;
        default:
          return false;
      }
    } else {
      switch (stepIndex) {
        case 0: // Property Details
          return formValues.propertyAddress && 
                 formValues.propertyType;
        case 1: // Financial Info
          return formValues.purchasePrice && 
                 formValues.acceptanceDate && 
                 formValues.closingDate;
        case 2: // Parties
          return formValues.buyers?.[0]?.name && 
                 formValues.sellers?.[0]?.name;
        case 3: // Professionals
          return true; // All optional fields
        case 4: // Deadlines
          return true; // All optional fields
        default:
          return false;
      }
    }
  };

  const renderQuickForm = () => (
    <>
      {currentStep === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Controller
              name="propertyAddress"
              control={control}
              rules={{ required: 'Property address is required' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Property Address"
                  fullWidth
                  required
                  error={!!errors.propertyAddress}
                  helperText={errors.propertyAddress?.message}
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
          <Grid item xs={12} sm={6}>
            <Controller
              name="purchasePrice"
              control={control}
              rules={{ required: 'Purchase price is required', min: { value: 1, message: 'Must be greater than 0' } }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Purchase Price"
                  type="number"
                  fullWidth
                  required
                  error={!!errors.purchasePrice}
                  helperText={errors.purchasePrice?.message}
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
          <Grid item xs={12} sm={6}>
            <Controller
              name="acceptanceDate"
              control={control}
              rules={{ required: 'Acceptance date is required' }}
              render={({ field }) => (
                <DatePicker
                  {...field}
                  label="Acceptance Date"
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      required
                      error={!!errors.acceptanceDate}
                      helperText={errors.acceptanceDate?.message}
                    />
                  )}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Controller
              name="closingDate"
              control={control}
              rules={{ required: 'Closing date is required' }}
              render={({ field }) => (
                <DatePicker
                  {...field}
                  label="Closing Date"
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      required
                      error={!!errors.closingDate}
                      helperText={errors.closingDate?.message}
                    />
                  )}
                />
              )}
            />
          </Grid>
        </Grid>
      )}

      {currentStep === 1 && (
        <Grid container spacing={3}>
          {/* Buyers */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Buyers
            </Typography>
            {buyerFields.map((field, index) => (
              <Card key={field.id} sx={{ mb: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="subtitle1">Buyer {index + 1}</Typography>
                    {buyerFields.length > 1 && (
                      <IconButton onClick={() => removeBuyer(index)} size="small">
                        <Remove />
                      </IconButton>
                    )}
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                      <Controller
                        name={`buyers.${index}.name`}
                        control={control}
                        rules={{ required: 'Buyer name is required' }}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="Full Name"
                            fullWidth
                            required
                            error={!!errors.buyers?.[index]?.name}
                            helperText={errors.buyers?.[index]?.name?.message}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Controller
                        name={`buyers.${index}.email`}
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="Email"
                            type="email"
                            fullWidth
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Controller
                        name={`buyers.${index}.phone`}
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="Phone"
                            fullWidth
                          />
                        )}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            ))}
            <Button
              startIcon={<Add />}
              onClick={() => appendBuyer({ name: '', email: '', phone: '' })}
              variant="outlined"
              size="small"
            >
              Add Buyer
            </Button>
          </Grid>

          {/* Sellers */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              Sellers
            </Typography>
            {sellerFields.map((field, index) => (
              <Card key={field.id} sx={{ mb: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="subtitle1">Seller {index + 1}</Typography>
                    {sellerFields.length > 1 && (
                      <IconButton onClick={() => removeSeller(index)} size="small">
                        <Remove />
                      </IconButton>
                    )}
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                      <Controller
                        name={`sellers.${index}.name`}
                        control={control}
                        rules={{ required: 'Seller name is required' }}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="Full Name"
                            fullWidth
                            required
                            error={!!errors.sellers?.[index]?.name}
                            helperText={errors.sellers?.[index]?.name?.message}
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Controller
                        name={`sellers.${index}.email`}
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="Email"
                            type="email"
                            fullWidth
                          />
                        )}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Controller
                        name={`sellers.${index}.phone`}
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="Phone"
                            fullWidth
                          />
                        )}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            ))}
            <Button
              startIcon={<Add />}
              onClick={() => appendSeller({ name: '', email: '', phone: '' })}
              variant="outlined"
              size="small"
            >
              Add Seller
            </Button>
          </Grid>
        </Grid>
      )}

    </>
  );

  const renderFullForm = () => {
    return (
      <>
        {/* Step 1: Property Details */}
        {currentStep === 0 && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom color="primary">
                Property Information
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="propertyAddress"
                control={control}
                rules={{ required: 'Property address is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Property Address"
                    fullWidth
                    required
                    error={!!errors.propertyAddress}
                    helperText={errors.propertyAddress?.message}
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
            <Grid item xs={12} sm={6}>
              <Controller
                name="propertyType"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>Property Type</InputLabel>
                    <Select {...field} label="Property Type">
                      {propertyTypes.map((type) => (
                        <MenuItem key={type} value={type}>
                          {type}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="transactionType"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>Transaction Type</InputLabel>
                    <Select {...field} label="Transaction Type">
                      <MenuItem value="Purchase">Purchase</MenuItem>
                      <MenuItem value="Sale">Sale</MenuItem>
                      <MenuItem value="Refinance">Refinance</MenuItem>
                      <MenuItem value="Other">Other</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="acceptanceDate"
                control={control}
                rules={{ required: 'Acceptance date is required' }}
                render={({ field }) => (
                  <DatePicker
                    {...field}
                    label="Acceptance Date"
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        required
                        error={!!errors.acceptanceDate}
                        helperText={errors.acceptanceDate?.message}
                      />
                    )}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="closingDate"
                control={control}
                rules={{ required: 'Closing date is required' }}
                render={({ field }) => (
                  <DatePicker
                    {...field}
                    label="Closing Date"
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        required
                        error={!!errors.closingDate}
                        helperText={errors.closingDate?.message}
                      />
                    )}
                  />
                )}
              />
            </Grid>
          </Grid>
        )}

        {/* Step 2: Financial Information */}
        {currentStep === 1 && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom color="primary">
                Financial Details
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="purchasePrice"
                control={control}
                rules={{ required: 'Purchase price is required', min: { value: 1, message: 'Must be greater than 0' } }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Purchase Price"
                    type="number"
                    fullWidth
                    required
                    error={!!errors.purchasePrice}
                    helperText={errors.purchasePrice?.message}
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
            <Grid item xs={12} sm={6}>
              <Controller
                name="earnestMoneyDeposit"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Earnest Money Deposit"
                    type="number"
                    fullWidth
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
            <Grid item xs={12} sm={6}>
              <Controller
                name="downPayment"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Down Payment"
                    type="number"
                    fullWidth
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
            <Grid item xs={12} sm={6}>
              <Controller
                name="loanAmount"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Loan Amount"
                    type="number"
                    fullWidth
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
            <Grid item xs={12} sm={6}>
              <Controller
                name="commissionPercentage"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Commission Percentage"
                    type="number"
                    fullWidth
                    InputProps={{
                      endAdornment: <InputAdornment position="end">%</InputAdornment>,
                    }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Estimated Total Commission"
                value={watchPurchasePrice && watchCommissionPercentage ? 
                  `$${(parseFloat(watchPurchasePrice) * parseFloat(watchCommissionPercentage) / 100).toLocaleString()}` : 
                  '$0'
                }
                fullWidth
                disabled
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AttachMoney />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        )}

        {/* Step 3: Parties */}
        {currentStep === 2 && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom color="primary">
                Transaction Parties
              </Typography>
            </Grid>
            
            {/* Buyers */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Buyers
              </Typography>
              {buyerFields.map((field, index) => (
                <Card key={field.id} sx={{ mb: 2 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="subtitle1">Buyer {index + 1}</Typography>
                      {buyerFields.length > 1 && (
                        <IconButton onClick={() => removeBuyer(index)} size="small">
                          <Remove />
                        </IconButton>
                      )}
                    </Box>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={4}>
                        <Controller
                          name={`buyers.${index}.name`}
                          control={control}
                          rules={{ required: 'Buyer name is required' }}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              label="Full Name"
                              fullWidth
                              required
                              error={!!errors.buyers?.[index]?.name}
                              helperText={errors.buyers?.[index]?.name?.message}
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Controller
                          name={`buyers.${index}.email`}
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              label="Email"
                              type="email"
                              fullWidth
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Controller
                          name={`buyers.${index}.phone`}
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              label="Phone"
                              fullWidth
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Controller
                          name={`buyers.${index}.lender`}
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              label="Lender"
                              fullWidth
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Controller
                          name={`buyers.${index}.preApproved`}
                          control={control}
                          render={({ field }) => (
                            <FormControlLabel
                              control={
                                <Switch
                                  checked={field.value || false}
                                  onChange={field.onChange}
                                />
                              }
                              label="Pre-approved"
                            />
                          )}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              ))}
              <Button
                startIcon={<Add />}
                onClick={() => appendBuyer({ name: '', email: '', phone: '', lender: '', preApproved: false })}
                variant="outlined"
                size="small"
              >
                Add Buyer
              </Button>
            </Grid>

            {/* Sellers */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                Sellers
              </Typography>
              {sellerFields.map((field, index) => (
                <Card key={field.id} sx={{ mb: 2 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="subtitle1">Seller {index + 1}</Typography>
                      {sellerFields.length > 1 && (
                        <IconButton onClick={() => removeSeller(index)} size="small">
                          <Remove />
                        </IconButton>
                      )}
                    </Box>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={4}>
                        <Controller
                          name={`sellers.${index}.name`}
                          control={control}
                          rules={{ required: 'Seller name is required' }}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              label="Full Name"
                              fullWidth
                              required
                              error={!!errors.sellers?.[index]?.name}
                              helperText={errors.sellers?.[index]?.name?.message}
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Controller
                          name={`sellers.${index}.email`}
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              label="Email"
                              type="email"
                              fullWidth
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Controller
                          name={`sellers.${index}.phone`}
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              label="Phone"
                              fullWidth
                            />
                          )}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              ))}
              <Button
                startIcon={<Add />}
                onClick={() => appendSeller({ name: '', email: '', phone: '' })}
                variant="outlined"
                size="small"
              >
                Add Seller
              </Button>
            </Grid>
          </Grid>
        )}

        {/* Step 4: Professionals */}
        {currentStep === 3 && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom color="primary">
                Professional Contacts
              </Typography>
            </Grid>
            
            {/* Escrow Information */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Escrow Company
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="escrowCompany"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Escrow Company"
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Business />
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
            
            {/* Title Company */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                Title Company
              </Typography>
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
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Business />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />
            </Grid>
            
            {/* Lender */}
            <Grid item xs={12} sm={6}>
              <Controller
                name="lender"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Primary Lender"
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Business />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />
            </Grid>
            
            {/* Agents */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                Listing Agent (You)
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Controller
                name="listingAgent.name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Your Name"
                    fullWidth
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Controller
                name="listingAgent.email"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Your Email"
                    type="email"
                    fullWidth
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Controller
                name="listingAgent.phone"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Your Phone"
                    fullWidth
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                Buyer's Agent
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Controller
                name="buyerAgent.name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Buyer's Agent Name"
                    fullWidth
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Controller
                name="buyerAgent.email"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Buyer's Agent Email"
                    type="email"
                    fullWidth
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Controller
                name="buyerAgent.phone"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Buyer's Agent Phone"
                    fullWidth
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="buyerAgent.brokerage"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Buyer's Agent Brokerage"
                    fullWidth
                  />
                )}
              />
            </Grid>
          </Grid>
        )}

        {/* Step 5: Deadlines */}
        {currentStep === 4 && (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom color="primary">
                Important Deadlines
              </Typography>
              <Alert severity="info" sx={{ mb: 3 }}>
                These deadlines are critical for the transaction timeline. They can be adjusted later if needed.
              </Alert>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Controller
                name="inspectionDeadline"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    {...field}
                    label="Inspection Deadline"
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        helperText="Usually 10-17 days from acceptance"
                      />
                    )}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="appraisalDeadline"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    {...field}
                    label="Appraisal Deadline"
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        helperText="Usually 17-21 days from acceptance"
                      />
                    )}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="loanContingencyDeadline"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    {...field}
                    label="Loan Contingency Deadline"
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        helperText="Usually 21 days from acceptance"
                      />
                    )}
                  />
                )}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Controller
                name="notes"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Additional Notes"
                    multiline
                    rows={4}
                    fullWidth
                    placeholder="Any additional notes about this transaction..."
                  />
                )}
              />
            </Grid>
          </Grid>
        )}

      </>
    );
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            {escrow ? 'Edit Escrow' : 'Create New Escrow'}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {!escrow && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<Upload />}
                onClick={() => setShowRPAParser(!showRPAParser)}
                sx={{ fontSize: '0.75rem' }}
              >
                {showRPAParser ? 'Close' : 'Import RPA'}
              </Button>
            )}
            <FormControlLabel
              control={
                <Switch
                  checked={formMode === 'quick'}
                  onChange={toggleMode}
                  size="small"
                />
              }
              label={<Typography variant="body2">Quick Mode</Typography>}
            />
            <IconButton onClick={onClose} size="small">
              <Close />
            </IconButton>
          </Box>
        </Box>
        <Stepper activeStep={currentStep} sx={{ mt: 2 }}>
          {steps.map((label, index) => {
            const completed = isStepCompleted(index);
            return (
              <Step key={label} completed={completed}>
                <StepLabel 
                  sx={{ 
                    cursor: 'pointer',
                    '& .MuiStepLabel-label': {
                      '&:hover': {
                        color: 'primary.main',
                        fontWeight: 'bold'
                      },
                      ...(completed && {
                        color: 'primary.main',
                        fontWeight: 'bold'
                      })
                    },
                    '& .MuiStepIcon-root': {
                      ...(completed && {
                        color: 'primary.main'
                      })
                    }
                  }}
                  onClick={() => handleStepClick(index)}
                >
                  {label}
                </StepLabel>
              </Step>
            );
          })}
        </Stepper>
      </DialogTitle>

      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent sx={{ mt: 2 }}>
          {showRPAParser && (
            <SimpleRPAParser 
              onDataExtracted={handleRPADataExtracted}
              onClose={() => setShowRPAParser(false)}
            />
          )}
          {formMode === 'quick' ? renderQuickForm() : renderFullForm()}
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          {currentStep > 0 && (
            <Button onClick={handleBack} disabled={loading}>
              Back
            </Button>
          )}
          {currentStep < steps.length - 1 ? (
            <Button onClick={handleNext} variant="contained">
              Next
            </Button>
          ) : (
            <Button 
              type="submit" 
              variant="contained" 
              disabled={loading}
            >
              {loading ? 'Creating...' : (escrow ? 'Update Escrow' : 'Create Escrow')}
            </Button>
          )}
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EscrowForm;