import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  TextField,
  IconButton,
  InputAdornment,
  Switch,
  Divider,
  Checkbox,
  Alert,
  Paper,
  Tooltip,
  Collapse,
  CircularProgress,
} from '@mui/material';
import {
  Edit,
  Save,
  Cancel,
  ContentCopy,
  Check,
  ExpandMore,
  ExpandLess,
  CheckCircle,
} from '@mui/icons-material';
import { escrowsAPI } from '../../services/api';
import { format, parseISO, isValid } from 'date-fns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const AllDataViewer = ({ escrowData, onUpdate }) => {
  const [editingField, setEditingField] = useState(null);
  const [tempValue, setTempValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [copiedField, setCopiedField] = useState(null);
  const [savedField, setSavedField] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    property: true,
    people: true,
    timeline: true,
    financial: true,
    checklist: true,
  });

  const handleEdit = (path, value, type) => {
    setEditingField(path);
    // Format value based on type
    if (type === 'currency' && value) {
      setTempValue(parseFloat(value).toString());
    } else if (type === 'date' && value) {
      try {
        const date = parseISO(value);
        setTempValue(isValid(date) ? format(date, 'yyyy-MM-dd') : value);
      } catch {
        setTempValue(value || '');
      }
    } else {
      setTempValue(value || '');
    }
    setError('');
  };

  const handleCancel = () => {
    setEditingField(null);
    setTempValue('');
    setError('');
  };

  const handleBooleanToggle = async (path, currentValue) => {
    setSaving(true);
    setError('');
    
    try {
      const newValue = !currentValue;
      
      // Clean the escrow ID
      const cleanId = escrowData.id.startsWith('escrow-') ? 
        escrowData.id.substring(7) : escrowData.id;
      
      let response;
      
      console.log(`Toggling ${path} from ${currentValue} to ${newValue}`);
      
      // Handle checklist fields specially
      if (path.startsWith('checklists.')) {
        // For checklists, send as part of regular update with checklists field
        const checklistParts = path.split('.');
        const checklistType = checklistParts[1]; // loan, house, or admin
        const checklistItem = checklistParts[2]; // specific item
        
        // Get the current checklist state from escrowData
        const currentChecklists = escrowData.checklists || {};
        
        console.log('Current checklists before update:', JSON.parse(JSON.stringify(currentChecklists)));
        
        // Create a deep copy of ALL existing checklist data
        const updatedChecklists = {
          loan: { ...(currentChecklists.loan || {}) },
          house: { ...(currentChecklists.house || {}) },
          admin: { ...(currentChecklists.admin || {}) }
        };
        
        // Ensure the checklist type exists
        if (!updatedChecklists[checklistType]) {
          updatedChecklists[checklistType] = {};
        }
        
        // Update the specific item
        updatedChecklists[checklistType][checklistItem] = newValue;
        
        console.log('Updated checklists to send:', updatedChecklists);
        
        // Send as regular update with checklists field
        const updateData = { checklists: updatedChecklists };
        response = await escrowsAPI.update(cleanId, updateData);
      } else {
        // Regular field mapping - these map frontend display paths to backend field names
        const fieldMapping = {
          'transactionDetails.avid': 'avid',
          'propertyDetails.pool': 'pool',
          'propertyDetails.spa': 'spa',
          'propertyDetails.gatedCommunity': 'gated_community',
          'propertyDetails.seniorCommunity': 'senior_community',
        };
        
        const backendField = fieldMapping[path];
        
        if (!backendField) {
          console.error(`No field mapping found for path: ${path}`);
          throw new Error(`Cannot update field: ${path}`);
        }
        
        const updateData = { [backendField]: newValue };
        
        console.log('Sending update:', updateData);
        
        // Use regular update endpoint
        response = await escrowsAPI.update(cleanId, updateData);
      }
      
      if (response.success) {
        setSavedField(path);
        setTimeout(() => setSavedField(null), 2000);
        setSuccess('Updated successfully');
        setTimeout(() => setSuccess(''), 3000);
        
        // Notify parent component
        if (onUpdate) {
          const updatedData = { ...escrowData };
          const pathParts = path.split('.');
          let current = updatedData;
          for (let i = 0; i < pathParts.length - 1; i++) {
            if (!current[pathParts[i]]) current[pathParts[i]] = {};
            current = current[pathParts[i]];
          }
          current[pathParts[pathParts.length - 1]] = newValue;
          onUpdate(updatedData);
        }
      }
    } catch (err) {
      console.error('Failed to update:', err);
      setError('Failed to update');
      setTimeout(() => setError(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async (path, type) => {
    setSaving(true);
    setError('');
    
    try {
      // Format the value based on type
      let finalValue = tempValue;
      if (type === 'currency' && tempValue) {
        finalValue = parseFloat(tempValue) || 0;
      } else if (type === 'boolean') {
        finalValue = tempValue === 'true' || tempValue === true;
      } else if (type === 'percent' && tempValue) {
        finalValue = parseFloat(tempValue) || 0;
      }
      
      // Map frontend nested paths to backend flat field names
      const fieldMapping = {
        // Basic fields
        'zillowUrl': 'zillow_url',
        'propertyAddress': 'property_address',
        'propertyImage': 'property_image_url',
        'escrowStatus': 'escrow_status',
        'purchasePrice': 'purchase_price',
        'myCommission': 'my_commission',
        'escrowNumber': 'escrow_number',
        
        // Property Details
        'propertyDetails.bedrooms': 'bedrooms',
        'propertyDetails.bathrooms': 'bathrooms',
        'propertyDetails.squareFeet': 'square_feet',
        'propertyDetails.lotSize': 'lot_size_sqft',
        'propertyDetails.yearBuilt': 'year_built',
        'propertyDetails.garageSpaces': 'garage_spaces',
        'propertyDetails.stories': 'stories',
        'propertyDetails.pool': 'pool',
        'propertyDetails.spa': 'spa',
        'propertyDetails.viewType': 'view_type',
        'propertyDetails.architecturalStyle': 'architectural_style',
        'propertyDetails.propertyCondition': 'property_condition',
        'propertyDetails.zoning': 'zoning',
        'propertyDetails.apn': 'apn',
        'propertyDetails.mlsNumber': 'mls_number',
        'propertyDetails.county': 'county',
        'propertyDetails.city': 'city',
        'propertyDetails.state': 'state',
        'propertyDetails.zipCode': 'zip_code',
        'propertyDetails.subdivision': 'subdivision',
        'propertyDetails.crossStreets': 'cross_streets',
        'propertyDetails.hoaFee': 'hoa_fee',
        'propertyDetails.hoaFrequency': 'hoa_frequency',
        'propertyDetails.hoaName': 'hoa_name',
        'propertyDetails.gatedCommunity': 'gated_community',
        'propertyDetails.seniorCommunity': 'senior_community',
        'propertyDetails.listPrice': 'list_price',
        'propertyDetails.listDate': 'list_date',
        'propertyDetails.daysOnMarket': 'days_on_market',
        'propertyDetails.previousListPrice': 'previous_list_price',
        'propertyDetails.originalListPrice': 'original_list_price',
        
        // Transaction Details
        'transactionDetails.escrowStatus': 'escrow_status',
        'transactionDetails.purchasePrice': 'purchase_price',
        'transactionDetails.earnestMoneyDeposit': 'earnest_money_deposit',
        'transactionDetails.downPayment': 'down_payment',
        'transactionDetails.loanAmount': 'loan_amount',
        'transactionDetails.transactionType': 'transaction_type',
        'transactionDetails.closingDate': 'closing_date',
        'transactionDetails.acceptanceDate': 'acceptance_date',
        'transactionDetails.openingDate': 'opening_date',
        'transactionDetails.escrowNumber': 'escrow_number',
        'transactionDetails.escrowCompany': 'escrow_company',
        'transactionDetails.escrowOfficer': 'escrow_officer',
        'transactionDetails.escrowPhone': 'escrow_phone',
        'transactionDetails.escrowEmail': 'escrow_email',
        'transactionDetails.titleCompany': 'title_company',
        'transactionDetails.titleOfficer': 'title_officer',
        'transactionDetails.nhdCompany': 'nhd_company',
        'transactionDetails.homeWarrantyCompany': 'home_warranty_company',
        'transactionDetails.homeWarrantyAmount': 'home_warranty_amount',
        'transactionDetails.homeWarrantyOrderNumber': 'home_warranty_order_number',
        'transactionDetails.homeInspectionCompany': 'home_inspection_company',
        'transactionDetails.leadSource': 'lead_source',
        'transactionDetails.transactionCoordinator': 'transaction_coordinator',
        'transactionDetails.avid': 'avid',
        
        // Commission Details
        'commissionDetails.commissionPercentage': 'commission_percentage',
        'commissionDetails.grossCommission': 'gross_commission',
        'commissionDetails.myCommission': 'my_commission',
        'commissionDetails.netCommission': 'net_commission',
        'commissionDetails.buyerSideCommission': 'buyer_side_commission',
        'commissionDetails.listingSideCommission': 'listing_side_commission',
        'commissionDetails.referralFee': 'referral_fee',
        'commissionDetails.referralAgent': 'referral_agent',
        'commissionDetails.tcFee': 'tc_fee',
        'commissionDetails.adminFee': 'admin_fee',
        'commissionDetails.brokerageSplit': 'brokerage_split',
        'commissionDetails.commissionAdjustments': 'commission_adjustments',
        'commissionDetails.expenseAdjustments': 'expense_adjustments',
      };
      
      // Get the backend field name
      const backendField = fieldMapping[path] || path;
      
      // Create update object with the correct backend field name
      const updateData = {
        [backendField]: finalValue
      };

      // Strip the 'escrow-' prefix if present
      const cleanId = escrowData.id.startsWith('escrow-') ? 
        escrowData.id.substring(7) : escrowData.id;
      
      await escrowsAPI.update(cleanId, updateData);
      
      setEditingField(null);
      setSavedField(path);
      setTimeout(() => setSavedField(null), 2000);
      
      // Auto refresh after 500ms
      setTimeout(() => {
        if (onUpdate) onUpdate();
      }, 500);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = (value, field) => {
    navigator.clipboard.writeText(value || '');
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const formatValue = (value, type) => {
    if (value === null || value === undefined || value === '') return '-';
    
    switch (type) {
      case 'currency':
        const num = parseFloat(value);
        return isNaN(num) ? '-' : `$${num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
      case 'date':
        if (!value) return '-';
        try {
          const date = typeof value === 'string' ? parseISO(value) : value;
          return isValid(date) ? format(date, 'MM/dd/yyyy') : value;
        } catch {
          return value;
        }
      case 'boolean':
        return value ? 'Yes' : 'No';
      case 'percent':
        return `${value}%`;
      default:
        return value.toString();
    }
  };

  const renderField = (label, value, path, type = 'text') => {
    const isEditing = editingField === path;
    const displayValue = formatValue(value, type);
    const isSaved = savedField === path;

    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          py: 1,
          px: 2,
          '&:hover': {
            backgroundColor: 'action.hover',
            '& .edit-button': {
              opacity: 1,
            }
          },
          borderRadius: 1,
          backgroundColor: isSaved ? 'success.light' : 'transparent',
          transition: 'background-color 0.3s',
        }}
      >
        <Typography
          variant="caption"
          sx={{
            minWidth: 200,
            color: 'text.secondary',
            fontWeight: 500,
          }}
        >
          {label}
        </Typography>
        
        {isEditing ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
            {type === 'date' ? (
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  value={tempValue ? parseISO(tempValue) : null}
                  onChange={(newValue) => {
                    if (newValue && isValid(newValue)) {
                      setTempValue(format(newValue, 'yyyy-MM-dd'));
                    } else {
                      setTempValue('');
                    }
                  }}
                  disabled={saving}
                  slotProps={{
                    textField: {
                      size: 'small',
                      fullWidth: true,
                      error: !!error,
                      helperText: error,
                    },
                  }}
                />
              </LocalizationProvider>
            ) : (
              <TextField
                size="small"
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                fullWidth
                autoFocus
                disabled={saving}
                error={!!error}
                helperText={error}
                type={type === 'currency' || type === 'percent' ? 'number' : type}
                InputProps={{
                  startAdornment: type === 'currency' && (
                    <InputAdornment position="start">$</InputAdornment>
                  ),
                  endAdornment: type === 'percent' && (
                    <InputAdornment position="end">%</InputAdornment>
                  ),
                }}
              />
            )}
            <IconButton
              size="small"
              onClick={() => handleSave(path, type)}
              disabled={saving}
              color="primary"
            >
              {saving ? <CircularProgress size={16} /> : <Save fontSize="small" />}
            </IconButton>
            <IconButton
              size="small"
              onClick={handleCancel}
              disabled={saving}
            >
              <Cancel fontSize="small" />
            </IconButton>
          </Box>
        ) : (
          <>
            {type === 'boolean' ? (
              <Box sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                <Checkbox
                  checked={value === true || value === 'true'}
                  onChange={() => handleBooleanToggle(path, value === true || value === 'true')}
                  disabled={saving}
                  sx={{
                    color: 'primary.main',
                    '&.Mui-checked': {
                      color: 'primary.main',
                    },
                  }}
                />
              </Box>
            ) : (
              <Typography
                variant="body2"
                sx={{ 
                  flex: 1, 
                  fontFamily: type === 'currency' || type === 'percent' ? 'inherit' : 'monospace',
                  fontWeight: type === 'currency' ? 600 : 400,
                  color: type === 'currency' ? 'success.main' : 'text.primary',
                }}
              >
                {displayValue}
              </Typography>
            )}
            <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
              {isSaved && (
                <CheckCircle 
                  sx={{ 
                    color: 'success.main', 
                    fontSize: 20,
                    animation: 'fadeIn 0.3s',
                    '@keyframes fadeIn': {
                      '0%': { opacity: 0, transform: 'scale(0.5)' },
                      '100%': { opacity: 1, transform: 'scale(1)' },
                    }
                  }} 
                />
              )}
              {type !== 'boolean' && (
                <>
                  <Tooltip title="Copy">
                    <IconButton
                      size="small"
                      onClick={() => handleCopy(value, path)}
                      sx={{ opacity: 0.5 }}
                    >
                      {copiedField === path ? <Check fontSize="small" /> : <ContentCopy fontSize="small" />}
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit">
                    <IconButton
                      size="small"
                      className="edit-button"
                      onClick={() => handleEdit(path, value, type)}
                      sx={{ opacity: 0 }}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </>
              )}
            </Box>
          </>
        )}
      </Box>
    );
  };

  const renderSection = (title, fields, sectionKey) => (
    <Paper elevation={0} sx={{ mb: 2, border: '1px solid', borderColor: 'divider' }}>
      <Box
        sx={{
          p: 2,
          backgroundColor: 'grey.50',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
        onClick={() => toggleSection(sectionKey)}
      >
        <Typography variant="subtitle2" fontWeight="600">
          {title}
        </Typography>
        <IconButton size="small">
          {expandedSections[sectionKey] ? <ExpandLess /> : <ExpandMore />}
        </IconButton>
      </Box>
      <Collapse in={expandedSections[sectionKey]}>
        <Box sx={{ p: 1 }}>
          {fields.map((field, index) => (
            <React.Fragment key={index}>
              {renderField(field.label, field.value, field.path, field.type)}
              {index < fields.length - 1 && <Divider variant="middle" />}
            </React.Fragment>
          ))}
        </Box>
      </Collapse>
    </Paper>
  );

  // Helper function to get value from nested or flat structure
  const getValue = (data, paths) => {
    // paths can be a string or array of paths to try
    const pathsToTry = Array.isArray(paths) ? paths : [paths];
    
    for (const path of pathsToTry) {
      const parts = path.split('.');
      let value = data;
      
      for (const part of parts) {
        if (value && typeof value === 'object') {
          value = value[part];
        } else {
          value = undefined;
          break;
        }
      }
      
      if (value !== undefined && value !== null) {
        return value;
      }
    }
    
    return null;
  };

  // Flatten all data into sections
  const allDataSections = [
    {
      title: 'Basic Information',
      key: 'basic',
      fields: [
        { label: 'ID', value: escrowData.id, path: 'id' },
        { label: 'Escrow Number', value: escrowData.escrowNumber || escrowData.displayId, path: 'escrowNumber' },
        { label: 'Property Address', value: escrowData.propertyAddress, path: 'propertyAddress' },
        { label: 'Status', value: escrowData.escrowStatus || escrowData.status, path: 'escrowStatus' },
        { label: 'Purchase Price', value: escrowData.purchasePrice, path: 'purchasePrice', type: 'currency' },
        { label: 'My Commission', value: escrowData.myCommission, path: 'myCommission', type: 'currency' },
        { label: 'Zillow URL', value: escrowData.zillowUrl || escrowData.zillow_url, path: 'zillowUrl' },
        { label: 'Property Image URL', value: escrowData.propertyImage || escrowData.property_image_url, path: 'propertyImage' },
      ],
    },
    {
      title: 'Property Details',
      key: 'property',
      fields: [
        { label: 'City', value: getValue(escrowData, ['propertyDetails.city', 'property.city', 'city']), path: 'propertyDetails.city' },
        { label: 'State', value: getValue(escrowData, ['propertyDetails.state', 'property.state', 'state']), path: 'propertyDetails.state' },
        { label: 'ZIP Code', value: getValue(escrowData, ['propertyDetails.zipCode', 'property.zipCode', 'zip_code', 'zipCode']), path: 'propertyDetails.zipCode' },
        { label: 'County', value: getValue(escrowData, ['propertyDetails.county', 'property.county', 'county']), path: 'propertyDetails.county' },
        { label: 'Bedrooms', value: getValue(escrowData, ['propertyDetails.bedrooms', 'property.bedrooms', 'bedrooms']), path: 'propertyDetails.bedrooms' },
        { label: 'Bathrooms', value: getValue(escrowData, ['propertyDetails.bathrooms', 'property.bathrooms', 'bathrooms']), path: 'propertyDetails.bathrooms' },
        { label: 'Square Feet', value: getValue(escrowData, ['propertyDetails.squareFeet', 'property.sqft', 'square_feet', 'squareFeet']), path: 'propertyDetails.squareFeet' },
        { label: 'Lot Size (sqft)', value: getValue(escrowData, ['propertyDetails.lotSizeSqft', 'property.lotSize', 'lot_size_sqft', 'lotSize']), path: 'propertyDetails.lotSize' },
        { label: 'Year Built', value: getValue(escrowData, ['propertyDetails.yearBuilt', 'property.yearBuilt', 'year_built', 'yearBuilt']), path: 'propertyDetails.yearBuilt' },
        { label: 'Garage Spaces', value: getValue(escrowData, ['propertyDetails.garageSpaces', 'property.garageSpaces', 'garage_spaces', 'garageSpaces']), path: 'propertyDetails.garageSpaces' },
        { label: 'Stories', value: getValue(escrowData, ['propertyDetails.stories', 'property.stories', 'stories']), path: 'propertyDetails.stories' },
        { label: 'View Type', value: getValue(escrowData, ['propertyDetails.viewType', 'view_type', 'viewType']), path: 'propertyDetails.viewType' },
        { label: 'Architectural Style', value: getValue(escrowData, ['propertyDetails.architecturalStyle', 'architectural_style', 'architecturalStyle']), path: 'propertyDetails.architecturalStyle' },
        { label: 'Property Condition', value: getValue(escrowData, ['propertyDetails.propertyCondition', 'property_condition', 'propertyCondition']), path: 'propertyDetails.propertyCondition' },
        { label: 'Zoning', value: getValue(escrowData, ['propertyDetails.zoning', 'zoning']), path: 'propertyDetails.zoning' },
        { label: 'APN', value: getValue(escrowData, ['propertyDetails.apn', 'apn']), path: 'propertyDetails.apn' },
        { label: 'MLS Number', value: getValue(escrowData, ['propertyDetails.mlsNumber', 'mls_number', 'mlsNumber']), path: 'propertyDetails.mlsNumber' },
        { label: 'Subdivision', value: getValue(escrowData, ['propertyDetails.subdivision', 'subdivision']), path: 'propertyDetails.subdivision' },
        { label: 'Cross Streets', value: getValue(escrowData, ['propertyDetails.crossStreets', 'cross_streets', 'crossStreets']), path: 'propertyDetails.crossStreets' },
        { label: 'HOA Fee', value: getValue(escrowData, ['propertyDetails.hoaFee', 'hoa_fee', 'hoaFee']), path: 'propertyDetails.hoaFee', type: 'currency' },
        { label: 'HOA Frequency', value: getValue(escrowData, ['propertyDetails.hoaFrequency', 'hoa_frequency', 'hoaFrequency']), path: 'propertyDetails.hoaFrequency' },
        { label: 'HOA Name', value: getValue(escrowData, ['propertyDetails.hoaName', 'hoa_name', 'hoaName']), path: 'propertyDetails.hoaName' },
        { label: 'Pool', value: getValue(escrowData, ['propertyDetails.pool', 'property.pool', 'pool']), path: 'propertyDetails.pool', type: 'boolean' },
        { label: 'Spa', value: getValue(escrowData, ['propertyDetails.spa', 'property.spa', 'spa']), path: 'propertyDetails.spa', type: 'boolean' },
        { label: 'Gated Community', value: getValue(escrowData, ['propertyDetails.gatedCommunity', 'gated_community', 'gatedCommunity']), path: 'propertyDetails.gatedCommunity', type: 'boolean' },
        { label: 'Senior Community', value: getValue(escrowData, ['propertyDetails.seniorCommunity', 'senior_community', 'seniorCommunity']), path: 'propertyDetails.seniorCommunity', type: 'boolean' },
        { label: 'List Price', value: getValue(escrowData, ['propertyDetails.listPrice', 'list_price', 'listPrice']), path: 'propertyDetails.listPrice', type: 'currency' },
        { label: 'List Date', value: getValue(escrowData, ['propertyDetails.listDate', 'list_date', 'listDate']), path: 'propertyDetails.listDate', type: 'date' },
        { label: 'Days on Market', value: getValue(escrowData, ['propertyDetails.daysOnMarket', 'days_on_market', 'daysOnMarket']), path: 'propertyDetails.daysOnMarket' },
        { label: 'Previous List Price', value: getValue(escrowData, ['propertyDetails.previousListPrice', 'previous_list_price', 'previousListPrice']), path: 'propertyDetails.previousListPrice', type: 'currency' },
        { label: 'Original List Price', value: getValue(escrowData, ['propertyDetails.originalListPrice', 'original_list_price', 'originalListPrice']), path: 'propertyDetails.originalListPrice', type: 'currency' },
      ],
    },
    {
      title: 'People & Contacts',
      key: 'people',
      fields: [
        { label: 'Buyers', value: getValue(escrowData, ['people.buyers']) && Array.isArray(escrowData.people.buyers) ? escrowData.people.buyers.join(', ') : getValue(escrowData, ['people.buyers']), path: 'people.buyers' },
        { label: 'Listing Agent', value: getValue(escrowData, ['people.listingAgent', 'listingAgent']), path: 'people.listingAgent' },
        { label: 'Buyers Agent', value: getValue(escrowData, ['people.buyersAgent', 'buyersAgent', 'buyerAgent']), path: 'people.buyersAgent' },
        { label: 'Escrow Officer', value: getValue(escrowData, ['people.escrowOfficer', 'escrowOfficer', 'escrow_officer_name']), path: 'people.escrowOfficer' },
        { label: 'Loan Officer', value: getValue(escrowData, ['people.loanOfficer', 'loanOfficer', 'loan_officer_name']), path: 'people.loanOfficer' },
        { label: 'Transaction Coordinator', value: getValue(escrowData, ['people.transactionCoordinator', 'transactionCoordinator', 'transaction_coordinator']), path: 'people.transactionCoordinator' },
        { label: 'NHD Company', value: getValue(escrowData, ['people.transactionTeam.nhdCompany', 'people.nhdCompany', 'nhd_company']), path: 'people.nhdCompany' },
        { label: 'Home Warranty Company', value: getValue(escrowData, ['people.homeWarrantyCompany']), path: 'people.homeWarrantyCompany' },
        { label: 'Home Inspection Company', value: getValue(escrowData, ['people.homeInspectionCompany']), path: 'people.homeInspectionCompany' },
      ],
    },
    {
      title: 'Transaction Details',
      key: 'transaction',
      fields: [
        { label: 'Escrow Status', value: getValue(escrowData, ['escrowStatus', 'escrow_status', 'status']), path: 'transactionDetails.escrowStatus' },
        { label: 'Purchase Price', value: getValue(escrowData, ['purchasePrice', 'purchase_price']), path: 'transactionDetails.purchasePrice', type: 'currency' },
        { label: 'Earnest Money Deposit', value: getValue(escrowData, ['earnestMoneyDeposit', 'earnest_money_deposit']), path: 'transactionDetails.earnestMoneyDeposit', type: 'currency' },
        { label: 'Down Payment', value: getValue(escrowData, ['downPayment', 'down_payment']), path: 'transactionDetails.downPayment', type: 'currency' },
        { label: 'Loan Amount', value: getValue(escrowData, ['loanAmount', 'loan_amount']), path: 'transactionDetails.loanAmount', type: 'currency' },
        { label: 'Transaction Type', value: getValue(escrowData, ['transactionType', 'transaction_type']), path: 'transactionDetails.transactionType' },
        { label: 'Escrow Company', value: getValue(escrowData, ['escrowCompany', 'escrow_company']), path: 'transactionDetails.escrowCompany' },
        { label: 'Escrow Officer', value: getValue(escrowData, ['escrowOfficer', 'escrow_officer_name', 'people.escrowOfficer']), path: 'transactionDetails.escrowOfficer' },
        { label: 'Escrow Phone', value: getValue(escrowData, ['escrowPhone', 'escrow_officer_phone']), path: 'transactionDetails.escrowPhone' },
        { label: 'Escrow Email', value: getValue(escrowData, ['escrowEmail', 'escrow_officer_email']), path: 'transactionDetails.escrowEmail' },
        { label: 'Title Company', value: getValue(escrowData, ['titleCompany', 'title_company']), path: 'transactionDetails.titleCompany' },
        { label: 'Title Officer', value: getValue(escrowData, ['titleOfficer', 'title_officer']), path: 'transactionDetails.titleOfficer' },
        { label: 'Lender', value: getValue(escrowData, ['lender', 'lender_name']), path: 'transactionDetails.lender' },
        { label: 'Loan Officer', value: getValue(escrowData, ['loanOfficer', 'loan_officer_name', 'people.loanOfficer']), path: 'transactionDetails.loanOfficer' },
        { label: 'NHD Company', value: getValue(escrowData, ['nhdCompany', 'nhd_company', 'people.transactionTeam.nhdCompany']), path: 'transactionDetails.nhdCompany' },
        { label: 'Home Warranty Company', value: getValue(escrowData, ['homeWarrantyCompany', 'home_warranty_company', 'people.homeWarrantyCompany']), path: 'transactionDetails.homeWarrantyCompany' },
        { label: 'Home Inspection Company', value: getValue(escrowData, ['homeInspectionCompany', 'home_inspection_company', 'people.homeInspectionCompany']), path: 'transactionDetails.homeInspectionCompany' },
        { label: 'Lead Source', value: getValue(escrowData, ['leadSource', 'lead_source', 'financials.leadSource']), path: 'transactionDetails.leadSource' },
        { label: 'Transaction Coordinator', value: getValue(escrowData, ['transactionCoordinator', 'transaction_coordinator', 'people.transactionCoordinator']), path: 'transactionDetails.transactionCoordinator' },
        { label: 'AVID', value: getValue(escrowData, ['avid', 'financials.avid']), path: 'transactionDetails.avid', type: 'boolean' },
      ],
    },
    {
      title: 'Commission Details',
      key: 'commission',
      fields: [
        { label: 'Commission Percentage', value: getValue(escrowData, ['commission_percentage', 'commissionPercentage']), path: 'commissionDetails.commissionPercentage', type: 'percent' },
        { label: 'Gross Commission', value: getValue(escrowData, ['gross_commission', 'grossCommission', 'financials.grossCommission']), path: 'commissionDetails.grossCommission', type: 'currency' },
        { label: 'My Commission', value: getValue(escrowData, ['myCommission', 'my_commission']), path: 'commissionDetails.myCommission', type: 'currency' },
        { label: 'Net Commission', value: getValue(escrowData, ['net_commission', 'netCommission', 'financials.netCommission']), path: 'commissionDetails.netCommission', type: 'currency' },
        { label: 'Agent Commission', value: getValue(escrowData, ['financials.agentCommission']), path: 'commissionDetails.agentCommission', type: 'currency' },
        { label: 'Agent Net', value: getValue(escrowData, ['financials.agentNet']), path: 'commissionDetails.agentNet', type: 'currency' },
        { label: 'Referral Fee', value: getValue(escrowData, ['referral_fee', 'referralFee']), path: 'commissionDetails.referralFee', type: 'currency' },
        { label: 'Referral Agent', value: getValue(escrowData, ['referral_agent', 'referralAgent']), path: 'commissionDetails.referralAgent' },
        { label: 'TC Fee', value: getValue(escrowData, ['tc_fee', 'tcFee', 'financials.tcFee']), path: 'commissionDetails.tcFee', type: 'currency' },
        { label: 'Transaction Fee', value: getValue(escrowData, ['financials.transactionFee']), path: 'commissionDetails.transactionFee', type: 'currency' },
        { label: 'Franchise Fees', value: getValue(escrowData, ['financials.franchiseFees']), path: 'commissionDetails.franchiseFees', type: 'currency' },
        { label: 'Brokerage Split', value: getValue(escrowData, ['brokerage_split', 'brokerageSplit', 'financials.splitPercentage']), path: 'commissionDetails.brokerageSplit', type: 'percent' },
        { label: 'Commission Adjustments', value: getValue(escrowData, ['commission_adjustments', 'commissionAdjustments']), path: 'commissionDetails.commissionAdjustments', type: 'currency' },
        { label: 'Expense Adjustments', value: getValue(escrowData, ['expense_adjustments', 'expenseAdjustments']), path: 'commissionDetails.expenseAdjustments', type: 'currency' },
      ],
    },
    {
      title: 'Timeline',
      key: 'timeline',
      fields: [
        { label: 'Acceptance Date', value: getValue(escrowData, ['timeline.acceptanceDate', 'acceptanceDate', 'acceptance_date']), path: 'timeline.acceptanceDate', type: 'date' },
        { label: 'Opening Date', value: getValue(escrowData, ['timeline.escrowOpenedDate', 'timeline.openingDate', 'openingDate', 'opening_date']), path: 'timeline.openingDate', type: 'date' },
        { label: 'Closing Date', value: getValue(escrowData, ['timeline.closingDate', 'closingDate', 'closing_date', 'scheduledCoeDate']), path: 'timeline.closingDate', type: 'date' },
        { label: 'Actual COE Date', value: getValue(escrowData, ['timeline.actualCoeDate', 'actualCoeDate', 'actual_coe_date']), path: 'timeline.actualCoeDate', type: 'date' },
        { label: 'EMD Date', value: getValue(escrowData, ['timeline.emdDate']), path: 'timeline.emdDate', type: 'date' },
        { label: 'Contingencies Date', value: getValue(escrowData, ['timeline.contingenciesDate']), path: 'timeline.contingenciesDate', type: 'date' },
        { label: 'Inspection Date', value: getValue(escrowData, ['timeline.physicalInspectionDate']), path: 'timeline.physicalInspectionDate', type: 'date' },
        { label: 'Appraisal Ordered', value: getValue(escrowData, ['timeline.appraisalOrderedDate']), path: 'timeline.appraisalOrderedDate', type: 'date' },
        { label: 'Appraisal Completed', value: getValue(escrowData, ['timeline.appraisalCompletedDate']), path: 'timeline.appraisalCompletedDate', type: 'date' },
        { label: 'Loan Approval', value: getValue(escrowData, ['timeline.loanApprovalDate']), path: 'timeline.loanApprovalDate', type: 'date' },
        { label: 'Final Walkthrough', value: getValue(escrowData, ['timeline.walkThroughDate']), path: 'timeline.walkThroughDate', type: 'date' },
      ],
    },
    {
      title: 'Financial Details',
      key: 'financial',
      fields: [
        { label: 'Base Commission', value: getValue(escrowData, ['financials.baseCommission']), path: 'financials.baseCommission', type: 'currency' },
        { label: 'Gross Commission', value: getValue(escrowData, ['financials.grossCommission', 'gross_commission']), path: 'financials.grossCommission', type: 'currency' },
        { label: 'Agent Split %', value: getValue(escrowData, ['financials.splitPercentage']), path: 'financials.splitPercentage', type: 'percent' },
        { label: 'Agent Commission', value: getValue(escrowData, ['financials.agentCommission']), path: 'financials.agentCommission', type: 'currency' },
        { label: 'Transaction Fee', value: getValue(escrowData, ['financials.transactionFee']), path: 'financials.transactionFee', type: 'currency' },
        { label: 'TC Fee', value: getValue(escrowData, ['financials.tcFee']), path: 'financials.tcFee', type: 'currency' },
        { label: 'Franchise Fees', value: getValue(escrowData, ['financials.franchiseFees']), path: 'financials.franchiseFees', type: 'currency' },
        { label: 'Agent Net', value: getValue(escrowData, ['financials.agentNet']), path: 'financials.agentNet', type: 'currency' },
        { label: 'Lead Source', value: getValue(escrowData, ['financials.leadSource', 'lead_source']), path: 'financials.leadSource' },
        { label: 'Commission Adjustments', value: getValue(escrowData, ['commission_adjustments', 'financials.commissionAdjustments']), path: 'commission_adjustments', type: 'currency' },
        { label: 'Expense Adjustments', value: getValue(escrowData, ['expense_adjustments', 'financials.expenseAdjustments']), path: 'expense_adjustments', type: 'currency' },
      ],
    },
    {
      title: 'Checklist Status',
      key: 'checklist',
      fields: [
        { label: 'Loan - LE', value: getValue(escrowData, ['checklists.loan.le', 'checklist.loan.le']), path: 'checklists.loan.le', type: 'boolean' },
        { label: 'Loan - Rate Locked', value: getValue(escrowData, ['checklists.loan.lockedRate', 'checklist.loan.lockedRate']), path: 'checklists.loan.lockedRate', type: 'boolean' },
        { label: 'Loan - Appraisal Ordered', value: getValue(escrowData, ['checklists.loan.appraisalOrdered', 'checklist.loan.appraisalOrdered']), path: 'checklists.loan.appraisalOrdered', type: 'boolean' },
        { label: 'Loan - Clear to Close', value: getValue(escrowData, ['checklists.loan.clearToClose', 'checklist.loan.clearToClose']), path: 'checklists.loan.clearToClose', type: 'boolean' },
        { label: 'House - EMD', value: getValue(escrowData, ['checklists.house.emd', 'checklist.house.emd']), path: 'checklists.house.emd', type: 'boolean' },
        { label: 'House - Inspection Ordered', value: getValue(escrowData, ['checklists.house.homeInspectionOrdered', 'checklist.house.homeInspectionOrdered']), path: 'checklists.house.homeInspectionOrdered', type: 'boolean' },
        { label: 'House - Disclosures', value: getValue(escrowData, ['checklists.house.sellerDisclosures', 'checklist.house.sellerDisclosures']), path: 'checklists.house.sellerDisclosures', type: 'boolean' },
        { label: 'Admin - MLS Updated', value: getValue(escrowData, ['checklists.admin.mlsStatusUpdate', 'checklist.admin.mlsStatusUpdate']), path: 'checklists.admin.mlsStatusUpdate', type: 'boolean' },
        { label: 'Admin - TC Email', value: getValue(escrowData, ['checklists.admin.tcEmail', 'checklist.admin.tcEmail']), path: 'checklists.admin.tcEmail', type: 'boolean' },
      ],
    },
  ];

  return (
    <Card elevation={0} sx={{ mb: 3, border: '1px solid', borderColor: 'divider' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h6" fontWeight="600">
            All Data Fields
          </Typography>
          <Chip label="Click any field to edit" size="small" color="primary" />
        </Box>

        <Collapse in={!!success}>
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        </Collapse>

        <Grid container spacing={2}>
          {allDataSections.map((section) => (
            <Grid item xs={12} md={6} key={section.key}>
              {renderSection(section.title, section.fields, section.key)}
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default AllDataViewer;