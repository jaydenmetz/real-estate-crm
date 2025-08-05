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

  // Flatten all data into sections
  const allDataSections = [
    {
      title: 'Basic Information',
      key: 'basic',
      fields: [
        { label: 'ID', value: escrowData.id, path: 'id' },
        { label: 'Escrow Number', value: escrowData.escrowNumber, path: 'escrowNumber' },
        { label: 'Property Address', value: escrowData.propertyAddress, path: 'propertyAddress' },
        { label: 'Status', value: escrowData.escrowStatus, path: 'escrowStatus' },
        { label: 'Purchase Price', value: escrowData.purchasePrice, path: 'purchasePrice', type: 'currency' },
        { label: 'My Commission', value: escrowData.myCommission, path: 'myCommission', type: 'currency' },
        { label: 'Zillow URL', value: escrowData.zillowUrl || escrowData.zillow_url, path: 'zillowUrl' },
        { label: 'Property Image URL', value: escrowData.propertyImage, path: 'propertyImage' },
      ],
    },
    {
      title: 'Property Details',
      key: 'property',
      fields: [
        { label: 'City', value: escrowData.city, path: 'propertyDetails.city' },
        { label: 'State', value: escrowData.state, path: 'propertyDetails.state' },
        { label: 'ZIP Code', value: escrowData.zip_code || escrowData.zipCode, path: 'propertyDetails.zipCode' },
        { label: 'County', value: escrowData.county, path: 'propertyDetails.county' },
        { label: 'Bedrooms', value: escrowData.bedrooms, path: 'propertyDetails.bedrooms' },
        { label: 'Bathrooms', value: escrowData.bathrooms, path: 'propertyDetails.bathrooms' },
        { label: 'Square Feet', value: escrowData.square_feet || escrowData.squareFeet, path: 'propertyDetails.squareFeet' },
        { label: 'Lot Size (sqft)', value: escrowData.lot_size_sqft || escrowData.lotSize, path: 'propertyDetails.lotSize' },
        { label: 'Year Built', value: escrowData.year_built || escrowData.yearBuilt, path: 'propertyDetails.yearBuilt' },
        { label: 'Garage Spaces', value: escrowData.garage_spaces || escrowData.garageSpaces, path: 'propertyDetails.garageSpaces' },
        { label: 'Stories', value: escrowData.stories, path: 'propertyDetails.stories' },
        { label: 'View Type', value: escrowData.view_type || escrowData.viewType, path: 'propertyDetails.viewType' },
        { label: 'Architectural Style', value: escrowData.architectural_style || escrowData.architecturalStyle, path: 'propertyDetails.architecturalStyle' },
        { label: 'Property Condition', value: escrowData.property_condition || escrowData.propertyCondition, path: 'propertyDetails.propertyCondition' },
        { label: 'Zoning', value: escrowData.zoning, path: 'propertyDetails.zoning' },
        { label: 'APN', value: escrowData.apn, path: 'propertyDetails.apn' },
        { label: 'MLS Number', value: escrowData.mls_number || escrowData.mlsNumber, path: 'propertyDetails.mlsNumber' },
        { label: 'Subdivision', value: escrowData.subdivision, path: 'propertyDetails.subdivision' },
        { label: 'Cross Streets', value: escrowData.cross_streets || escrowData.crossStreets, path: 'propertyDetails.crossStreets' },
        { label: 'HOA Fee', value: escrowData.hoa_fee || escrowData.hoaFee, path: 'propertyDetails.hoaFee', type: 'currency' },
        { label: 'HOA Frequency', value: escrowData.hoa_frequency || escrowData.hoaFrequency, path: 'propertyDetails.hoaFrequency' },
        { label: 'HOA Name', value: escrowData.hoa_name || escrowData.hoaName, path: 'propertyDetails.hoaName' },
        { label: 'Pool', value: escrowData.pool, path: 'propertyDetails.pool', type: 'boolean' },
        { label: 'Spa', value: escrowData.spa, path: 'propertyDetails.spa', type: 'boolean' },
        { label: 'Gated Community', value: escrowData.gated_community || escrowData.gatedCommunity, path: 'propertyDetails.gatedCommunity', type: 'boolean' },
        { label: 'Senior Community', value: escrowData.senior_community || escrowData.seniorCommunity, path: 'propertyDetails.seniorCommunity', type: 'boolean' },
        { label: 'List Price', value: escrowData.list_price || escrowData.listPrice, path: 'propertyDetails.listPrice', type: 'currency' },
        { label: 'List Date', value: escrowData.list_date || escrowData.listDate, path: 'propertyDetails.listDate', type: 'date' },
        { label: 'Days on Market', value: escrowData.days_on_market || escrowData.daysOnMarket, path: 'propertyDetails.daysOnMarket' },
        { label: 'Previous List Price', value: escrowData.previous_list_price || escrowData.previousListPrice, path: 'propertyDetails.previousListPrice', type: 'currency' },
        { label: 'Original List Price', value: escrowData.original_list_price || escrowData.originalListPrice, path: 'propertyDetails.originalListPrice', type: 'currency' },
      ],
    },
    {
      title: 'People & Contacts',
      key: 'people',
      fields: [
        { label: 'Buyers', value: escrowData.people?.buyers?.join(', '), path: 'people.buyers' },
        { label: 'Listing Agent', value: escrowData.people?.listingAgent, path: 'people.listingAgent' },
        { label: 'Buyers Agent', value: escrowData.people?.buyersAgent, path: 'people.buyersAgent' },
        { label: 'Escrow Officer', value: escrowData.people?.escrowOfficer, path: 'people.escrowOfficer' },
        { label: 'Loan Officer', value: escrowData.people?.loanOfficer, path: 'people.loanOfficer' },
        { label: 'Transaction Coordinator', value: escrowData.people?.transactionCoordinator, path: 'people.transactionCoordinator' },
        { label: 'NHD Company', value: escrowData.people?.nhdCompany, path: 'people.nhdCompany' },
      ],
    },
    {
      title: 'Transaction Details',
      key: 'transaction',
      fields: [
        { label: 'Escrow Status', value: escrowData.escrow_status || escrowData.escrowStatus, path: 'transactionDetails.escrowStatus' },
        { label: 'Purchase Price', value: escrowData.purchase_price || escrowData.purchasePrice, path: 'transactionDetails.purchasePrice', type: 'currency' },
        { label: 'Earnest Money Deposit', value: escrowData.earnest_money_deposit || escrowData.earnestMoneyDeposit, path: 'transactionDetails.earnestMoneyDeposit', type: 'currency' },
        { label: 'Down Payment', value: escrowData.down_payment || escrowData.downPayment, path: 'transactionDetails.downPayment', type: 'currency' },
        { label: 'Loan Amount', value: escrowData.loan_amount || escrowData.loanAmount, path: 'transactionDetails.loanAmount', type: 'currency' },
        { label: 'Transaction Type', value: escrowData.transaction_type || escrowData.transactionType, path: 'transactionDetails.transactionType' },
        { label: 'Closing Date', value: escrowData.closing_date || escrowData.closingDate, path: 'transactionDetails.closingDate', type: 'date' },
        { label: 'Acceptance Date', value: escrowData.acceptance_date || escrowData.acceptanceDate, path: 'transactionDetails.acceptanceDate', type: 'date' },
        { label: 'Opening Date', value: escrowData.opening_date || escrowData.openingDate, path: 'transactionDetails.openingDate', type: 'date' },
        { label: 'Escrow Number', value: escrowData.escrow_number || escrowData.escrowNumber, path: 'transactionDetails.escrowNumber' },
        { label: 'Escrow Company', value: escrowData.escrow_company || escrowData.escrowCompany, path: 'transactionDetails.escrowCompany' },
        { label: 'Escrow Officer', value: escrowData.escrow_officer || escrowData.escrowOfficer, path: 'transactionDetails.escrowOfficer' },
        { label: 'Escrow Phone', value: escrowData.escrow_phone || escrowData.escrowPhone, path: 'transactionDetails.escrowPhone' },
        { label: 'Escrow Email', value: escrowData.escrow_email || escrowData.escrowEmail, path: 'transactionDetails.escrowEmail' },
        { label: 'Title Company', value: escrowData.title_company || escrowData.titleCompany, path: 'transactionDetails.titleCompany' },
        { label: 'Title Officer', value: escrowData.title_officer || escrowData.titleOfficer, path: 'transactionDetails.titleOfficer' },
        { label: 'NHD Company', value: escrowData.nhd_company || escrowData.nhdCompany, path: 'transactionDetails.nhdCompany' },
        { label: 'Home Warranty Company', value: escrowData.home_warranty_company || escrowData.homeWarrantyCompany, path: 'transactionDetails.homeWarrantyCompany' },
        { label: 'Home Warranty Amount', value: escrowData.home_warranty_amount || escrowData.homeWarrantyAmount, path: 'transactionDetails.homeWarrantyAmount', type: 'currency' },
        { label: 'Home Warranty Order #', value: escrowData.home_warranty_order_number || escrowData.homeWarrantyOrderNumber, path: 'transactionDetails.homeWarrantyOrderNumber' },
        { label: 'Home Inspection Company', value: escrowData.home_inspection_company || escrowData.homeInspectionCompany, path: 'transactionDetails.homeInspectionCompany' },
        { label: 'Lead Source', value: escrowData.lead_source || escrowData.leadSource, path: 'transactionDetails.leadSource' },
        { label: 'Transaction Coordinator', value: escrowData.transaction_coordinator || escrowData.transactionCoordinator, path: 'transactionDetails.transactionCoordinator' },
        { label: 'AVID', value: escrowData.avid, path: 'transactionDetails.avid', type: 'boolean' },
      ],
    },
    {
      title: 'Commission Details',
      key: 'commission',
      fields: [
        { label: 'Commission Percentage', value: escrowData.commission_percentage || escrowData.commissionPercentage, path: 'commissionDetails.commissionPercentage', type: 'percent' },
        { label: 'Gross Commission', value: escrowData.gross_commission || escrowData.grossCommission, path: 'commissionDetails.grossCommission', type: 'currency' },
        { label: 'My Commission', value: escrowData.my_commission || escrowData.myCommission, path: 'commissionDetails.myCommission', type: 'currency' },
        { label: 'Net Commission', value: escrowData.net_commission || escrowData.netCommission, path: 'commissionDetails.netCommission', type: 'currency' },
        { label: 'Buyer Side Commission', value: escrowData.buyer_side_commission || escrowData.buyerSideCommission, path: 'commissionDetails.buyerSideCommission', type: 'currency' },
        { label: 'Listing Side Commission', value: escrowData.listing_side_commission || escrowData.listingSideCommission, path: 'commissionDetails.listingSideCommission', type: 'currency' },
        { label: 'Referral Fee', value: escrowData.referral_fee || escrowData.referralFee, path: 'commissionDetails.referralFee', type: 'currency' },
        { label: 'Referral Agent', value: escrowData.referral_agent || escrowData.referralAgent, path: 'commissionDetails.referralAgent' },
        { label: 'TC Fee', value: escrowData.tc_fee || escrowData.tcFee, path: 'commissionDetails.tcFee', type: 'currency' },
        { label: 'Admin Fee', value: escrowData.admin_fee || escrowData.adminFee, path: 'commissionDetails.adminFee', type: 'currency' },
        { label: 'Brokerage Split', value: escrowData.brokerage_split || escrowData.brokerageSplit, path: 'commissionDetails.brokerageSplit', type: 'percent' },
        { label: 'Commission Adjustments', value: escrowData.commission_adjustments || escrowData.commissionAdjustments, path: 'commissionDetails.commissionAdjustments', type: 'currency' },
        { label: 'Expense Adjustments', value: escrowData.expense_adjustments || escrowData.expenseAdjustments, path: 'commissionDetails.expenseAdjustments', type: 'currency' },
      ],
    },
    {
      title: 'Timeline',
      key: 'timeline',
      fields: [
        { label: 'Acceptance Date', value: escrowData.acceptance_date || escrowData.acceptanceDate || escrowData.timeline?.acceptanceDate, path: 'timeline.acceptanceDate', type: 'date' },
        { label: 'Opening Date', value: escrowData.opening_date || escrowData.openingDate || escrowData.timeline?.openingDate, path: 'timeline.openingDate', type: 'date' },
        { label: 'Closing Date', value: escrowData.closing_date || escrowData.closingDate || escrowData.timeline?.closingDate, path: 'timeline.closingDate', type: 'date' },
        { label: 'Actual COE Date', value: escrowData.actual_coe_date || escrowData.actualCoeDate || escrowData.timeline?.actualCoeDate, path: 'timeline.actualCoeDate', type: 'date' },
        { label: 'RPA Deadline', value: escrowData.rpa_deadline || escrowData.timeline?.rpaDeadline, path: 'timeline.rpaDeadline', type: 'date' },
        { label: 'Contract Signed', value: escrowData.contract_signed || escrowData.timeline?.contractSigned, path: 'timeline.contractSigned', type: 'date' },
        { label: 'Deposit Made', value: escrowData.deposit_made || escrowData.timeline?.depositMade, path: 'timeline.depositMade', type: 'date' },
        { label: 'Contingency Removal', value: escrowData.contingency_removal || escrowData.timeline?.contingencyRemoval, path: 'timeline.contingencyRemoval', type: 'date' },
        { label: 'Loan Approval', value: escrowData.loan_approval || escrowData.timeline?.loanApproval, path: 'timeline.loanApproval', type: 'date' },
        { label: 'Appraisal Completed', value: escrowData.appraisal_completed || escrowData.timeline?.appraisalCompleted, path: 'timeline.appraisalCompleted', type: 'date' },
        { label: 'Final Walkthrough', value: escrowData.final_walkthrough || escrowData.timeline?.finalWalkthrough, path: 'timeline.finalWalkthrough', type: 'date' },
      ],
    },
    {
      title: 'Financial Details',
      key: 'financial',
      fields: [
        { label: 'Base Commission', value: escrowData.financials?.baseCommission, path: 'financials.baseCommission', type: 'currency' },
        { label: 'Gross Commission', value: escrowData.financials?.grossCommission, path: 'financials.grossCommission', type: 'currency' },
        { label: 'Agent Split', value: escrowData.financials?.splitPercentage, path: 'financials.splitPercentage', type: 'percent' },
        { label: 'Agent Commission', value: escrowData.financials?.agentCommission, path: 'financials.agentCommission', type: 'currency' },
        { label: 'Transaction Fee', value: escrowData.financials?.transactionFee, path: 'financials.transactionFee', type: 'currency' },
        { label: 'TC Fee', value: escrowData.financials?.tcFee, path: 'financials.tcFee', type: 'currency' },
        { label: 'Franchise Fees', value: escrowData.financials?.franchiseFees, path: 'financials.franchiseFees', type: 'currency' },
        { label: 'Agent Net', value: escrowData.financials?.agentNet, path: 'financials.agentNet', type: 'currency' },
        { label: 'Lead Source', value: escrowData.financials?.leadSource, path: 'financials.leadSource' },
      ],
    },
    {
      title: 'Checklist Status',
      key: 'checklist',
      fields: [
        { label: 'Loan - LE', value: escrowData.checklists?.loan?.le, path: 'checklists.loan.le', type: 'boolean' },
        { label: 'Loan - Rate Locked', value: escrowData.checklists?.loan?.lockedRate, path: 'checklists.loan.lockedRate', type: 'boolean' },
        { label: 'Loan - Appraisal Ordered', value: escrowData.checklists?.loan?.appraisalOrdered, path: 'checklists.loan.appraisalOrdered', type: 'boolean' },
        { label: 'Loan - Clear to Close', value: escrowData.checklists?.loan?.clearToClose, path: 'checklists.loan.clearToClose', type: 'boolean' },
        { label: 'House - EMD', value: escrowData.checklists?.house?.emd, path: 'checklists.house.emd', type: 'boolean' },
        { label: 'House - Inspection Ordered', value: escrowData.checklists?.house?.homeInspectionOrdered, path: 'checklists.house.homeInspectionOrdered', type: 'boolean' },
        { label: 'House - Disclosures', value: escrowData.checklists?.house?.sellerDisclosures, path: 'checklists.house.sellerDisclosures', type: 'boolean' },
        { label: 'Admin - MLS Updated', value: escrowData.checklists?.admin?.mlsStatusUpdate, path: 'checklists.admin.mlsStatusUpdate', type: 'boolean' },
        { label: 'Admin - TC Email', value: escrowData.checklists?.admin?.tcEmail, path: 'checklists.admin.tcEmail', type: 'boolean' },
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