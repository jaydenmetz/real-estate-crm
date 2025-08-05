import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  IconButton,
  Chip,
  Grid,
  Divider,
  Alert,
  Collapse,
  Button,
  InputAdornment,
  Switch,
  FormControlLabel,
  Tooltip,
} from '@mui/material';
import {
  Edit,
  Save,
  Cancel,
  ExpandMore,
  ExpandLess,
  AttachMoney,
  Home,
  Person,
  CalendarToday,
  Assignment,
  TrendingUp,
  CheckCircle,
  Warning,
} from '@mui/icons-material';
import { escrowsAPI } from '../../services/api';
import { format } from 'date-fns';

const ComprehensiveDataEditor = ({ escrowData, onUpdate }) => {
  const [expanded, setExpanded] = useState(true);
  const [editingFields, setEditingFields] = useState({});
  const [localData, setLocalData] = useState({});
  const [saving, setSaving] = useState({});
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  useEffect(() => {
    setLocalData(escrowData);
  }, [escrowData]);

  const handleEdit = (section, field) => {
    const key = `${section}.${field}`;
    setEditingFields({ ...editingFields, [key]: true });
  };

  const handleCancel = (section, field) => {
    const key = `${section}.${field}`;
    setEditingFields({ ...editingFields, [key]: false });
    // Reset to original value
    setLocalData({
      ...localData,
      [section]: {
        ...localData[section],
        [field]: escrowData[section]?.[field] || escrowData[field],
      },
    });
  };

  const handleChange = (section, field, value) => {
    if (section) {
      setLocalData({
        ...localData,
        [section]: {
          ...localData[section],
          [field]: value,
        },
      });
    } else {
      setLocalData({
        ...localData,
        [field]: value,
      });
    }
  };

  const handleSave = async (section, field) => {
    const key = `${section}.${field}`;
    setSaving({ ...saving, [key]: true });
    setErrors({ ...errors, [key]: null });

    try {
      const updateData = {};
      if (section && section !== 'root') {
        updateData[section] = {
          ...escrowData[section],
          [field]: localData[section][field],
        };
      } else {
        updateData[field] = localData[field];
      }

      await escrowsAPI.update(escrowData.id, updateData);
      
      setEditingFields({ ...editingFields, [key]: false });
      setSuccessMessage(`Updated ${field}`);
      setTimeout(() => setSuccessMessage(''), 3000);
      
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      setErrors({ ...errors, [key]: error.message });
    } finally {
      setSaving({ ...saving, [key]: false });
    }
  };

  const renderField = (label, value, section, field, type = 'text', prefix = '') => {
    const key = `${section}.${field}`;
    const isEditing = editingFields[key];
    const isSaving = saving[key];
    const error = errors[key];
    const displayValue = section && section !== 'root' 
      ? localData[section]?.[field] 
      : localData[field];

    return (
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="caption" color="text.secondary" sx={{ minWidth: 140 }}>
            {label}
          </Typography>
          {isEditing ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
              <TextField
                size="small"
                value={displayValue || ''}
                onChange={(e) => handleChange(section, field, e.target.value)}
                type={type}
                fullWidth
                disabled={isSaving}
                error={!!error}
                helperText={error}
                InputProps={{
                  startAdornment: prefix && (
                    <InputAdornment position="start">{prefix}</InputAdornment>
                  ),
                }}
              />
              <IconButton
                size="small"
                onClick={() => handleSave(section, field)}
                disabled={isSaving}
                color="primary"
              >
                <Save fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => handleCancel(section, field)}
                disabled={isSaving}
              >
                <Cancel fontSize="small" />
              </IconButton>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
              <Typography variant="body2" sx={{ flex: 1 }}>
                {prefix}{displayValue || '-'}
              </Typography>
              <IconButton
                size="small"
                onClick={() => handleEdit(section, field)}
                sx={{ opacity: 0.5, '&:hover': { opacity: 1 } }}
              >
                <Edit fontSize="small" />
              </IconButton>
            </Box>
          )}
        </Box>
      </Box>
    );
  };

  const renderBooleanField = (label, value, section, field) => {
    const key = `${section}.${field}`;
    const displayValue = section && section !== 'root' 
      ? localData[section]?.[field] 
      : localData[field];

    return (
      <Box sx={{ mb: 2 }}>
        <FormControlLabel
          control={
            <Switch
              checked={!!displayValue}
              onChange={(e) => {
                handleChange(section, field, e.target.checked);
                handleSave(section, field);
              }}
              size="small"
            />
          }
          label={
            <Typography variant="caption" color="text.secondary">
              {label}
            </Typography>
          }
        />
      </Box>
    );
  };

  const sections = [
    {
      title: 'Basic Information',
      icon: <Home />,
      fields: [
        { label: 'Escrow Number', field: 'escrowNumber', section: 'root' },
        { label: 'Property Address', field: 'propertyAddress', section: 'root' },
        { label: 'Status', field: 'escrowStatus', section: 'root' },
        { label: 'Purchase Price', field: 'purchasePrice', section: 'root', type: 'number', prefix: '$' },
        { label: 'My Commission', field: 'myCommission', section: 'root', type: 'number', prefix: '$' },
      ],
    },
    {
      title: 'Property Details',
      icon: <Assignment />,
      fields: [
        { label: 'Bedrooms', field: 'bedrooms', section: 'propertyDetails', type: 'number' },
        { label: 'Bathrooms', field: 'bathrooms', section: 'propertyDetails' },
        { label: 'Square Feet', field: 'squareFeet', section: 'propertyDetails', type: 'number' },
        { label: 'Lot Size (sqft)', field: 'lotSizeSqft', section: 'propertyDetails', type: 'number' },
        { label: 'Year Built', field: 'yearBuilt', section: 'propertyDetails', type: 'number' },
        { label: 'HOA Fee', field: 'hoaFee', section: 'propertyDetails', prefix: '$' },
        { label: 'Pool', field: 'pool', section: 'propertyDetails', type: 'boolean' },
        { label: 'Spa', field: 'spa', section: 'propertyDetails', type: 'boolean' },
      ],
    },
    {
      title: 'People & Contacts',
      icon: <Person />,
      fields: [
        { label: 'Escrow Officer', field: 'escrowOfficer', section: 'people' },
        { label: 'Loan Officer', field: 'loanOfficer', section: 'people' },
        { label: 'Transaction Coordinator', field: 'transactionCoordinator', section: 'people' },
        { label: 'Listing Agent', field: 'listingAgent', section: 'people' },
        { label: 'Buyers Agent', field: 'buyersAgent', section: 'people' },
      ],
    },
    {
      title: 'Timeline',
      icon: <CalendarToday />,
      fields: [
        { label: 'Acceptance Date', field: 'acceptanceDate', section: 'timeline', type: 'date' },
        { label: 'EMD Date', field: 'emdDate', section: 'timeline', type: 'date' },
        { label: 'Contingencies Date', field: 'contingenciesDate', section: 'timeline', type: 'date' },
        { label: 'Scheduled COE Date', field: 'scheduledCoeDate', section: 'timeline', type: 'date' },
        { label: 'Actual COE Date', field: 'actualCoeDate', section: 'timeline', type: 'date' },
      ],
    },
    {
      title: 'Financial Details',
      icon: <TrendingUp />,
      fields: [
        { label: 'Base Commission', field: 'baseCommission', section: 'financials', type: 'number', prefix: '$' },
        { label: 'Agent Split %', field: 'splitPercentage', section: 'financials', type: 'number' },
        { label: 'Transaction Fee', field: 'transactionFee', section: 'financials', type: 'number', prefix: '$' },
        { label: 'TC Fee', field: 'tcFee', section: 'financials', type: 'number', prefix: '$' },
        { label: 'Lead Source', field: 'leadSource', section: 'financials' },
      ],
    },
  ];

  return (
    <Card 
      elevation={0} 
      sx={{ 
        mb: 3, 
        background: 'linear-gradient(145deg, #f5f5f5 0%, #ffffff 100%)',
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Assignment color="primary" />
            <Typography variant="h6" fontWeight="600">
              Comprehensive Data Editor
            </Typography>
            <Chip 
              label="All Fields Editable" 
              size="small" 
              color="primary" 
              variant="outlined"
            />
          </Box>
          <IconButton onClick={() => setExpanded(!expanded)}>
            {expanded ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </Box>

        <Collapse in={!!successMessage}>
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage('')}>
            {successMessage}
          </Alert>
        </Collapse>

        <Collapse in={expanded}>
          <Grid container spacing={3}>
            {sections.map((section, index) => (
              <Grid item xs={12} md={6} lg={4} key={index}>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    {section.icon}
                    <Typography variant="subtitle2" fontWeight="600">
                      {section.title}
                    </Typography>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  {section.fields.map((fieldConfig, fieldIndex) => (
                    <React.Fragment key={fieldIndex}>
                      {fieldConfig.type === 'boolean' 
                        ? renderBooleanField(
                            fieldConfig.label,
                            fieldConfig.section === 'root' 
                              ? escrowData[fieldConfig.field]
                              : escrowData[fieldConfig.section]?.[fieldConfig.field],
                            fieldConfig.section,
                            fieldConfig.field
                          )
                        : renderField(
                            fieldConfig.label,
                            fieldConfig.section === 'root' 
                              ? escrowData[fieldConfig.field]
                              : escrowData[fieldConfig.section]?.[fieldConfig.field],
                            fieldConfig.section,
                            fieldConfig.field,
                            fieldConfig.type,
                            fieldConfig.prefix
                          )
                      }
                    </React.Fragment>
                  ))}
                </Box>
              </Grid>
            ))}
          </Grid>
        </Collapse>
      </CardContent>
    </Card>
  );
};

export default ComprehensiveDataEditor;