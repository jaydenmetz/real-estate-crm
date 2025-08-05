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
      // Parse the path to create the update object
      const pathParts = path.split('.');
      let updateData = {};
      let current = updateData;
      
      // Format the value based on type
      let finalValue = tempValue;
      if (type === 'currency' && tempValue) {
        finalValue = parseFloat(tempValue) || 0;
      } else if (type === 'boolean') {
        finalValue = tempValue === 'true' || tempValue === true;
      } else if (type === 'percent' && tempValue) {
        finalValue = parseFloat(tempValue) || 0;
      }
      
      for (let i = 0; i < pathParts.length - 1; i++) {
        current[pathParts[i]] = {};
        current = current[pathParts[i]];
      }
      current[pathParts[pathParts.length - 1]] = finalValue;

      await escrowsAPI.update(escrowData.id, updateData);
      
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
        { label: 'Zillow URL', value: escrowData.zillowUrl, path: 'zillowUrl' },
        { label: 'Property Image URL', value: escrowData.propertyImage, path: 'propertyImage' },
      ],
    },
    {
      title: 'Property Details',
      key: 'property',
      fields: [
        { label: 'Address', value: escrowData.propertyDetails?.address, path: 'propertyDetails.address' },
        { label: 'City', value: escrowData.propertyDetails?.city, path: 'propertyDetails.city' },
        { label: 'State', value: escrowData.propertyDetails?.state, path: 'propertyDetails.state' },
        { label: 'ZIP Code', value: escrowData.propertyDetails?.zipCode, path: 'propertyDetails.zipCode' },
        { label: 'County', value: escrowData.propertyDetails?.county, path: 'propertyDetails.county' },
        { label: 'Property Type', value: escrowData.propertyDetails?.propertyType, path: 'propertyDetails.propertyType' },
        { label: 'Bedrooms', value: escrowData.propertyDetails?.bedrooms, path: 'propertyDetails.bedrooms' },
        { label: 'Bathrooms', value: escrowData.propertyDetails?.bathrooms, path: 'propertyDetails.bathrooms' },
        { label: 'Square Feet', value: escrowData.propertyDetails?.squareFeet, path: 'propertyDetails.squareFeet' },
        { label: 'Lot Size (sqft)', value: escrowData.propertyDetails?.lotSizeSqft, path: 'propertyDetails.lotSizeSqft' },
        { label: 'Year Built', value: escrowData.propertyDetails?.yearBuilt, path: 'propertyDetails.yearBuilt' },
        { label: 'APN', value: escrowData.propertyDetails?.apn, path: 'propertyDetails.apn' },
        { label: 'HOA Fee', value: escrowData.propertyDetails?.hoaFee, path: 'propertyDetails.hoaFee', type: 'currency' },
        { label: 'Pool', value: escrowData.propertyDetails?.pool, path: 'propertyDetails.pool', type: 'boolean' },
        { label: 'Spa', value: escrowData.propertyDetails?.spa, path: 'propertyDetails.spa', type: 'boolean' },
        { label: 'Gated Community', value: escrowData.propertyDetails?.gatedCommunity, path: 'propertyDetails.gatedCommunity', type: 'boolean' },
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
      title: 'Timeline',
      key: 'timeline',
      fields: [
        { label: 'Acceptance Date', value: escrowData.timeline?.acceptanceDate, path: 'timeline.acceptanceDate', type: 'date' },
        { label: 'EMD Date', value: escrowData.timeline?.emdDate, path: 'timeline.emdDate', type: 'date' },
        { label: 'Contingencies Date', value: escrowData.timeline?.contingenciesDate, path: 'timeline.contingenciesDate', type: 'date' },
        { label: 'Scheduled COE Date', value: escrowData.timeline?.scheduledCoeDate, path: 'timeline.scheduledCoeDate', type: 'date' },
        { label: 'Actual COE Date', value: escrowData.timeline?.actualCoeDate, path: 'timeline.actualCoeDate', type: 'date' },
        { label: 'Days to Close', value: escrowData.timeline?.daysToCoe, path: 'timeline.daysToCoe' },
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