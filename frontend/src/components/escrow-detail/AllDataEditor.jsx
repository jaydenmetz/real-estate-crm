import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  Divider,
  IconButton,
  Chip,
  FormControlLabel,
  Checkbox,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Snackbar,
  InputAdornment
} from '@mui/material';
import {
  Save as SaveIcon,
  Edit as EditIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  AttachMoney as MoneyIcon,
  Home as HomeIcon,
  Assignment as ChecklistIcon,
  Assignment
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// Styled components
const SectionCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2.5),
  marginBottom: theme.spacing(2),
  backgroundColor: 'white',
  border: '1px solid rgba(118, 75, 162, 0.1)',
  borderRadius: theme.spacing(1.5),
  boxShadow: '0 2px 8px rgba(118, 75, 162, 0.08)'
}));

const SectionHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: theme.spacing(2),
  paddingBottom: theme.spacing(1),
  borderBottom: '2px solid rgba(118, 75, 162, 0.1)'
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.125rem',
  fontWeight: 700,
  color: '#764ba2',
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1)
}));

const FieldGrid = styled(Grid)(({ theme }) => ({
  '& .MuiTextField-root': {
    '& .MuiOutlinedInput-root': {
      '&:hover fieldset': {
        borderColor: '#764ba2'
      },
      '&.Mui-focused fieldset': {
        borderColor: '#764ba2'
      }
    },
    '& .MuiInputLabel-root.Mui-focused': {
      color: '#764ba2'
    }
  }
}));

const SaveButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  fontWeight: 600,
  '&:hover': {
    background: 'linear-gradient(135deg, #5a67d8 0%, #6b46a2 100%)'
  }
}));

function AllDataEditor({ data, onUpdate, isSaving }) {
  const [editingSections, setEditingSections] = useState({});
  const [formData, setFormData] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    // Initialize form data with current escrow data
    setFormData({
      details: { ...data },
      people: { ...data.people },
      timeline: { ...data.timeline },
      financials: { ...data.financials },
      checklists: { ...data.checklists },
      checklistLoan: { ...data.checklists?.loan },
      checklistHouse: { ...data.checklists?.house },
      checklistAdmin: { ...data.checklists?.admin },
      propertyDetails: {
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        squareFeet: data.squareFeet,
        yearBuilt: data.yearBuilt,
        lotSize: data.lotSize,
        garageSpaces: data.garageSpaces,
        pool: data.pool,
        spa: data.spa,
        propertyType: data.propertyType,
        apn: data.apn,
        mlsNumber: data.mlsNumber,
        county: data.county,
        hoaFee: data.hoaFee,
        hoaName: data.hoaName
      }
    });
  }, [data]);

  const handleEditSection = (section) => {
    setEditingSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleFieldChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSaveSection = async (section, endpoint) => {
    const result = await onUpdate(endpoint, formData[section]);
    
    if (result.success) {
      setEditingSections(prev => ({ ...prev, [section]: false }));
      setSnackbar({
        open: true,
        message: `${section.charAt(0).toUpperCase() + section.slice(1)} updated successfully`,
        severity: 'success'
      });
    } else {
      setSnackbar({
        open: true,
        message: result.error || `Failed to update ${section}`,
        severity: 'error'
      });
    }
  };

  const handleCancelEdit = (section) => {
    // Reset form data for this section
    let resetData = {};
    if (section === 'checklistLoan') {
      resetData = { ...data.checklists?.loan || {} };
    } else if (section === 'checklistHouse') {
      resetData = { ...data.checklists?.house || {} };
    } else if (section === 'checklistAdmin') {
      resetData = { ...data.checklists?.admin || {} };
    } else {
      resetData = { ...data[section] || {} };
    }
    
    setFormData(prev => ({
      ...prev,
      [section]: resetData
    }));
    setEditingSections(prev => ({ ...prev, [section]: false }));
  };

  const formatFieldLabel = (field) => {
    return field
      .replace(/([A-Z])/g, ' $1')
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box>
        {/* Main Details Section */}
        <SectionCard>
          <SectionHeader>
            <SectionTitle>
              <HomeIcon />
              Property Information
            </SectionTitle>
            {!editingSections.details ? (
              <IconButton size="small" onClick={() => handleEditSection('details')}>
                <EditIcon />
              </IconButton>
            ) : (
              <Box display="flex" gap={1}>
                <IconButton 
                  size="small" 
                  onClick={() => handleSaveSection('details', 'details')}
                  disabled={isSaving}
                >
                  <CheckIcon color="success" />
                </IconButton>
                <IconButton size="small" onClick={() => handleCancelEdit('details')}>
                  <CloseIcon color="error" />
                </IconButton>
              </Box>
            )}
          </SectionHeader>

          <FieldGrid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Property Address"
                value={formData.details?.propertyAddress || formData.details?.property_address || ''}
                onChange={(e) => handleFieldChange('details', 'property_address', e.target.value)}
                disabled={!editingSections.details}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="City"
                value={formData.details?.city || ''}
                onChange={(e) => handleFieldChange('details', 'city', e.target.value)}
                disabled={!editingSections.details}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="State"
                value={formData.details?.state || ''}
                onChange={(e) => handleFieldChange('details', 'state', e.target.value)}
                disabled={!editingSections.details}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="ZIP Code"
                value={formData.details?.zipCode || formData.details?.zip_code || ''}
                onChange={(e) => handleFieldChange('details', 'zip_code', e.target.value)}
                disabled={!editingSections.details}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="Purchase Price"
                value={formData.details?.purchasePrice || formData.details?.purchase_price || ''}
                onChange={(e) => handleFieldChange('details', 'purchase_price', e.target.value)}
                disabled={!editingSections.details}
                size="small"
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Escrow Status</InputLabel>
                <Select
                  value={formData.details?.escrowStatus || formData.details?.escrow_status || 'active'}
                  onChange={(e) => handleFieldChange('details', 'escrow_status', e.target.value)}
                  disabled={!editingSections.details}
                  label="Escrow Status"
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="closed">Closed</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </FieldGrid>
        </SectionCard>

        {/* People Section */}
        <SectionCard>
          <SectionHeader>
            <SectionTitle>
              <PersonIcon />
              People
            </SectionTitle>
            {!editingSections.people ? (
              <IconButton size="small" onClick={() => handleEditSection('people')}>
                <EditIcon />
              </IconButton>
            ) : (
              <Box display="flex" gap={1}>
                <IconButton 
                  size="small" 
                  onClick={() => handleSaveSection('people', 'people')}
                  disabled={isSaving}
                >
                  <CheckIcon color="success" />
                </IconButton>
                <IconButton size="small" onClick={() => handleCancelEdit('people')}>
                  <CloseIcon color="error" />
                </IconButton>
              </Box>
            )}
          </SectionHeader>

          <FieldGrid container spacing={2}>
            {['buyer', 'seller', 'buyerAgent', 'sellerAgent', 'loanOfficer', 'escrowOfficer'].map((role) => (
              <Grid item xs={12} md={6} key={role}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  {formatFieldLabel(role)}
                </Typography>
                <Grid container spacing={1}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Name"
                      value={formData.people?.[role]?.name || ''}
                      onChange={(e) => handleFieldChange('people', role, { 
                        ...formData.people?.[role], 
                        name: e.target.value 
                      })}
                      disabled={!editingSections.people}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      value={formData.people?.[role]?.email || ''}
                      onChange={(e) => handleFieldChange('people', role, { 
                        ...formData.people?.[role], 
                        email: e.target.value 
                      })}
                      disabled={!editingSections.people}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Phone"
                      value={formData.people?.[role]?.phone || ''}
                      onChange={(e) => handleFieldChange('people', role, { 
                        ...formData.people?.[role], 
                        phone: e.target.value 
                      })}
                      disabled={!editingSections.people}
                      size="small"
                    />
                  </Grid>
                </Grid>
              </Grid>
            ))}
          </FieldGrid>
        </SectionCard>

        {/* Timeline Section */}
        <SectionCard>
          <SectionHeader>
            <SectionTitle>
              <CalendarIcon />
              Timeline & Important Dates
            </SectionTitle>
            {!editingSections.timeline ? (
              <IconButton size="small" onClick={() => handleEditSection('timeline')}>
                <EditIcon />
              </IconButton>
            ) : (
              <Box display="flex" gap={1}>
                <IconButton 
                  size="small" 
                  onClick={() => handleSaveSection('timeline', 'timeline')}
                  disabled={isSaving}
                >
                  <CheckIcon color="success" />
                </IconButton>
                <IconButton size="small" onClick={() => handleCancelEdit('timeline')}>
                  <CloseIcon color="error" />
                </IconButton>
              </Box>
            )}
          </SectionHeader>

          <FieldGrid container spacing={2}>
            {[
              'acceptanceDate', 'emdDate', 'homeInspectionDate', 'appraisalDate',
              'loanContingencyDate', 'allContingenciesRemovalDate', 'coeDate', 'closingDate'
            ].map((dateField) => (
              <Grid item xs={12} sm={6} md={3} key={dateField}>
                <DatePicker
                  label={formatFieldLabel(dateField)}
                  value={formData.timeline?.[dateField] ? new Date(formData.timeline[dateField]) : null}
                  onChange={(newValue) => handleFieldChange('timeline', dateField, newValue?.toISOString())}
                  disabled={!editingSections.timeline}
                  slotProps={{ 
                    textField: { 
                      fullWidth: true, 
                      size: 'small' 
                    } 
                  }}
                />
              </Grid>
            ))}
          </FieldGrid>
        </SectionCard>

        {/* Financials Section */}
        <SectionCard>
          <SectionHeader>
            <SectionTitle>
              <MoneyIcon />
              Financial Information
            </SectionTitle>
            {!editingSections.financials ? (
              <IconButton size="small" onClick={() => handleEditSection('financials')}>
                <EditIcon />
              </IconButton>
            ) : (
              <Box display="flex" gap={1}>
                <IconButton 
                  size="small" 
                  onClick={() => handleSaveSection('financials', 'financials')}
                  disabled={isSaving}
                >
                  <CheckIcon color="success" />
                </IconButton>
                <IconButton size="small" onClick={() => handleCancelEdit('financials')}>
                  <CloseIcon color="error" />
                </IconButton>
              </Box>
            )}
          </SectionHeader>

          <FieldGrid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Purchase Price"
                type="number"
                value={formData.financials?.purchasePrice || ''}
                onChange={(e) => handleFieldChange('financials', 'purchasePrice', e.target.value)}
                disabled={!editingSections.financials}
                size="small"
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Down Payment"
                type="number"
                value={formData.financials?.downPayment || ''}
                onChange={(e) => handleFieldChange('financials', 'downPayment', e.target.value)}
                disabled={!editingSections.financials}
                size="small"
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Loan Amount"
                type="number"
                value={formData.financials?.loanAmount || ''}
                onChange={(e) => handleFieldChange('financials', 'loanAmount', e.target.value)}
                disabled={!editingSections.financials}
                size="small"
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Earnest Money"
                type="number"
                value={formData.financials?.earnestMoney || ''}
                onChange={(e) => handleFieldChange('financials', 'earnestMoney', e.target.value)}
                disabled={!editingSections.financials}
                size="small"
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Base Commission"
                type="number"
                value={formData.financials?.baseCommission || ''}
                onChange={(e) => handleFieldChange('financials', 'baseCommission', e.target.value)}
                disabled={!editingSections.financials}
                size="small"
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Split Percentage"
                type="number"
                value={formData.financials?.splitPercentage || ''}
                onChange={(e) => handleFieldChange('financials', 'splitPercentage', e.target.value)}
                disabled={!editingSections.financials}
                size="small"
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Transaction Fee"
                type="number"
                value={formData.financials?.transactionFee || ''}
                onChange={(e) => handleFieldChange('financials', 'transactionFee', e.target.value)}
                disabled={!editingSections.financials}
                size="small"
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="TC Fee"
                type="number"
                value={formData.financials?.tcFee || ''}
                onChange={(e) => handleFieldChange('financials', 'tcFee', e.target.value)}
                disabled={!editingSections.financials}
                size="small"
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>
                }}
              />
            </Grid>
          </FieldGrid>
        </SectionCard>

        {/* Loan Checklist Section */}
        <SectionCard>
          <SectionHeader>
            <SectionTitle>
              <ChecklistIcon />
              Loan & Financing Checklist
            </SectionTitle>
            {!editingSections.checklistLoan ? (
              <IconButton size="small" onClick={() => handleEditSection('checklistLoan')}>
                <EditIcon />
              </IconButton>
            ) : (
              <Box display="flex" gap={1}>
                <IconButton 
                  size="small" 
                  onClick={() => handleSaveSection('checklistLoan', 'checklist-loan')}
                  disabled={isSaving}
                >
                  <CheckIcon color="success" />
                </IconButton>
                <IconButton size="small" onClick={() => handleCancelEdit('checklistLoan')}>
                  <CloseIcon color="error" />
                </IconButton>
              </Box>
            )}
          </SectionHeader>

          <Grid container spacing={2}>
            {['le', 'lockedRate', 'appraisalOrdered', 'appraisalReceived', 'clearToClose', 
              'cd', 'loanDocsSigned', 'cashToClosePaid', 'loanFunded'].map((item) => (
              <Grid item xs={12} sm={6} md={4} key={item}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.checklistLoan?.[item] || formData.checklists?.loan?.[item] || false}
                      onChange={(e) => handleFieldChange('checklistLoan', item, e.target.checked)}
                      disabled={!editingSections.checklistLoan}
                      sx={{ 
                        color: '#764ba2',
                        '&.Mui-checked': { color: '#764ba2' }
                      }}
                    />
                  }
                  label={formatFieldLabel(item)}
                  sx={{ display: 'block' }}
                />
              </Grid>
            ))}
          </Grid>
        </SectionCard>

        {/* House Checklist Section */}
        <SectionCard>
          <SectionHeader>
            <SectionTitle>
              <HomeIcon />
              Property & Inspections Checklist
            </SectionTitle>
            {!editingSections.checklistHouse ? (
              <IconButton size="small" onClick={() => handleEditSection('checklistHouse')}>
                <EditIcon />
              </IconButton>
            ) : (
              <Box display="flex" gap={1}>
                <IconButton 
                  size="small" 
                  onClick={() => handleSaveSection('checklistHouse', 'checklist-house')}
                  disabled={isSaving}
                >
                  <CheckIcon color="success" />
                </IconButton>
                <IconButton size="small" onClick={() => handleCancelEdit('checklistHouse')}>
                  <CloseIcon color="error" />
                </IconButton>
              </Box>
            )}
          </SectionHeader>

          <Grid container spacing={2}>
            {['homeInspectionOrdered', 'emd', 'solarTransferInitiated', 'avid', 
              'homeInspectionReceived', 'sellerDisclosures', 'rr', 'recorded'].map((item) => (
              <Grid item xs={12} sm={6} md={4} key={item}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.checklistHouse?.[item] || formData.checklists?.house?.[item] || false}
                      onChange={(e) => handleFieldChange('checklistHouse', item, e.target.checked)}
                      disabled={!editingSections.checklistHouse}
                      sx={{ 
                        color: '#764ba2',
                        '&.Mui-checked': { color: '#764ba2' }
                      }}
                    />
                  }
                  label={formatFieldLabel(item)}
                  sx={{ display: 'block' }}
                />
              </Grid>
            ))}
          </Grid>
        </SectionCard>

        {/* Admin Checklist Section */}
        <SectionCard>
          <SectionHeader>
            <SectionTitle>
              <Assignment />
              Administrative Checklist
            </SectionTitle>
            {!editingSections.checklistAdmin ? (
              <IconButton size="small" onClick={() => handleEditSection('checklistAdmin')}>
                <EditIcon />
              </IconButton>
            ) : (
              <Box display="flex" gap={1}>
                <IconButton 
                  size="small" 
                  onClick={() => handleSaveSection('checklistAdmin', 'checklist-admin')}
                  disabled={isSaving}
                >
                  <CheckIcon color="success" />
                </IconButton>
                <IconButton size="small" onClick={() => handleCancelEdit('checklistAdmin')}>
                  <CloseIcon color="error" />
                </IconButton>
              </Box>
            )}
          </SectionHeader>

          <Grid container spacing={2}>
            {['mlsStatusUpdate', 'tcEmail', 'tcGlideInvite', 'addContactsToPhone', 
              'addContactsToNotion'].map((item) => (
              <Grid item xs={12} sm={6} md={4} key={item}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.checklistAdmin?.[item] || formData.checklists?.admin?.[item] || false}
                      onChange={(e) => handleFieldChange('checklistAdmin', item, e.target.checked)}
                      disabled={!editingSections.checklistAdmin}
                      sx={{ 
                        color: '#764ba2',
                        '&.Mui-checked': { color: '#764ba2' }
                      }}
                    />
                  }
                  label={formatFieldLabel(item)}
                  sx={{ display: 'block' }}
                />
              </Grid>
            ))}
          </Grid>
        </SectionCard>

        {/* Property Details Section */}
        <SectionCard>
          <SectionHeader>
            <SectionTitle>
              <HomeIcon />
              Property Details
            </SectionTitle>
            {!editingSections.propertyDetails ? (
              <IconButton size="small" onClick={() => handleEditSection('propertyDetails')}>
                <EditIcon />
              </IconButton>
            ) : (
              <Box display="flex" gap={1}>
                <IconButton 
                  size="small" 
                  onClick={() => handleSaveSection('propertyDetails', 'property-details')}
                  disabled={isSaving}
                >
                  <CheckIcon color="success" />
                </IconButton>
                <IconButton size="small" onClick={() => handleCancelEdit('propertyDetails')}>
                  <CloseIcon color="error" />
                </IconButton>
              </Box>
            )}
          </SectionHeader>

          <FieldGrid container spacing={2}>
            <Grid item xs={6} sm={3} md={2}>
              <TextField
                fullWidth
                label="Bedrooms"
                type="number"
                value={formData.propertyDetails?.bedrooms || ''}
                onChange={(e) => handleFieldChange('propertyDetails', 'bedrooms', e.target.value)}
                disabled={!editingSections.propertyDetails}
                size="small"
              />
            </Grid>
            <Grid item xs={6} sm={3} md={2}>
              <TextField
                fullWidth
                label="Bathrooms"
                value={formData.propertyDetails?.bathrooms || ''}
                onChange={(e) => handleFieldChange('propertyDetails', 'bathrooms', e.target.value)}
                disabled={!editingSections.propertyDetails}
                size="small"
              />
            </Grid>
            <Grid item xs={6} sm={3} md={2}>
              <TextField
                fullWidth
                label="Square Feet"
                type="number"
                value={formData.propertyDetails?.squareFeet || ''}
                onChange={(e) => handleFieldChange('propertyDetails', 'squareFeet', e.target.value)}
                disabled={!editingSections.propertyDetails}
                size="small"
              />
            </Grid>
            <Grid item xs={6} sm={3} md={2}>
              <TextField
                fullWidth
                label="Year Built"
                type="number"
                value={formData.propertyDetails?.yearBuilt || ''}
                onChange={(e) => handleFieldChange('propertyDetails', 'yearBuilt', e.target.value)}
                disabled={!editingSections.propertyDetails}
                size="small"
              />
            </Grid>
            <Grid item xs={6} sm={3} md={2}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.propertyDetails?.pool || false}
                    onChange={(e) => handleFieldChange('propertyDetails', 'pool', e.target.checked)}
                    disabled={!editingSections.propertyDetails}
                    sx={{ 
                      color: '#764ba2',
                      '&.Mui-checked': { color: '#764ba2' }
                    }}
                  />
                }
                label="Pool"
              />
            </Grid>
            <Grid item xs={6} sm={3} md={2}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.propertyDetails?.spa || false}
                    onChange={(e) => handleFieldChange('propertyDetails', 'spa', e.target.checked)}
                    disabled={!editingSections.propertyDetails}
                    sx={{ 
                      color: '#764ba2',
                      '&.Mui-checked': { color: '#764ba2' }
                    }}
                  />
                }
                label="Spa"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="APN"
                value={formData.propertyDetails?.apn || ''}
                onChange={(e) => handleFieldChange('propertyDetails', 'apn', e.target.value)}
                disabled={!editingSections.propertyDetails}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="MLS Number"
                value={formData.propertyDetails?.mlsNumber || ''}
                onChange={(e) => handleFieldChange('propertyDetails', 'mlsNumber', e.target.value)}
                disabled={!editingSections.propertyDetails}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="County"
                value={formData.propertyDetails?.county || ''}
                onChange={(e) => handleFieldChange('propertyDetails', 'county', e.target.value)}
                disabled={!editingSections.propertyDetails}
                size="small"
              />
            </Grid>
          </FieldGrid>
        </SectionCard>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert 
            onClose={() => setSnackbar({ ...snackbar, open: false })} 
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </LocalizationProvider>
  );
}

export default AllDataEditor;