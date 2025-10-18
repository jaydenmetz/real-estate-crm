import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Checkbox,
  FormControlLabel,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Alert,
  LinearProgress,
  Chip,
  IconButton,
  Paper
} from '@mui/material';
import {
  Close,
  Description,
  CheckCircle,
  RadioButtonUnchecked,
  FileUpload,
  Delete,
  Download,
  InsertDriveFile
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import apiInstance from '../../../../services/api.service';

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: theme.spacing(2),
    maxWidth: 800,
    width: '100%',
    maxHeight: '90vh',
  },
}));

const Header = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(2, 3),
  background: 'linear-gradient(135deg, #4A90E2 0%, #5B9FED 100%)',
  color: 'white',
}));

const UploadZone = styled(Paper)(({ theme, isDragActive }) => ({
  border: `2px dashed ${isDragActive ? theme.palette.primary.main : theme.palette.grey[300]}`,
  borderRadius: theme.spacing(1),
  padding: theme.spacing(3),
  textAlign: 'center',
  backgroundColor: isDragActive ? theme.palette.primary.light + '10' : theme.palette.grey[50],
  cursor: 'pointer',
  transition: 'all 0.3s',
  '&:hover': {
    backgroundColor: theme.palette.primary.light + '20',
    borderColor: theme.palette.primary.main,
  },
}));

const FileChip = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  padding: theme.spacing(1, 1.5),
  borderRadius: theme.spacing(1),
  backgroundColor: theme.palette.grey[100],
  marginBottom: theme.spacing(1),
}));

/**
 * DocumentsDetailModal - Skyslopes-style checklist with file upload
 * Phase 6: Full document management for escrow categories
 */
const DocumentsDetailModal = ({ open, onClose, escrow, category, onUpdate }) => {
  const [checklists, setChecklists] = useState({});
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [isDragActive, setIsDragActive] = useState(false);

  useEffect(() => {
    if (escrow?.checklists) {
      setChecklists(escrow.checklists);
    }
    if (escrow?.documents) {
      setDocuments(escrow.documents.filter(doc => doc.category === category));
    }
  }, [escrow, category]);

  // Define checklist items by category
  const checklistTemplates = {
    'Purchase Agreement': [
      'Purchase Agreement Signed',
      'Addendums Attached',
      'Buyer Qualification Letter',
      'Earnest Money Deposited',
      'Counter Offers (if any)'
    ],
    'Disclosures': [
      'Seller Property Questionnaire',
      'Natural Hazard Disclosure',
      'Lead-Based Paint Disclosure',
      'TDS (Transfer Disclosure Statement)',
      'Agent Visual Inspection Disclosure',
      'Statewide Buyer/Seller Advisory',
      'Earthquake Guide',
      'Environmental Hazards Booklet'
    ],
    'Inspection Reports': [
      'Home Inspection Report',
      'Roof Inspection',
      'Pest Inspection (Section 1)',
      'Chimney Inspection'
    ],
    'Loan Documents': [
      'Loan Application Submitted',
      'LE (Loan Estimate)',
      'Rate Locked',
      'Appraisal Ordered',
      'Appraisal Report Received',
      'Title Report Ordered',
      'Underwriting Approval',
      'CD (Closing Disclosure)',
      'Final Loan Approval',
      'Funding Confirmation'
    ],
    'Closing Documents': [
      'Final Walkthrough Complete',
      'Signed Settlement Statement',
      'Grant Deed',
      'Bill of Sale',
      'HOA Documents (if applicable)',
      'Keys Received'
    ]
  };

  const items = checklistTemplates[category] || [];

  const handleCheckboxToggle = (item) => {
    if (!category) return;
    const categoryKey = category.toLowerCase().replace(/ /g, '_');
    const currentChecklist = checklists[categoryKey] || {};

    setChecklists(prev => ({
      ...prev,
      [categoryKey]: {
        ...currentChecklist,
        [item]: !currentChecklist[item]
      }
    }));
  };

  const handleFileSelect = async (files) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append('files', file);
      });
      formData.append('category', category);

      const response = await apiInstance.post(`/escrows/${escrow.id}/documents`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data?.success) {
        const newDocuments = response.data.data;
        setDocuments(prev => [...prev, ...newDocuments]);

        if (onUpdate) {
          onUpdate({
            documents: [...(escrow.documents || []), ...newDocuments]
          });
        }
      } else {
        setError('Failed to upload files');
      }
    } catch (err) {
      console.error('Error uploading files:', err);
      setError(err.response?.data?.error?.message || 'An error occurred during upload');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragActive(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = () => {
    setIsDragActive(false);
  };

  const handleDeleteDocument = async (docId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;

    try {
      const response = await apiInstance.delete(`/escrows/${escrow.id}/documents/${docId}`);

      if (response.data?.success) {
        setDocuments(prev => prev.filter(doc => doc.id !== docId));

        if (onUpdate) {
          onUpdate({
            documents: (escrow.documents || []).filter(doc => doc.id !== docId)
          });
        }
      }
    } catch (err) {
      console.error('Error deleting document:', err);
      setError('Failed to delete document');
    }
  };

  const handleSave = async () => {
    if (!escrow?.id) return;

    setSaving(true);
    setError(null);

    try {
      const response = await apiInstance.put(`/escrows/${escrow.id}/checklists`, checklists);

      if (response.data?.success) {
        if (onUpdate) {
          onUpdate({ checklists });
        }
        onClose();
      } else {
        setError(response.data?.error?.message || 'Failed to save checklist');
      }
    } catch (err) {
      console.error('Error saving checklist:', err);
      setError(err.response?.data?.error?.message || 'An error occurred while saving');
    } finally {
      setSaving(false);
    }
  };

  const categoryKey = category ? category.toLowerCase().replace(/ /g, '_') : '';
  const currentChecklist = checklists[categoryKey] || {};
  const completedCount = Object.values(currentChecklist).filter(Boolean).length;
  const totalCount = items.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <StyledDialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <Header>
        <Box display="flex" alignItems="center" gap={1}>
          <Description />
          <Typography variant="h6" fontWeight="700">
            {category}
          </Typography>
          <Chip
            label={`${completedCount}/${totalCount}`}
            size="small"
            sx={{
              ml: 1,
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              fontWeight: 700
            }}
          />
        </Box>
        <Button
          onClick={onClose}
          sx={{ color: 'white', minWidth: 'auto', p: 0.5 }}
        >
          <Close />
        </Button>
      </Header>

      <DialogContent sx={{ p: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Progress Bar */}
        <Box sx={{ mb: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
            <Typography variant="body2" fontWeight="600">
              Checklist Progress
            </Typography>
            <Typography variant="body2" color="primary.main" fontWeight="700">
              {progressPercent}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={progressPercent}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: 'grey.200',
              '& .MuiLinearProgress-bar': {
                borderRadius: 4,
                background: 'linear-gradient(90deg, #4A90E2 0%, #5B9FED 100%)'
              }
            }}
          />
        </Box>

        {/* Checklist Items */}
        <Typography variant="caption" fontWeight="700" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
          REQUIRED ITEMS
        </Typography>

        <List dense>
          {items.map((item, index) => (
            <React.Fragment key={item}>
              <ListItem
                button
                onClick={() => handleCheckboxToggle(item)}
                sx={{
                  borderRadius: 1,
                  mb: 0.5,
                  '&:hover': {
                    backgroundColor: 'grey.50'
                  }
                }}
              >
                <ListItemIcon>
                  <Checkbox
                    edge="start"
                    checked={currentChecklist[item] || false}
                    tabIndex={-1}
                    disableRipple
                  />
                </ListItemIcon>
                <ListItemText
                  primary={item}
                  primaryTypographyProps={{
                    fontWeight: currentChecklist[item] ? 400 : 600,
                    sx: {
                      textDecoration: currentChecklist[item] ? 'line-through' : 'none',
                      color: currentChecklist[item] ? 'text.secondary' : 'text.primary'
                    }
                  }}
                />
                {currentChecklist[item] && (
                  <CheckCircle sx={{ color: 'success.main', fontSize: 20 }} />
                )}
              </ListItem>
              {index < items.length - 1 && <Divider variant="inset" component="li" />}
            </React.Fragment>
          ))}
        </List>

        <Divider sx={{ my: 3 }} />

        {/* File Upload */}
        <Typography variant="caption" fontWeight="700" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
          UPLOADED DOCUMENTS ({documents.length})
        </Typography>

        <UploadZone
          isDragActive={isDragActive}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => document.getElementById('file-upload-input').click()}
        >
          <input
            id="file-upload-input"
            type="file"
            multiple
            style={{ display: 'none' }}
            onChange={(e) => handleFileSelect(e.target.files)}
          />
          <FileUpload sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
          <Typography variant="body2" fontWeight="600" sx={{ mb: 0.5 }}>
            Drop files here or click to browse
          </Typography>
          <Typography variant="caption" color="text.secondary">
            PDF, DOC, DOCX, JPG, PNG (Max 10MB each)
          </Typography>
          {uploading && (
            <LinearProgress sx={{ mt: 2 }} />
          )}
        </UploadZone>

        {/* Uploaded Files List */}
        {documents.length > 0 && (
          <Box sx={{ mt: 2 }}>
            {documents.map((doc) => (
              <FileChip key={doc.id}>
                <InsertDriveFile sx={{ color: 'primary.main', fontSize: 20 }} />
                <Typography variant="body2" flex={1} noWrap>
                  {doc.filename || doc.name}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
                  {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : ''}
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => window.open(doc.url, '_blank')}
                >
                  <Download fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => handleDeleteDocument(doc.id)}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </FileChip>
            ))}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={onClose} variant="outlined" disabled={saving}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Checklist'}
        </Button>
      </DialogActions>
    </StyledDialog>
  );
};

export default DocumentsDetailModal;
